const API_KEY = 'crnlndQJ08dwt8OiZMxL1niF2WDbAq5vSWi78T0qrk6hr05GXC0DIZlc';

async function search(label, query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: API_KEY } });
  const data = await res.json();
  console.log(`\n🔍 [${label}] "${query}"`);
  data.photos?.forEach((p, i) => {
    console.log(`  [${i}] id:${p.id} | ${p.photographer} | ${p.width}x${p.height}`);
    console.log(`       ${p.url}`);
  });
}

// PROBLEM: cracked/damaged brick chimney wall USA home
await search('PROBLEM', 'cracked brick wall chimney damage USA home');
await search('PROBLEM', 'deteriorating brick foundation crack american house');

// SOLUTION: beautiful professional masonry brick USA home
await search('SOLUTION', 'beautiful brick house exterior USA professional masonry');
await search('SOLUTION', 'new brick home construction american residential masonry');
