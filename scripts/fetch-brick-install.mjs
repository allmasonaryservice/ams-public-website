import sharp from 'sharp';
import { mkdirSync } from 'fs';
import path from 'path';

const API_KEY = 'crnlndQJ08dwt8OiZMxL1niF2WDbAq5vSWi78T0qrk6hr05GXC0DIZlc';
const OUT_DIR = './public/images';
mkdirSync(OUT_DIR, { recursive: true });

const imgRes = await fetch('https://images.pexels.com/photos/32913797/pexels-photo-32913797.jpeg?auto=compress&cs=tinysrgb&w=1920');
const buffer = Buffer.from(await imgRes.arrayBuffer());
await sharp(buffer).webp({ quality: 88 }).toFile(path.join(OUT_DIR, 'service-brick-installation.webp'));
console.log('✅ Saved service-brick-installation.webp');
