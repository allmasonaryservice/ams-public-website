// Add blog sections to:
//  - 19 tuckpointing city pages (before <CTABanner />)
//  - 11 service pages (before <CTABanner />)
// Run: node docs/add-blog-sections.mjs

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ─── CITY PAGES ───────────────────────────────────────────────────────────────
// All 19 tuckpointing city pages get 3 blog posts:
// 1. tuckpointing service guide (same for all)
// 2. tuckpointing cost guide (same for all)
// 3. city-specific masonry contractor post
const CITY_PAGES = [
  { file: 'tuckpointing/chicago.astro',        citySlug: 'chicago-il',        cityName: 'Chicago' },
  { file: 'tuckpointing/evanston.astro',       citySlug: 'evanston-il',       cityName: 'Evanston' },
  { file: 'tuckpointing/wilmette.astro',       citySlug: 'wilmette-il',       cityName: 'Wilmette' },
  { file: 'tuckpointing/northbrook.astro',     citySlug: 'northbrook-il',     cityName: 'Northbrook' },
  { file: 'tuckpointing/naperville.astro',     citySlug: 'naperville-il',     cityName: 'Naperville' },
  { file: 'tuckpointing/hinsdale.astro',       citySlug: 'hinsdale-il',       cityName: 'Hinsdale' },
  { file: 'tuckpointing/oak-brook.astro',      citySlug: 'oak-brook-il',      cityName: 'Oak Brook' },
  { file: 'tuckpointing/elmhurst.astro',       citySlug: 'elmhurst-il',       cityName: 'Elmhurst' },
  { file: 'tuckpointing/highland-park.astro',  citySlug: 'highland-park-il',  cityName: 'Highland Park' },
  { file: 'tuckpointing/winnetka.astro',       citySlug: 'winnetka-il',       cityName: 'Winnetka' },
  { file: 'tuckpointing/kenilworth.astro',     citySlug: 'kenilworth-il',     cityName: 'Kenilworth' },
  { file: 'tuckpointing/glencoe.astro',        citySlug: 'glencoe-il',        cityName: 'Glencoe' },
  { file: 'tuckpointing/la-grange.astro',      citySlug: 'la-grange-il',      cityName: 'La Grange' },
  { file: 'tuckpointing/western-springs.astro',citySlug: 'western-springs-il',cityName: 'Western Springs' },
  { file: 'tuckpointing/downers-grove.astro',  citySlug: 'downers-grove-il',  cityName: 'Downers Grove' },
  { file: 'tuckpointing/burr-ridge.astro',     citySlug: 'burr-ridge-il',     cityName: 'Burr Ridge' },
  { file: 'tuckpointing/clarendon-hills.astro',citySlug: 'clarendon-hills-il',cityName: 'Clarendon Hills' },
  { file: 'tuckpointing/willowbrook.astro',    citySlug: 'willowbrook-il',    cityName: 'Willowbrook' },
  { file: 'tuckpointing/wheaton.astro',        citySlug: 'wheaton-il',        cityName: 'Wheaton' },
];

// ─── SERVICE PAGES ────────────────────────────────────────────────────────────
const SERVICE_PAGES = [
  {
    file: 'services/tuckpointing-repointing.astro',
    posts: [
      { slug: 'tuckpointing-repointing-chicago-guide', title: 'Complete Guide to Tuckpointing & Repointing in Chicago', desc: 'When to repoint, what mortar to use, and how Chicago freeze-thaw cycles destroy failing joints.' },
      { slug: 'tuckpointing-cost-chicago-2026',        title: 'Tuckpointing Cost in Chicago 2026: What to Expect',      desc: 'Per-linear-foot pricing, full two-flat estimates, and factors that move the number up or down.' },
    ]
  },
  {
    file: 'services/chimney-repair-rebuilding.astro',
    posts: [
      { slug: 'chimney-repair-vs-rebuild-guide',   title: 'Chimney Repair vs. Full Rebuild: How to Decide',         desc: 'Understand which scope your chimney actually needs before you call a contractor.' },
      { slug: 'chimney-risk-score-tool-guide',     title: 'How to Use Our Free Chimney Risk Score Tool',            desc: 'Assess your chimney\'s condition in minutes and know exactly what to discuss with AMS.' },
    ]
  },
  {
    file: 'services/natural-stone-limestone.astro',
    posts: [
      { slug: 'natural-stone-limestone-chicago-guide', title: 'Natural Stone & Limestone Masonry in Chicago',         desc: 'Indiana limestone, greystone, and fieldstone — materials, repair methods, and what to expect.' },
      { slug: 'stone-style-selector-tool-guide',       title: 'How to Use Our Free Stone Style Selector Tool',        desc: 'Pick the right stone profile for your home\'s architecture in minutes.' },
    ]
  },
  {
    file: 'services/brick-installation.astro',
    posts: [
      { slug: 'brick-installation-chicago-guide',       title: 'Brick Installation in Chicago: The Complete Guide',    desc: 'New brick walls, additions, and features — materials, process, and cost in the Chicago area.' },
      { slug: 'brick-installation-estimator-tool-guide',title: 'How to Use Our Free Brick Installation Estimator',    desc: 'Get a fast brick count and material estimate before your AMS consultation.' },
    ]
  },
  {
    file: 'services/damaged-brick-replacement.astro',
    posts: [
      { slug: 'damaged-brick-replacement-guide',title: 'Damaged Brick Replacement: When to Repair vs. Replace',  desc: 'Spalling, cracking, and face loss — know which bricks can be saved and which must go.' },
      { slug: 'how-to-identify-brick-damage',   title: 'How to Identify Brick Damage Before It Gets Worse',     desc: 'A homeowner\'s visual guide to reading your brick facade and catching problems early.' },
    ]
  },
  {
    file: 'services/chimney-fireplace.astro',
    posts: [
      { slug: 'chimney-fireplace-guide',      title: 'Chimney & Fireplace Masonry: Chicago Homeowner\'s Guide', desc: 'Firebox, flue, crown, and cap — what each part does and how AMS keeps it working.' },
      { slug: 'chimney-risk-score-tool-guide',title: 'How to Use Our Free Chimney Risk Score Tool',             desc: 'Score your chimney\'s condition in minutes and arrive at your estimate ready.' },
    ]
  },
  {
    file: 'services/brick-stone-veneers.astro',
    posts: [
      { slug: 'brick-stone-veneers-guide',             title: 'Brick & Stone Veneers: Chicago Installation Guide',  desc: 'Full-bed vs. thin veneer, material options, and how AMS installs for Chicago\'s climate.' },
      { slug: 'veneer-coverage-calculator-tool-guide', title: 'How to Use Our Free Veneer Coverage Calculator',     desc: 'Know your square footage and material budget before you call.' },
    ]
  },
  {
    file: 'services/custom-home-masonry.astro',
    posts: [
      { slug: 'custom-home-masonry-guide',             title: 'Custom Home Masonry in Chicago: What\'s Possible',   desc: 'Brick, stone, and combination work for new construction and major renovations.' },
      { slug: 'custom-home-masonry-planner-tool-guide',title: 'How to Use Our Free Custom Home Masonry Planner',   desc: 'Scope your project, set a budget range, and prepare for your AMS consultation.' },
    ]
  },
  {
    file: 'services/commercial-brick-stone.astro',
    posts: [
      { slug: 'commercial-masonry-chicago-guide',   title: 'Commercial Masonry in Chicago: Contractor Guide',   desc: 'Tuckpointing, facade restoration, and new masonry for commercial buildings.' },
      { slug: 'commercial-scope-builder-tool-guide',title: 'How to Use Our Free Commercial Scope Builder Tool', desc: 'Build a clear project scope for your commercial masonry work before calling AMS.' },
    ]
  },
  {
    file: 'services/cmu-block-installation.astro',
    posts: [
      { slug: 'cmu-block-installation-guide',  title: 'CMU Block Installation in Chicago: The Full Guide',  desc: 'Concrete masonry units for retaining walls, foundations, and commercial structures.' },
      { slug: 'cmu-load-calculator-tool-guide',title: 'How to Use Our Free CMU Load Calculator Tool',      desc: 'Estimate block count and load requirements before your AMS consultation.' },
    ]
  },
  {
    file: 'services/commercial-masonry-veneers.astro',
    posts: [
      { slug: 'commercial-masonry-veneers-guide',       title: 'Commercial Masonry Veneers: Chicago Installation Guide', desc: 'Stone and brick veneer for commercial facades — specs, process, and AMS approach.' },
      { slug: 'facade-coverage-estimator-tool-guide',   title: 'How to Use Our Free Facade Coverage Estimator Tool',    desc: 'Estimate coverage area and material quantity for your commercial veneer project.' },
    ]
  },
];

// ─── CITY BLOG SECTION GENERATOR ──────────────────────────────────────────────
function cityBlogSection(cityName, citySlug) {
  return `
  <!-- ─── BLOG RESOURCES ─── -->
  <section class="lp-section lp-blog" style="background:#F5F3EF;border-top:1px solid #D8D2C8;">
    <div class="lp-section-inner">
      <div class="lp-section-label">From the Blog</div>
      <h2 class="lp-section-h2">Masonry Resources for <em>${cityName} Homeowners</em></h2>
      <div class="lp-blog-grid">
        <a href="/blog/tuckpointing-repointing-chicago-guide" class="lp-blog-card">
          <div class="lp-blog-tag">Service Guide</div>
          <h3 class="lp-blog-title">Complete Guide to Tuckpointing &amp; Repointing in Chicago</h3>
          <p class="lp-blog-desc">When to repoint, what mortar to use, and how Chicago freeze-thaw cycles destroy failing joints.</p>
          <span class="lp-blog-read">Read Article</span>
        </a>
        <a href="/blog/tuckpointing-cost-chicago-2026" class="lp-blog-card">
          <div class="lp-blog-tag">Pricing Guide</div>
          <h3 class="lp-blog-title">Tuckpointing Cost in Chicago 2026: What to Expect</h3>
          <p class="lp-blog-desc">Per-linear-foot pricing, full two-flat estimates, and factors that move the number up or down.</p>
          <span class="lp-blog-read">Read Article</span>
        </a>
        <a href="/blog/masonry-contractor-${citySlug}" class="lp-blog-card">
          <div class="lp-blog-tag">Local Guide</div>
          <h3 class="lp-blog-title">Masonry Contractor in ${cityName}, IL — What to Know</h3>
          <p class="lp-blog-desc">Local permit requirements, common brick types, and what sets ${cityName} masonry apart from other suburbs.</p>
          <span class="lp-blog-read">Read Article</span>
        </a>
      </div>
    </div>
  </section>
`;
}

// ─── SERVICE BLOG SECTION GENERATOR ──────────────────────────────────────────
function serviceBlogSection(posts) {
  const cards = posts.map(p => `
        <a href="/blog/${p.slug}" class="lp-blog-card">
          <div class="lp-blog-tag">Read More</div>
          <h3 class="lp-blog-title">${p.title}</h3>
          <p class="lp-blog-desc">${p.desc}</p>
          <span class="lp-blog-read">Read Article</span>
        </a>`).join('');

  return `
  <!-- ─── BLOG RESOURCES ─── -->
  <section class="lp-blog-section" style="background:#F5F3EF;border-top:1px solid #D8D2C8;padding:80px 0;">
    <div style="max-width:1280px;margin:0 auto;padding:0 80px;">
      <div style="font-family:'Satoshi',sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#D4A931;margin-bottom:12px;">From the Blog</div>
      <h2 style="font-family:'Fraunces',serif;font-size:clamp(28px,3.5vw,44px);font-weight:700;color:#1A1A1A;line-height:1.1;margin-bottom:40px;">Related Reading &amp; <em style="font-style:italic;font-weight:400;color:#D4A931;">Resources</em></h2>
      <div class="lp-blog-grid">${cards}
      </div>
    </div>
  </section>
`;
}

// ─── SHARED CSS (added once per file via style tag) ───────────────────────────
const BLOG_CSS = `
  .lp-blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: #D8D2C8; margin-top: 0; }
  .lp-blog-card { background: #fff; padding: 32px 28px; display: flex; flex-direction: column; gap: 12px; text-decoration: none; color: inherit; transition: background 200ms ease; }
  .lp-blog-card:hover { background: #FAFAF8; }
  .lp-blog-tag { font-family: 'Satoshi', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #D4A931; }
  .lp-blog-title { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 700; color: #1A1A1A; line-height: 1.3; }
  .lp-blog-desc { font-family: 'Satoshi', sans-serif; font-size: 14px; color: #555; line-height: 1.6; flex: 1; }
  .lp-blog-read { font-family: 'Satoshi', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #D4A931; margin-top: 8px; }
  @media (max-width: 900px) { .lp-blog-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px) { .lp-blog-grid { grid-template-columns: 1fr; } }
`;

// ─── PROCESS CITY PAGES ───────────────────────────────────────────────────────
let cityOk = 0, cityFail = 0;
for (const { file, citySlug, cityName } of CITY_PAGES) {
  const filePath = path.join(ROOT, 'src', 'pages', file);
  try {
    let content = await readFile(filePath, 'utf8');

    // Skip if already added
    if (content.includes('lp-blog-grid')) {
      console.log(`  ⏭  ${file} (already has blog section)`);
      cityOk++;
      continue;
    }

    // Add CSS before closing </style>
    content = content.replace('</style>', BLOG_CSS + '\n  </style>');

    // Add blog section before <CTABanner />
    const blogHtml = cityBlogSection(cityName, citySlug);
    content = content.replace('  <CTABanner />', blogHtml + '  <CTABanner />');

    await writeFile(filePath, content, 'utf8');
    console.log(`  ✓ ${file}`);
    cityOk++;
  } catch (err) {
    console.log(`  ✗ ${file}: ${err.message}`);
    cityFail++;
  }
}

// ─── PROCESS SERVICE PAGES ────────────────────────────────────────────────────
let svcOk = 0, svcFail = 0;
for (const { file, posts } of SERVICE_PAGES) {
  const filePath = path.join(ROOT, 'src', 'pages', file);
  try {
    let content = await readFile(filePath, 'utf8');

    // Skip if already added
    if (content.includes('lp-blog-section')) {
      console.log(`  ⏭  ${file} (already has blog section)`);
      svcOk++;
      continue;
    }

    // Service pages: insert before <CTABanner />
    const blogHtml = serviceBlogSection(posts);
    content = content.replace('  <CTABanner />', blogHtml + '  <CTABanner />');

    // Add CSS — service pages have their own <style> block
    // Insert blog grid CSS before the last </style> tag
    const lastStyleClose = content.lastIndexOf('</style>');
    if (lastStyleClose !== -1) {
      content = content.slice(0, lastStyleClose) + BLOG_CSS + '\n  </style>' + content.slice(lastStyleClose + '</style>'.length);
    }

    await writeFile(filePath, content, 'utf8');
    console.log(`  ✓ ${file}`);
    svcOk++;
  } catch (err) {
    console.log(`  ✗ ${file}: ${err.message}`);
    svcFail++;
  }
}

console.log(`\n━━━ Summary ━━━`);
console.log(`City pages : ${cityOk} ok, ${cityFail} failed`);
console.log(`Service pages: ${svcOk} ok, ${svcFail} failed`);
