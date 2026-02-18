/**
 * init.js
 * ──────────────────────────────────────────────────────────────────
 * `acfm init` — Interactive wizard that installs AC Framework
 * modules into the user's project.
 *
 * Flags:
 *   --latest          Download the latest framework from GitHub
 *                     instead of using the bundled npm version.
 *   --branch <name>   GitHub branch to pull (implies --latest).
 * ──────────────────────────────────────────────────────────────────
 */

import chalk from 'chalk';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import { DESCRIPTIONS, ASSISTANT_ICONS, BUNDLED } from '../config/constants.js';
import { IDE_MD_MAP, AVAILABLE_MD_FILES, MD_DESCRIPTIONS } from '../config/ide-mapping.js';
import { formatFolderName, sleep } from '../utils/helpers.js';
import { detectIDE } from '../services/detector.js';
import {
  getSelectableModules,
  expandWithBundled,
  existsInTarget,
  copyModule,
  copyMdFile,
  FRAMEWORK_PATH,
} from '../services/installer.js';
import { downloadWithSpinner, cleanupTempDir } from '../services/github-sync.js';
import {
  scanAnimation,
  animatedSeparator,
  revealList,
  installWithAnimation,
  celebrateSuccess,
  showFailureSummary,
  stepHeader,
  pulseDiamondIntro,
} from '../ui/animations.js';

const acGradient = gradient(['#6C5CE7', '#00CEC9', '#0984E3']);

// ── Helpers ──────────────────────────────────────────────────────

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
    const icon = ASSISTANT_ICONS[folder] || '◦';
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

/**
 * Given the user's selected modules, determine which unique .md files
 * are needed. Returns a de-duplicated sorted array.
 */
function getMdFilesForSelection(selectedModules) {
  const mdSet = new Set();
  for (const mod of selectedModules) {
    const md = IDE_MD_MAP[mod];
    if (md) {
      mdSet.add(md);
    }
  }
  return [...mdSet].sort();
}

/**
 * Step 3: Handle .md instruction file selection.
 * Returns the final list of .md files to install.
 */
async function selectMdFiles(selected, targetDir) {
  // Determine required .md files based on module selection
  let requiredMd = getMdFilesForSelection(selected);

  // Attempt IDE auto-detection
  const detected = detectIDE();
  if (detected.ide) {
    const detectedBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${detected.ide} `);
    console.log(`  ${chalk.hex('#636E72')('Auto-detected:')} ${detectedBadge}`);
    console.log();
  }

  // Show which .md files will be installed
  if (requiredMd.length > 0) {
    console.log(chalk.hex('#B2BEC3')('  Instruction files for your selection:\n'));
    for (const md of requiredMd) {
      const desc = MD_DESCRIPTIONS[md] || '';
      console.log(
        chalk.hex('#00CEC9')('  ◆ ') +
        chalk.hex('#DFE6E9').bold(md) +
        (desc ? chalk.hex('#636E72')(` · ${desc}`) : '')
      );
    }
    console.log();
  } else {
    console.log(chalk.hex('#636E72')('  No instruction files needed for your selection.\n'));
  }

  // Offer additional .md files
  const available = AVAILABLE_MD_FILES.filter((f) => !requiredMd.includes(f));
  if (available.length > 0) {
    const { wantMore } = await inquirer.prompt([{
      type: 'confirm',
      name: 'wantMore',
      message: chalk.hex('#B2BEC3')('Install additional instruction files?'),
      default: false,
    }]);

    if (wantMore) {
      const { additional } = await inquirer.prompt([{
        type: 'checkbox',
        name: 'additional',
        message: acGradient('Select additional files:'),
        choices: available.map((f) => ({
          name: chalk.hex('#DFE6E9').bold(f) +
                chalk.hex('#636E72')(` · ${MD_DESCRIPTIONS[f] || ''}`),
          value: f,
          short: f,
        })),
        pageSize: 10,
      }]);
      requiredMd = [...requiredMd, ...additional];
    }
  }

  // Check for existing .md files
  const existingMd = [];
  for (const md of requiredMd) {
    if (await existsInTarget(targetDir, md)) {
      existingMd.push(md);
    }
  }

  if (existingMd.length > 0) {
    console.log(
      chalk.hex('#FDCB6E')('  ⚠  These instruction files already exist:\n')
    );
    for (const md of existingMd) {
      console.log(
        chalk.hex('#FDCB6E')('     ▸ ') +
        chalk.hex('#DFE6E9')(md)
      );
    }
    console.log();

    const { overwriteMd } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwriteMd',
      message: chalk.hex('#FDCB6E')('Overwrite existing instruction files?'),
      default: false,
    }]);

    if (!overwriteMd) {
      requiredMd = requiredMd.filter((f) => !existingMd.includes(f));
    }
  }

  return requiredMd;
}

// ── Main command ─────────────────────────────────────────────────

export async function initCommand(options = {}) {
  const targetDir = process.cwd();

  // --branch implies --latest
  const useLatest = !!(options.latest || options.branch);

  // Dynamic step counting: +1 step when downloading from GitHub
  const stepOffset = useLatest ? 1 : 0;
  const totalSteps = 4 + stepOffset;

  // Framework source: bundled by default, overridden by --latest
  let frameworkPath = FRAMEWORK_PATH;
  let tempDir = null;

  try {
    // ── Opening Animation ─────────────────────────────────────────
    console.log();
    await pulseDiamondIntro(1800);
    
    // ── Download (only with --latest / --branch) ──────────────────
    if (useLatest) {
      await stepHeader(1, totalSteps, 'Downloading latest framework');

      const branchLabel = options.branch || 'main';
      const branchBadge = chalk.hex('#2D3436').bgHex('#6C5CE7').bold(` ${branchLabel} `);
      console.log(`  ${chalk.hex('#636E72')('Branch:')} ${branchBadge}`);
      console.log();

      try {
        const result = await downloadWithSpinner({
          branch: options.branch,
        });
        tempDir = result.tempDir;
        frameworkPath = result.tempDir;

        if (result.commitSha) {
          const shaBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${result.commitSha.slice(0, 7)} `);
          console.log(`  ${shaBadge} ${chalk.hex('#636E72')('latest commit')}`);
        }
        console.log();
      } catch (err) {
        console.log();
        console.log(chalk.hex('#FDCB6E')(`  ⚠  ${err.message}`));
        console.log(chalk.hex('#636E72')('  Falling back to bundled version...\n'));
        frameworkPath = FRAMEWORK_PATH;
      }
    }

    // ── Step: Scan ────────────────────────────────────────────────
    await stepHeader(1 + stepOffset, totalSteps, 'Scanning framework modules');
    await scanAnimation('Indexing available modules', 1000);
    console.log();

    let folders;
    try {
      folders = await getSelectableModules(frameworkPath);
    } catch {
      console.log(chalk.hex('#D63031')('  ✗ Error: Could not read framework directory.'));
      console.log(chalk.hex('#636E72')('  Make sure ac-framework is installed correctly.'));
      process.exit(1);
    }

    if (folders.length === 0) {
      console.log(chalk.hex('#FDCB6E')('  No modules found in framework directory.'));
      process.exit(0);
    }

    const countBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${folders.length} `);
    console.log(`  ${countBadge} ${chalk.hex('#B2BEC3')('assistant modules found')}`);
    console.log();
    await animatedSeparator(60);
    console.log();

    // ── Step: Select ──────────────────────────────────────────────
    await stepHeader(2 + stepOffset, totalSteps, 'Select your assistants');

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

    // ── Check module conflicts ────────────────────────────────────
    const bundledForCheck = [];
    for (const folder of selected) {
      if (BUNDLED[folder]) {
        bundledForCheck.push(...BUNDLED[folder]);
      }
    }
    const allForCheck = [...selected, ...bundledForCheck];
    const existing = [];
    for (const folder of allForCheck) {
      if (await existsInTarget(targetDir, folder)) {
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
        if (filtered.length === 0) {
          console.log(chalk.hex('#636E72')('\n  Nothing new to install. Exiting.\n'));
          process.exit(0);
        }
        selected.length = 0;
        selected.push(...filtered);
        const newCount = chalk.hex('#00CEC9').bold(filtered.length);
        console.log(
          '\n  ' + chalk.hex('#B2BEC3')('Continuing with ') + newCount + chalk.hex('#B2BEC3')(' new module(s)...') + '\n'
        );
      }
    }

    // ── Reveal selection ──────────────────────────────────────────
    console.log(chalk.hex('#B2BEC3')('  Selected modules:\n'));

    const selectedItems = selected.map((folder) => {
      const desc = DESCRIPTIONS[folder] || '';
      return chalk.hex('#DFE6E9').bold(formatFolderName(folder)) +
        (desc ? chalk.hex('#636E72')(` · ${desc}`) : '');
    });

    await revealList(selectedItems, { prefix: '◆', color: '#00CEC9', delay: 40 });

    console.log();

    // ── Step: Instruction Files ───────────────────────────────────
    await animatedSeparator(60);
    console.log();
    await stepHeader(3 + stepOffset, totalSteps, 'Instruction files');

    const mdFiles = await selectMdFiles(selected, targetDir);

    // Show combined summary if there are .md files
    if (mdFiles.length > 0) {
      console.log(chalk.hex('#B2BEC3')('  Instruction files to install:\n'));
      const mdItems = mdFiles.map((md) => {
        const desc = MD_DESCRIPTIONS[md] || '';
        return chalk.hex('#DFE6E9').bold(md) +
          (desc ? chalk.hex('#636E72')(` · ${desc}`) : '');
      });
      await revealList(mdItems, { prefix: '◆', color: '#6C5CE7', delay: 40 });
      console.log();
    }

    // ── Final confirmation ────────────────────────────────────────
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

    // ── Step: Install ─────────────────────────────────────────────
    console.log();
    await animatedSeparator(60);
    console.log();
    await stepHeader(4 + stepOffset, totalSteps, 'Installing modules');

    const allToInstall = expandWithBundled(selected);
    let installed = 0;
    const errors = [];

    // Install module folders
    for (const folder of allToInstall) {
      const displayName = formatFolderName(folder);
      try {
        await installWithAnimation(displayName, async () => {
          await copyModule(folder, targetDir, frameworkPath);
        });
        installed++;
      } catch (err) {
        errors.push({ folder, error: err.message });
      }
      await sleep(80);
    }

    // Install .md instruction files
    for (const md of mdFiles) {
      try {
        await installWithAnimation(md, async () => {
          await copyMdFile(md, targetDir, frameworkPath);
        });
        installed++;
      } catch (err) {
        errors.push({ folder: md, error: err.message });
      }
      await sleep(80);
    }

    // ── Final result ──────────────────────────────────────────────
    if (errors.length === 0) {
      await celebrateSuccess(installed, targetDir);
    } else {
      await showFailureSummary(installed, errors);
    }
  } finally {
    // Always clean up the temp directory if we downloaded from GitHub
    if (tempDir) {
      await cleanupTempDir(tempDir);
    }
  }
}
