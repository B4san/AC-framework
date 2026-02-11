import gradient from 'gradient-string';
import chalk from 'chalk';

// ── Emerald Color Palette ─────────────────────────────────────────
const emeraldGradient = gradient(['#1B5E20', '#2ECC71', '#50C878', '#00FF7F', '#50C878', '#2ECC71', '#1B5E20']);
const glowGradient = gradient(['#1B5E20', '#2ECC71', '#50C878', '#2ECC71', '#1B5E20']);

// ── Emerald Gem ASCII Art ─────────────────────────────────────────
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

export async function showBanner() {
  console.clear();
  console.log();

  // ── Render gem with "AC" highlighted ────────────────────────────
  for (let i = 0; i < EMERALD_GEM.length; i++) {
    const line = EMERALD_GEM[i];
    if (i === 3) {
      const acIdx = line.indexOf('AC');
      const before = line.slice(0, acIdx);
      const ac = line.slice(acIdx, acIdx + 2);
      const after = line.slice(acIdx + 2);
      console.log(`${emeraldGradient(before)}${chalk.hex('#FFFFFF').bold(ac)}${emeraldGradient(after)}`);
    } else {
      console.log(emeraldGradient(line));
    }
  }

  console.log();

  // ── Separator ───────────────────────────────────────────────────
  const sepWidth = 68;
  console.log(`  ${glowGradient('─'.repeat(sepWidth))}  `);

  console.log();

  // ── Tagline ─────────────────────────────────────────────────────
  const tagline = '  Agentic Coding Framework — Multi-assistant configuration system';
  console.log(chalk.hex('#DFE6E9')(tagline));

  // ── Info badges ─────────────────────────────────────────────────
  console.log();
  const version = chalk.hex('#1B5E20').bgHex('#00FF7F').bold(' v1.x ');
  const badge = chalk.hex('#FFFFFF').bgHex('#2ECC71').bold(' CLI ');
  const badge2 = chalk.hex('#1B5E20').bgHex('#A8E6CF').bold(' 23 Assistants ');
  console.log(`  ${version} ${badge} ${badge2}`);

  console.log();
  console.log(`  ${glowGradient('─'.repeat(sepWidth))}  `);
  console.log();
}
