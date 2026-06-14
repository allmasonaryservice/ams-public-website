import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

const API_KEY = 'crnlndQJ08dwt8OiZMxL1niF2WDbAq5vSWi78T0qrk6hr05GXC0DIZlc';
const OUT_DIR = './public/images';
mkdirSync(OUT_DIR, { recursive: true });

const images = [
  {
    file: 'service-cmu.webp',
    // actual CMU concrete masonry units
    url: 'https://images.pexels.com/photos/16594605/pexels-photo-16594605.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    file: 'service-commercial.webp',
    // USA commercial brick building Lancaster Ohio
    url: 'https://images.pexels.com/photos/34262326/pexels-photo-34262326.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    file: 'service-commercial-veneers.webp',
    // stone veneer cladding exterior
    url: 'https://images.pexels.com/photos/17500796/pexels-photo-17500796.jpeg?auto=compress&cs=tinysrgb&w=1920',
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
