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
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  DESCRIPTIONS,
  ASSISTANT_ICONS,
  BUNDLED,
  TEMPLATE_DESCRIPTIONS,
  TEMPLATE_CAPABILITIES,
  TEMPLATE_SKILL_PREVIEWS,
} from '../config/constants.js';
import { IDE_MD_MAP, AVAILABLE_MD_FILES, MD_DESCRIPTIONS } from '../config/ide-mapping.js';
import { formatFolderName, formatTemplateName, sleep } from '../utils/helpers.js';
import { detectIDE } from '../services/detector.js';
import {
  getAvailableTemplates,
  getSelectableModules,
  resolveTemplatePath,
  expandWithBundled,
  existsInTarget,
  copyModule,
  copyMdFile,
  FRAMEWORK_PATH,
  saveTemplateSelection,
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

// ── Persistent Memory Setup ───────────────────────────────────────

/**
 * First-time persistent memory setup.
 * Only shown when ~/.acfm/memory.db does not yet exist.
 *
 * The memory store is named "NexusVault" — a unique, memorable name
 * for the embedded knowledge base that persists context across sessions.
 */
async function setupPersistentMemory() {
  const memoryDbPath = join(homedir(), '.acfm', 'memory.db');
  const alreadyExists = existsSync(memoryDbPath);

  console.log();
  await animatedSeparator(60);
  console.log();

  const vaultBadge = chalk.hex('#2D3436').bgHex('#6C5CE7').bold(' NexusVault ');
  console.log(`  ${vaultBadge} ${chalk.hex('#B2BEC3').bold('Persistent Memory System')}`);
  console.log();
  console.log(
    chalk.hex('#636E72')(
      '  NexusVault is an embedded SQLite knowledge base that lives at\n' +
      `  ${chalk.hex('#DFE6E9')('~/.acfm/memory.db')} on your machine.\n\n` +
      '  When enabled, your AI assistants will automatically:\n' +
      `    ${chalk.hex('#00CEC9')('◆')} Remember architectural decisions, bugfixes & patterns\n` +
      `    ${chalk.hex('#00CEC9')('◆')} Recall relevant context when you start a new task\n` +
      `    ${chalk.hex('#00CEC9')('◆')} Connect to assistants via MCP (Model Context Protocol)\n\n` +
      '  Your data never leaves your machine — fully offline & private.'
    )
  );
  console.log();

  const { enableMemory } = await inquirer.prompt([{
    type: 'confirm',
    name: 'enableMemory',
    message: chalk.hex('#B2BEC3')('Enable NexusVault persistent memory?'),
    default: true,
  }]);

  if (!enableMemory) {
    console.log();
    console.log(chalk.hex('#636E72')('  Skipped. You can enable it later with: acfm memory init'));
    console.log();
    return;
  }

  console.log();
  console.log(chalk.hex('#B2BEC3')(alreadyExists ? '  Reconnecting NexusVault...' : '  Initializing NexusVault...'));

  // Init the SQLite database (idempotent — skips if already exists)
  const { initDatabase, isDatabaseInitialized } = await import('../memory/database.js');
  if (!isDatabaseInitialized()) {
    initDatabase();
  }
  console.log(
    chalk.hex('#00CEC9')('  ◆ ') +
    chalk.hex('#DFE6E9')(
      alreadyExists
        ? 'NexusVault database found at ~/.acfm/memory.db'
        : 'NexusVault database created at ~/.acfm/memory.db'
    )
  );

  // Install MCP server into detected assistants
  console.log();
  console.log(chalk.hex('#B2BEC3')('  Connecting NexusVault to your AI assistants via MCP...'));
  console.log();

  const { detectAndInstallMCPs, ASSISTANTS, isAssistantInstalled } = await import('../services/mcp-installer.js');
  const { installed, success } = detectAndInstallMCPs();

  if (installed === 0) {
    console.log(chalk.hex('#636E72')('  No AI assistants detected yet.'));
    console.log(chalk.hex('#636E72')('  Run ' + chalk.hex('#DFE6E9')('acfm memory install-mcps') + ' after installing an assistant.'));
  } else {
    for (const assistant of ASSISTANTS) {
      if (isAssistantInstalled(assistant)) {
        console.log(
          chalk.hex('#00CEC9')('  ◆ ') +
          chalk.hex('#DFE6E9').bold(assistant.name) +
          chalk.hex('#636E72')(` · MCP config → ${assistant.configPath}`)
        );
      }
    }
    console.log();
    const successBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${success}/${installed} `);
    console.log(`  ${successBadge} ${chalk.hex('#B2BEC3')('assistants connected to NexusVault')}`);
  }

  console.log();
  console.log(chalk.hex('#6C5CE7').bold('  NexusVault is active.'));
  console.log(chalk.hex('#636E72')('  Use acfm memory --help to manage your knowledge base.'));
  console.log();
}

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

function buildTemplateChoices(templates) {
  return templates.map((template) => {
    const displayName = formatTemplateName(template);
    const desc = TEMPLATE_DESCRIPTIONS[template] || 'Template for AI-assisted development workflows';
    return {
      name:
        `${chalk.hex('#DFE6E9').bold(displayName)}` +
        chalk.hex('#636E72')(` · ${desc}`),
      value: template,
      short: displayName,
    };
  });
}

function printTemplatePreview(template) {
  const capabilities = TEMPLATE_CAPABILITIES[template] || [];
  const skills = TEMPLATE_SKILL_PREVIEWS[template] || [];

  if (capabilities.length > 0) {
    console.log(chalk.hex('#B2BEC3')('  What this template is optimized for:'));
    for (const item of capabilities) {
      console.log(chalk.hex('#00CEC9')('  ◆ ') + chalk.hex('#DFE6E9')(item));
    }
    console.log();
  }

  if (skills.length > 0) {
    console.log(chalk.hex('#B2BEC3')('  Included skill examples:'));
    const skillLine = skills.map((skill) => `\`${skill}\``).join('  ');
    console.log(chalk.hex('#6C5CE7')(`  ${skillLine}`));
    console.log();
  }
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
  const totalSteps = 5 + stepOffset;

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
    await stepHeader(1 + stepOffset, totalSteps, 'Scanning framework templates');
    await scanAnimation('Indexing available templates', 1000);
    console.log();

    let templates;
    try {
      templates = await getAvailableTemplates(frameworkPath);
    } catch {
      console.log(chalk.hex('#D63031')('  ✗ Error: Could not read framework directory.'));
      console.log(chalk.hex('#636E72')('  Make sure ac-framework is installed correctly.'));
      process.exit(1);
    }

    if (templates.length === 0) {
      console.log(chalk.hex('#FDCB6E')('  No templates found in framework directory.'));
      process.exit(0);
    }

    const countBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${templates.length} `);
    console.log(`  ${countBadge} ${chalk.hex('#B2BEC3')('templates found')}`);
    console.log();
    await animatedSeparator(60);
    console.log();

    // ── Step: Select Template ─────────────────────────────────────
    await stepHeader(2 + stepOffset, totalSteps, 'Select your template');

    const templateChoices = buildTemplateChoices(templates);
    const { template } = await inquirer.prompt([
      {
        type: 'list',
        name: 'template',
        message: acGradient('Choose a development template:'),
        choices: templateChoices,
        pageSize: 10,
      },
    ]);

    const templatePath = await resolveTemplatePath(template, frameworkPath);
    const templateBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${formatTemplateName(template)} `);
    console.log();
    console.log(`  ${chalk.hex('#636E72')('Template:')} ${templateBadge}`);
    console.log(chalk.hex('#636E72')(`  Source: ${templatePath}`));
    console.log();
    printTemplatePreview(template);

    let folders;
    try {
      folders = await getSelectableModules(templatePath);
    } catch {
      console.log(chalk.hex('#D63031')('  ✗ Error: Could not read template contents.'));
      process.exit(1);
    }

    if (folders.length === 0) {
      console.log(chalk.hex('#FDCB6E')('  No assistant modules found inside the selected template.'));
      process.exit(0);
    }

    await animatedSeparator(60);
    console.log();

    // ── Step: Select ──────────────────────────────────────────────
    await stepHeader(3 + stepOffset, totalSteps, 'Select your assistants');

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
    await stepHeader(4 + stepOffset, totalSteps, 'Instruction files');

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
    await stepHeader(5 + stepOffset, totalSteps, 'Installing modules');

    const allToInstall = expandWithBundled(selected);
    let installed = 0;
    const errors = [];

    // Install module folders
    for (const folder of allToInstall) {
        const displayName = formatFolderName(folder);
        try {
          await installWithAnimation(displayName, async () => {
            await copyModule(folder, targetDir, templatePath);
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
          await copyMdFile(md, targetDir, templatePath);
        });
        installed++;
      } catch (err) {
        errors.push({ folder: md, error: err.message });
      }
      await sleep(80);
    }

    // ── Final result ──────────────────────────────────────────────
    if (errors.length === 0) {
      await saveTemplateSelection(targetDir, template);
      await celebrateSuccess(installed, targetDir);
      await setupPersistentMemory();
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
