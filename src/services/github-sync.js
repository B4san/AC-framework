/**
 * github-sync.js
 * ──────────────────────────────────────────────────────────────────
 * Downloads the latest framework/ directory from the GitHub repo
 * so that users can get updates without a new npm publish.
 *
 * Uses the GitHub tarball API (single HTTP request, no auth needed
 * for public repos, no rate-limit concerns).
 *
 * Security:
 *  - URL is validated against a strict pattern before fetching.
 *  - Tarball extraction filters entries by path and rejects
 *    traversal attempts (.. segments, null bytes).
 *  - tar's built-in preservePaths:false (default) adds a second
 *    layer of path-traversal protection.
 *  - Temp directories are always cleaned up, even on errors.
 * ──────────────────────────────────────────────────────────────────
 */

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { x as tarExtract } from 'tar';
import chalk from 'chalk';
import { GITHUB_CONFIG } from '../config/constants.js';
import { sleep } from '../utils/helpers.js';

/**
 * Strict regex that only matches GitHub API tarball URLs.
 * Prevents the CLI from ever sending requests to unexpected hosts.
 */
const GITHUB_API_URL_RE =
  /^https:\/\/api\.github\.com\/repos\/[\w.-]+\/[\w.-]+\/tarball\/[\w./_-]+$/;

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Builds the GitHub API tarball URL for the configured repository.
 * @param {string} [branch] - Override branch (defaults to GITHUB_CONFIG.branch).
 * @returns {string}
 */
function buildTarballUrl(branch) {
  const { owner, repo } = GITHUB_CONFIG;
  const targetBranch = branch || GITHUB_CONFIG.branch;
  return `https://api.github.com/repos/${owner}/${repo}/tarball/${targetBranch}`;
}

/**
 * Tar entry filter: only allows paths inside the framework/ directory
 * and rejects any path-traversal tricks.
 *
 * GitHub tarball structure:
 *   owner-repo-SHA/framework/.cursor/skills/foo.md
 *   │ segment[0] │ segment[1] │ segment[2+]...
 *
 * Combined with strip:2, segment[2+] ends up at the root of tempDir.
 *
 * @param {string} frameworkDir - Name of the framework directory (default: "framework").
 * @returns {(entryPath: string) => boolean}
 */
function createPathFilter(frameworkDir) {
  return (entryPath) => {
    const segments = entryPath.split('/').filter(Boolean);

    // Reject path traversal or null-byte injection
    if (segments.some((s) => s === '..' || s.includes('\0'))) {
      return false;
    }

    // Only extract entries whose second segment is the framework dir
    // and that have actual content beyond it (length > 2).
    return segments.length > 2 && segments[1] === frameworkDir;
  };
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Downloads the latest framework/ directory from the GitHub repository.
 *
 * Fetches a gzipped tarball via the GitHub API and extracts ONLY the
 * contents under `framework/` into a new temporary directory.
 *
 * The temporary directory mirrors the internal layout of framework/:
 *   tempDir/.cursor/…
 *   tempDir/.claude/…
 *   tempDir/openspec/…
 *   tempDir/AGENTS.md
 *
 * The caller MUST call cleanupTempDir(tempDir) when finished.
 *
 * @param {Object}  [options]
 * @param {string}  [options.branch]  - Git branch to pull (default: 'main').
 * @param {number}  [options.timeout] - Request timeout in ms (default: 30 000).
 * @returns {Promise<{ tempDir: string, commitSha: string|null }>}
 * @throws {Error} On network failure, timeout, or GitHub API errors.
 */
export async function downloadFramework({ branch, timeout } = {}) {
  const url = buildTarballUrl(branch);
  const { frameworkDir } = GITHUB_CONFIG;
  const requestTimeout = timeout || GITHUB_CONFIG.timeout;

  // Defense-in-depth: verify the URL targets the GitHub API
  if (!GITHUB_API_URL_RE.test(url)) {
    throw new Error(`Refused to fetch from unexpected URL: ${url}`);
  }

  const tempDir = await mkdtemp(join(tmpdir(), 'acfm-'));
  let commitSha = null;

  try {
    // ── Fetch the tarball ────────────────────────────────────────
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), requestTimeout);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ac-framework-cli',
        'Accept': 'application/vnd.github+json',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository or branch not found on GitHub.');
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Try again later.');
      }
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      );
    }

    // ── Extract commit SHA ───────────────────────────────────────
    // GitHub sends: attachment; filename=owner-repo-SHORTSHA.tar.gz
    const disposition =
      response.headers.get('content-disposition') || '';
    const shaMatch = disposition.match(/([a-f0-9]{7,40})\.tar\.gz/i);
    if (shaMatch) {
      commitSha = shaMatch[1];
    }

    // ── Stream → tar extract ─────────────────────────────────────
    // strip:2 removes "owner-repo-sha/framework/" so the contents
    // land directly in tempDir.
    const nodeStream = Readable.fromWeb(response.body);

    await pipeline(
      nodeStream,
      tarExtract({
        cwd: tempDir,
        strip: 2,
        filter: createPathFilter(frameworkDir),
      }),
    );

    return { tempDir, commitSha };
  } catch (err) {
    // Always clean up on failure so we don't leak temp directories
    await cleanupTempDir(tempDir);

    if (err.name === 'AbortError') {
      throw new Error(
        `Download timed out after ${requestTimeout / 1000}s. Check your connection.`,
      );
    }

    throw err;
  }
}

/**
 * Safely removes a temporary directory created by downloadFramework().
 * Errors are silently ignored (best-effort cleanup).
 * @param {string|null} tempDir
 */
export async function cleanupTempDir(tempDir) {
  if (!tempDir) return;
  try {
    await rm(tempDir, { recursive: true, force: true });
  } catch {
    // Best-effort — don't crash the CLI over a cleanup failure
  }
}

/**
 * Wraps downloadFramework() with an animated CLI spinner.
 * Provides visual feedback while the tarball is being downloaded.
 *
 * @param {Object} [options] - Forwarded to downloadFramework().
 * @returns {Promise<{ tempDir: string, commitSha: string|null }>}
 */
export async function downloadWithSpinner(options = {}) {
  const frames = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
  let frameIdx = 0;
  let running = true;

  const animate = async () => {
    while (running) {
      const frame = chalk.hex('#6C5CE7')(frames[frameIdx % frames.length]);
      process.stdout.write(
        `\x1B[2K\r  ${frame} ${chalk.hex('#B2BEC3')('Downloading from GitHub')}${chalk.hex('#636E72')('...')}`,
      );
      frameIdx++;
      await sleep(60);
    }
  };

  // Fire-and-forget: the loop exits when `running` becomes false
  animate();

  try {
    const result = await downloadFramework(options);
    running = false;
    await sleep(70);
    process.stdout.write(
      `\x1B[2K\r  ${chalk.hex('#00CEC9')('✓')} ${chalk.hex('#00CEC9')('Framework downloaded successfully')}\n`,
    );
    return result;
  } catch (err) {
    running = false;
    await sleep(70);
    process.stdout.write(
      `\x1B[2K\r  ${chalk.hex('#D63031')('✗')} ${chalk.hex('#D63031')('Download failed')}\n`,
    );
    throw err;
  }
}
