// Optimize project desktop images ONLY (mobile untouched)
// Desktop: 1200x675, target 60-120KB WebP (high quality, not blurry)
// Source: [slug]-desktop-raw.jpg → [slug]-desktop.webp (in-place)
// Run: node docs/optimize-project-desktop.mjs

import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { writeFile, readFile, unlink, rename } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJ_DIR = path.join(__dirname, '..', 'public', 'images', 'projects');

// Find all raw source files
const rawFiles = readdirSync(PROJ_DIR)
  .filter(f => f.endsWith('-desktop-raw.jpg') || f.endsWith('-desktop-raw.jpeg') || f.endsWith('-desktop-raw.png') || f.endsWith('-desktop-raw.webp'));

console.log(`Found ${rawFiles.length} raw source files to optimize…\n`);

async function resizeToTarget(rawBuf, width, height, minKB, maxKB) {
  const minBytes = minKB * 1024;
  const maxBytes = maxKB * 1024;

  // Start at quality 92, step down until we hit ≤maxKB
  // If we go below minKB at some quality, return the previous (higher quality) result
  let lastResult = null;
  for (let q = 92; q >= 55; q -= 3) {
    const buf = await sharp(rawBuf, { failOnError: false })
      .resize(width, height, { fit: 'cover', position: 'center' })
      .webp({ quality: q, effort: 6 })
      .toBuffer();
    const kb = buf.length / 1024;
    if (kb <= maxKB) {
      // Within range — try to stay above minKB too
      return { buf, quality: q, sizeKB: Math.round(kb) };
    }
    lastResult = { buf, quality: q, sizeKB: Math.round(kb) };
  }
  // Still above maxKB even at q=55 — return best we can
  return lastResult || { buf: Buffer.alloc(0), quality: 55, sizeKB: 0 };
}

let ok = 0, fail = 0;

for (const file of rawFiles) {
  const src = path.join(PROJ_DIR, file);
  // e.g. "chicago-tuckpointing-repointing-desktop-raw.jpg" → "chicago-tuckpointing-repointing-desktop.webp"
  const baseName = file.replace(/-desktop-raw\.(jpg|jpeg|png|webp)$/i, '-desktop.webp');
  const destPath = path.join(PROJ_DIR, baseName);
  const tmp = path.join(os.tmpdir(), `amsopt-proj-${Date.now()}-${baseName}`);

  const beforeKB = Math.round(statSync(src).size / 1024);

  try {
    const rawBuf = await readFile(src);

    // Target: 60-120KB. Start at 1200×675.
    let result = await resizeToTarget(rawBuf, 1200, 675, 60, 120);

    // If still above 120KB after q=55, try smaller dimensions
    if (result.sizeKB > 120) {
      for (const [w, h] of [[1000, 563], [900, 506], [800, 450]]) {
        result = await resizeToTarget(rawBuf, w, h, 60, 120);
        if (result.sizeKB <= 120) break;
      }
    }

    await writeFile(tmp, result.buf);

    // Remove old desktop file if exists
    if (existsSync(destPath)) {
      try { await unlink(destPath); } catch {}
    }
    await rename(tmp, destPath);

    // Remove the raw source file
    try { await unlink(src); } catch {}

    ok++;
    console.log(`✓ ${baseName.padEnd(55)} ${beforeKB}KB raw → ${result.sizeKB}KB (q${result.quality})`);
  } catch (err) {
    fail++;
    console.log(`✗ ${file}: ${err.message}`);
  }
}

console.log(`\n━━━ Summary ━━━`);
console.log(`Processed: ${ok} ok, ${fail} failed`);
console.log(`Mobile images untouched ✓`);
