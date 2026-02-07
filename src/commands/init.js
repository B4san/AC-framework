import { readdir, cp, access } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { DESCRIPTIONS, formatFolderName, sleep } from '../utils/helpers.js';
import { matrixRain, loadingAnimation, progressBar } from '../ui/animations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const acGradient = gradient(['#6C5CE7', '#00CEC9', '#0984E3']);
const successGradient = gradient(['#00CEC9', '#00B894', '#55EFC4']);

async function getFrameworkFolders() {
  const frameworkPath = resolve(__dirname, '../../framework');
  const entries = await readdir(frameworkPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => {
      // Hidden folders first, then normal
      const aHidden = a.startsWith('.');
      const bHidden = b.startsWith('.');
      if (aHidden && !bHidden) return -1;
      if (!aHidden && bHidden) return 1;
      return a.localeCompare(b);
    });
}

function buildChoices(folders) {
  const choices = [];

  const hidden = folders.filter((f) => f.startsWith('.'));
  const visible = folders.filter((f) => !f.startsWith('.'));

  if (hidden.length > 0) {
    choices.push(new inquirer.Separator(chalk.hex('#636E72')('  ── AI Assistants ──────────────────────────')));
    for (const folder of hidden) {
      const desc = DESCRIPTIONS[folder] || '';
      const displayName = formatFolderName(folder);
      const label = `${chalk.hex('#DFE6E9').bold(displayName)}${desc ? chalk.hex('#636E72')(` — ${desc}`) : ''}`;
      choices.push({
        name: label,
        value: folder,
        short: displayName,
      });
    }
  }

  if (visible.length > 0) {
    choices.push(new inquirer.Separator(chalk.hex('#636E72')('  ── Configuration ─────────────────────────')));
    for (const folder of visible) {
      const desc = DESCRIPTIONS[folder] || '';
      const displayName = formatFolderName(folder);
      const label = `${chalk.hex('#DFE6E9').bold(displayName)}${desc ? chalk.hex('#636E72')(` — ${desc}`) : ''}`;
      choices.push({
        name: label,
        value: folder,
        short: displayName,
      });
    }
  }

  return choices;
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

  // Scanning animation
  await loadingAnimation('Scanning available modules...', 800);
  console.log();

  // Matrix rain effect
  console.log('\n'.repeat(6));
  await matrixRain(1500);

  let folders;
  try {
    folders = await getFrameworkFolders();
  } catch {
    console.log(chalk.red('  Error: Could not read framework directory.'));
    console.log(chalk.hex('#636E72')('  Make sure ac-framework is installed correctly.'));
    process.exit(1);
  }

  if (folders.length === 0) {
    console.log(chalk.yellow('  No modules found in framework directory.'));
    process.exit(0);
  }

  console.log(
    chalk.hex('#B2BEC3')(`  Found ${chalk.hex('#00CEC9').bold(folders.length)} modules available\n`)
  );

  console.log(
    chalk.hex('#636E72')('  Use ') +
    chalk.hex('#00CEC9')('↑↓') +
    chalk.hex('#636E72')(' to navigate, ') +
    chalk.hex('#00CEC9')('Space') +
    chalk.hex('#636E72')(' to select, ') +
    chalk.hex('#00CEC9')('Enter') +
    chalk.hex('#636E72')(' to confirm\n')
  );

  const choices = buildChoices(folders);

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: acGradient('Select modules to install:'),
      choices,
      pageSize: 15,
      loop: false,
      validate(answer) {
        if (answer.length === 0) {
          return chalk.hex('#D63031')('You must select at least one module.');
        }
        return true;
      },
    },
  ]);

  console.log();

  // Check for existing folders
  const existing = [];
  for (const folder of selected) {
    if (await checkExisting(targetDir, folder)) {
      existing.push(folder);
    }
  }

  if (existing.length > 0) {
    console.log(
      chalk.hex('#FDCB6E')('  ⚠  The following modules already exist in your project:\n')
    );
    for (const folder of existing) {
      console.log(chalk.hex('#FDCB6E')(`     • ${formatFolderName(folder)} (${folder})`));
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
      if (filtered.length === 0) {
        console.log(chalk.hex('#636E72')('\n  No new modules to install. Exiting.\n'));
        process.exit(0);
      }
      selected.length = 0;
      selected.push(...filtered);
      console.log(
        chalk.hex('#B2BEC3')(`\n  Proceeding with ${chalk.hex('#00CEC9').bold(selected.length)} new module(s)...\n`)
      );
    }
  }

  // Confirm selection
  console.log(chalk.hex('#B2BEC3')('  Modules to install:\n'));
  for (const folder of selected) {
    const desc = DESCRIPTIONS[folder] || '';
    console.log(
      chalk.hex('#00CEC9')('  ◆ ') +
      chalk.hex('#DFE6E9').bold(formatFolderName(folder)) +
      (desc ? chalk.hex('#636E72')(` — ${desc}`) : '')
    );
  }
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

  console.log();

  // Install modules with progress
  const frameworkPath = resolve(__dirname, '../../framework');
  let installed = 0;
  const errors = [];

  for (const folder of selected) {
    const spinner = createSpinner(
      chalk.hex('#B2BEC3')(`Installing ${chalk.hex('#DFE6E9').bold(formatFolderName(folder))}...`)
    ).start();

    try {
      const src = join(frameworkPath, folder);
      const dest = join(targetDir, folder);

      await cp(src, dest, { recursive: true, force: true });

      // Skip node_modules if copied
      const nmPath = join(dest, 'node_modules');
      try {
        const { rm } = await import('node:fs/promises');
        await rm(nmPath, { recursive: true, force: true });
      } catch {
        // node_modules didn't exist, that's fine
      }

      installed++;
      spinner.success({
        text:
          chalk.hex('#00CEC9')(`  ${formatFolderName(folder)}`) +
          chalk.hex('#636E72')(` → ${folder}/`),
      });
    } catch (err) {
      errors.push({ folder, error: err.message });
      spinner.error({
        text: chalk.hex('#D63031')(`  Failed: ${formatFolderName(folder)} — ${err.message}`),
      });
    }

    await sleep(150);
  }

  // Final summary
  console.log();
  console.log(
    gradient(['#636E72', '#B2BEC3'])('  ─────────────────────────────────────────────────────────────────')
  );
  console.log();

  if (errors.length === 0) {
    await progressBar('Finalizing', 20, 600);
    console.log();
    console.log(successGradient('  ✓ Installation complete!'));
    console.log();
    console.log(
      chalk.hex('#B2BEC3')(`  ${chalk.hex('#00CEC9').bold(installed)} module(s) installed successfully in ${chalk.hex('#DFE6E9')(targetDir)}`)
    );
  } else {
    console.log(
      chalk.hex('#FDCB6E')(`  ${installed} installed, ${errors.length} failed.`)
    );
  }

  console.log();
  console.log(
    chalk.hex('#636E72')('  Your project is ready. Happy coding!')
  );
  console.log();
}
