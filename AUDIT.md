# AUDIT.md — TechNexus Catalogue Site Audit

**Prepared:** 2026-05-30  
**Scope:** technexus-catalogue repo — all HTML/JS/CSS files  
**Prepared for:** TJ, TechNexus

---

## Part 1 — AI-Generated Code Artefact Audit

This section documents patterns to find and fix across the repo.
Run each task as a targeted file pass. Do not break functionality.

### 1.1 Emoji in markup / comments / strings

Emoji appear in README.md (acceptable — README is public-facing markdown, low stakes) and likely in HTML comments. Pattern to find:

```
grep -rn "[^\x00-\x7F]" --include="*.html" --include="*.js" --include="*.css" .
```

Files most likely affected based on repo history: `index.html`, `eis.html`, `credentials.html`, `software-development.html`, `wa-chat.js`.

Action: Remove all emoji from HTML comments, JS comments, and any visible UI strings where they were not intentionally chosen for branding. Exception: WhatsApp CTA buttons may keep the WA logo SVG but not emoji text.

### 1.2 AI comment patterns to remove

Find and replace:
- `// This function handles...` — delete the comment, keep the function
- `// Step 1: ...` / `// Step 2: ...` — numbered procedure comments, remove or rewrite
- `// Helper function to...` — delete
- `// TODO: Add more functionality` — delete or convert to a real issue
- `/* Add your custom ... here */` — delete
- `// Initialize the...` before a constructor call — delete

Pattern:
```
grep -rn "// This\|// Step [0-9]\|// Helper\|// Initialize\|// TODO: Add" --include="*.js" --include="*.html" .
```

### 1.3 Filler copy patterns to replace

Find across all HTML files:
| Original | Replace with |
|---|---|
| "seamlessly" | remove or use "without disruption" |
| "leverage" | "use" |
| "robust solution" | name the thing specifically |
| "cutting-edge" | remove |
| "streamline" | "simplify" or name the specific improvement |
| "innovative" | remove unless backed by a specific claim |
| "state-of-the-art" | remove |
| "world-class" | remove |
| "empowering" (in body copy — motto excluded) | rewrite around what you actually deliver |

Pattern:
```
grep -rni "seamlessly\|leverage\|robust solution\|cutting-edge\|streamline\|state-of-the-art\|world-class" --include="*.html" .
```

### 1.4 Generic method names (JS files)

Check `wa-chat.js`, `security.js`, `sw.js` for:
- Functions named `handleX`, `processData`, `updateState`, `fetchData` with no qualifying context
- Rename to describe what they actually do: `openWhatsAppChat`, `queueOfflineRequest`, etc.

### 1.5 Commit message for this work

```
chore: strip AI-generated artefacts from codebase

- Remove emoji from HTML/JS comments and non-intentional UI strings
- Remove generic AI comment patterns (step numbers, helper descriptions)
- Replace filler marketing copy (seamlessly, cutting-edge, robust, etc.)
- Rename generic JS function stubs to context-specific names
```

---

## Part 2 — Senior Infrastructure Architect Recommendations

### Current State

Static HTML/CSS/JS. No build pipeline. GitHub Pages. Cloudflare CDN. Manual deploy via PowerShell.

**This works** for the current scale. The problems are:
- No shared components (nav and footer duplicated across 10+ HTML files)
- No type safety or linting
- Manual image optimisation (convert-to-webp.ps1)
- Multilingual (EN/PT/NY) handled by directory copies — updating one language requires touching three separate files
- No CMS — all content updates are direct file edits
- Service worker (sw.js) needs manual cache version bumps

### Recommendation: Migrate to Next.js (App Router)

**Rationale for Next.js over plain React or other frameworks:**

1. Static export (`next export`) preserves Cloudflare/GitHub Pages deploy model. No server needed.
2. Shared layouts — one `layout.tsx` replaces duplicated nav/footer in 15+ files.
3. File-based routing maps directly to current URL structure (`/eis`, `/catalogue`, etc.).
4. i18n routing built in — EN/PT/NY handled via `next-intl` or the built-in `i18n` config, not directory copies.
5. Image component handles WebP conversion and lazy loading automatically.
6. TypeScript by default catches copy/paste errors in pricing data and form handlers.
7. MDX support allows non-developer content updates (useful for catalogue items, pricing).

### Migration Path (phased — do not big-bang)

**Phase 1 — Scaffold alongside current site (no disruption)**
- `npx create-next-app@latest technexus-next --typescript --tailwind --app`
- Port `styles.css` tokens to Tailwind config
- Build shared `Nav` and `Footer` components
- Port `index.html` as first page — verify Cloudflare deploy works
- Commit: `feat(infra): scaffold Next.js app alongside static site`

**Phase 2 — Port revenue pages first**
- `/eis` (done — this session produced the HTML reference)
- `/software-development`
- `/credentials`
- Multilingual: implement `next-intl`, remove PT/ and NY/ directory copies

**Phase 3 — Catalogue and product pages**
- Move product data to JSON or MDX files
- Generate pages dynamically from data
- Remove manual HTML product files

**Phase 4 — Decommission static site**
- Point CNAME to Vercel or keep GitHub Pages with `next export`
- Archive old static files, update `apply-updates.ps1`

### Infrastructure Risks to Address

| Risk | Current | Fix |
|---|---|---|
| No staging environment | Changes go straight to prod | Add `staging.technexusmw.com` branch |
| No automated image optimisation | Manual PS1 script | Next.js Image component handles this |
| Cache invalidation manual | Cloudflare purge by hand | Cloudflare Pages auto-purges on deploy |
| No error monitoring | None | Add Sentry free tier |
| No uptime monitoring | None | Add UptimeRobot (free) |
| Multilingual sync fragile | Three directory copies | next-intl with single source JSON |

### Hosting Recommendation

Move from GitHub Pages to **Cloudflare Pages** (free tier):
- Auto-deploy from GitHub push
- Preview deployments per branch (solves staging gap)
- Edge network already used via Cloudflare CDN
- `_headers` file already in repo — compatible

---

## Part 3 — F500 Department Suggestions

Framed as: each department at a large enterprise has reviewed the site and voted on top improvements. Ten votes per department.

---

### Marketing

1. The EIS page has no case study or testimonial. One real client quote with business name and result outperforms any feature list.
2. No before/after framing on the hero. "Currently non-compliant? Here is what happens next" converts better than a feature headline alone.
3. The site has no lead magnet. A one-page PDF "MRA EIS checklist for VAT-registered businesses" captures emails and positions TechNexus as the authority.
4. No blog or article section. Two articles on MRA EIS compliance would rank on Google for Malawi-specific searches.
5. "Local" is the competitive advantage — no competitor can match a Blantyre-based team. That word needs more space in the hero, not just the stats strip.
6. Pricing is visible, which is a strength. Add a "most businesses choose this" call-out more prominently on Counter POS Business.
7. The WA float button has no label text on desktop. "Chat with us" alongside the icon increases click rate.
8. No Google Tag Manager or any analytics. You cannot improve what you cannot measure.
9. Social proof: the credentials page exists but there is no link to it from the EIS page. Add a "Certified by MRA" badge near the hero.
10. The site has no exit-intent or scroll-depth trigger for the pricing section. A sticky "Get compliant" bar after scroll past the hero would improve conversion.

---

### Sales

1. Pricing page has no comparison table showing what each plan includes vs excludes. Buyers need to compare side by side.
2. No FAQ section. The three questions every prospect asks: "Do I need new hardware?", "What happens if the internet goes down?", "How long does registration take?" Answer them on the page.
3. No phone number visible on the EIS page itself (only in the nav). Put it in the contact section too.
4. The contact form sends to WhatsApp, which is correct for this market. But there is no email fallback for corporate enquiries.
5. No CRM or lead tracking. Leads that come via WA are lost if not logged. Even a shared Google Sheet works at this stage.
6. The "First 20 clients" offer has no expiry date or counter showing how many slots remain. Urgency is absent.
7. Multi-branch plan has no detail on what "site visit" means or costs. Prospects drop off at ambiguity.
8. No testimonial from a business in a recognisable sector (pharmacy, supermarket, hardware store). Sector-specific social proof closes faster.
9. Sales copy uses "we" throughout. Reframe around the customer: "Your receipts are MRA-signed" not "We sign your receipts".
10. No upsell path from Bridge Only to Counter POS Business. A comparison call-out between the two plans would move buyers up.

---

### IT / Engineering

1. No CI/CD pipeline. Every deploy is manual. GitHub Actions with a `main` branch trigger and Cloudflare Pages deploy takes 30 minutes to set up and eliminates human error.
2. No linter (ESLint, Stylelint). AI-generated code issues will recur without enforcement.
3. Service worker cache version is hardcoded. On next deploy it will serve stale files to returning visitors until manually bumped. Automate with a build hash.
4. No Content Security Policy header in `_headers`. XSS risk is low on a static site but CSP is table stakes for a site handling business enquiries.
5. No Subresource Integrity (SRI) on the Google Fonts `<link>`. Low risk but good practice.
6. `security.js` — audit what it actually does. If it is blocking right-click and copy, remove it. This pattern is cargo-culted from old sites and damages trust with technical buyers.
7. No `<meta name="theme-color">` for mobile. Minor but visible on Android Chrome.
8. PageSpeed: run Lighthouse on every page before next deploy. Core Web Vitals matter for search ranking.
9. No error boundary on the WA chat widget. If `wa-chat.js` throws, does it silently fail or break the page?
10. `manifest.json` and `sw.js` register the site as a PWA but there is no actual offline experience. Either complete it or remove the service worker to avoid stale-cache complaints.

---

### Legal / Compliance

1. `privacy.html` and `terms.html` exist. Verify they reflect actual data handling — particularly the WA chat widget which sends data to Meta.
2. The enquiry form collects phone numbers and business names. There is no privacy notice adjacent to the form.
3. MRA EIS certification: the site claims MRA certification. Add the certificate reference number to the credentials page and link to it from eis.html.
4. POPIA (Malawi data protection) applies if collecting personal data. Confirm the privacy policy covers this.
5. WhatsApp message content is not encrypted end-to-end when relayed via the API. If clients send sensitive business data via the enquiry widget, add a disclosure.
6. The "First 20 clients" promotional offer should have written terms to avoid disputes.
7. Pricing in MWK is correct for local market. Ensure VAT status is noted on the pricing page (inclusive or exclusive).
8. No accessibility statement. WCAG 2.1 AA compliance is increasingly expected even for business sites.
9. Cookie notice absent. Even a static site loading Google Fonts creates a third-party data flow.
10. Company registration number and registered address are not on the site. These are expected by corporate procurement teams.

---

### Finance

1. Pricing is in MWK only. For NGOs, embassies, and regional clients, add a USD equivalent at current rate with a note that MWK rate applies at time of invoice.
2. No invoice or quotation request flow on the site. Corporate clients need a formal quote, not a WhatsApp message.
3. Monthly recurring revenue (MRR) potential is not visible to the reader. A simple "most businesses pay X per month" framing anchors value.
4. Annual prepay discount (10%) should show the effective saving in MWK, not just the percentage. "Save MWK 42,000 per year on Bridge Only" is more persuasive than "10% off".
5. No VAT indicator on pricing. State whether displayed prices are inclusive or exclusive of 16.5% VAT.
6. Multi-branch plan range (MWK 150,000 to 300,000/month) is too wide. Buyers cannot budget from a range. Narrow it or add a "from" price with a scope indicator.
7. No payment methods listed. Does TechNexus accept mobile money (Airtel, TNM)? Bank transfer? State this.
8. No refund or cancellation policy visible for the monthly support fee.
9. Hardware costs (for POS plans that include hardware) are not broken out. Add an asterisk noting hardware is included or a separate line for clarity.
10. No "total cost of ownership" framing over 12 months. A simple table showing setup + 12 months support makes the annual cost transparent and builds trust.

---

### Customer Experience / UX

1. Mobile navigation collapses to nothing (links hidden, no hamburger menu). Mobile users on smartphones cannot navigate the site.
2. The pricing section is the most important section but requires scrolling. A sticky "View pricing" link in the nav or a back-to-top + jump link improves access.
3. Form submission via WhatsApp is smart for this market. Consider adding a success state that shows the message was sent, with a follow-up time expectation.
4. Plan descriptions are short and functional. Add a single concrete example per plan: "Used by Limbe hardware stores with 2 terminals" gives context that spec sheets cannot.
5. No dark/light toggle. The dark theme is appropriate for the market but some users in daylight will struggle with contrast on the dark-on-dark muted text.
6. No search functionality. Once the catalogue grows, users cannot find products without it.
7. Fonts load from Google Fonts with no fallback during load. Add a system-font fallback stack to prevent layout shift.
8. The contact section has a form and contact details in a two-column layout. On tablet (768 to 900px) this collapses awkwardly. Test and fix the breakpoint.
9. Error states on the form are absent. If a user submits with an empty required field, there is no visible error message beyond the browser default.
10. No live chat or callback request option for users who are not on WhatsApp. Email is listed but not as a visible form action.

---

## Suggested Work Order

| Priority | Task | Effort | Commit target |
|---|---|---|---|
| 1 | EIS page full redesign | Done (this session) | `refactor(eis): redesign page, strip AI artefacts` |
| 2 | Repo-wide AI artefact strip | 2 hrs | `chore: strip AI-generated artefacts` |
| 3 | Mobile nav (hamburger menu) | 1 hr | `fix(nav): add mobile hamburger menu` |
| 4 | FAQ section on eis.html | 30 min | `feat(eis): add FAQ section` |
| 5 | MRA cert reference + credentials link on eis.html | 15 min | `feat(eis): add MRA cert reference` |
| 6 | Privacy note adjacent to form | 15 min | `fix(eis): add privacy note to enquiry form` |
| 7 | GitHub Actions CI/CD pipeline | 1 hr | `ci: add Cloudflare Pages auto-deploy` |
| 8 | Next.js scaffold | 1 day | `feat(infra): scaffold Next.js app` |
