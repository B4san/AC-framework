/**
 * spec.js — `acfm spec` command group.
 *
 * AC Framework Spec-Driven Development Workflow
 * Supports both .acfm/ (new) and openspec/ (legacy) directories for backward compatibility.
 * All commands support --json for machine-readable output (used by skills).
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
  initProject,
  createChange,
  listChanges,
  getChangeStatus,
  getGlobalStatus,
  getArtifactInstructions,
  getApplyInstructions,
  archiveChange,
  listSchemas,
  validateChange,
} from '../services/spec-engine.js';

/**
 * Output helper: prints JSON if --json flag, otherwise human-readable
 */
function output(data, json) {
  if (json) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
  }
  return data;
}

/**
 * Build and return the `acfm spec` command group
 */
export function specCommand() {
  const spec = new Command('spec')
    .description('AC Framework spec-driven development workflow');

  // ─── acfm spec init ──────────────────────────────────────────────────────

  spec
    .command('init')
    .description('Initialize spec directory (.acfm/) in the current project')
    .option('--schema <schema>', 'Default workflow schema', 'spec-driven')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const result = await initProject(process.cwd(), opts.schema);
        if (opts.json) {
          output(result, true);
          return;
        }
        if (result.created) {
          console.log(chalk.green(`Initialized ${result.dirName}/ directory`));
          console.log(chalk.dim(`  Schema: ${opts.schema}`));
          console.log(chalk.dim(`  Path:   ${result.path}`));
          console.log(chalk.dim(`\n  Legacy openspec/ directories are also supported for backward compatibility.`));
        } else {
          console.log(chalk.yellow(`${result.dirName}/ already initialized`));
          console.log(chalk.dim(`  Path: ${result.path}`));
        }
      } catch (err) {
        if (opts.json) {
          output({ error: err.message }, true);
          process.exit(1);
        }
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm spec new ───────────────────────────────────────────────────────

  spec
    .command('new <name>')
    .description('Create a new change with scaffolded artifact files')
    .option('--schema <schema>', 'Workflow schema to use (overrides project default)')
    .option('--json', 'Output as JSON')
    .action(async (name, opts) => {
      try {
        const result = await createChange(name, process.cwd(), opts.schema);
        if (opts.json) {
          output(result, true);
          return;
        }
        console.log(chalk.green(`Created change "${name}"`));
        console.log(chalk.dim(`  Schema:    ${result.schemaName}`));
        console.log(chalk.dim(`  Path:      ${result.changeDir}`));
        console.log(chalk.dim(`  Artifacts: ${result.artifacts.join(', ')}`));
      } catch (err) {
        if (opts.json) {
          output({ error: err.message }, true);
          process.exit(1);
        }
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm spec status ────────────────────────────────────────────────────

  spec
    .command('status')
    .description('Show status (global or per-change)')
    .option('--change <name>', 'Show status for a specific change')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        if (opts.change) {
          // Per-change status
          const status = await getChangeStatus(opts.change, process.cwd());
          if (opts.json) {
            output(status, true);
            return;
          }
          console.log(chalk.bold(`Change: ${opts.change}`));
          console.log(chalk.dim(`Schema: ${status.schemaName}`));
          console.log('');
          for (const art of status.artifacts) {
            const icon = art.status === 'done' ? chalk.green('\u2713')
              : art.status === 'ready' ? chalk.yellow('\u25CB')
              : chalk.dim('\u2022');
            const label = art.status === 'done' ? chalk.green(art.status)
              : art.status === 'ready' ? chalk.yellow(art.status)
              : chalk.dim(art.status);
            console.log(`  ${icon} ${art.id.padEnd(12)} ${label}`);
          }
          console.log('');
          console.log(status.isComplete
            ? chalk.green('All artifacts complete')
            : chalk.yellow(`Apply requires: ${status.applyRequires.join(', ')}`));
        } else {
          // Global status
          const status = await getGlobalStatus(process.cwd());
          if (opts.json) {
            output(status, true);
            return;
          }
          if (!status.initialized) {
            console.log(chalk.yellow('Spec directory not initialized'));
            console.log(chalk.dim('Run: acfm spec init'));
            console.log(chalk.dim('\nNote: Legacy openspec/ directories are automatically detected.'));
            return;
          }
          const dirName = status.dirName || '.acfm';
          console.log(chalk.bold('Spec Status'));
          console.log(chalk.dim(`Directory: ${dirName}/`));
          console.log(chalk.dim(`Schema: ${status.schema}`));
          console.log(chalk.dim(`Active changes: ${status.activeChanges}`));
          if (status.changes.length > 0) {
            console.log('');
            for (const ch of status.changes) {
              console.log(`  ${chalk.cyan(ch.name.padEnd(30))} ${ch.status}`);
            }
          }
        }
      } catch (err) {
        if (opts.json) {
          output({ error: err.message }, true);
          process.exit(1);
        }
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm spec list ──────────────────────────────────────────────────────

  spec
    .command('list')
    .description('List active changes')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const changes = await listChanges(process.cwd());
        if (opts.json) {
          output(changes, true);
          return;
        }
        if (changes.length === 0) {
          console.log(chalk.dim('No active changes'));
          return;
        }
        console.log(chalk.bold('Active Changes'));
        console.log('');
        for (const ch of changes) {
          console.log(`  ${chalk.cyan(ch.name.padEnd(30))} ${chalk.dim(ch.schema.padEnd(15))} ${ch.status}`);
        }
      } catch (err) {
        if (opts.json) {
          output({ error: err.message }, true);
          process.exit(1);
        }
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm spec instructions ──────────────────────────────────────────────

  spec
    .command('instructions <artifact>')
    .description('Get instructions for creating an artifact or applying changes')
    .requiredOption('--change <name>', 'Change name')
    .option('--json', 'Output as JSON')
    .action(async (artifact, opts) => {
      try {
        let result;
        if (artifact === 'apply') {
          result = await getApplyInstructions(opts.change, process.cwd());
        } else {
          result = await getArtifactInstructions(artifact, opts.change, process.cwd());
        }

        if (opts.json) {
          output(result, true);
          return;
        }

        // Human-readable output
        if (artifact === 'apply') {
          console.log(chalk.bold('Apply Instructions'));
          console.log(chalk.dim(`State: ${result.state}`));
          console.log(chalk.dim(`Progress: ${result.progress.complete}/${result.progress.total} tasks`));
          console.log('');
          console.log(result.instruction);
          if (result.contextFiles.length > 0) {
            console.log('');
            console.log(chalk.dim('Context files:'));
            for (const f of result.contextFiles) {
              console.log(chalk.dim(`  ${f}`));
            }
          }
        } else {
          console.log(chalk.bold(`Instructions: ${artifact}`));
          console.log(chalk.dim(`Output: ${result.outputPath}`));
          if (result.dependencies.length > 0) {
            console.log(chalk.dim(`Dependencies: ${result.dependencies.join(', ')}`));
          }
          if (result.instruction) {
            console.log('');
            console.log(result.instruction);
          }
          if (result.template) {
            console.log('');
            console.log(chalk.dim('--- Template ---'));
            console.log(result.template);
          }
        }
      } catch (err) {
        if (opts.json) {
          output({ error: err.message }, true);
          process.exit(1);
        }
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm spec archive ───────────────────────────────────────────────────

  spec
    .command('archive <name>')
    .description('Archive a completed change')
    .option('--json', 'Output as JSON')
    .action(async (name, opts) => {
      try {
        const result = await archiveChange(name, process.cwd());
        if (opts.json) {
          output(result, true);
          return;
        }
        console.log(chalk.green(`Archived "${name}"`));
        console.log(chalk.dim(`  Moved to: ${result.archivedTo}`));
      } catch (err) {
        if (opts.json) {
          output({ error: err.message }, true);
          process.exit(1);
        }
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm spec schemas ───────────────────────────────────────────────────

  spec
    .command('schemas')
    .description('List available workflow schemas')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const schemas = await listSchemas();
        if (opts.json) {
          output(schemas, true);
          return;
        }
        console.log(chalk.bold('Available Schemas'));
        console.log('');
        for (const s of schemas) {
          console.log(`  ${chalk.cyan(s.name.padEnd(20))} ${chalk.dim(s.description)}`);
        }
      } catch (err) {
        if (opts.json) {
          output({ error: err.message }, true);
          process.exit(1);
        }
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm spec validate ──────────────────────────────────────────────────

  spec
    .command('validate <name>')
    .description('Validate a change\'s artifacts for structural correctness')
    .option('--json', 'Output as JSON')
    .action(async (name, opts) => {
      try {
        const result = await validateChange(name, process.cwd());
        if (opts.json) {
          output(result, true);
          return;
        }
        if (result.valid && result.issues.length === 0) {
          console.log(chalk.green(`Change "${name}" is valid with no issues`));
          return;
        }
        console.log(chalk.bold(`Validation: ${name}`));
        console.log(result.valid ? chalk.green('Valid') : chalk.red('Invalid'));
        console.log('');
        for (const issue of result.issues) {
          const icon = issue.severity === 'error' ? chalk.red('\u2718')
            : issue.severity === 'warning' ? chalk.yellow('\u26A0')
            : chalk.dim('\u2139');
          console.log(`  ${icon} ${issue.message}`);
        }
      } catch (err) {
        if (opts.json) {
          output({ error: err.message }, true);
          process.exit(1);
        }
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  return spec;
}
