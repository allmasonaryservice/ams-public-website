import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

const API_KEY = 'crnlndQJ08dwt8OiZMxL1niF2WDbAq5vSWi78T0qrk6hr05GXC0DIZlc';
const OUT_DIR = './public/images';
mkdirSync(OUT_DIR, { recursive: true });

const images = [
  {
    file: 'why-choose-us-brick.webp',
    // PROBLEM: clearly cracked/damaged brick wall
    url: 'https://images.pexels.com/photos/5684818/pexels-photo-5684818.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    file: 'service-custom-home.webp',
    // SOLUTION: brand new brick house Texas USA
    url: 'https://images.pexels.com/photos/34304714/pexels-photo-34304714.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
];

async function downloadAndConvert({ file, url }) {
  console.log(`⬇  Fetching: ${file}`);
  try {
    const imgRes = await fetch(url);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const outPath = path.join(OUT_DIR, file);
    await sharp(buffer).webp({ quality: 88 }).toFile(outPath);
    console.log(`✅ Saved: ${outPath}`);
  } catch (err) {
    console.error(`❌ Failed: ${file} — ${err.message}`);
  }
}

for (const img of images) {
  await downloadAndConvert(img);
  await new Promise(r => setTimeout(r, 300));
}
console.log('\n✅ Done!');
