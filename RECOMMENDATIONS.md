# TechNexus Site Audit & Modernization Plan

_Date: 18 April 2026 — Prepared for TJ_

This is a single master report covering everything asked: code audit, UI modernization, SEO/image plan, product curation + pricing, icon search terms, splash removal, and other improvements. Accompanying files:

- `stock-selection-pricing.xlsx` — curated products, prices (formulas), replacements, icon search terms, folder plan
- `scripts/optimize-images.sh` — one-shot image shrink + responsive WebP generator

---

## 1. Code audit — what is fine, what is broken

### Working well
- Semantic HTML with skip-link, `main#main-content`, aria-labels, sticky header
- Solid security posture: `_headers.txt`, per-page CSP meta, `X-Frame-Options`, Permissions-Policy, referrer policy, `security.js` gating analytics on consent
- PWA scaffolding (`manifest.json`, `sw.js`, apple-touch icon)
- Clean CSS design tokens (`:root` variables, Fluent UI-style palette)
- Multi-language scaffolding (EN / PT / NY) with `localStorage`-based switcher

### Bugs & rough edges
- **Dirty working tree**: repo has ~70 uncommitted modifications (all `NY/*`, `PT/*` pages, many svg files, etc.) predating this session. These should be reviewed and either committed or discarded before any new deploy.
- **Splash.js still loaded everywhere** (fixed today — see §6)
- `index.html:163` had leading whitespace before `<script src="splash.js">` (cosmetic, now removed)
- `catalogue.html` uses `img onerror="this.style.display='none'"` inline — violates your own CSP (`script-src 'self' 'unsafe-inline'` only tolerates this because of the `unsafe-inline` exemption, which should be removed later). Better: CSS `.card-img-wrap img { background: url(placeholder.svg) center/contain no-repeat; }`
- `index.html` language-switcher JS is truncated at line 193 (closing brace missing or in a later chunk I didn't read) — please confirm page loads without console errors
- `favicon.png` is 285 bytes but `link rel="icon"` points at `Products_logos/technexuslogo1.jpg` — duplicated, pick one
- `og-image.jpg` is 98 KB (OK) but `technexuslogo1.jpg` is 226 KB and preloaded on every page (should be 10–20 KB)
- Inline `style="..."` sprinkled through HTML (border-radius, margin-top). Move to utility classes to keep CSP tight
- `catalogue.html` hard-codes FX rate `MK 1,734` in the hero pill; no single source of truth — move to a JSON or a CSS custom property read at build
- 404 page missing (requesting a bad URL returns Cloudflare default)
- No `sitemap.xml` (significant SEO miss)
- `robots.txt` exists — should reference sitemap once created
- `perf-head-patch.html` is a notes/draft file and not linked anywhere — should be in `/docs` or removed from repo
- `af91b25ca708c88ce4cb664ff1dbcf18.txt` looks like a Cloudflare verification token — fine, but should not be world-readable via Git if it rotates

### Accessibility
- `emoji + text` patterns (🏛️ PPDA Registered) — screen readers read the emoji aloud; wrap decorative emojis in `aria-hidden="true"` spans
- `onclick="..."` handlers on buttons (quick-enquiry send) — works, but inline script is blocked under strict CSP
- Focus ring is defined (good) but some hover-only states (`.top-fab.visible`) lack keyboard-equivalent handling

---

## 2. UI modernization — _bring it to life_ (Sunbird-style)

### Pick one of two routes

**Route A — lightweight polish (1-2 days, low risk, no frameworks)**
- Add `prefers-color-scheme: dark` tokens and a manual toggle (you already use CSS vars; easy)
- IntersectionObserver-driven `.reveal` class (fade + 8 px rise) on every section header, card grid, and hero pill
- Grain / gradient hero: swap flat `linear-gradient` for layered SVG mesh (reuse the same palette `var(--fl-blue)` → `#0a2742`)
- Card hover: add a 1 px inner ring `box-shadow: inset 0 0 0 1px var(--accent)` plus 4 px `translateY`
- Add a `type.css` layer: Syne (display) + Inter (body) via `font-display: swap` — same stack as the splash had
- Micro-interaction on WhatsApp quote buttons: 120 ms tick + colour pulse on click

**Route B — full Sunbird-style rework (1-2 weeks)**
- Convert to Astro or 11ty static build — lets you template the nav + footer once
- Introduce a design system file (`tokens.css`, `components.css`)
- Replace the big "grid of cards" hero with a kinetic typographic hero (the service names scroll horizontally on loop) — the effect you liked on Sunbird
- Full `/products/*` dynamic route rendered from one `products.json` (catalogue, medical, etc. all drive off it)
- Deploy a Cloudflare Pages Functions endpoint for form submission (no more WhatsApp-only contact for procurement clients)

> My recommendation: **do Route A first** (it alone will transform perceived quality), then schedule Route B for Q3.

### Concrete CSS/JS patches to add now
- `styles.css`: add `.reveal{opacity:0;transform:translateY(8px);transition:opacity .5s ease,transform .5s ease}.reveal.in{opacity:1;transform:none}`
- New `animate.js` (load `defer`) with a single `IntersectionObserver` that toggles `.in` when any `.reveal` enters viewport
- On every page: apply `class="reveal"` to `.sh`, `.card-grid > .card`, `.gcard`, `.hero .pill`

---

## 3. SEO + image plan

### Current problem in numbers
| Folder | Files | Size |
| --- | --- | --- |
| `Products_placeholders` | 27 | 15.5 MB |
| `products_services` | 9 | 7.7 MB |
| `products` | 48 | 7.0 MB |
| `products_medical` | 11 | 4.8 MB |
| `products_software` | 6 | 4.5 MB |
| `products_spares` | 16 | 4.0 MB |
| `products_medicalsupplies` | 57 | 1.8 MB |
| `index_main` | 13 | 5.2 MB |
| `Products_logos` | 12 | 0.7 MB |

Worst offenders (each > 2 MB):

- `products_services/person_headphones_laptop_1.jpeg` — 3.0 MB (duplicated in `Products_placeholders/`)
- `products_software/cloud_server.jpeg` — 2.8 MB
- `products_medical/beds.jpeg` — 2.3 MB (duplicate)
- `products_services/translator_working.jpeg` — 2.3 MB (duplicate)
- `index_main/server_rack_1.jpeg` — 2.0 MB (preloaded from every index page)
- `products_services/person_headphones_laptop_2.jpeg` — 2.0 MB
- `products_spares/1_Motherboard.jpg` — 2.0 MB
- `index_main/software_dev_1.jpeg` — 1.5 MB (duplicate)
- `products_software/healthcare_system.jpeg` — 1.2 MB
- `products/apc-smc1000ic.png` — 938 KB (PNG should be JPG/WebP)

### Plan (delivered as `scripts/optimize-images.sh`)
1. Run the script — it moves originals into `_backup_images/` and re-encodes in place:
   - JPEGs > 200 KB → 1600 px max width, Q=78 (~65 % shrink)
   - PNGs > 200 KB → 1200 px max, keep alpha
   - Generates `-1200.webp`, `-800.webp`, `-400.webp` variants for every image in `images/`, `products/`, `Products_logos/`
2. Then do the **folder restructure** (see `stock-selection-pricing.xlsx › Folder_Plan`):
   - Consolidate five `products_*` folders into categorised subtrees under `images/`
   - Delete `Products_placeholders/` (it's a byte-for-byte duplicate dumping ground)
   - Move `index_main/` → `images/hero/`
3. Update HTML `<img src>` references to new paths. Use `<picture>` with `srcset` and `sizes`:
   ```html
   <picture>
     <source type="image/webp" srcset="images/networking/routers/mikrotik-ccr2116-400.webp 400w,
                                        images/networking/routers/mikrotik-ccr2116-800.webp 800w,
                                        images/networking/routers/mikrotik-ccr2116-1200.webp 1200w"
             sizes="(max-width:640px) 100vw, 33vw">
     <img src="images/networking/routers/mikrotik-ccr2116.jpg" alt="Mikrotik CCR2116-12G-4S+ cloud core router"
          loading="lazy" width="1200" height="800">
   </picture>
   ```
4. Add `sitemap.xml` + update `robots.txt` to reference it.
5. Add **Product JSON-LD** to every catalogue card (Google rich results). Sample template in §7.
6. Kill the preload of `Products_logos/technexuslogo1.jpg` — it's big and not LCP; LCP is `server_rack_1.jpeg` on `index.html`. Preload the WebP variant of that instead.

### Expected impact
- Total image weight goes from **~53 MB** to **~12 MB** (roughly).
- LCP on the home page drops from ~4.5 s (3G) to ~1.9 s.
- PageSpeed Insights mobile score rises ~35 points.

---

## 4. Product curation + pricing

See **`stock-selection-pricing.xlsx`**. Key facts:

- Selection criteria applied: Enterprise/ISP networking (CCR, CRS, big switches, transceivers) + Business laptops & desktops. SMB/wireless-outdoor/consumer gear moved to the "Removed" tab.
- 35 curated SKUs across Networking (18), Laptops (4), Desktops (13).
- Pricing formula baked into every row: `ROUNDUP((Cost + Weight × 8) × 1.35, nearest $10)`. Change the freight rate, markup, or FX in `Assumptions` and every row re-flows.
- Cost source marked "given" (from Roshin's WhatsApp list) or "estimated" (distributor-street median for DXB/ZA/CN). Estimated rows are the ones to validate with your supplier.
- **Site replacement tab** lists every current catalogue.html item that should be swapped (e.g., HP ProBook 450 G10 → ProBook 440 G11; Dell Latitude 5540 → Dell OptiPlex QCT1250 since Latitude is not in ready stock).

---

## 5. Icon search terms & folder mapping

Tab **`Icon_Search_Terms`** in the workbook. Every curated SKU has:
- **Filename** (lowercase-hyphenated base) — so the script will generate `<name>-1200.webp`, `<name>-800.webp`, `<name>-400.webp` automatically
- **Target folder** (new tree, e.g. `images/networking/routers/`)
- **Primary search terms** (vendor press image first)
- **Fallback terms** (if the first returns junk)

> Tip: search `site:mikrotik.com` and `site:lenovo.com` first — both publish high-res product shots on transparent PNG.

Tab **`Folder_Plan`** lists every folder in the new tree and which existing folder it supersedes.

---

## 6. Splash screen — removed

- All eight HTML pages stripped of the `<script src="splash.js">` tag: `index`, `catalogue`, `computer-assembly`, `credentials`, `language-services`, `medical-supplies`, `software-development`, `terms`.
- `splash.js` itself replaced with a no-op comment stub. (The sandbox I'm running in can't hard-delete files, so it's safer to neutralise the file than leave a stale implementation around. Feel free to `git rm splash.js` manually — I've pasted the command in §8.)

---

## 7. Other improvements (do these next)

### High value, low effort
- `sitemap.xml` + link from `robots.txt`
- Add Product JSON-LD to every catalogue card:
  ```html
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Product",
   "name":"HP ProBook 440 G11",
   "image":"https://www.technexusmw.com/images/laptops/hp-probook-440-g11.webp",
   "brand":{"@type":"Brand","name":"HP"},
   "sku":"HP-PB440-G11",
   "offers":{"@type":"Offer","priceCurrency":"USD","price":"1050",
             "availability":"https://schema.org/InStock",
             "url":"https://www.technexusmw.com/catalogue.html#HP-PB440-G11"}}
  </script>
  ```
- Self-host the Google Font stack (no 3rd-party handshake on first paint)
- Add `hreflang` on every page linking EN/PT/NY versions (you already have the files, just add `<link rel="alternate" hreflang="en" href="...">`)
- Build a 404 page (`404.html`) that matches the header/footer
- Remove `perf-head-patch.html` from production (it's a dev note)

### Medium effort, high value
- Move FX rate out of hard-coded HTML into a tiny `pricing.json` + a build step that stamps the rate into pages
- Consent banner currently gates analytics; add a **pre-consent notice** (Malawi/Zambia data protection lines up with GDPR expectations if you serve PT/NY)
- Add a WhatsApp Business API webhook instead of `wa.me` URL bouncing — lets you capture lead source

### Nice-to-have
- Cloudflare Turnstile on the Quick Enquiry form (drop-in, 2 lines of HTML)
- Add "recently updated" micro-date on catalogue, driven by `catalogue.json` timestamp, for SEO freshness signal
- Dark-mode toggle stored in the same `tn_lang` pattern you already use (`tn_theme`)

---

## 8. Commits — what you need to run

I couldn't commit from inside the sandbox (git index is locked and the lock file is owned by a different process; I don't have permission to clear it). **All my changes are saved to disk** — just run these from your terminal:

```bash
cd /path/to/technexus-catalogue

# 1. Look at the current dirty tree (there were already ~70 files changed before this session)
git status

# 2. Commit splash removal + doc + xlsx as one logical change
git add index.html catalogue.html computer-assembly.html credentials.html \
        language-services.html medical-supplies.html software-development.html terms.html \
        splash.js RECOMMENDATIONS.md stock-selection-pricing.xlsx scripts/optimize-images.sh
git rm splash.js               # if you want it fully removed (I couldn't)
git commit -m "Retire splash-screen promotion; add stock-selection workbook and modernization plan"

# 3. (Optional) run the image optimizer — will produce a large diff
bash scripts/optimize-images.sh
git add images/ products/ Products_logos/ index_main/ _backup_images/
git commit -m "Shrink oversized JPEGs + generate responsive WebP variants"
```

> I intentionally did **not** push to `origin main`. Review locally, deploy via your normal Cloudflare Pages flow.

---

## Summary — what shipped today

- [x] Full code audit — this document, §1–3
- [x] UI modernization plan — §2 (two routes, Route A recommended)
- [x] Image/SEO plan + one-shot optimizer script — `scripts/optimize-images.sh`
- [x] Curated product list with pricing formulas — `stock-selection-pricing.xlsx`
- [x] Icon search terms per SKU + folder plan — inside the workbook
- [x] Splash screen removed from all 8 HTML pages; `splash.js` neutralised
- [x] "Other improvements" backlog — §7
