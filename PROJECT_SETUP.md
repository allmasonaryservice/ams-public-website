# AMS Public Website — Project Setup

**Domain:** allmasonryservices.com  
**Stack:** Astro 6 + GSAP + Lenis + Tailwind CSS v4

---

## Packages Installed

| Package | Version | কাজ |
|---|---|---|
| `astro` | 6.4.5 | Core framework |
| `tailwindcss` | 4.3.0 | Utility CSS |
| `@tailwindcss/vite` | 4.3.0 | Tailwind v4 Vite plugin |
| `gsap` | 3.15.0 | Animation library |
| `lenis` | 1.3.23 | Smooth scroll |
| `astro-seo` | 1.1.0 | On-page SEO meta tags |
| `@astrojs/sitemap` | 3.7.3 | Auto sitemap.xml generate |
| `@astrojs/rss` | 4.0.18 | Blog RSS feed |

> `@astrojs/image` লাগেনি — Astro 6 এ built-in `<Image />` component আছে।

---

## VS Code Extensions

### Astro
| Extension | ID | কাজ |
|---|---|---|
| Astro | `astro-build.astro-vscode` | Syntax highlighting, IntelliSense |
| Astro Snippets | `sheltonlouis.astro-snippets` | Boilerplate snippets |

### Tailwind CSS
| Extension | ID | কাজ |
|---|---|---|
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Class autocomplete, hover preview |
| Tailwind Snippets | `zarifprogrammer.tailwind-snippets` | Quick snippets |

### GSAP
| Extension | ID | কাজ |
|---|---|---|
| GSAP Snippets | `hridoy.gsap-snippets` | Animation snippets |

### Code Quality
| Extension | ID | কাজ |
|---|---|---|
| Prettier | `esbenp.prettier-vscode` | Auto format |
| ESLint | `dbaeumer.vscode-eslint` | Linting |
| Error Lens | `usernamehw.errorlens` | Inline error display |
| Pretty TS Errors | `yoavbls.pretty-ts-errors` | TypeScript error readable |
| Code Spell Checker | `streetsidesoftware.code-spell-checker` | Spelling check |

### Navigation & DX
| Extension | ID | কাজ |
|---|---|---|
| Path IntelliSense | `christian-kohler.path-intellisense` | File path autocomplete |
| NPM IntelliSense | `christian-kohler.npm-intellisense` | NPM module autocomplete |
| Import Cost | `wix.vscode-import-cost` | Bundle size inline দেখায় |
| Iconify | `antfu.iconify` | Icon preview inline |

### Git
| Extension | ID | কাজ |
|---|---|---|
| GitLens | `eamodio.gitlens` | Git history, blame |
| Git Graph | `mhutchie.git-graph` | Visual git graph |

### UI / Visuals
| Extension | ID | কাজ |
|---|---|---|
| Material Icon Theme | `pkief.material-icon-theme` | File icons |
| Fluent Icons | `miguelsolorio.fluent-icons` | UI icons |
| TODO Tree | `gruntfuggly.todo-tree` | TODO comments track |

### TypeScript
| Extension | ID | কাজ |
|---|---|---|
| TypeScript Next | `ms-vscode.vscode-typescript-next` | Latest TS features |

---

## SEO Setup

### On-Page SEO — `astro-seo`
প্রতিটা page এ `BaseLayout` use করলে automatically apply হয়:
- Title + Meta Description
- Canonical URL
- Open Graph (Facebook, LinkedIn, WhatsApp share preview)
- Twitter Card
- noindex / nofollow control
- Theme color, author meta

### AEO (Answer Engine Optimization)
Schema Markup components:

| Component | File | কোথায় use করবে |
|---|---|---|
| `SchemaOrg` | `src/components/SchemaOrg.astro` | সব page এ (BaseLayout এ আছে) |
| `SchemaFAQ` | `src/components/SchemaFAQ.astro` | FAQ section এ |
| `SchemaService` | `src/components/SchemaService.astro` | Services page এ |

**Schema Types:**
- `Organization` — Company info, Google Knowledge Panel
- `WebSite` — Site search action
- `FAQPage` — Google Featured Snippets, People Also Ask
- `Service` — Service pages

### GEO (Generative Engine Optimization)
AI crawlers (ChatGPT, Gemini, Perplexity) এর জন্য:
- `public/llms.txt` — AI bots কে site সম্পর্কে বলে

### Technical SEO
| Feature | কীভাবে |
|---|---|
| Sitemap | `@astrojs/sitemap` — build এ auto generate |
| robots.txt | `public/robots.txt` |
| RSS Feed | `@astrojs/rss` — blog এর জন্য |
| Canonical URL | `astro-seo` দিয়ে প্রতিটা page এ |
| Image Optimization | Astro built-in `<Image />` |

---

## Performance Setup (Core Web Vitals)

সব কিছু `BaseLayout.astro` এ একবার করা আছে — প্রতিটা page এ automatically apply হয়।

| Metric | Fix | কীভাবে |
|---|---|---|
| **FCP** ↓ | Critical CSS inline | Tailwind v4 + Vite auto |
| **FCP** ↓ | Font preconnect | BaseLayout `<head>` এ |
| **LCP** ↓ | Hero image eager load | `loading="eager" fetchpriority="high"` |
| **TBT = 0** | Dynamic import | `import('gsap')` + `import('lenis')` |
| **TBT = 0** | requestIdleCallback | Browser idle এ GSAP+Lenis load |
| **CLS = 0** | ViewTransitions | Astro built-in |
| **CLS = 0** | Image dimensions | `width` + `height` সবসময় দিতে হবে |
| **CPU free** | No main thread block | Dynamic import + idle callback |
| **Speed Index** ↓ | Zero JS by default | Astro Island architecture |

### Dev vs Production
```js
// BaseLayout এ automatic
if (isDev) {
  // Dev — eager load (faster DX, hot reload)
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  // Production — idle load (no TBT, no CPU hit)
  requestIdleCallback(initAnimations, { timeout: 2000 });
}
```

### Section এ Animation করার নিয়ম
```astro
<script>
  window.addEventListener('animations:ready', () => {
    const gsap = (window as any).__gsap;
    const ScrollTrigger = (window as any).__ScrollTrigger;

    gsap.from('.my-element', {
      opacity: 0,
      y: 60,
      duration: 1,
      scrollTrigger: { trigger: '.my-element' }
    });
  });
</script>
```

---

## Project File Structure

```
AMS_PUBLIC_WEBSITE/
├── public/
│   ├── robots.txt          ← Google crawler control
│   ├── llms.txt            ← AI crawler (GEO)
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── SchemaOrg.astro     ← Organization + WebSite schema
│   │   ├── SchemaFAQ.astro     ← FAQ schema (AEO)
│   │   └── SchemaService.astro ← Service schema (AEO)
│   ├── layouts/
│   │   └── BaseLayout.astro    ← সব performance + SEO এখানে
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css          ← Tailwind + Lenis CSS
├── astro.config.mjs            ← Sitemap + Tailwind vite plugin
├── package.json
└── tsconfig.json
```

---

## BaseLayout Usage

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Home | All Masonry Services"
  description="Professional masonry services you can trust."
  ogImage="/images/og-home.jpg"
>
  <!-- sections এখানে -->
</BaseLayout>
```

---

## Important Notes

1. **`astro.config.mjs` এ `site`** → `https://allmasonryservices.com` set আছে
2. **Production test** → `npm run build && npm run preview` — dev এ Lighthouse চালালে score কম আসবে, এটা normal
3. **Image format** → সবসময় `.webp` use করবে, JPG/PNG এড়াবে
4. **Font** → Google Fonts use করলে `BaseLayout` এ preconnect already আছে
5. **Analytics** → Google Analytics / GTM add করলে `defer` করতে হবে, নাহলে TBT বাড়বে
