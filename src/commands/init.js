import { readdir, cp, access, rm } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import { DESCRIPTIONS, formatFolderName, sleep } from '../utils/helpers.js';
import {
  matrixRain,
  scanAnimation,
  animatedSeparator,
  revealList,
  progressBar,
  installWithAnimation,
  celebrateSuccess,
  showFailureSummary,
  stepHeader,
} from '../ui/animations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const acGradient = gradient(['#6C5CE7', '#00CEC9', '#0984E3']);

const ALWAYS_INSTALL = ['openspec'];

async function getFrameworkFolders() {
  const frameworkPath = resolve(__dirname, '../../framework');
  const entries = await readdir(frameworkPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory() && !ALWAYS_INSTALL.includes(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function buildChoices(folders) {
  const choices = [];

  choices.push(new inquirer.Separator(
    chalk.hex('#636E72')('  ── ') +
    chalk.hex('#6C5CE7').bold('AI Assistants') +
    chalk.hex('#636E72')(' ─────────────────────────────')
  ));

  for (const folder of folders) {
    const desc = DESCRIPTIONS[folder] || '';
    const displayName = formatFolderName(folder);
    const icon = getAssistantIcon(folder);
    const label =
      `${chalk.hex('#636E72')(icon)} ${chalk.hex('#DFE6E9').bold(displayName)}` +
      (desc ? chalk.hex('#636E72')(` · ${desc}`) : '');
    choices.push({
      name: label,
      value: folder,
      short: displayName,
    });
  }

  return choices;
}

function getAssistantIcon(folder) {
  const icons = {
    '.agent': '⊡',
    '.amazonq': '◈',
    '.augment': '◇',
    '.claude': '◉',
    '.cline': '◎',
    '.clinerules': '◎',
    '.codebuddy': '◈',
    '.codex': '⊞',
    '.continue': '▹',
    '.cospec': '⊙',
    '.crush': '◆',
    '.cursor': '▸',
    '.factory': '⊟',
    '.gemini': '◇',
    '.github': '◈',
    '.iflow': '▹',
    '.kilocode': '◎',
    '.opencode': '⊡',
    '.qoder': '◇',
    '.qwen': '◈',
    '.roo': '◆',
    '.trae': '▸',
    '.windsurf': '◇',
  };
  return icons[folder] || '◦';
}

async function checkExisting(targetDir, folder) {
  try {
    await access(join(targetDir, folder));
    return true;
  } catch {
    return false;
  }
}

export async function initCommand() {
  const targetDir = process.cwd();

  // ── Step 1: Scan ───────────────────────────────────────────────
  await stepHeader(1, 3, 'Scanning framework modules');
  await scanAnimation('Indexing available modules', 1000);
  console.log();

  // Matrix rain transition
  await matrixRain(1800);

  let folders;
  try {
    folders = await getFrameworkFolders();
  } catch {
    console.log(chalk.hex('#D63031')('  ✗ Error: Could not read framework directory.'));
    console.log(chalk.hex('#636E72')('  Make sure ac-framework is installed correctly.'));
    process.exit(1);
  }

  if (folders.length === 0) {
    console.log(chalk.hex('#FDCB6E')('  No modules found in framework directory.'));
    process.exit(0);
  }

  // Module count display
  const countBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${folders.length} `);
  const autoBadge = chalk.hex('#2D3436').bgHex('#6C5CE7').bold(' +openspec ');
  console.log(`  ${countBadge} ${chalk.hex('#B2BEC3')('assistant modules found')}  ${autoBadge} ${chalk.hex('#636E72')('auto-included')}`);
  console.log();
  await animatedSeparator(60);
  console.log();

  // ── Step 2: Select ─────────────────────────────────────────────
  await stepHeader(2, 3, 'Select your assistants');

  // Controls hint with styled keys
  const key = (k) => chalk.hex('#2D3436').bgHex('#636E72')(` ${k} `);
  console.log(
    `  ${key('↑↓')} ${chalk.hex('#636E72')('navigate')}  ` +
    `${key('Space')} ${chalk.hex('#636E72')('toggle')}  ` +
    `${key('Enter')} ${chalk.hex('#636E72')('confirm')}`
  );
  console.log();

  const choices = buildChoices(folders);

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: acGradient('Choose modules to install:'),
      choices,
      pageSize: 15,
      loop: false,
      validate(answer) {
        if (answer.length === 0) {
          return chalk.hex('#D63031')('Select at least one module. Use Space to toggle.');
        }
        return true;
      },
    },
  ]);

  console.log();

  // ── Check conflicts ────────────────────────────────────────────
  const allForCheck = [...selected, ...ALWAYS_INSTALL];
  const existing = [];
  for (const folder of allForCheck) {
    if (await checkExisting(targetDir, folder)) {
      existing.push(folder);
    }
  }

  if (existing.length > 0) {
    console.log(
      chalk.hex('#FDCB6E')('  ⚠  These modules already exist in your project:\n')
    );
    for (const folder of existing) {
      console.log(
        chalk.hex('#FDCB6E')('     ▸ ') +
        chalk.hex('#DFE6E9')(formatFolderName(folder)) +
        chalk.hex('#636E72')(` (${folder})`)
      );
    }
    console.log();

    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: chalk.hex('#FDCB6E')('Overwrite existing modules?'),
        default: false,
      },
    ]);

    if (!overwrite) {
      const filtered = selected.filter((f) => !existing.includes(f));
      const autoFiltered = ALWAYS_INSTALL.filter((f) => !existing.includes(f));
      if (filtered.length === 0 && autoFiltered.length === 0) {
        console.log(chalk.hex('#636E72')('\n  Nothing new to install. Exiting.\n'));
        process.exit(0);
      }
      selected.length = 0;
      selected.push(...filtered);
      console.log(
        chalk.hex('#B2BEC3')(`\n  Continuing with ${chalk.hex('#00CEC9').bold(filtered.length + autoFiltered.length)} new module(s)...\n`)
      );
    }
  }

  // ── Confirm selection with animated reveal ─────────────────────
  console.log(chalk.hex('#B2BEC3')('  Selected modules:\n'));

  const selectedItems = selected.map((folder) => {
    const desc = DESCRIPTIONS[folder] || '';
    return chalk.hex('#DFE6E9').bold(formatFolderName(folder)) +
      (desc ? chalk.hex('#636E72')(` · ${desc}`) : '');
  });
  selectedItems.push(
    chalk.hex('#DFE6E9').bold('Openspec') +
    chalk.hex('#636E72')(` · ${DESCRIPTIONS['openspec']}`) +
    chalk.hex('#6C5CE7').italic(' (auto)')
  );

  await revealList(selectedItems, { prefix: '◆', color: '#00CEC9', delay: 40 });

  console.log();

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.hex('#B2BEC3')('Proceed with installation?'),
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.hex('#636E72')('\n  Installation cancelled.\n'));
    process.exit(0);
  }

  // ── Step 3: Install ────────────────────────────────────────────
  console.log();
  await animatedSeparator(60);
  console.log();
  await stepHeader(3, 3, 'Installing modules');

  const frameworkPath = resolve(__dirname, '../../framework');
  const allToInstall = [...selected, ...ALWAYS_INSTALL];
  let installed = 0;
  const errors = [];

  for (const folder of allToInstall) {
    const displayName = formatFolderName(folder);

    try {
      await installWithAnimation(displayName, async () => {
        const src = join(frameworkPath, folder);
        const dest = join(targetDir, folder);

        await cp(src, dest, { recursive: true, force: true });

        // Remove node_modules if present (e.g. .opencode)
        try {
          await rm(join(dest, 'node_modules'), { recursive: true, force: true });
        } catch {
          // Fine if it doesn't exist
        }
      });
      installed++;
    } catch (err) {
      errors.push({ folder, error: err.message });
    }

    await sleep(80);
  }

  // ── Final result ───────────────────────────────────────────────
  if (errors.length === 0) {
    await celebrateSuccess(installed, targetDir);
  } else {
    await showFailureSummary(installed, errors);
  }
}
