/**
 * update.js
 * ──────────────────────────────────────────────────────────────────
 * `acfm update` — Pulls the latest framework from GitHub and
 * re-installs every module and instruction file already present
 * in the current project, without requiring a new npm publish.
 *
 * Flags:
 *   --branch <name>   GitHub branch to pull from (default: main).
 * ──────────────────────────────────────────────────────────────────
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import { DESCRIPTIONS, ALWAYS_INSTALL, BUNDLED } from '../config/constants.js';
import { AVAILABLE_MD_FILES, MD_DESCRIPTIONS } from '../config/ide-mapping.js';
import { formatFolderName, sleep } from '../utils/helpers.js';
import {
  existsInTarget,
  copyModule,
  copyMdFile,
} from '../services/installer.js';
import { downloadWithSpinner, cleanupTempDir } from '../services/github-sync.js';
import { showBanner } from '../ui/banner.js';
import {
  scanAnimation,
  animatedSeparator,
  installWithAnimation,
  celebrateSuccess,
  showFailureSummary,
  stepHeader,
  revealList,
} from '../ui/animations.js';

const acGradient = gradient(['#6C5CE7', '#00CEC9', '#0984E3']);

// ── Main command ─────────────────────────────────────────────────

/**
 * Detects which AC Framework modules and instruction files are
 * currently installed in targetDir, downloads the latest version
 * from GitHub, and overwrites them.
 *
 * @param {Object} [options]
 * @param {string} [options.branch] - GitHub branch to pull from.
 */
export async function updateCommand(options = {}) {
  await showBanner();

  const targetDir = process.cwd();

  // ── Step 1/3: Detect installed modules ────────────────────────
  await stepHeader(1, 3, 'Detecting installed modules');
  await scanAnimation('Scanning project directory', 800);
  console.log();

  // Build a de-duplicated list of every module folder name we know about
  const allKnownModules = [
    ...new Set([
      ...Object.keys(DESCRIPTIONS),
      ...Object.values(BUNDLED).flat(),
    ]),
  ];

  // Check which modules exist in the project
  const installedModules = [];
  for (const mod of allKnownModules) {
    if (await existsInTarget(targetDir, mod)) {
      installedModules.push(mod);
    }
  }

  // Check which .md instruction files exist in the project
  const installedMdFiles = [];
  for (const md of AVAILABLE_MD_FILES) {
    if (await existsInTarget(targetDir, md)) {
      installedMdFiles.push(md);
    }
  }

  const totalFound = installedModules.length + installedMdFiles.length;

  if (totalFound === 0) {
    console.log(chalk.hex('#FDCB6E')('  No AC Framework modules detected in this directory.'));
    console.log(
      chalk.hex('#636E72')('  Run ') +
      chalk.hex('#00CEC9')('acfm init') +
      chalk.hex('#636E72')(' first to install modules.'),
    );
    console.log();
    process.exit(0);
  }

  // Show detected modules
  const countBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${totalFound} `);
  console.log(`  ${countBadge} ${chalk.hex('#B2BEC3')('installed items detected')}`);
  console.log();

  if (installedModules.length > 0) {
    const moduleItems = installedModules.map((mod) => {
      const desc = DESCRIPTIONS[mod] || '';
      return chalk.hex('#DFE6E9').bold(formatFolderName(mod)) +
        (desc ? chalk.hex('#636E72')(` · ${desc}`) : '');
    });
    await revealList(moduleItems, { prefix: '◆', color: '#00CEC9', delay: 30 });
  }

  if (installedMdFiles.length > 0) {
    console.log();
    const mdItems = installedMdFiles.map((md) => {
      const desc = MD_DESCRIPTIONS[md] || '';
      return chalk.hex('#DFE6E9').bold(md) +
        (desc ? chalk.hex('#636E72')(` · ${desc}`) : '');
    });
    await revealList(mdItems, { prefix: '◇', color: '#6C5CE7', delay: 30 });
  }

  console.log();

  // ── Confirmation ──────────────────────────────────────────────
  const branchLabel = options.branch || 'main';
  const branchBadge = chalk.hex('#2D3436').bgHex('#6C5CE7').bold(` ${branchLabel} `);

  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: chalk.hex('#B2BEC3')(`Download latest from GitHub (${branchLabel}) and update all?`),
    default: true,
  }]);

  if (!confirm) {
    console.log(chalk.hex('#636E72')('\n  Update cancelled.\n'));
    process.exit(0);
  }

  // ── Step 2/3: Download from GitHub ────────────────────────────
  console.log();
  await animatedSeparator(60);
  console.log();
  await stepHeader(2, 3, 'Downloading latest framework');

  console.log(`  ${chalk.hex('#636E72')('Branch:')} ${branchBadge}`);
  console.log();

  let tempDir = null;
  let commitSha = null;

  try {
    const result = await downloadWithSpinner({ branch: options.branch });
    tempDir = result.tempDir;
    commitSha = result.commitSha;
  } catch (err) {
    console.log();
    console.log(chalk.hex('#D63031')(`  ✗ ${err.message}`));
    console.log(chalk.hex('#636E72')('  Check your internet connection and try again.'));
    console.log();
    process.exit(1);
  }

  if (commitSha) {
    const shaBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${commitSha.slice(0, 7)} `);
    console.log(`  ${shaBadge} ${chalk.hex('#636E72')('latest commit')}`);
    console.log();
  }

  // ── Step 3/3: Update modules ──────────────────────────────────
  await animatedSeparator(60);
  console.log();
  await stepHeader(3, 3, 'Updating modules');

  let updated = 0;
  const errors = [];

  try {
    // Update module folders
    for (const mod of installedModules) {
      const displayName = formatFolderName(mod);
      try {
        await installWithAnimation(displayName, async () => {
          await copyModule(mod, targetDir, tempDir);
        });
        updated++;
      } catch (err) {
        errors.push({ folder: mod, error: err.message });
      }
      await sleep(80);
    }

    // Update .md instruction files
    for (const md of installedMdFiles) {
      try {
        await installWithAnimation(md, async () => {
          await copyMdFile(md, targetDir, tempDir);
        });
        updated++;
      } catch (err) {
        errors.push({ folder: md, error: err.message });
      }
      await sleep(80);
    }
  } finally {
    // Always clean up the temp directory
    await cleanupTempDir(tempDir);
  }

  // ── Results ───────────────────────────────────────────────────
  if (errors.length === 0) {
    await celebrateSuccess(updated, targetDir);
  } else {
    await showFailureSummary(updated, errors);
  }
}
