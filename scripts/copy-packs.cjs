const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const candidates = [
  path.resolve(cwd, '..', 'site', 'public', 'research-packs'),
  path.resolve(cwd, 'site', 'public', 'research-packs'),
  path.resolve(cwd, '..', '..', 'site', 'public', 'research-packs'),
];

let srcDir = null;
for (const dir of candidates) {
  try {
    if (fs.statSync(path.join(dir, 'stocks.index.json')).isFile()) {
      srcDir = dir;
      break;
    }
  } catch {}
}

if (!srcDir) {
  console.log('[copy-packs] Source research-packs not found, skipping copy');
  process.exit(0);
}

const destDir = path.resolve(cwd, 'public', 'research-packs');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const entries = fs.readdirSync(srcDir);
for (const entry of entries) {
  const srcPath = path.join(srcDir, entry);
  const destPath = path.join(destDir, entry);
  if (entry === 'stocks.index.json') {
    if (!fs.existsSync(destPath)) {
      fs.cpSync(srcPath, destPath, { recursive: true });
      console.log(`[copy-packs] Copied ${entry}`);
    }
  } else {
    if (!fs.existsSync(destPath)) {
      fs.cpSync(srcPath, destPath, { recursive: true });
      console.log(`[copy-packs] Copied ${entry}`);
    }
  }
}

console.log('[copy-packs] Done');
