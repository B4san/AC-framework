import chalk from 'chalk';
import gradient from 'gradient-string';
import { sleep } from '../utils/helpers.js';

const acGradient = gradient(['#6C5CE7', '#00CEC9', '#0984E3']);
const successGradient = gradient(['#00CEC9', '#00B894', '#55EFC4']);
const warmGradient = gradient(['#FDCB6E', '#E17055', '#D63031']);
const glowGradient = gradient(['#0984E3', '#00CEC9', '#55EFC4', '#00CEC9', '#0984E3']);

// ── Scanning / Loading ───────────────────────────────────────────

export async function scanAnimation(text, durationMs = 800) {
  const frames = ['◜', '◠', '◝', '◞', '◡', '◟'];
  const totalFrames = Math.floor(durationMs / 80);

  for (let i = 0; i < totalFrames; i++) {
    const frame = frames[i % frames.length];
    const dots = '.'.repeat((i % 3) + 1).padEnd(3);
    process.stdout.write(
      `\x1B[2K\r  ${chalk.hex('#00CEC9')(frame)} ${chalk.hex('#B2BEC3')(text)}${chalk.hex('#636E72')(dots)}`
    );
    await sleep(80);
  }
  process.stdout.write(
    `\x1B[2K\r  ${chalk.hex('#00CEC9')('◉')} ${chalk.hex('#00CEC9')(text)}   \n`
  );
}

// ── Animated Separator ───────────────────────────────────────────

export async function animatedSeparator(width = 60) {
  const ch = '─';
  for (let i = 0; i <= width; i += 3) {
    const before = ch.repeat(Math.min(i, width));
    const dot = '●';
    const after = ch.repeat(Math.max(0, width - i));
    process.stdout.write(
      `\x1B[2K\r  ${glowGradient(before)}${chalk.hex('#00CEC9')(dot)}${chalk.hex('#2D3436')(after)}`
    );
    await sleep(3);
  }
  process.stdout.write(`\x1B[2K\r  ${glowGradient(ch.repeat(width))}  \n`);
}

// ── Staggered List Reveal ────────────────────────────────────────

export async function revealList(items, { prefix = '◆', color = '#00CEC9', delay = 30 } = {}) {
  for (const item of items) {
    console.log(`  ${chalk.hex(color)(prefix)} ${item}`);
    await sleep(delay);
  }
}

// ── Installation Spinner ─────────────────────────────────────────

export async function installWithAnimation(name, task) {
  const frames = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
  let frameIdx = 0;
  let running = true;

  const animate = async () => {
    while (running) {
      const frame = chalk.hex('#6C5CE7')(frames[frameIdx % frames.length]);
      process.stdout.write(
        `\x1B[2K\r  ${frame} ${chalk.hex('#B2BEC3')('Installing')} ${chalk.hex('#DFE6E9').bold(name)}${chalk.hex('#636E72')('...')}`
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
      `\x1B[2K\r  ${chalk.hex('#00CEC9')('✓')} ${chalk.hex('#00CEC9')(name)}${chalk.hex('#636E72')(' installed successfully')}\n`
    );
  } catch (err) {
    running = false;
    await sleep(70);
    process.stdout.write(
      `\x1B[2K\r  ${chalk.hex('#D63031')('✗')} ${chalk.hex('#D63031')(name)}${chalk.hex('#636E72')(` — ${err.message}`)}\n`
    );
    throw err;
  }
}

// ── Success Celebration ──────────────────────────────────────────

export async function celebrateSuccess(moduleCount, targetDir) {
  console.log();
  await animatedSeparator(60);
  console.log();

  // Success message
  console.log(`  ${chalk.hex('#00CEC9')('✓')} ${successGradient('Installation complete!')}`);
  console.log();

  // Module count badge
  const countBadge = chalk.hex('#2D3436').bgHex('#00CEC9').bold(` ${moduleCount} modules `);
  const pathBadge = chalk.hex('#636E72')(targetDir);
  console.log(`  ${countBadge} ${chalk.hex('#636E72')('installed in')} ${pathBadge}`);

  console.log();

  // Commands reference box
  const boxW = 62;
  const top = chalk.hex('#636E72')('  ┌' + '─'.repeat(boxW) + '┐');
  const bot = chalk.hex('#636E72')('  └' + '─'.repeat(boxW) + '┘');
  const row = (content, rawLen) => {
    const pad = boxW - rawLen;
    return chalk.hex('#636E72')('  │') + content + ' '.repeat(Math.max(0, pad)) + chalk.hex('#636E72')('│');
  };
  const empty = row(' ', 1);

  console.log(top);
  console.log(row(
    chalk.hex('#FDCB6E')(' ⚡ Available Commands'),
    ' ⚡ Available Commands'.length
  ));
  console.log(empty);

  // Core commands
  console.log(row(
    chalk.hex('#6C5CE7')('  Core'),
    '  Core'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm init')}${chalk.hex('#636E72')(' .............. Install modules into your project')}`,
    '  acfm init .............. Install modules into your project'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm init --latest')}${chalk.hex('#636E72')(' ..... Download latest from GitHub')}`,
    '  acfm init --latest ..... Download latest from GitHub'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm update')}${chalk.hex('#636E72')(' ............ Update installed modules')}`,
    '  acfm update ............ Update installed modules'.length
  ));
  console.log(empty);

  // Spec commands
  console.log(row(
    chalk.hex('#6C5CE7')('  Spec-Driven Workflow'),
    '  Spec-Driven Workflow'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm spec init')}${chalk.hex('#636E72')(' ......... Bootstrap openspec/ directory')}`,
    '  acfm spec init ......... Bootstrap openspec/ directory'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm spec new <name>')}${chalk.hex('#636E72')(' ... Create a new change')}`,
    '  acfm spec new <name> ... Create a new change'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm spec status')}${chalk.hex('#636E72')(' ....... View change status')}`,
    '  acfm spec status ....... View change status'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm spec list')}${chalk.hex('#636E72')(' ......... List active changes')}`,
    '  acfm spec list ......... List active changes'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm spec instructions')}${chalk.hex('#636E72')(' . Get artifact instructions')}`,
    '  acfm spec instructions . Get artifact instructions'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm spec validate')}${chalk.hex('#636E72')(' ..... Validate change structure')}`,
    '  acfm spec validate ..... Validate change structure'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm spec archive')}${chalk.hex('#636E72')(' ...... Archive a completed change')}`,
    '  acfm spec archive ...... Archive a completed change'.length
  ));
  console.log(row(
    `  ${chalk.hex('#00CEC9')('acfm spec schemas')}${chalk.hex('#636E72')(' ...... List workflow schemas')}`,
    '  acfm spec schemas ...... List workflow schemas'.length
  ));
  console.log(empty);

  // JSON flag hint
  console.log(row(
    chalk.hex('#636E72')('  Tip: Add --json to any spec command for machine-readable output'),
    '  Tip: Add --json to any spec command for machine-readable output'.length
  ));

  // Windows PATH help
  if (process.platform === 'win32') {
    console.log(empty);
    console.log(row(
      chalk.hex('#FDCB6E')(' ⚠  Command not found? Run: npm config get prefix'),
      ' ⚠  Command not found? Run: npm config get prefix'.length
    ));
    console.log(row(
      chalk.hex('#B2BEC3')('  Then add that path to your system PATH.'),
      '  Then add that path to your system PATH.'.length
    ));
  }

  console.log(bot);

  console.log();
  console.log(
    chalk.hex('#636E72')('  Happy coding! ') +
    chalk.hex('#00CEC9')('→') +
    chalk.hex('#636E72')(' ac-framework')
  );
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
