import chalk from 'chalk';
import { verifyFrameworkParity } from '../services/parity-check.js';

export async function verifyCommand(options = {}) {
  const frameworkDir = options.framework || 'framework';
  const reference = options.reference || '.claude';

  const result = await verifyFrameworkParity({ frameworkDir, reference });

  console.log(chalk.hex('#636E72')(`Reference assistant: ${reference}`));
  console.log(chalk.hex('#636E72')(`Assistants checked: ${result.assistants.length}`));

  if (result.drift.length === 0) {
    console.log(chalk.green('\n✓ Framework parity check passed. No drift detected.'));
    return;
  }

  console.log(chalk.red(`\n✗ Drift detected: ${result.drift.length} issue(s)`));
  for (const item of result.drift) {
    console.log(chalk.red(`- [${item.type}] ${item.path}`));
  }

  process.exitCode = 1;
}
