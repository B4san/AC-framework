import { cp, rm, access, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALWAYS_INSTALL, BUNDLED, HIDDEN_FOLDERS } from '../config/constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Absolute path to the bundled framework/ directory inside this package. */
export const FRAMEWORK_PATH = resolve(__dirname, '../../framework');
export const DEFAULT_TEMPLATE = 'new_project';
export const TEMPLATE_METADATA_FILE = '.acfm-template.json';

function isTemplateDirectory(entry) {
  return entry.isDirectory() && !entry.name.startsWith('.');
}

async function hasLegacyModules(frameworkPath) {
  const entries = await readdir(frameworkPath, { withFileTypes: true });
  return entries.some((entry) => entry.isDirectory() && entry.name.startsWith('.'));
}

export async function getAvailableTemplates(frameworkPath = FRAMEWORK_PATH) {
  const entries = await readdir(frameworkPath, { withFileTypes: true });
  const templates = entries
    .filter(isTemplateDirectory)
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (templates.length > 0) {
    return templates;
  }

  if (await hasLegacyModules(frameworkPath)) {
    return [DEFAULT_TEMPLATE];
  }

  return [];
}

export async function resolveTemplatePath(templateName, frameworkPath = FRAMEWORK_PATH) {
  const explicitTemplatePath = join(frameworkPath, templateName);

  try {
    const entries = await readdir(explicitTemplatePath, { withFileTypes: true });
    if (entries.length >= 0) {
      return explicitTemplatePath;
    }
  } catch {
    if (templateName === DEFAULT_TEMPLATE && await hasLegacyModules(frameworkPath)) {
      return frameworkPath;
    }
    throw new Error(`Template not found: ${templateName}`);
  }

  return explicitTemplatePath;
}

export async function saveTemplateSelection(targetDir, templateName) {
  const metadataPath = join(targetDir, TEMPLATE_METADATA_FILE);
  const payload = {
    template: templateName,
    savedAt: new Date().toISOString(),
  };

  await writeFile(metadataPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

export async function readTemplateSelection(targetDir) {
  try {
    const metadataPath = join(targetDir, TEMPLATE_METADATA_FILE);
    const raw = await readFile(metadataPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed?.template || null;
  } catch {
    return null;
  }
}

export async function detectTemplateForModules(modules, frameworkPath = FRAMEWORK_PATH) {
  const templates = await getAvailableTemplates(frameworkPath);
  const prioritizedTemplates = [
    ...templates.filter((template) => template === DEFAULT_TEMPLATE),
    ...templates.filter((template) => template !== DEFAULT_TEMPLATE),
  ];

  for (const template of prioritizedTemplates) {
    const templatePath = await resolveTemplatePath(template, frameworkPath);
    let matches = true;

    for (const mod of modules) {
      if (!(await existsInTarget(templatePath, mod))) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return template;
    }
  }

  return templates.includes(DEFAULT_TEMPLATE) ? DEFAULT_TEMPLATE : templates[0] || null;
}

/**
 * Returns sorted list of selectable assistant folder names.
 * Excludes ALWAYS_INSTALL items, HIDDEN_FOLDERS, and non-directories.
 *
 * @param {string} [frameworkPath=FRAMEWORK_PATH] - Root directory to scan.
 */
export async function getSelectableModules(frameworkPath = FRAMEWORK_PATH) {
  const entries = await readdir(frameworkPath, { withFileTypes: true });
  return entries
    .filter(
      (e) =>
        e.isDirectory() &&
        e.name.startsWith('.') &&
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
 * Copy a single module folder to targetDir.
 * Removes node_modules inside the destination if present.
 *
 * @param {string} folder         - Module folder name (e.g. '.cursor').
 * @param {string} targetDir      - Destination project directory.
 * @param {string} [frameworkPath=FRAMEWORK_PATH] - Source root to copy from.
 */
export async function copyModule(folder, targetDir, frameworkPath = FRAMEWORK_PATH) {
  const src = join(frameworkPath, folder);
  const dest = join(targetDir, folder);
  await cp(src, dest, { recursive: true, force: true });

  try {
    await rm(join(dest, 'node_modules'), { recursive: true, force: true });
  } catch {
    // Fine if it doesn't exist
  }
}

/**
 * Copy a single .md instruction file to targetDir root.
 *
 * @param {string} mdFileName     - File name (e.g. 'AGENTS.md').
 * @param {string} targetDir      - Destination project directory.
 * @param {string} [frameworkPath=FRAMEWORK_PATH] - Source root to copy from.
 */
export async function copyMdFile(mdFileName, targetDir, frameworkPath = FRAMEWORK_PATH) {
  const src = join(frameworkPath, mdFileName);
  const dest = join(targetDir, mdFileName);
  await cp(src, dest, { force: true });
}
