import chalk from 'chalk';
import { createSpinner } from 'nanospinner';
import { sleep } from '../utils/helpers.js';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export async function matrixRain(durationMs = 1500) {
  const cols = Math.min(process.stdout.columns || 80, 80);
  const drops = Array.from({ length: cols }, () => ({
    y: Math.floor(Math.random() * 6),
    speed: 1 + Math.floor(Math.random() * 3),
    char: '',
  }));
  const chars = '01アイウエオカキクケコサシスセソタチツテトABCDEFacfm';
  const colors = ['#00CEC9', '#0984E3', '#6C5CE7', '#00FF41'];
  const rows = 6;
  const frameTime = 60;
  const totalFrames = Math.floor(durationMs / frameTime);

  for (let frame = 0; frame < totalFrames; frame++) {
    let output = '';
    const grid = Array.from({ length: rows }, () => Array(cols).fill(' '));

    for (let c = 0; c < cols; c++) {
      const drop = drops[c];
      if (drop.y < rows) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        grid[drop.y][c] = chalk.hex(colors[Math.floor(Math.random() * colors.length)])(ch);
        if (drop.y > 0) {
          grid[drop.y - 1][c] = chalk.hex('#2D3436')(
            chars[Math.floor(Math.random() * chars.length)]
          );
        }
      }
      drop.y += drop.speed;
      if (drop.y > rows + 3) {
        drop.y = -Math.floor(Math.random() * 4);
        drop.speed = 1 + Math.floor(Math.random() * 3);
      }
    }

    for (const row of grid) {
      output += '  ' + row.join('') + '\n';
    }

    process.stdout.write(`\x1B[${rows}A`);
    process.stdout.write(output);
    await sleep(frameTime);
  }

  // Clear the matrix area
  process.stdout.write(`\x1B[${rows}A`);
  for (let i = 0; i < rows; i++) {
    process.stdout.write('\x1B[2K\n');
  }
  process.stdout.write(`\x1B[${rows}A`);
}

export async function loadingAnimation(text, durationMs = 1200) {
  const spinner = createSpinner(chalk.hex('#B2BEC3')(text)).start();
  await sleep(durationMs);
  spinner.success({ text: chalk.hex('#00CEC9')(text) });
}

export async function progressBar(label, steps = 20, durationMs = 800) {
  const filled = '█';
  const empty = '░';
  const barWidth = 30;

  for (let i = 0; i <= steps; i++) {
    const progress = Math.round((i / steps) * barWidth);
    const bar =
      chalk.hex('#6C5CE7')(filled.repeat(progress)) +
      chalk.hex('#2D3436')(empty.repeat(barWidth - progress));
    const pct = Math.round((i / steps) * 100);
    process.stdout.write(
      `\r  ${chalk.hex('#B2BEC3')(label)} ${bar} ${chalk.hex('#00CEC9')(`${pct}%`)}`
    );
    await sleep(durationMs / steps);
  }
  process.stdout.write('\n');
}
