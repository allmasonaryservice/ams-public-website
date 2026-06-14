const API_KEY = 'crnlndQJ08dwt8OiZMxL1niF2WDbAq5vSWi78T0qrk6hr05GXC0DIZlc';

async function search(label, query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=8&orientation=portrait`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  const data = await res.json();
  console.log(`\n🔍 [${label}]`);
  data.photos?.forEach((p, i) => {
    console.log(`  [${i}] id:${p.id} | ${p.photographer} | ${p.width}x${p.height}`);
    console.log(`       ${p.url}`);
  });
}

await search('BRICK INSTALL', 'bricklayer laying bricks professional masonry USA');
await search('BRICK INSTALL 2', 'mason worker installing brick wall close up hands');
