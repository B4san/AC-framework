#!/usr/bin/env node

import { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initCommand } from './commands/init.js';
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
  .action(async () => {
    await showBanner();
    await initCommand();
  });

program.parse();
