#!/usr/bin/env node

import { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initCommand } from './commands/init.js';
import { updateCommand } from './commands/update.js';
import { specCommand } from './commands/spec.js';
import { showBanner } from './ui/banner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(await readFile(resolve(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('acfm')
  .description('AC Framework - Agentic Coding Framework CLI')
  .version(pkg.version);

program
  .command('init')
  .description('Initialize AC Framework modules in your project')
  .option('--latest', 'Download latest framework from GitHub instead of using bundled version')
  .option('--branch <branch>', 'GitHub branch to pull from (implies --latest)')
  .action(async (opts) => {
    await showBanner();
    await initCommand(opts);
  });

program
  .command('update')
  .description('Update installed modules to the latest version from GitHub')
  .option('--branch <branch>', 'GitHub branch to pull from (default: main)')
  .action(async (opts) => {
    await updateCommand(opts);
  });

program.addCommand(specCommand());

program.parse();
