#!/usr/bin/env node

const isWin = process.platform === 'win32';

console.log();
console.log('  ✓ ac-framework installed successfully!');
console.log();
console.log('  Get started:');
console.log('    acfm init');
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
