import gradient from 'gradient-string';
import chalk from 'chalk';
import { sleep } from '../utils/helpers.js';

// ── Emerald Color Palette ─────────────────────────────────────────
const emeraldGradient = gradient(['#1B5E20', '#2ECC71', '#50C878', '#00FF7F', '#50C878', '#2ECC71', '#1B5E20']);
const dimEmerald = gradient(['#0D2B0D', '#1B3A1B', '#2D4A2D', '#1B3A1B', '#0D2B0D']);
const brightEmerald = gradient(['#00FF7F', '#55FFB2', '#AAFFDD', '#55FFB2', '#00FF7F']);
const glowGradient = gradient(['#1B5E20', '#2ECC71', '#50C878', '#2ECC71', '#1B5E20']);

// ── Emerald Gem ASCII Art ─────────────────────────────────────────
// Faceted gem with "AC" in crown and code/symbols in body
const EMERALD_GEM = [
  '                        ╱╲',
  '                       ╱  ╲',
  '                      ╱    ╲',
  '                     ╱  AC  ╲',
  '                    ╱════════╲',
  '                   ╱ {=>}  ◈  ╲',
  '                  ╱  async  AI  ╲',
  '                 ╱  ◇  /**/  ⊹   ╲',
  '                ╱   import {} ◈    ╲',
  '               ╱══════════════════╲',
  '                ╲   ⊹  () => {}  ╱',
  '                 ╲  ◈  const   ╱',
  '                  ╲   ✦  AI  ╱',
  '                   ╲  ◇ {} ╱',
  '                    ╲    ╱',
  '                     ╲  ╱',
  '                      ╲╱',
];

// Sparkle row indices where sparkles can appear (around the gem perimeter)
const SPARKLE_ROWS = [0, 1, 2, 4, 9, 14, 15, 16];

const SPARKLE_CHARS = ['✦', '✧', '⊹', '✶', '⋆'];

export async function showBanner() {
  console.clear();
  console.log();

  const gemHeight = EMERALD_GEM.length;
  const particleChars = '░▒▓█◈◇⊹';

  // ── Phase 1: Particle Build-up ──────────────────────────────────
  // Green particles progressively form the emerald silhouette
  const buildSteps = 6;

  for (let step = 0; step < buildSteps; step++) {
    const ratio = step / (buildSteps - 1); // 0 → 1
    const output = [];

    for (const line of EMERALD_GEM) {
      let result = '';
      for (let i = 0; i < line.length; i++) {
        if (line[i] === ' ') {
          // In early frames, occasionally show a stray particle near non-space chars
          if (ratio < 0.6 && Math.random() < 0.03 && i > 0 && line[i - 1] !== ' ') {
            result += particleChars[Math.floor(Math.random() * 3)]; // ░▒▓ only
          } else {
            result += ' ';
          }
        } else if (Math.random() < ratio) {
          result += line[i]; // Reveal actual character
        } else {
          result += particleChars[Math.floor(Math.random() * particleChars.length)];
        }
      }
      output.push(result);
    }

    if (step > 0) {
      process.stdout.write(`\x1B[${gemHeight}A`);
    }
    for (const line of output) {
      const colored = step < buildSteps - 1
        ? dimEmerald(line)
        : emeraldGradient(line);
      console.log(colored);
    }
    await sleep(step < buildSteps - 1 ? 100 : 0);
  }

  // ── Phase 2: Full Reveal with AC highlight ──────────────────────
  // Brief pause then re-render with "AC" in bright white/green
  await sleep(150);
  process.stdout.write(`\x1B[${gemHeight}A`);

  for (let i = 0; i < EMERALD_GEM.length; i++) {
    const line = EMERALD_GEM[i];
    // Highlight "AC" in the crown (line index 3)
    if (i === 3) {
      const acIdx = line.indexOf('AC');
      const before = line.slice(0, acIdx);
      const ac = line.slice(acIdx, acIdx + 2);
      const after = line.slice(acIdx + 2);
      process.stdout.write(
        `\x1B[2K${emeraldGradient(before)}${chalk.hex('#FFFFFF').bold(ac)}${emeraldGradient(after)}\n`
      );
    } else {
      process.stdout.write(`\x1B[2K${emeraldGradient(line)}\n`);
    }
  }
  await sleep(200);

  // ── Phase 3: Pulsing Glow Loop ──────────────────────────────────
  // Alternate bright/dim with sparkles around perimeter
  const pulseCycles = 3;

  for (let cycle = 0; cycle < pulseCycles; cycle++) {
    // Bright phase with sparkles
    process.stdout.write(`\x1B[${gemHeight}A`);

    for (let i = 0; i < EMERALD_GEM.length; i++) {
      const line = EMERALD_GEM[i];
      let rendered;

      if (i === 3) {
        const acIdx = line.indexOf('AC');
        const before = line.slice(0, acIdx);
        const ac = line.slice(acIdx, acIdx + 2);
        const after = line.slice(acIdx + 2);
        rendered = brightEmerald(before) + chalk.hex('#FFFFFF').bold(ac) + brightEmerald(after);
      } else {
        rendered = brightEmerald(line);
      }

      // Add sparkle after the line on perimeter rows
      let sparkle = '';
      if (SPARKLE_ROWS.includes(i) && Math.random() < 0.6) {
        const sp = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
        const pad = Math.floor(Math.random() * 3) + 1;
        sparkle = ' '.repeat(pad) + chalk.hex('#AAFFDD')(sp);
      }

      process.stdout.write(`\x1B[2K${rendered}${sparkle}\n`);
    }
    await sleep(250);

    // Dim phase
    process.stdout.write(`\x1B[${gemHeight}A`);
    for (let i = 0; i < EMERALD_GEM.length; i++) {
      const line = EMERALD_GEM[i];
      let rendered;
      if (i === 3) {
        const acIdx = line.indexOf('AC');
        const before = line.slice(0, acIdx);
        const ac = line.slice(acIdx, acIdx + 2);
        const after = line.slice(acIdx + 2);
        rendered = emeraldGradient(before) + chalk.hex('#A8E6CF').bold(ac) + emeraldGradient(after);
      } else {
        rendered = emeraldGradient(line);
      }
      process.stdout.write(`\x1B[2K${rendered}\n`);
    }
    await sleep(250);
  }

  console.log();

  // ── Phase 4: Animated separator (preserved) ─────────────────────
  const sepWidth = 68;
  const sepChars = '─';
  for (let i = 0; i <= sepWidth; i++) {
    const line =
      chalk.hex('#1B5E20')('  ') +
      glowGradient(sepChars.repeat(i)) +
      chalk.hex('#2ECC71')('●') +
      chalk.hex('#1B5E20')(sepChars.repeat(Math.max(0, sepWidth - i)));
    process.stdout.write(`\x1B[2K\r${line}`);
    await sleep(6);
  }
  process.stdout.write(`\x1B[2K\r  ${glowGradient(sepChars.repeat(sepWidth))}  \n`);

  console.log();

  // ── Phase 5: Typewriter tagline (preserved) ─────────────────────
  const tagline = '  Agentic Coding Framework — Multi-assistant configuration system';
  const cursor = '▌';
  for (let i = 0; i <= tagline.length; i++) {
    const text = tagline.slice(0, i);
    process.stdout.write(`\x1B[2K\r${chalk.hex('#DFE6E9')(text)}${chalk.hex('#2ECC71')(cursor)}`);
    await sleep(i % 4 === 0 ? 18 : 10);
  }
  // Blink cursor 3 times then remove
  for (let b = 0; b < 3; b++) {
    process.stdout.write(`\x1B[2K\r${chalk.hex('#DFE6E9')(tagline)}${chalk.hex('#2ECC71')(cursor)}`);
    await sleep(120);
    process.stdout.write(`\x1B[2K\r${chalk.hex('#DFE6E9')(tagline)} `);
    await sleep(120);
  }
  process.stdout.write(`\x1B[2K\r${chalk.hex('#DFE6E9')(tagline)}  \n`);

  // ── Phase 6: Info badges (preserved) ────────────────────────────
  console.log();
  const version = chalk.hex('#1B5E20').bgHex('#00FF7F').bold(' v1.x ');
  const badge = chalk.hex('#FFFFFF').bgHex('#2ECC71').bold(' CLI ');
  const badge2 = chalk.hex('#1B5E20').bgHex('#A8E6CF').bold(' 23 Assistants ');
  console.log(`  ${version} ${badge} ${badge2}`);

  console.log();
  process.stdout.write(`  ${glowGradient(sepChars.repeat(sepWidth))}  \n`);
  console.log();
}
