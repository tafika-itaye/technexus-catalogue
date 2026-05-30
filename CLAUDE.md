# CLAUDE.md — TechNexus Catalogue Handover

**Project:** technexus-catalogue  
**Repo:** https://github.com/tafika-itaye/technexus-catalogue  
**Live site:** https://www.technexusmw.com  
**Local path:** C:\Users\HP1\Documents\GitHub\technexus-catalogue  
**CDN:** Cloudflare (deployed via apply-updates.ps1)  
**Owner:** TJ (Tafika Bilson Itaye Jr.), IT Manager / Managing Director, TechNexus  
**Contact:** technexus_mw@proton.me | +265 995 753 326 / +265 889 941 700

---

## Stack

Static HTML/CSS/JS site. No build pipeline. Deployed to GitHub Pages, fronted by Cloudflare CDN.

| File | Purpose |
|------|---------|
| index.html | Home page |
| eis.html | EIS/POS compliance product page (primary revenue page) |
| eis-splash.html | EIS marketing splash |
| catalogue.html | Product catalogue |
| computer-assembly.html | PC assembly service |
| language-services.html | TechNexus Scripts |
| medical-supplies.html | Medical catalogue |
| software-development.html | Software dev service |
| credentials.html | Company credentials |
| styles.css | Global stylesheet |
| wa-chat.js | WhatsApp in-page chat widget |
| sw.js | Service worker (PWA) |
| security.js | Security helpers |
| _headers | Cloudflare cache headers |
| manifest.json | PWA manifest |

**Languages:** EN / PT / NY (Chichewa) — folders PT/ and NY/ mirror the root structure.

---

## Active Work Streams

### 1. EIS Page Redesign (PRIORITY — this session)

**File:** eis.html  
**Issues identified:**
- Flashing green pulsing dot in hero badge — remove entirely
- Page carries AI-generated fingerprints: emoji in HTML comments, over-literal method names, generic filler copy
- Full redesign requested: cleaner, more editorial, less "template-feel"

**Design direction:** Industrial/editorial. Dark hero. Sharp typography. No gimmicks. Pricing table stays but needs tighter layout. Remove all emoji from markup and inline comments.

**Commit target after EIS fix:** single commit, message: `refactor(eis): redesign page, strip AI artefacts, remove pulse animation`

### 2. AI Code Audit (repo-wide)

Scan all HTML/JS/CSS files for:
- Emoji in code, comments, strings
- Over-literal AI comment patterns ("// This function handles...", "// Step 1: ...")
- Filler copy patterns ("seamlessly", "leverage", "streamline", "cutting-edge", "robust solution")
- Boilerplate method names that signal generation (`handleSubmit`, `processData`, `updateState` used without context)

Do not break functionality. Changes are cosmetic/linguistic only unless code quality is genuinely poor.

**Commit target:** `chore: strip AI-generated artefacts from codebase`

### 3. Infrastructure Upgrade Assessment

See AUDIT.md — Senior infra architect recommendations.  
TJ is leaning toward Next.js migration. Key considerations documented there.

### 4. F500 Department Suggestions

See AUDIT.md — full department-by-department breakdown.

---

## Deployment

```powershell
# From repo root:
.\apply-updates.ps1 -ExecutionPolicy Bypass
```

Cloudflare cache purge may be needed after deploy for eis.html.

---

## Conventions

- PowerShell for all scripting. No bash heredocs (`cat > file << 'EOF'` corrupts on Git Bash/Windows).
- Full file rewrites preferred over targeted patches when changes are > 20 lines.
- No demo workarounds in production code.
- No em dashes, no hashtags, no asterisks in copy.
- Bullet lists in social/marketing copy. Active voice. Short sentences.
- MWK pricing (not USD) for local market pages.

---

## Key Business Context

- MRA EIS certification: TechNexus is a certified EIS fiscal device integrator in Malawi.
- Tenants: Demo (TIN 1234567890), TECHNEXUS (TIN 70684595, TAC D82G-CCWD-4YX7-8S69).
- EIS app: ASP.NET Core 8 / Blazor Server / SQL Server / Hangfire. Ports 7030/7200/5210.
- BAH bid pending (Blantyre Adventist Hospital — TNHMS system).
- NexusFine proposal submitted to Ministry of Transport.

---

## Session Log

| Date | Work Done |
|------|-----------|
| 2026-05-30 | claude.md created. EIS page full redesign. AI audit initiated. Infra/F500 audit documented. |
