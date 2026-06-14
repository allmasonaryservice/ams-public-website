# All Masonry Services Inc — Option 1 Complete Design System

**Charcoal Black + Gold** · Color · Typography · UI Components · Layout · Animation · Full Developer Reference · v3

---

## 1. Core Color Palette

### All Colors Quick Reference

| Role | Hex | Name | Used Where |
|------|-----|------|------------|
| PRIMARY | `#1A1A1A` | Charcoal Black | Nav, footer, H1/H2, dark section bg, button borders |
| GOLD | `#D4A931` | Gold | CTA button bg, icons, star ratings, badge bg, phone text |
| GOLD HOVER | `#B8932A` | Deep Gold | CTA button `:hover` background |
| GOLD ACTIVE | `#9A7A22` | Gold Dark | CTA button `:active` / click background |
| GOLD DISABLED | `#E8C96A` | Gold Disabled | Disabled button bg · opacity 0.6 · cursor not-allowed |
| BG MAIN | `#F5F3EF` | Stone White | Odd sections (Hero, About, Contact) |
| BG ALT | `#E8E4DC` | Light Stone | Even sections (Services, Areas, Restoration) |
| SURFACE | `#FFFFFF` | Pure White | Service cards, content blocks inside sections |
| DARK SECTION | `#2D2D2D` | Soft Black | Secondary dark sections, nav dropdown bg |
| NEUTRAL TEXT | `#8B8070` | Warm Gray | Subtitles, captions, supporting body text |
| BODY TEXT | `#4A4A4A` | Dark Gray | Main paragraph / body text on light backgrounds |
| BORDER LIGHT | `#D8D2C8` | Border Light | Cards/dividers on light section backgrounds |
| BORDER GOLD | `#D4A931` | Gold | Cards on dark bg, card `:hover` border, testimonial left-accent |
| ERROR | `#C0392B` | Error Red | Input error border, form validation error message |
| SUCCESS | `#27AE60` | Success Green | Input success border, confirmed booking, checkmarks |

### Page Background — Sections Alternate

| Section | Color | Hex | Notes |
|---------|-------|-----|-------|
| Hero / About | Stone White | `#F5F3EF` | Odd sections (1, 3, 5) |
| Services / Areas | Light Stone | `#E8E4DC` | Even sections (2, 4, 6) |
| CTA Banner / Footer | Charcoal Black | `#1A1A1A` | Dark accent sections |
| Service Cards | Pure White | `#FFFFFF` | Cards inside sections |

### CTA Button States

| State | Hex |
|-------|-----|
| Default | `#D4A931` |
| Hover | `#B8932A` |
| Active | `#9A7A22` |
| Disabled | `#E8C96A` · 60% opacity |

### Border Colors

| Use | Color | Hex |
|-----|-------|-----|
| Cards on dark bg | Gold border | `#D4A931` |
| Cards on light bg | Light border | `#D8D2C8` |
| Inputs default | Input border | `#1A1A1A` |
| Testimonial / quote | Gold accent | `#D4A931` |

---

## 2. Color System — Hover States, Typography Colors, Extra UI

### Hover States — Nav Links & Cards

| Element | State | Spec |
|---------|-------|------|
| Nav link | Default | `#FFFFFF` |
| Nav link | Hover | Gold underline + gold text |
| Service card | Default | 1px `#D8D2C8` |
| Service card | Hover | 2px `#D4A931` |

### Typography Colors

| Element | Hex | Name |
|---------|-----|------|
| Main Heading H1 / H2 | `#1A1A1A` | Charcoal Black |
| Section Heading H3 | `#2D2D2D` | Soft Black |
| Body text | `#4A4A4A` | Dark Gray |
| Subtitle / caption / supporting text | `#8B8070` | Warm Gray |
| Gold accent (e.g. "19 Years Experience") | `#D4A931` | Gold |
| White text on dark background | `#FFFFFF` | on dark nav / footer |

### Extra UI Elements

| Element | Background | Text Color | Icon / Size | Notes |
|---------|-----------|-----------|-------------|-------|
| Social Icons (FB/IG) | `#1A1A1A` (footer) | `#D4A931` | icon 20px | Hover `#FFFFFF` · margin 0 8px |
| Star Rating | transparent | `#D4A931` | font-size 16px | ★★★★★ followed by number in `#1A1A1A` |
| Stat Circle | `#D4A931` | `#1A1A1A` | 44×44px | Satoshi 700 · 14px · border-radius 0 |

### Announcement Strip (Above Nav Bar)

> LIMITED PROJECT SLOTS AVAILABLE THIS SEASON  |  BOOK BEFORE THEY'RE GONE  →

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Height | 36px | Background | `#D4A931` |
| Padding | 0 16px | Text color | `#1A1A1A` |
| Font | Satoshi 700 | Text size | 11px |
| Letter spacing | 0.06em | Transform | UPPERCASE |
| Border radius | 0px | Width | 100% full width |

### Input Fields & Form Elements

| Element / Property | Value | Element / Property | Value |
|--------------------|-------|--------------------|-------|
| Text Input height | 44px | Font family | Satoshi 400 |
| Padding | 0 14px | Font size | 13px |
| Border default | 2px solid `#1A1A1A` | Placeholder color | `#8B8070` |
| Border focus | 2px solid `#D4A931` | Text color | `#1A1A1A` |
| Border error | 2px solid `#C0392B` | Background | `#FFFFFF` |
| Border success | 2px solid `#27AE60` | Border radius | 0px |
| Select dropdown | same as input · 44px · 2px border | Select arrow color | `#1A1A1A` |
| Textarea min-height | 120px | Textarea resize | vertical only |
| Textarea padding | 12px 14px | Textarea border | same as input · 0px radius |

---

## 3. Typography — Fraunces + Satoshi (Showcase)

| Level | Font / Weight | Size | Notes |
|-------|--------------|------|-------|
| Hero H1 — Display | Fraunces 900 Black | 48–56px desktop · 32px mobile | line-height 1.1–1.2 · color `#1A1A1A` |
| Section H2 | Fraunces 700 Bold | 32–36px desktop · 24px mobile | line-height 1.2–1.3 · color `#1A1A1A` |
| Sub-section H3 | Satoshi 700 Bold · UPPERCASE | 13–15px | letter-spacing 0.06–0.1em · color `#1A1A1A` |
| Tagline / Quote / Gold accent | Fraunces 400 Italic · Gold `#D4A931` | 16–20px | font-style italic · line-height 1.5 |
| Body paragraph | Satoshi 400 Regular | 16px desktop · 15px mobile | line-height 1.7–1.8 · color `#4A4A4A` |
| Nav / Button / Badge / Labels | Satoshi 600–700 | 12–14px | letter-spacing 0.04–0.06em · uppercase |
| Caption / Muted text | Satoshi 300 Light | 12–13px | color `#8B8070` · line-height 1.6 |
| Footer | Fraunces (brand name) + Satoshi (body) | — | Brand `#D4A931` · Body `#CCCCCC` · Links `#D4A931` · Social icons 20px `#D4A931` |

---

## 4. Complete Typography Specification — Fraunces + Satoshi (All 13 Elements)

| Element | Font | Weight | Size | Line-H | Letter-Sp | Color |
|---------|------|--------|------|--------|-----------|-------|
| Hero H1 | Fraunces | 900 Black | 48–56px / 32px | 1.1–1.2 | normal | `#1A1A1A` |
| Section H2 | Fraunces | 700 Bold | 32–36px / 24px | 1.2–1.3 | normal | `#1A1A1A` |
| Sub-section H3 | Satoshi | 700 Bold | 13–15px | 1.3 | 0.06–0.1em | `#1A1A1A` |
| Body Text | Satoshi | 400 Regular | 16px / 15px | 1.7–1.8 | normal | `#4A4A4A` |
| Tagline / Quote | Fraunces | 400 Italic | 16–20px | 1.5 | normal | `#D4A931` |
| Nav Links | Satoshi | 600 Semi | 12–13px | 1.0 | 0.04–0.06em | `#FFFFFF` |
| CTA Button | Satoshi | 700 Bold | 13–14px | 1.0 | 0.04–0.06em | `#1A1A1A` on `#D4A931` |
| Urgency Badge | Satoshi | 700 Bold | 10–11px | 1.0 | 0.06–0.08em | `#1A1A1A` on `#D4A931` |
| Caption / Muted | Satoshi | 300 Light | 12–13px | 1.6 | normal | `#8B8070` |
| Footer Brand | Fraunces | 700 Bold | 15–16px | 1.2 | normal | `#D4A931` |
| Footer Body | Satoshi | 400 Regular | 12–13px | 1.6 | normal | `#CCCCCC` |
| Footer Links | Satoshi | 500 Medium | 12–13px | 1.6 | normal | `#D4A931` |
| Announce Bar | Satoshi | 700 Bold | 11px | 1.0 | 0.06em | `#1A1A1A` on `#D4A931` |

### CSS Import Code — Fraunces + Satoshi

```css
/* —— Font Option: Fraunces + Satoshi —— */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400&display=swap');

/* Satoshi — download & self-host: fontshare.com/fonts/satoshi */

font-family: 'Fraunces', serif;     /* H1, H2, Tagline, Footer Brand */
font-family: 'Satoshi', sans-serif; /* H3, Body, Nav, CTA, Badge, Caption, Footer Body */
```

### Font Download Info

**Fraunces** — H1 · H2 · Tagline · Footer Brand
Variable serif with weight, softness, and "wonkiness" control. Old-style inspired.
Weights used: 900 (H1), 700 (H2), 400 Italic (Tagline).
License: SIL OFL 1.1 · Free Commercial Use · fontsquirrel.com/fonts/fraunces

**Satoshi** — H3 · Body · Nav · CTA · Badge · Footer
Popular geometric grotesque from Fontshare. 10 styles + variable font, 135 languages.
Weights used: 700 (H3/CTA), 600 (Nav), 500 (Links), 400 (Body), 300 (Caption).
License: Free · Personal & Commercial Use · fontshare.com/fonts/satoshi

---

## 5. UI Components — Buttons & Badges (All border-radius: 0px)

### Button Size Specification

| Size | Height | Padding (T/B · L/R) | Font Size | Font Weight | Border | Letter Spacing | Transform | Radius |
|------|--------|---------------------|-----------|-------------|--------|----------------|-----------|--------|
| Large (Hero CTA) | 52px | 13px · 28px | 13px | 700 Bold | 2px solid | 0.06em | UPPERCASE | 0px |
| Medium (Section) | 44px | 10px · 20px | 11px | 700 Bold | 2px solid | 0.06em | UPPERCASE | 0px |
| Small (Card/Nav) | 34px | 7px · 14px | 10px | 700 Bold | 2px solid | 0.05em | UPPERCASE | 0px |
| Icon Only | 44px | 12px · 13px | icon 18px | — | 2px solid | — | — | 0px |

### Button Variants & States

- **Primary** — bg `#D4A931`, text `#1A1A1A`, 2px `#D4A931` border
- **Primary Hover** — bg `#B8932A`
- **Primary Active / Click** — bg `#9A7A22`, white text
- **Primary Disabled** — `#E8C96A` · opacity 0.6 · not-allowed
- **Outline Dark** — transparent · 2px `#1A1A1A` → Hover fills `#1A1A1A`, gold text
- **Ghost Gold** ("CALL NOW") — transparent · 2px `#D4A931` → Hover fills `#D4A931`, `#1A1A1A` text
- **Solid Dark** ("773-656-2107") — `#1A1A1A` · gold text

### Badges & Labels

| Badge Type | Background | Border | Text Color | Font Size | Font Weight | Padding | Radius |
|------------|-----------|--------|-----------|-----------|-------------|---------|--------|
| Urgency (Gold) | `#D4A931` | none | `#1A1A1A` | 10px | Satoshi 700 | 4px 10px | 0px |
| Trust (Dark) | `#1A1A1A` | none | `#D4A931` | 10px | Satoshi 700 | 4px 10px | 0px |
| Outline Dark | transparent | 2px `#1A1A1A` | `#1A1A1A` | 10px | Satoshi 700 | 3px 8px | 0px |
| Outline Gold | transparent | 2px `#D4A931` | `#D4A931` | 10px | Satoshi 700 | 3px 8px | 0px |

Examples: `NOW BOOKING` (Urgency Gold) · `19+ YEARS` (Trust Dark) · `✓ LICENSED & INSURED` · `FREE ESTIMATE` (Outline Dark) · `CHICAGOLAND` (Outline Gold) · `★ 5.0 RATING` (Star Rating).

---

## 6. UI Components — Cards, Inputs, Select, Textarea, Nav Dropdown

### Service Cards (All border-radius: 0px)

| Card State | Background | Border | Padding | Accent Bar | Card Gap | Radius |
|------------|-----------|--------|---------|-----------|----------|--------|
| Default (light bg) | `#FFFFFF` | 1px solid `#D8D2C8` | 20px | 3px×28px `#D4A931` | 16px | 0px |
| Hover | `#FFFFFF` | 2px solid `#D4A931` | 20px | 3px×28px `#D4A931` | 16px | 0px |
| Dark variant | `#1A1A1A` | 1px solid `#D4A931` | 20px | 3px×28px `#D4A931` | 16px | 0px |
| Alt bg card | `#E8E4DC` | 1px solid `#D8D2C8` | 20px | 3px×28px `#D4A931` | 16px | 0px |

### Input · Select · Textarea (All border-radius: 0px)

| Property | Text Input | Select | Textarea |
|----------|-----------|--------|----------|
| Height | 44px | 44px | min 120px |
| Padding | 0 14px | 0 14px | 12px 14px |
| Font size | 13px · Satoshi 400 | 13px · Satoshi 400 | 13px · Satoshi 400 |
| Border default | 2px solid `#1A1A1A` | 2px solid `#1A1A1A` | 2px solid `#1A1A1A` |
| Border focus | 2px solid `#D4A931` | 2px solid `#D4A931` | 2px solid `#D4A931` |
| Placeholder | `#8B8070` | `#8B8070` | `#8B8070` |
| Resize | — | — | vertical only |
| Border radius | 0px | 0px | 0px |

Input border states: Default `#1A1A1A` · Focused `#D4A931` · Error `#C0392B` · Success `#27AE60`.

### Nav Dropdown Menu (Rectangular)

| Dropdown Property | Value | Dropdown Property | Value |
|-------------------|-------|-------------------|-------|
| Background | `#1A1A1A` | Category header bg | `#2D2D2D` |
| Outer border | 1px solid `#D4A931` | Item separator | 0.5px solid `#333` |
| Category label | Satoshi 700 · `#D4A931` · UPPERCASE | Item text | Satoshi 400 · `#bbb` |
| Padding per item | 5px 10px | Border radius | 0px |

---

## 7. UI Components — Dividers, Tooltip, Modal, Global Shape Rules

### Dividers & Accent Lines

- **Section divider** — `border-top: 1px solid #D8D2C8` · between light sections
- **Strong divider** — `border-top: 2px solid #1A1A1A` · major page breaks
- **Gold divider** — `border-top: 1px solid #D4A931` · dark section breaks
- **Card accent bar** — 3px×28px `#D4A931` · top of every card content
- **Testimonial** — `border-left: 3px solid #D4A931` · padding-left 12px
- **Section title underline** — `border-bottom: 1.5px solid #1A1A1A`

### Tooltip Spec

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Background | `#1A1A1A` | Font size | 11px · Satoshi 400 |
| Text color | `#D4A931` | Padding | 6px 10px |
| Border | 1px solid `#D4A931` | Border radius | 0px |
| Max width | 220px | z-index | 1000 |

### Modal / Dialog Spec

| Property | Value | Property | Value |
|----------|-------|----------|-------|
| Background | `#FFFFFF` | Overlay bg | rgba(0, 0, 0, 0.6) |
| Border | 2px solid `#1A1A1A` | Padding | 32px |
| Title border-bottom | 1.5px solid `#1A1A1A` | Max width | 480px |
| Border radius | 0px | z-index | 9999 |

### Global Shape Rule — Rectangular Design System

**CORE RULE: `border-radius: 0px` — NO EXCEPTIONS.**
Applies to all buttons, cards, input fields, badges & labels, image frames, nav dropdown, modals/dialogs, tooltips, and select/dropdown. Everything is rectangular.

---

## 8. Complete Component Reference — All Elements

| Component | Height | Padding | Border | BG Color | Text Color | Radius |
|-----------|--------|---------|--------|----------|-----------|--------|
| Btn Primary (L) | 52px | 13px 28px | 2px `#D4A931` | `#D4A931` | `#1A1A1A` | 0 |
| Btn Primary (M) | 44px | 10px 20px | 2px `#D4A931` | `#D4A931` | `#1A1A1A` | 0 |
| Btn Primary (S) | 34px | 7px 14px | 2px `#D4A931` | `#D4A931` | `#1A1A1A` | 0 |
| Btn Primary Hover | 52px | 13px 28px | 2px `#B8932A` | `#B8932A` | `#1A1A1A` | 0 |
| Btn Primary Active | 52px | 13px 28px | 2px `#9A7A22` | `#9A7A22` | `#FFFFFF` | 0 |
| Btn Primary Disabled | 52px | 13px 28px | 2px `#E8C96A` | `#E8C96A` | `#888888` | 0 |
| Btn Outline (L) | 52px | 13px 28px | 2px `#1A1A1A` | transparent | `#1A1A1A` | 0 |
| Btn Outline Hover | 52px | 13px 28px | 2px `#1A1A1A` | `#1A1A1A` | `#D4A931` | 0 |
| Btn Ghost Gold | 52px | 13px 28px | 2px `#D4A931` | transparent | `#D4A931` | 0 |
| Btn Ghost Hover | 52px | 13px 28px | 2px `#D4A931` | `#D4A931` | `#1A1A1A` | 0 |
| Btn Solid Dark | 52px | 13px 28px | 2px `#1A1A1A` | `#1A1A1A` | `#D4A931` | 0 |
| Btn Icon Only | 44px | 12px 13px | 2px `#D4A931` | `#D4A931` | `#1A1A1A` | 0 |
| Badge Urgency (Gold) | auto | 4px 10px | none | `#D4A931` | `#1A1A1A` | 0 |
| Badge Trust (Dark) | auto | 4px 10px | none | `#1A1A1A` | `#D4A931` | 0 |
| Badge Outline Dark | auto | 3px 8px | 2px `#1A1A1A` | transparent | `#1A1A1A` | 0 |
| Badge Outline Gold | auto | 3px 8px | 2px `#D4A931` | transparent | `#D4A931` | 0 |
| Card Default | auto | 20px | 1px `#D8D2C8` | `#FFFFFF` | `#1A1A1A` | 0 |
| Card Hover | auto | 20px | 2px `#D4A931` | `#FFFFFF` | `#1A1A1A` | 0 |
| Card Dark | auto | 20px | 1px `#D4A931` | `#1A1A1A` | `#D4A931` | 0 |
| Input Default | 44px | 0 14px | 2px `#1A1A1A` | `#FFFFFF` | `#1A1A1A` | 0 |
| Input Focused | 44px | 0 14px | 2px `#D4A931` | `#FFFFFF` | `#1A1A1A` | 0 |
| Input Error | 44px | 0 14px | 2px `#C0392B` | `#FFFFFF` | `#1A1A1A` | 0 |
| Input Success | 44px | 0 14px | 2px `#27AE60` | `#FFFFFF` | `#1A1A1A` | 0 |
| Select Dropdown | 44px | 0 14px | 2px `#1A1A1A` | `#FFFFFF` | `#1A1A1A` | 0 |
| Textarea | min 120px | 12px 14px | 2px `#1A1A1A` | `#FFFFFF` | `#1A1A1A` | 0 |
| Nav Dropdown | auto | 5px 10px/item | 1px `#D4A931` | `#1A1A1A` | `#D4A931` | 0 |
| Tooltip | auto | 6px 10px | 1px `#D4A931` | `#1A1A1A` | `#D4A931` | 0 |
| Modal / Dialog | auto | 32px | 2px `#1A1A1A` | `#FFFFFF` | `#1A1A1A` | 0 |
| Modal Overlay | 100vh | — | none | rgba(0,0,0,0.6) | — | 0 |
| Announce Strip | 36px | 0 16px | none | `#D4A931` | `#1A1A1A` | 0 |

---

## 9. Layout & Grid System

### Page Max Width & Container

| Property | Value | Notes |
|----------|-------|-------|
| Max width | 1280px | All sections capped at this |
| Container padding (desktop) | 0 80px | Left/right |
| Container padding (tablet) | 0 40px | Left/right |
| Container padding (mobile) | 0 20px | Left/right |
| Section padding (desktop) | 100px 0 | Top/bottom |
| Section padding (tablet) | 72px 0 | Top/bottom |
| Section padding (mobile) | 56px 0 | Top/bottom |

### Grid System

| Grid | Columns | Gap (desktop) | Gap (mobile) | Used For |
|------|---------|--------------|--------------|----------|
| 2-col | 1fr 1fr | 48px | 24px | About, Hero split |
| 3-col | repeat(3, 1fr) | 32px | 16px | Services cards |
| 4-col | repeat(4, 1fr) | 24px | 16px | Footer columns |
| 2-col asymmetric | 1fr 2fr | 48px | 24px | Sidebar layouts |

### Responsive Breakpoints

| Name | Value | Target |
|------|-------|--------|
| `sm` | 640px | Large mobile |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### Navigation Layout

| Property | Value |
|----------|-------|
| Navbar height (desktop) | 72px |
| Navbar height (mobile) | 60px |
| Announcement strip height | 36px |
| Total top offset | 108px (strip + nav) |
| Navbar position | fixed top-0 |
| Navbar z-index | 100 |
| Navbar bg (scrolled) | `#1A1A1A` · backdrop-blur |
| Navbar bg (top) | transparent |
| Logo size | 140px × 40px |
| Nav link gap | 32px |

### Section Layout Structure

| Section | Layout | Notes |
|---------|--------|-------|
| Announcement Strip | full-width · center text | 36px height |
| Navbar | full-width · space-between | 72px height · fixed |
| Hero | 2-col asymmetric (60/40) | text left · image right |
| Services | 3-col grid | cards |
| About | 2-col (50/50) | text left · image right |
| Service Areas | full-width · centered | map + area list |
| CTA Banner | full-width · center | dark bg `#1A1A1A` |
| Testimonials | 3-col grid | quote cards |
| Blog Preview | 3-col grid | blog cards |
| Contact | 2-col (50/50) | form left · info right |
| Footer | 4-col grid | links + contact |
| Footer Bottom | full-width · space-between | copyright bar |

---

## 10. Spacing System

### Base Spacing Scale

| Token | Value | Used For |
|-------|-------|----------|
| `space-1` | 4px | Micro gaps |
| `space-2` | 8px | Icon · text gap |
| `space-3` | 12px | Badge padding |
| `space-4` | 16px | Card gap (mobile) |
| `space-5` | 20px | Card padding |
| `space-6` | 24px | Grid gap (mobile) |
| `space-8` | 32px | Grid gap · section sub-elements |
| `space-10` | 40px | Container padding (tablet) |
| `space-12` | 48px | Grid gap (desktop) |
| `space-14` | 56px | Section padding (mobile) |
| `space-16` | 64px | Large element gaps |
| `space-18` | 72px | Section padding (tablet) |
| `space-20` | 80px | Container padding (desktop) |
| `space-25` | 100px | Section padding (desktop) |

### Component Spacing Rules

| Component | Internal Padding | External Margin |
|-----------|-----------------|-----------------|
| Section container | 100px 80px (desktop) | 0 |
| Card | 20px all sides | 0 (gap handles) |
| Button (L) | 13px 28px | — |
| Button (M) | 10px 20px | — |
| Button (S) | 7px 14px | — |
| Nav item gap | — | 32px between |
| Footer column gap | — | 24px between |
| Heading → body gap | — | 16px |
| Body → CTA gap | — | 32px |
| Section title → content | — | 48px |

---

## 11. Z-index System

| Element | Z-index | Notes |
|---------|---------|-------|
| Base content | 0 | Default |
| Cards on hover | 1 | Slight lift |
| Sticky elements | 10 | Sticky sidebar |
| Dropdown menu | 50 | Nav dropdown |
| Fixed navbar | 100 | Always on top of content |
| Modal overlay | 200 | Behind modal |
| Modal / Dialog | 9999 | Always on top |
| Tooltip | 1000 | Above cards, below modal |
| Announcement strip | 101 | Above navbar |

---

## 12. Shadow System

| Element | Shadow | Notes |
|---------|--------|-------|
| Card default | none | Border used instead |
| Card hover | `0 4px 24px rgba(0,0,0,0.08)` | Subtle lift |
| Card dark | none | Border used instead |
| Nav dropdown | `0 8px 32px rgba(0,0,0,0.24)` | Depth |
| Modal | `0 16px 64px rgba(0,0,0,0.32)` | Strong depth |
| Button (no shadow) | none | Flat design system |
| Sticky navbar (scrolled) | `0 2px 16px rgba(0,0,0,0.16)` | Separation from content |

---

## 13. Animation & Motion System (GSAP + Lenis)

### Lenis Scroll Config

| Property | Value | Notes |
|----------|-------|-------|
| Duration | 1.2 | Scroll smoothness |
| Easing | `t => Math.min(1, 1.001 - Math.pow(2, -10 * t))` | Expo ease out |
| Orientation | vertical | |
| smoothWheel | true | |

### GSAP Global Defaults

| Property | Value | Used For |
|----------|-------|----------|
| Default duration | 0.8s | Most animations |
| Default ease | `power2.out` | General transitions |
| Stagger | 0.12s | List items, cards |
| ScrollTrigger start | `top 85%` | Element enters viewport |
| ScrollTrigger end | `top 40%` | Element in center |

### Animation Presets

| Animation | Duration | Ease | From | To | Used On |
|-----------|----------|------|------|----|---------|
| Fade Up | 0.8s | `power2.out` | `y: 40, opacity: 0` | `y: 0, opacity: 1` | Headings, cards |
| Fade In | 0.6s | `power2.out` | `opacity: 0` | `opacity: 1` | Images, overlays |
| Slide Left | 0.8s | `power2.out` | `x: -60, opacity: 0` | `x: 0, opacity: 1` | Left content |
| Slide Right | 0.8s | `power2.out` | `x: 60, opacity: 0` | `x: 0, opacity: 1` | Right content |
| Scale In | 0.6s | `back.out(1.4)` | `scale: 0.92, opacity: 0` | `scale: 1, opacity: 1` | Cards, badges |
| Stagger Cards | 0.6s | `power2.out` | `y: 30, opacity: 0` | stagger `0.12s` | Service cards |
| Line Draw | 1.0s | `power2.inOut` | `scaleX: 0` | `scaleX: 1` | Dividers, underlines |
| Counter | 2.0s | `power1.out` | `0` | target number | Stat numbers |

### Hover Transitions (CSS)

| Element | Property | Duration | Ease |
|---------|----------|----------|------|
| Nav links | color, border | 200ms | ease |
| Buttons | background, border | 200ms | ease |
| Cards | border, box-shadow | 250ms | ease |
| Social icons | color | 200ms | ease |
| CTA button | background | 200ms | ease |

### Page Transition (Astro ViewTransitions)

| Property | Value |
|----------|-------|
| Type | Astro built-in ViewTransitions |
| Fade duration | 300ms |
| CLS impact | 0 |

---

## 14. Iconography

### Icon Library

| Library | Usage | Install |
|---------|-------|---------|
| **Lucide Icons** | Primary icon set | `npm install lucide-astro` |

### Icon Size System

| Size | px | Used For |
|------|-----|---------|
| `xs` | 14px | Badge icons, inline text |
| `sm` | 16px | Nav icons, small buttons |
| `md` | 20px | Social icons, card icons |
| `lg` | 24px | Section feature icons |
| `xl` | 32px | Hero accent icons |
| `2xl` | 48px | Large feature icons |

### Icon Color Rules

| Context | Color |
|---------|-------|
| On light background | `#1A1A1A` |
| On dark background | `#D4A931` |
| CTA button icon | `#1A1A1A` |
| Footer social icons | `#D4A931` · hover `#FFFFFF` |
| Form icons | `#8B8070` |
| Success icon | `#27AE60` |
| Error icon | `#C0392B` |

---

## 15. Images & Media

### Image Aspect Ratios

| Context | Ratio | Notes |
|---------|-------|-------|
| Hero background | 16:9 | Full width |
| Hero split image | 4:5 | Right column |
| Service card image | 3:2 | Top of card |
| Portfolio/Project | 4:3 | Grid thumbnail |
| Blog card | 16:9 | Top of card |
| About section | 1:1 or 4:5 | Right column |
| OG / Share image | 1200×630px | Social share |
| Favicon | 32×32px + 180×180px | Browser + Apple |

### Image Rules

| Rule | Value |
|------|-------|
| Format | WebP (primary) · JPEG fallback |
| Hero image | `loading="eager"` · `fetchpriority="high"` |
| All other images | `loading="lazy"` · `decoding="async"` |
| Always include | `width` + `height` attributes (prevents CLS) |
| Always include | `alt` text (accessibility + SEO) |
| Component | Astro built-in `<Image />` |

### Image Overlay

| Type | Value | Used On |
|------|-------|---------|
| Dark overlay | `rgba(0,0,0,0.4)` | Hero bg image |
| Dark overlay strong | `rgba(0,0,0,0.6)` | CTA banner bg |
| Gold tint | `rgba(212,169,49,0.08)` | Hover on portfolio |

---

## 16. Accessibility

### Color Contrast Ratios (WCAG AA)

| Pair | Ratio | Pass |
|------|-------|------|
| `#1A1A1A` on `#F5F3EF` | 16.8:1 | ✅ AAA |
| `#1A1A1A` on `#D4A931` | 5.9:1 | ✅ AA |
| `#D4A931` on `#1A1A1A` | 5.9:1 | ✅ AA |
| `#FFFFFF` on `#1A1A1A` | 19.4:1 | ✅ AAA |
| `#4A4A4A` on `#F5F3EF` | 7.8:1 | ✅ AAA |
| `#8B8070` on `#FFFFFF` | 3.9:1 | ✅ AA (large text) |

### Focus State

| Element | Focus Ring |
|---------|-----------|
| Buttons | `outline: 2px solid #D4A931` · `outline-offset: 2px` |
| Links | `outline: 2px solid #D4A931` · `outline-offset: 2px` |
| Inputs | `border: 2px solid #D4A931` (already in spec) |

### ARIA Rules

| Element | ARIA |
|---------|------|
| Nav | `role="navigation"` · `aria-label="Main navigation"` |
| Mobile menu button | `aria-expanded` · `aria-controls` |
| Dropdown | `aria-haspopup` · `aria-expanded` |
| Images | `alt=""` always required |
| CTA buttons | descriptive text (not just "Click here") |
| Form inputs | `<label>` always paired |
| Phone link | `aria-label="Call 773-656-2107"` |

---

## 17. States & Interactions

### Loading States

| Element | Loading State |
|---------|--------------|
| Submit button | Text → "Sending..." · disabled · opacity 0.7 |
| Form | Inputs disabled during submit |
| Page | Astro ViewTransitions handles page load |

### Empty States

| Context | Message |
|---------|---------|
| Blog (no posts) | "No posts yet. Check back soon." |
| Search (no results) | "No results found. Try a different search." |

### Error / Success Pages

| Page | Style |
|------|-------|
| 404 | Dark bg `#1A1A1A` · Gold headline · "Go Home" CTA button |
| 500 | Same as 404 · different message |
| Form success | Green badge · "Thank you, we'll be in touch." |
| Form error | Red badge · "Something went wrong. Please try again." |

---

## 18. Blog Specific

### Blog Card

| Property | Value |
|----------|-------|
| Layout | Image top · content bottom |
| Image ratio | 16:9 |
| Card bg | `#FFFFFF` |
| Card border | 1px solid `#D8D2C8` |
| Card hover border | 2px solid `#D4A931` |
| Card padding | 20px |
| Border radius | 0px |
| Title font | Fraunces 700 · 18px · `#1A1A1A` |
| Date font | Satoshi 400 · 12px · `#8B8070` |
| Excerpt font | Satoshi 400 · 14px · `#4A4A4A` |
| Tag badge | Outline Gold style |
| Read more | Ghost Gold button (S size) |

### Article Typography

| Element | Font | Size | Color |
|---------|------|------|-------|
| Article H1 | Fraunces 700 | 36px / 26px | `#1A1A1A` |
| Article H2 | Fraunces 700 | 28px / 22px | `#1A1A1A` |
| Article H3 | Satoshi 700 UPPERCASE | 14px | `#1A1A1A` |
| Article body | Satoshi 400 | 17px / 16px | `#4A4A4A` |
| Article quote | Fraunces 400 Italic | 18px | `#D4A931` |
| Article caption | Satoshi 300 | 12px | `#8B8070` |
| Article max-width | 720px | centered | readable line length |

### Blog Meta Elements

| Element | Style |
|---------|-------|
| Category tag | Badge Outline Gold |
| Date | Satoshi 400 · 12px · `#8B8070` |
| Author block | Avatar + Name (Satoshi 600) + Role (Satoshi 400 · `#8B8070`) |
| Read time | Satoshi 400 · 12px · `#8B8070` |
| Related posts | 3-col grid · same as blog card |

---

## 19. Footer Layout

### Footer Grid

| Column | Content | Width |
|--------|---------|-------|
| Col 1 | Logo · tagline · social icons | 1fr |
| Col 2 | Residential Services links | 1fr |
| Col 3 | Commercial & Restoration links | 1fr |
| Col 4 | Contact info · service areas | 1fr |

### Footer Specs

| Property | Value |
|----------|-------|
| Background | `#1A1A1A` |
| Padding top | 80px |
| Padding bottom | 40px |
| Column gap | 48px (desktop) · 24px (tablet) · stacked (mobile) |
| Divider | `border-top: 1px solid #2D2D2D` above copyright bar |

### Footer Bottom Bar

| Property | Value |
|----------|-------|
| Background | `#1A1A1A` |
| Padding | 20px 0 |
| Border top | 1px solid `#2D2D2D` |
| Left | © 2026 All Masonry Services Inc. All Rights Reserved. Licensed & Insured. |
| Right | Privacy Policy · Terms (optional) |
| Font | Satoshi 400 · 12px · `#8B8070` |

---

## 20. SEO & Meta Specs

### OG / Social Share Image

| Property | Value |
|----------|-------|
| Size | 1200 × 630px |
| Background | `#1A1A1A` |
| Logo | centered or top-left |
| Title font | Fraunces 700 · white |
| Accent | Gold bar or Gold text |
| Format | JPG or PNG |

### Favicon Specs

| Type | Size | File |
|------|------|------|
| Browser tab | 32×32px | `favicon.ico` |
| SVG favicon | scalable | `favicon.svg` |
| Apple touch icon | 180×180px | `apple-touch-icon.png` |
| OG image | 1200×630px | `og-image.jpg` |

---

## 21. Complete Component Reference — All Elements (Updated v3)

| Component | Height | Padding | Border | BG Color | Text Color | Radius |
|-----------|--------|---------|--------|----------|-----------|--------|
| Btn Primary (L) | 52px | 13px 28px | 2px `#D4A931` | `#D4A931` | `#1A1A1A` | 0 |
| Btn Primary (M) | 44px | 10px 20px | 2px `#D4A931` | `#D4A931` | `#1A1A1A` | 0 |
| Btn Primary (S) | 34px | 7px 14px | 2px `#D4A931` | `#D4A931` | `#1A1A1A` | 0 |
| Btn Primary Hover | 52px | 13px 28px | 2px `#B8932A` | `#B8932A` | `#1A1A1A` | 0 |
| Btn Primary Active | 52px | 13px 28px | 2px `#9A7A22` | `#9A7A22` | `#FFFFFF` | 0 |
| Btn Primary Disabled | 52px | 13px 28px | 2px `#E8C96A` | `#E8C96A` | `#888888` | 0 |
| Btn Outline (L) | 52px | 13px 28px | 2px `#1A1A1A` | transparent | `#1A1A1A` | 0 |
| Btn Outline Hover | 52px | 13px 28px | 2px `#1A1A1A` | `#1A1A1A` | `#D4A931` | 0 |
| Btn Ghost Gold | 52px | 13px 28px | 2px `#D4A931` | transparent | `#D4A931` | 0 |
| Btn Ghost Hover | 52px | 13px 28px | 2px `#D4A931` | `#D4A931` | `#1A1A1A` | 0 |
| Btn Solid Dark | 52px | 13px 28px | 2px `#1A1A1A` | `#1A1A1A` | `#D4A931` | 0 |
| Btn Icon Only | 44px | 12px 13px | 2px `#D4A931` | `#D4A931` | `#1A1A1A` | 0 |
| Badge Urgency (Gold) | auto | 4px 10px | none | `#D4A931` | `#1A1A1A` | 0 |
| Badge Trust (Dark) | auto | 4px 10px | none | `#1A1A1A` | `#D4A931` | 0 |
| Badge Outline Dark | auto | 3px 8px | 2px `#1A1A1A` | transparent | `#1A1A1A` | 0 |
| Badge Outline Gold | auto | 3px 8px | 2px `#D4A931` | transparent | `#D4A931` | 0 |
| Card Default | auto | 20px | 1px `#D8D2C8` | `#FFFFFF` | `#1A1A1A` | 0 |
| Card Hover | auto | 20px | 2px `#D4A931` | `#FFFFFF` | `#1A1A1A` | 0 |
| Card Dark | auto | 20px | 1px `#D4A931` | `#1A1A1A` | `#D4A931` | 0 |
| Input Default | 44px | 0 14px | 2px `#1A1A1A` | `#FFFFFF` | `#1A1A1A` | 0 |
| Input Focused | 44px | 0 14px | 2px `#D4A931` | `#FFFFFF` | `#1A1A1A` | 0 |
| Input Error | 44px | 0 14px | 2px `#C0392B` | `#FFFFFF` | `#1A1A1A` | 0 |
| Input Success | 44px | 0 14px | 2px `#27AE60` | `#FFFFFF` | `#1A1A1A` | 0 |
| Select Dropdown | 44px | 0 14px | 2px `#1A1A1A` | `#FFFFFF` | `#1A1A1A` | 0 |
| Textarea | min 120px | 12px 14px | 2px `#1A1A1A` | `#FFFFFF` | `#1A1A1A` | 0 |
| Nav Dropdown | auto | 5px 10px/item | 1px `#D4A931` | `#1A1A1A` | `#D4A931` | 0 |
| Tooltip | auto | 6px 10px | 1px `#D4A931` | `#1A1A1A` | `#D4A931` | 0 |
| Modal / Dialog | auto | 32px | 2px `#1A1A1A` | `#FFFFFF` | `#1A1A1A` | 0 |
| Modal Overlay | 100vh | — | none | rgba(0,0,0,0.6) | — | 0 |
| Announce Strip | 36px | 0 16px | none | `#D4A931` | `#1A1A1A` | 0 |
| Blog Card | auto | 20px | 1px `#D8D2C8` | `#FFFFFF` | `#1A1A1A` | 0 |
| Blog Card Hover | auto | 20px | 2px `#D4A931` | `#FFFFFF` | `#1A1A1A` | 0 |
| Author Block | auto | 16px | 1px `#D8D2C8` top | `#F5F3EF` | `#1A1A1A` | 0 |
| 404 Page | full | — | — | `#1A1A1A` | `#FFFFFF` | 0 |

---

---

## Section 22 — Lighthouse 98+ Rules: Every Page & Section Build

These rules must be followed during build — not after. Any section or page that does not meet these is not done.

**Target: Mobile ≥ 98 / Desktop = 100 on every page.**

---

### 22.1 Fonts — Non-Blocking (FCP Critical)

Never add `<link rel="stylesheet">` for any font or CSS CDN directly in `<head>`. It blocks FCP by 300–800ms on mobile.

Always use the three-line pattern:

```html
<link rel="preload" as="style" href="FONT_URL" />
<link rel="stylesheet" href="FONT_URL" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="FONT_URL" /></noscript>
```

`BaseLayout.astro` already does this for Fraunces, Satoshi, and Leaflet CSS. Copy this pattern exactly for any new font or CSS CDN link. Never skip the `<noscript>` fallback.

---

### 22.2 Images — Explicit Dimensions (CLS Critical)

Every `<img>` tag must have four attributes: `width`, `height`, `loading`, `decoding`.

```html
<!-- Correct -->
<img src="/images/photo.webp" alt="Brick repair in Hinsdale" loading="lazy" decoding="async" width="800" height="450" />
```

- `width` + `height` must match the aspect ratio of the display size — not required to be pixel-perfect, but ratio must be correct so the browser can reserve space before the image loads.
- Hero or LCP image (above fold, largest element): use `loading="eager"` + `fetchpriority="high"`. Never lazy-load the LCP element.
- All below-fold images: `loading="lazy"` + `decoding="async"`.
- Format: WebP for all new images. No JPG/PNG unless no alternative exists.
- Images inside fixed-height containers: still add `width` + `height` — prevents shift before CSS applies.

---

### 22.3 Third-Party Scripts — Never Render-Blocking

Any `<script src>` in `<head>` without `defer`/`async` blocks the entire page parse.

- Never add `<script src>` to `BaseLayout.astro` `<head>` without `defer` or `async`.
- Scripts only needed when a section is visible (maps, carousels): load via IntersectionObserver when that section enters viewport. Pattern used: `ServiceAreasSection.astro` for Leaflet JS.
- Scripts needed post-load but not immediately (analytics): load via `requestIdleCallback`. Pattern used: `BaseLayout.astro` for GSAP + Lenis.

---

### 22.4 Animations — GPU-Safe Only

Animating `top`, `left`, `width`, `height`, `margin`, or `padding` triggers layout recalculation every frame and tanks INP on mobile.

- Animate `transform` and `opacity` only. Nothing else.
- `will-change: transform` — set in JS immediately before the animation starts, removed via `transitionend` / `animationend` immediately after. Never set permanently on idle elements in CSS.
- `transform: translateZ(0)` for compositor layer promotion (e.g. fixed navbar) — set once in CSS.

---

### 22.5 Scroll & Resize Handlers — Always Passive

```js
// Correct
window.addEventListener('scroll', handler, { passive: true });
window.addEventListener('touchstart', handler, { passive: true });
```

All scroll, wheel, and touchstart/touchmove listeners must have `{ passive: true }`. Resize handlers must be debounced (min 100ms) or use `ResizeObserver`.

---

### 22.6 Tap Targets — Mobile Minimum 44px

Lighthouse mobile audit flags targets smaller than 44×44px. Every button, link, and form input must meet:

```css
.btn {
  min-height: 44px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
}
```

---

### 22.7 `build.inlineStylesheets: 'auto'` — Already Set

`astro.config.mjs` already has `build: { inlineStylesheets: 'auto' }`. Do not remove it. It inlines small CSS into `<style>` tags — fewer HTTP requests on mobile.

---

### 22.8 Schema — Required Per Page Type

| Page type | Required schema |
|---|---|
| Homepage | `LocalBusiness` + `HomeAndConstructionBusiness` + `WebSite` |
| Service page | `Service` + `SchemaFAQ` |
| Tool page | `SoftwareApplication` + `SchemaFAQ` |
| Contact page | `ContactPage` |
| Any page with FAQ | `SchemaFAQ` |
| Any page with reviews | `aggregateRating` inside `LocalBusiness` |

---

### 22.9 Build Gate — 0 Errors, 0 Warnings

Run `npm run build` before marking any work done. Output must be clean:

- 0 errors
- 0 warnings
- No `[vite:build-import-analysis]` lines
- No `[vite] warning` lines

---

### 22.10 PageSpeed Test — Run Before Done

Test via `https://pagespeed.web.dev/` on the deployed preview. Both mobile and desktop tabs.

**Mobile ≥ 98. Desktop = 100.**

Common failures and fixes:

| Metric | Threshold | Most likely cause | Fix |
|---|---|---|---|
| FCP | > 1.8s | Blocking font or `<script src>` in `<head>` | `media="print"` pattern / IntersectionObserver |
| LCP | > 2.5s | Hero image not preloaded, or blocking resource above it | `fetchpriority="high"` preload, remove blocking |
| CLS | > 0 | `<img>` missing `width`/`height` | Add explicit dimensions |
| INP | > 200ms | Heavy sync work in click handler, or layout-property animation | `requestIdleCallback`, fix to `transform`/`opacity` |
| Performance mobile | < 98 | Total JS too heavy, or render-blocking resources | Audit chunk sizes, audit `<head>` |

---

---

## Section 23 — JS Chunk Rules: Zero Unwanted Bundles

Astro tries to bundle every `<script>` tag. When a script uses browser-only APIs or TypeScript casts, the bundler cannot process it and produces an **empty chunk** — a wasted HTTP request, and a build warning.

---

### 23.1 When to Use `is:inline`

Use `<script is:inline>` when the script does any of these:

| Condition | Use `is:inline` |
|---|---|
| Uses `document.getElementById` / `querySelector` | Yes |
| Uses any `window.*` global | Yes |
| Has TypeScript casts: `as HTMLInputElement`, `el!` | Yes |
| Uses `addEventListener` on DOM elements | Yes |
| Uses `window.__gsap`, `window.__ScrollTrigger`, `window.__lenis` | Yes |
| Has no `import` statements and does not export anything | Yes |

Use plain `<script>` (bundled) only when the script imports `.ts` project modules and has no browser-only APIs at the top level.

In this codebase: all section scripts and all magnet tool scripts use `<script is:inline>`. Follow that pattern.

---

### 23.2 The Three-Question Test

Before writing any `<script>` tag in a `.astro` file:

1. Does it touch the DOM? (`getElementById`, `querySelector`, `addEventListener`) → `is:inline`
2. Does it use TypeScript casts (`as`, `!`)? → `is:inline`
3. Does it use `window.__gsap` / `window.__ScrollTrigger` / `window.__lenis`? → `is:inline`

Any yes → `<script is:inline>`. All no → plain `<script>` is fine.

---

### 23.3 GSAP — One Import, BaseLayout Only

GSAP, ScrollTrigger, and Lenis are imported once in `BaseLayout.astro` and exposed globally:

```js
window.__gsap = gsap;
window.__ScrollTrigger = ScrollTrigger;
window.__lenis = lenis;
```

In any section component that needs GSAP:

```html
<script is:inline>
  window.addEventListener('animations:ready', () => {
    const gsap = window.__gsap;
    const ScrollTrigger = window.__ScrollTrigger;
    // animate here
  });
</script>
```

Never import GSAP inside a section component — it creates a second 27 KB bundle on every page that component loads on.

---

### 23.4 No Framework Components Unless Required

React, Vue, Svelte each add 30–100 KB gzipped. This site is pure Astro + vanilla JS.

If ever needed: use `client:visible` (loads when section enters viewport). Never `client:load`.

---

### 23.5 Chunk Size Limits (Gzipped)

| Chunk | Max gzipped | Action if over |
|---|---|---|
| GSAP + ScrollTrigger | 50 KB | Already at 45 KB — do not add more plugins |
| Lenis | 8 KB | Fine |
| Astro internals | 8 KB | Fine |
| Any section script | 5 KB | Refactor |
| Any magnet tool script | 10 KB | Refactor if over |
| Any empty chunk | 0 KB | Always a bug — fix immediately |

---

### 23.6 Post-Build Chunk Check

After adding any `.astro` component with a `<script>` tag, run `npm run build` and check the output.

If you see:

```
[vite:build-import-analysis] warning: Empty chunk
```

Find the `<script>` in the new component and add `is:inline`. This is the cause 95% of the time.

Zero empty chunk warnings = correct build.

---

*Option 1 — Charcoal Black + Gold · All Masonry Services Inc · Complete Design System v3 · Font: Fraunces + Satoshi*
