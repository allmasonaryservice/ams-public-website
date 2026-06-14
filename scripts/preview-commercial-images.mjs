const API_KEY = 'crnlndQJ08dwt8OiZMxL1niF2WDbAq5vSWi78T0qrk6hr05GXC0DIZlc';

async function search(label, query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=portrait`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  const data = await res.json();
  console.log(`\n🔍 [${label}]`);
  data.photos?.forEach((p, i) => {
    console.log(`  [${i}] id:${p.id} | ${p.photographer} | ${p.width}x${p.height}`);
    console.log(`       ${p.url}`);
  });
}

await search('CMU BLOCK', 'concrete block wall cmu construction industrial');
await search('COMMERCIAL BRICK', 'commercial brick building facade USA professional');
await search('MASONRY VENEERS', 'stone veneer cladding commercial building exterior');
