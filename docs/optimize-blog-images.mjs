// Optimize ONLY /public/images/blog/ images
// Desktop: 1200x675 → max 60KB WebP (in-place)
// Mobile:  640x400  → max 40KB WebP → /blog/mobile/
// Run: node docs/optimize-blog-images.mjs

import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync } from 'fs';
import { writeFile, readFile, unlink, rename } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR   = path.join(__dirname, '..', 'public', 'images', 'blog');
const MOBILE_DIR = path.join(BLOG_DIR, 'mobile');

try { mkdirSync(MOBILE_DIR, { recursive: true }); } catch {}

async function resizeToTarget(rawBuf, width, height, targetKB) {
  const limit = targetKB * 1024;
  // Try qualities from 85 down to 20
  for (let q = 85; q >= 20; q -= 5) {
    const buf = await sharp(rawBuf, { failOnError: false })
      .resize(width, height, { fit: 'cover', position: 'center' })
      .webp({ quality: q, effort: 6 })
      .toBuffer();
    if (buf.length <= limit || q <= 20) {
      return { buf, quality: q, sizeKB: Math.round(buf.length / 1024) };
    }
  }
}

const files = readdirSync(BLOG_DIR)
  .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f) && !f.includes('mobile') && !f.includes('mobile'));

// Also skip the mobile subdir entries
const blogFiles = files.filter(f => !readdirSync(MOBILE_DIR).includes(f));

console.log(`Optimizing ${files.length} blog images…\n`);

let ok = 0, fail = 0, sumBefore = 0, sumDesk = 0, sumMob = 0;

for (const file of files) {
  const src = path.join(BLOG_DIR, file);
  const base = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const desktopDest = path.join(BLOG_DIR, base);
  const mobileDest  = path.join(MOBILE_DIR, base);
  const tmp = path.join(os.tmpdir(), `amsopt-${Date.now()}-${base}`);

  const before = Math.round(statSync(src).size / 1024);
  sumBefore += before;

  try {
    const rawBuf = await readFile(src);

    const desk = await resizeToTarget(rawBuf, 1200, 675, 60);
    const mob  = await resizeToTarget(rawBuf, 640,  400, 40);

    // Write desktop to tmp, delete original, rename
    await writeFile(tmp, desk.buf);
    if (src !== desktopDest) {
      try { await unlink(src); } catch {}
    } else {
      try { await unlink(desktopDest); } catch {}
    }
    await rename(tmp, desktopDest);

    // Write mobile
    await writeFile(mobileDest, mob.buf);

    sumDesk += desk.sizeKB;
    sumMob  += mob.sizeKB;
    ok++;

    console.log(`✓ ${base.padEnd(52)} ${before}KB → desk:${String(desk.sizeKB).padStart(3)}KB(q${desk.quality}) mob:${String(mob.sizeKB).padStart(3)}KB(q${mob.quality})`);
  } catch (err) {
    fail++;
    console.log(`✗ ${file}: ${err.message}`);
  }
}

const n = files.length;
console.log(`\n━━━ Summary ━━━`);
console.log(`Processed  : ${ok} ok, ${fail} failed`);
console.log(`Avg before : ${Math.round(sumBefore/n)} KB`);
console.log(`Avg desktop: ${Math.round(sumDesk/(ok||1))} KB  (target ≤60 KB)`);
console.log(`Avg mobile : ${Math.round(sumMob/(ok||1))} KB   (target ≤40 KB)`);
