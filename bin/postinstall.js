#!/usr/bin/env node

const isWin = process.platform === 'win32';

console.log();
console.log('  ✓ ac-framework installed successfully!');
console.log();
console.log('  Available commands:');
console.log();
console.log('    Core');
console.log('      acfm init                Install modules into your project');
console.log('      acfm init --latest       Download latest from GitHub');
console.log('      acfm update              Update installed modules');
console.log();
console.log('    Spec-Driven Workflow');
console.log('      acfm spec init           Bootstrap openspec/ directory');
console.log('      acfm spec new <name>     Create a new change');
console.log('      acfm spec status         View change status');
console.log('      acfm spec list           List active changes');
console.log('      acfm spec instructions   Get artifact instructions');
console.log('      acfm spec validate       Validate change structure');
console.log('      acfm spec archive        Archive a completed change');
console.log('      acfm spec schemas        List workflow schemas');
console.log();
console.log('    Tip: Add --json to any spec command for machine-readable output.');
console.log();

if (isWin) {
  console.log('  ⚠  If "acfm" is not recognized, add npm global bin to your PATH:');
  console.log();
  console.log('    1. Run:  npm config get prefix');
  console.log('    2. Copy the output path (e.g. C:\\Users\\YourUser\\AppData\\Roaming\\npm)');
  console.log('    3. Add it to your system PATH:');
  console.log('       - Search "Environment Variables" in Windows Settings');
  console.log('       - Edit "Path" under User variables');
  console.log('       - Add the npm prefix path');
  console.log('    4. Restart your terminal');
  console.log();
}
