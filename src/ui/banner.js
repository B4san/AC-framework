import gradient from 'gradient-string';
import chalk from 'chalk';
import { sleep } from '../utils/helpers.js';

const acGradient = gradient(['#6C5CE7', '#A29BFE', '#00CEC9', '#0984E3', '#6C5CE7']);
const dimGradient = gradient(['#2D3436', '#636E72', '#2D3436']);
const glowGradient = gradient(['#0984E3', '#00CEC9', '#55EFC4', '#00CEC9', '#0984E3']);

const LOGO = [
  '     ██████╗  ██████╗         ███████╗██████╗  █████╗ ███╗   ███╗███████╗',
  '    ██╔══██╗██╔════╝         ██╔════╝██╔══██╗██╔══██╗████╗ ████║██╔════╝',
  '    ███████║██║              █████╗  ██████╔╝███████║██╔████╔██║█████╗  ',
  '    ██╔══██║██║              ██╔══╝  ██╔══██╗██╔══██║██║╚██╔╝██║██╔══╝  ',
  '    ██║  ██║╚██████╗         ██║     ██║  ██║██║  ██║██║ ╚═╝ ██║███████╗',
  '    ╚═╝  ╚═╝ ╚═════╝         ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝',
];

export async function showBanner() {
  console.clear();
  console.log();

  // Phase 1: Glitch-in effect — show random noise then resolve to the logo
  const maxWidth = Math.max(...LOGO.map((l) => l.length));
  const glitchChars = '█▓▒░╗╔╝╚═║╬╣╠╩╦';
  const glitchSteps = 6;

  for (let step = 0; step < glitchSteps; step++) {
    const ratio = step / (glitchSteps - 1); // 0 → 1
    const output = [];
    for (const line of LOGO) {
      let result = '';
      for (let i = 0; i < line.length; i++) {
        if (line[i] === ' ') {
          result += ' ';
        } else if (Math.random() < ratio) {
          result += line[i];
        } else {
          result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }
      }
      output.push(result);
    }

    if (step > 0) {
      process.stdout.write(`\x1B[${LOGO.length}A`);
    }
    for (const line of output) {
      const colored = step < glitchSteps - 1
        ? dimGradient(line)
        : acGradient(line);
      console.log(colored);
    }
    await sleep(step < glitchSteps - 1 ? 80 : 0);
  }

  console.log();

  // Phase 2: Animated separator with scanning effect
  const sepWidth = 68;
  const sepChars = '─';
  for (let i = 0; i <= sepWidth; i++) {
    const line =
      chalk.hex('#2D3436')('  ') +
      glowGradient(sepChars.repeat(i)) +
      chalk.hex('#00CEC9')('●') +
      chalk.hex('#2D3436')(sepChars.repeat(Math.max(0, sepWidth - i)));
    process.stdout.write(`\r${line}`);
    await sleep(6);
  }
  process.stdout.write(`\r  ${glowGradient(sepChars.repeat(sepWidth))}  \n`);

  console.log();

  // Phase 3: Typewriter tagline with cursor blink
  const tagline = '  Agentic Coding Framework — Multi-assistant configuration system';
  const cursor = '▌';
  for (let i = 0; i <= tagline.length; i++) {
    const text = tagline.slice(0, i);
    process.stdout.write(`\r${chalk.hex('#DFE6E9')(text)}${chalk.hex('#00CEC9')(cursor)}`);
    await sleep(i % 4 === 0 ? 18 : 10);
  }
  // Blink cursor 3 times then remove
  for (let b = 0; b < 3; b++) {
    process.stdout.write(`\r${chalk.hex('#DFE6E9')(tagline)}${chalk.hex('#00CEC9')(cursor)}`);
    await sleep(120);
    process.stdout.write(`\r${chalk.hex('#DFE6E9')(tagline)} `);
    await sleep(120);
  }
  process.stdout.write(`\r${chalk.hex('#DFE6E9')(tagline)}  \n`);

  // Phase 4: Info badges
  console.log();
  const version = chalk.hex('#2D3436').bgHex('#00CEC9').bold(' v1.x ');
  const badge = chalk.hex('#2D3436').bgHex('#6C5CE7').bold(' CLI ');
  const badge2 = chalk.hex('#2D3436').bgHex('#FDCB6E').bold(' 23 Assistants ');
  console.log(`  ${version} ${badge} ${badge2}`);

  console.log();
  process.stdout.write(`  ${glowGradient(sepChars.repeat(sepWidth))}  \n`);
  console.log();
}
