import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const API_KEY = 'crnlndQJ08dwt8OiZMxL1niF2WDbAq5vSWi78T0qrk6hr05GXC0DIZlc';
const OUT_DIR = './public/images';

mkdirSync(OUT_DIR, { recursive: true });

const images = [
  { file: 'why-choose-us-brick.webp',        query: 'brick masonry wall craftsman' },
  { file: 'service-custom-home.webp',         query: 'brick house exterior residential masonry' },
  { file: 'service-brick-installation.webp',  query: 'bricklaying worker construction' },
  { file: 'service-stone.webp',               query: 'natural stone wall limestone installation' },
  { file: 'service-veneers.webp',             query: 'stone veneer wall exterior' },
  { file: 'service-chimney.webp',             query: 'brick chimney exterior house' },
  { file: 'service-cmu.webp',                 query: 'concrete block wall cmu construction' },
  { file: 'service-commercial.webp',          query: 'commercial brick building facade' },
  { file: 'service-commercial-veneers.webp',  query: 'building brick facade commercial' },
  { file: 'about-masonry-work.webp',          query: 'mason worker brickwork craftsmanship' },
  { file: 'about-door-texture.webp',          query: 'dark brick wall texture close up' },
];

async function fetchBest(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=portrait`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  const data = await res.json();
  if (!data.photos?.length) throw new Error(`No results for: ${query}`);
  // pick highest quality photo (first result is best match)
  return data.photos[0].src.large2x;
}

async function downloadAndConvert({ file, query }) {
  console.log(`⬇  Fetching: ${file} (${query})`);
  try {
    const imgUrl = await fetchBest(query);
    const imgRes = await fetch(imgUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    const outPath = path.join(OUT_DIR, file);
    await sharp(buffer)
      .webp({ quality: 85 })
      .toFile(outPath);

    console.log(`✅ Saved: ${outPath}`);
  } catch (err) {
    console.error(`❌ Failed: ${file} — ${err.message}`);
  }
}

// Run sequentially to avoid rate limit
for (const img of images) {
  await downloadAndConvert(img);
  await new Promise(r => setTimeout(r, 300));
}

console.log('\n🎉 Done! All images saved to /public/images/');
