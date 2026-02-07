import chalk from 'chalk';
import gradient from 'gradient-string';
import { createSpinner } from 'nanospinner';
import { sleep } from '../utils/helpers.js';

const acGradient = gradient(['#6C5CE7', '#00CEC9', '#0984E3']);
const successGradient = gradient(['#00CEC9', '#00B894', '#55EFC4']);
const warmGradient = gradient(['#FDCB6E', '#E17055', '#D63031']);
const glowGradient = gradient(['#0984E3', '#00CEC9', '#55EFC4', '#00CEC9', '#0984E3']);

// ── Matrix Rain ──────────────────────────────────────────────────

export async function matrixRain(durationMs = 1800) {
  const cols = Math.min(process.stdout.columns || 80, 80);
  const rows = 8;
  const drops = Array.from({ length: cols }, () => ({
    y: Math.floor(Math.random() * rows),
    speed: 1 + Math.floor(Math.random() * 2),
    trail: 2 + Math.floor(Math.random() * 3),
  }));
  const chars = '01アイウエオカキクケコサシスセソ>>=</>{}[]ACFM';
  const colors = ['#00CEC9', '#0984E3', '#6C5CE7', '#00FF41', '#55EFC4'];
  const frameTime = 50;
  const totalFrames = Math.floor(durationMs / frameTime);

  // Print initial empty rows
  for (let i = 0; i < rows; i++) console.log();

  for (let frame = 0; frame < totalFrames; frame++) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(' '));

    for (let c = 0; c < cols; c++) {
      const drop = drops[c];
      // Draw trail
      for (let t = 0; t < drop.trail; t++) {
        const ty = drop.y - t;
        if (ty >= 0 && ty < rows) {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          const brightness = t === 0 ? '#FFFFFF' : colors[Math.floor(Math.random() * colors.length)];
          const opacity = t === 0 ? 1 : Math.max(0.2, 1 - t * 0.3);
          grid[ty][c] = t === 0
            ? chalk.hex(brightness).bold(ch)
            : chalk.hex(brightness)(ch);
        }
      }
      drop.y += drop.speed;
      if (drop.y - drop.trail > rows) {
        drop.y = -Math.floor(Math.random() * 6);
        drop.speed = 1 + Math.floor(Math.random() * 2);
        drop.trail = 2 + Math.floor(Math.random() * 3);
      }
    }

    let output = '';
    for (const row of grid) {
      output += '  ' + row.join('') + '\n';
    }

    process.stdout.write(`\x1B[${rows}A`);
    process.stdout.write(output);
    await sleep(frameTime);
  }

  // Fade out effect
  for (let fade = 0; fade < 4; fade++) {
    process.stdout.write(`\x1B[${rows}A`);
    for (let r = 0; r < rows; r++) {
      let line = '  ';
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.3 - fade * 0.07) {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          line += chalk.hex('#2D3436')(ch);
        } else {
          line += ' ';
        }
      }
      console.log(line);
    }
    await sleep(60);
  }

  // Clear the area
  process.stdout.write(`\x1B[${rows}A`);
  for (let i = 0; i < rows; i++) {
    process.stdout.write('\x1B[2K\n');
  }
  process.stdout.write(`\x1B[${rows}A`);
}

// ── Scanning / Loading ───────────────────────────────────────────

export async function scanAnimation(text, durationMs = 1000) {
  const frames = ['◜', '◠', '◝', '◞', '◡', '◟'];
  const totalFrames = Math.floor(durationMs / 80);

  for (let i = 0; i < totalFrames; i++) {
    const frame = frames[i % frames.length];
    const dots = '.'.repeat((i % 3) + 1).padEnd(3);
    process.stdout.write(
      `\r  ${chalk.hex('#00CEC9')(frame)} ${chalk.hex('#B2BEC3')(text)}${chalk.hex('#636E72')(dots)}`
    );
    await sleep(80);
  }
  process.stdout.write(
    `\r  ${chalk.hex('#00CEC9')('◉')} ${chalk.hex('#00CEC9')(text)}   \n`
  );
}

// ── Animated Separator ───────────────────────────────────────────

export async function animatedSeparator(width = 60) {
  const ch = '─';
  for (let i = 0; i <= width; i++) {
    const before = ch.repeat(i);
    const dot = '●';
    const after = ch.repeat(Math.max(0, width - i));
    process.stdout.write(
      `\r  ${glowGradient(before)}${chalk.hex('#00CEC9')(dot)}${chalk.hex('#2D3436')(after)}`
    );
    await sleep(4);
  }
  process.stdout.write(`\r  ${glowGradient(ch.repeat(width))}  \n`);
}

// ── Staggered List Reveal ────────────────────────────────────────

export async function revealList(items, { prefix = '◆', color = '#00CEC9', delay = 60 } = {}) {
  for (const item of items) {
    // Slide in from left
    const maxSlide = 6;
    for (let s = maxSlide; s >= 0; s--) {
      const pad = ' '.repeat(s);
      process.stdout.write(
        `\r  ${pad}${chalk.hex(color)(prefix)} ${item}`
      );
      await sleep(15);
    }
    console.log();
    await sleep(delay);
  }
}

// ── Progress Bar (enhanced) ──────────────────────────────────────

export async function progressBar(label, steps = 30, durationMs = 1000) {
  const barWidth = 35;
  const blocks = ['░', '▒', '▓', '█'];

  for (let i = 0; i <= steps; i++) {
    const progress = (i / steps) * barWidth;
    const full = Math.floor(progress);
    const partial = progress - full;

    let bar = '';
    for (let b = 0; b < barWidth; b++) {
      if (b < full) {
        bar += chalk.hex('#6C5CE7')('█');
      } else if (b === full) {
        const blockIdx = Math.floor(partial * blocks.length);
        bar += chalk.hex('#A29BFE')(blocks[Math.min(blockIdx, blocks.length - 1)]);
      } else {
        bar += chalk.hex('#2D3436')('░');
      }
    }

    const pct = Math.round((i / steps) * 100);
    const pctStr = `${pct}%`.padStart(4);

    // Spinner character
    const spinChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const spin = i < steps
      ? chalk.hex('#00CEC9')(spinChars[i % spinChars.length])
      : chalk.hex('#00CEC9')('✓');

    process.stdout.write(
      `\r  ${spin} ${chalk.hex('#B2BEC3')(label)} ${bar} ${chalk.hex('#00CEC9')(pctStr)}`
    );
    await sleep(durationMs / steps);
  }
  process.stdout.write('\n');
}

// ── Installation Spinner (enhanced) ──────────────────────────────

export async function installWithAnimation(name, task) {
  const frames = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
  let frameIdx = 0;
  let running = true;

  const animate = async () => {
    while (running) {
      const frame = chalk.hex('#6C5CE7')(frames[frameIdx % frames.length]);
      process.stdout.write(
        `\r  ${frame} ${chalk.hex('#B2BEC3')('Installing')} ${chalk.hex('#DFE6E9').bold(name)}${chalk.hex('#636E72')('...')}`
      );
      frameIdx++;
      await sleep(60);
    }
  };

  const animPromise = animate();

  try {
    await task();
    running = false;
    await sleep(70);
    process.stdout.write(
      `\r  ${chalk.hex('#00CEC9')('✓')} ${chalk.hex('#00CEC9')(name)}${chalk.hex('#636E72')(' installed successfully')}          \n`
    );
  } catch (err) {
    running = false;
    await sleep(70);
    process.stdout.write(
      `\r  ${chalk.hex('#D63031')('✗')} ${chalk.hex('#D63031')(name)}${chalk.hex('#636E72')(` — ${err.message}`)}          \n`
    );
    throw err;
  }
}

// ── Success Celebration ──────────────────────────────────────────

export async function celebrateSuccess(moduleCount, targetDir) {
  console.log();
  await animatedSeparator(60);
  console.log();

  // Big checkmark animation
  const check = [
    '         ██╗',
    '        ██╔╝',
    '       ██╔╝ ',
    '  ██╗ ██╔╝  ',
    '  ╚████╔╝   ',
    '   ╚═══╝    ',
  ];

  for (const line of check) {
    console.log(successGradient(line));
    await sleep(50);
  }

  console.log();
  await progressBar('Finalizing', 30, 800);
  console.log();

  // Sparkle animation on the success message
  const msg = '  Installation complete!';
  const sparkles = ['✦', '✧', '⊹', '✶', '⋆'];
  for (let i = 0; i < 3; i++) {
    const s1 = sparkles[Math.floor(Math.random() * sparkles.length)];
    const s2 = sparkles[Math.floor(Math.random() * sparkles.length)];
    const s3 = sparkles[Math.floor(Math.random() * sparkles.length)];
    process.stdout.write(
      `\r  ${chalk.hex('#FDCB6E')(s1)} ${successGradient(msg.trim())} ${chalk.hex('#FDCB6E')(s2)} ${chalk.hex('#00CEC9')(s3)}`
    );
    await sleep(200);
  }
  console.log();
  console.log();

  // Module count badge
  const countBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${moduleCount} modules `);
  const pathBadge = chalk.hex('#636E72')(targetDir);
  console.log(`  ${countBadge} ${chalk.hex('#636E72')('installed in')} ${pathBadge}`);

  console.log();

  // Tips box
  const boxW = 52;
  const topBorder = chalk.hex('#636E72')('  ┌' + '─'.repeat(boxW) + '┐');
  const botBorder = chalk.hex('#636E72')('  └' + '─'.repeat(boxW) + '┘');
  const line = (content, raw) => {
    const pad = boxW - raw.length;
    return chalk.hex('#636E72')('  │') + content + ' '.repeat(Math.max(0, pad)) + chalk.hex('#636E72')('│');
  };

  console.log(topBorder);
  console.log(line(
    chalk.hex('#FDCB6E')(' ⚡ Quick Start'),
    ' ⚡ Quick Start'
  ));
  console.log(line(
    chalk.hex('#636E72')(' '),
    ' '
  ));
  console.log(line(
    chalk.hex('#B2BEC3')('  Your AI assistants are ready to use.'),
    '  Your AI assistants are ready to use.'
  ));
  console.log(line(
    chalk.hex('#B2BEC3')('  Open your project in your preferred IDE.'),
    '  Open your project in your preferred IDE.'
  ));
  console.log(botBorder);

  console.log();
  console.log(chalk.hex('#636E72')('  Happy coding! ') + chalk.hex('#00CEC9')('→') + chalk.hex('#636E72')(' ac-framework'));
  console.log();
}

// ── Failure Summary ──────────────────────────────────────────────

export async function showFailureSummary(installed, errors) {
  console.log();
  await animatedSeparator(60);
  console.log();

  console.log(
    warmGradient(`  ⚠ ${installed} installed, ${errors.length} failed`)
  );
  console.log();

  for (const { folder, error } of errors) {
    console.log(
      chalk.hex('#D63031')('  ✗ ') +
      chalk.hex('#DFE6E9')(folder) +
      chalk.hex('#636E72')(` — ${error}`)
    );
  }
  console.log();
}

// ── Step Header ──────────────────────────────────────────────────

export async function stepHeader(stepNum, totalSteps, label) {
  const stepBadge = chalk.hex('#2D3436').bgHex('#6C5CE7').bold(` ${stepNum}/${totalSteps} `);
  console.log(`  ${stepBadge} ${chalk.hex('#DFE6E9')(label)}`);
  console.log();
}
