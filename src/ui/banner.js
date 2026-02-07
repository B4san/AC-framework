import figlet from 'figlet';
import gradient from 'gradient-string';
import chalk from 'chalk';
import { sleep } from '../utils/helpers.js';

const acGradient = gradient(['#6C5CE7', '#00CEC9', '#0984E3', '#6C5CE7']);
const subtleGradient = gradient(['#636E72', '#B2BEC3']);

export async function showBanner() {
  console.clear();
  console.log();

  const asciiArt = figlet.textSync('AC  Framework', {
    font: 'ANSI Shadow',
    horizontalLayout: 'fitted',
  });

  // Typing animation for the ASCII art
  const lines = asciiArt.split('\n');
  for (const line of lines) {
    console.log(acGradient(line));
    await sleep(40);
  }

  console.log();
  console.log(
    subtleGradient('  ─────────────────────────────────────────────────────────────────')
  );
  console.log();

  // Typewriter effect for tagline
  const tagline = '  Agentic Coding Framework — Multi-assistant configuration system';
  for (let i = 0; i <= tagline.length; i++) {
    process.stdout.write(`\r${chalk.hex('#DFE6E9')(tagline.slice(0, i))}${chalk.hex('#00CEC9')('█')}`);
    await sleep(12);
  }
  process.stdout.write(`\r${chalk.hex('#DFE6E9')(tagline)}  \n`);

  console.log();
  console.log(
    subtleGradient('  ─────────────────────────────────────────────────────────────────')
  );
  console.log();
}
