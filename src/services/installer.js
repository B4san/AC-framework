import { cp, rm, access, readdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALWAYS_INSTALL, BUNDLED, HIDDEN_FOLDERS } from '../config/constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Absolute path to the bundled framework/ directory inside this package. */
export const FRAMEWORK_PATH = resolve(__dirname, '../../framework');

/**
 * Returns sorted list of selectable assistant folder names from framework/.
 * Excludes ALWAYS_INSTALL items, HIDDEN_FOLDERS, and non-directories.
 */
export async function getSelectableModules() {
  const entries = await readdir(FRAMEWORK_PATH, { withFileTypes: true });
  return entries
    .filter(
      (e) =>
        e.isDirectory() &&
        !ALWAYS_INSTALL.includes(e.name) &&
        !HIDDEN_FOLDERS.has(e.name),
    )
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Expand a list of selected modules to include bundled companions
 * and ALWAYS_INSTALL items. Returns the full installation list.
 */
export function expandWithBundled(selected) {
  const bundled = [];
  for (const folder of selected) {
    if (BUNDLED[folder]) {
      bundled.push(...BUNDLED[folder]);
    }
  }
  return [...selected, ...bundled, ...ALWAYS_INSTALL];
}

/**
 * Check whether a folder or file already exists in the target directory.
 */
export async function existsInTarget(targetDir, name) {
  try {
    await access(join(targetDir, name));
    return true;
  } catch {
    return false;
  }
}

/**
 * Copy a single module folder from framework/ to targetDir.
 * Removes node_modules inside the destination if present.
 */
export async function copyModule(folder, targetDir) {
  const src = join(FRAMEWORK_PATH, folder);
  const dest = join(targetDir, folder);
  await cp(src, dest, { recursive: true, force: true });

  try {
    await rm(join(dest, 'node_modules'), { recursive: true, force: true });
  } catch {
    // Fine if it doesn't exist
  }
}

/**
 * Copy a single .md instruction file from framework/ to targetDir root.
 */
export async function copyMdFile(mdFileName, targetDir) {
  const src = join(FRAMEWORK_PATH, mdFileName);
  const dest = join(targetDir, mdFileName);
  await cp(src, dest, { force: true });
}
