const API_KEY = 'crnlndQJ08dwt8OiZMxL1niF2WDbAq5vSWi78T0qrk6hr05GXC0DIZlc';

async function search(label, query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=8&orientation=portrait`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  const data = await res.json();
  console.log(`\n🔍 [${label}] "${query}"`);
  data.photos?.forEach((p, i) => {
    console.log(`  [${i}] id:${p.id} | ${p.photographer} | ${p.width}x${p.height}`);
    console.log(`       ${p.url}`);
  });
}

// PROBLEM: cracked/damaged brick wall
await search('PROBLEM', 'cracked brick wall damage foundation');
await search('PROBLEM', 'damaged chimney crumbling brick deteriorating');

// SOLUTION: professional clean masonry USA
await search('SOLUTION', 'professional brick masonry new construction USA');
await search('SOLUTION', 'clean brick wall professional masonry work american home');
