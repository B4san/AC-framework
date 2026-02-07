#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { showBanner } from './ui/banner.js';

const program = new Command();

program
  .name('acfm')
  .description('AC Framework - Agentic Coding Framework CLI')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize AC Framework modules in your project')
  .action(async () => {
    await showBanner();
    await initCommand();
  });

program.parse();
