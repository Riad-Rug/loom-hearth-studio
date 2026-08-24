# SEO Audit — loomandhearthstudio.com

**Date:** 2026-08-22
**Scope:** Full site, 78 unique URLs
**Method:** `/seo audit` — 9 specialist agents in parallel (technical, content, schema, sitemap, performance, visual, GEO, SXO, e-commerce), plus adversarial verification of the headline finding.
**Platform:** Next.js on Vercel, behind Cloudflare. Images on Cloudinary.
**Business type:** E-commerce — one-of-a-kind Moroccan rugs and textiles.
**Domain age:** Registered 2026-03-28 (~5 months).

---

## SEO Health Score: 61/100

| Category | Weight | Score | |
|---|---|---|---|
| Technical SEO | 22% | 68 | ███████░░░ |
| Content Quality | 23% | 62 | ██████░░░░ |
| On-Page SEO | 20% | 65 | ██████░░░░ |
| Schema / Structured Data | 10% | 65 | ██████░░░░ |
| Performance (CWV) | 10% | 40 | ████░░░░░░ |
| AI Search Readiness | 10% | 62 | ██████░░░░ |
| Images | 5% | 45 | ████░░░░░░ |

**Weighted total: 61/100**

Read this as a well-built young site with a handful of specific, cheap defects — not
a site with structural problems. The information architecture is correct, content is
genuinely good, and Product schema is complete. Almost every point lost is a bug or an
omission, not a rebuild.

---

## The single most important finding

**`/shop/rugs/beni-ourain` is empty while its inventory sits at a different URL.**

The page returns HTTP 200, is `index, follow`, has a self-referencing canonical, and is
listed in the sitemap at priority 0.7. It renders:

```
Beni Ourain — 0 pieces
No matches. Nothing matches these filters yet.
```

Meanwhile three Beni Ourain rugs exist and are **all `InStock`** (verified individually):

```
/shop/rugs/beni-ourain-style/beni-ourain-pile-rug-brown-lilac-chevrons      InStock
/shop/rugs/beni-ourain-style/beni-ourain-pile-rug-ivory-dark-brown-diamonds InStock
/shop/rugs/beni-ourain-style/beni-ourain-pile-rug-undyed-ivory-relief       InStock
```

The category page filters on the slug `beni-ourain`; the products carry `beni-ourain-style`.
The slugs never match, so the page is permanently empty.

"Beni Ourain" is the highest-intent head term in this niche. The one page built to capture
it is blank, indexable, and actively promoted to Google in the sitemap. Five of nine agents
independently reached this URL from different directions.

This is a data/taxonomy fix, likely a one-line change. It is the highest
value-per-effort item in the entire audit.

*How you'd know the fix failed:* fetch `/shop/rugs/beni-ourain` and grep for "0 pieces".

---

## Critical

### 1. Beni Ourain category page empty due to slug mismatch
See above.

### 2. Six style segments used in product URLs 404 as directories

Products live under `/shop/rugs/<style>/<product>` for six styles — `azilal-style`,
`beni-ourain-style`, `boujad-style`, `flatweave-hanbel`, `mixed-technique`,
`zemmour-style`. Every one of those six directory URLs returns **404**.

The consequence isn't broken indexing (products are linked directly), it's that six
legitimate weaving-style keyword clusters — the exact vocabulary this business trades on —
have no landing page. Any truncated or guessed URL dead-ends.

*Falsify:* `curl -o /dev/null -w "%{http_code}" .../shop/rugs/azilal-style` → currently 404.

---

## High

### 3. `og:image` is a 404 on every non-product page

```
https://www.loomandhearthstudio.com/og/default-placeholder.jpg → 404
```

**Scope, verified precisely:** all 58 product pages carry real Cloudinary og:images. The
placeholder affects the ~20 non-product pages — homepage, `/shop`, all 6 category pages,
`/about`, `/contact`, `/faq`, `/trade`, `/blog` and both posts, and the policy pages.

Those are exactly the URLs shared when launching a brand. Every such share on Instagram,
Pinterest, Facebook, iMessage, Slack, and X renders with no preview image — for a business
whose `sameAs` names Instagram, Pinterest and TikTok as its primary channels.

Fix in two parts: ship the missing 1200×630 default, then give category pages a real image.
Add `og:image:width` / `og:image:height` while you're there.

*Falsify:* `curl -I .../og/default-placeholder.jpg` → should be 200.

### 4. Category and product images bypass `next/image` — 11.9 MB per category page

Lab-measured (headless Chromium, unthrottled, single run):

| Page | Total transfer | Image payload | Image requests |
|---|---|---|---|
| `/shop/rugs` desktop | 12.24 MB | **11.89 MB** | 36 |
| `/shop/rugs` mobile | 11.65 MB | — | — |
| Product page desktop | 5.98 MB | 4.9 MB | 20 |

The homepage does this correctly — images route through `/_next/image` with proper
`srcset`/`sizes`, natural dimensions tracking displayed dimensions ~1:1. Category and
product pages instead hit `res.cloudinary.com` directly with **one fixed transform for every
viewport**: a 412px-wide phone receives byte-identical images to a 1350px desktop.

LCP on `/shop/rugs` is a 324.9 KB image at natural 1000×1333 displayed at 328×437 CSS —
about 9× the pixels needed — rendering at 2.24s *unthrottled*. That is the optimistic
floor; standard mobile throttling pushes it well past the 2.5s "good" threshold.

Images are marked `loading="lazy"` but fetch anyway — the grid isn't tall enough to push
them beyond Chromium's lazy-load distance threshold.

Routing these through `next/image` (or a Cloudinary responsive helper with matching
`srcset`/`sizes`) is the single biggest performance lever available.

*Falsify:* re-measure `/shop/rugs` image transfer total; should drop from ~11.9 MB toward 1–2 MB.

### 5. Cookie consent modal occludes the primary mobile CTA

On first paint at 390×844, the "Privacy Preferences" modal covers the bottom ~55% of the
viewport, completely hiding both hero CTAs ("Shop Moroccan Rugs" / "Shop the full
collection"). They are rendered and within the fold — just occluded. A first-time mobile
visitor has no visible path to the primary conversion action until they dismiss the prompt.

Confirmed by comparing the same viewport before and after dismissal. The same modal also
covers the product-page CTA label on desktop at 1440×900.

The product page's sticky bottom bar (price + "Reserve this piece") is a good safety net —
the homepage lacks any equivalent.

### 6. No named human anywhere on the site

Home, `/about`, and both blog posts narrate in consistent first person — "I grew up…",
"my grandfather…", "my mother bought and recorded the piece…" — but never name a person.
No bio, no photo, no credential, no byline. The only named entity is "Loom & Hearth Studio
LLC". No `Person` schema exists on any page, and both blog posts' `Article` nodes have
`author: null`.

For a provenance-driven handmade brand, first-hand experience is the whole E-E-A-T case,
and it's currently narrated but unattributable. This is the central content gap.

### 7. Category pages carry almost no topical prose

`/shop/rugs` has a 47-word intro above the grid; boilerplate-stripped extraction of the
whole page yields ~70 words. The 400-word category floor in `references/quality-gates.md`
is not close to met on any category page.

More consequentially: the site's own vocabulary is never explained. Beni Ourain, Zemmour,
Taznakht, Boujad, Azilal, "mixed technique" appear constantly as URL slugs, filter labels
and product names — and are defined nowhere. A buyer asking an assistant "what's the
difference between a Zemmour and a Taznakht rug" gets an answer sourced from Wikipedia,
not from the retailer who actually sources them.

### 8. `/trade` has zero internal links sitewide

Verified by grep against full page HTML, not eyeballing: no link to `/trade` exists on the
homepage or category pages. The trade/designer segment the page was built for cannot reach
it by browsing. Its content scores well (70/100 against a designer persona) — the score is
moot if nobody arrives.

### 9. Blog `Article` schema is present but non-compliant

Both posts emit `Article` JSON-LD with `headline`, `description`, `url`, `datePublished`.
Three problems:

- `datePublished` is `"August 13, 2026"` — **not ISO 8601**
- `image` is `null` (required for Article rich-result eligibility) despite a real hero image existing in the page HTML
- `author` and `publisher` are both `null`

*Falsify:* re-fetch either post's JSON-LD; `datePublished` should match `^\d{4}-\d{2}-\d{2}` and `image` should be populated.

### 10. Six top-level category pages carry no page-level schema

`/shop`, `/shop/rugs`, `/shop/vintage`, `/shop/poufs`, `/shop/pillows`, `/shop/decor` emit
only `Organization` + `WebSite` — no `BreadcrumbList`, no `ItemList`. The subcategory
template one level deeper *does* emit both, so the capability exists and is simply
missing from the higher-traffic templates.

### 11. `LocalBusiness` schema asserts a storefront that likely doesn't exist

Sitewide JSON-LD declares `"@type": ["Organization","LocalBusiness"]` with a
suite/mailbox-format address (`5830 E 2ND ST, STE 7000 #34442, Casper, WY`) and no
`telephone`, `openingHours`, `geo`, or `priceRange`.

`LocalBusiness` asserts a physical place customers can visit. If there's no walk-in
showroom this is a misrepresentation that risks a manual action while buying nothing — a
mail-drop address earns no map pack eligibility. Replace with:

```json
"@type": ["Organization", "OnlineStore"]
```

Keep `LocalBusiness` only if a real showroom exists, and then add the missing properties.

---

## Medium

### 12. No crawlable pagination; discovery is incidental rather than structural

`/shop/rugs` exposes 20 of 31 products even after full JS render. "Show More Pieces" is a
pure `<button>` with no `href`, no `data-url`, no fallback. `?page=2`, `?offset=20`,
`?limit=40`, `?show=all` all return the identical first-20 HTML — there is no working
paginated URL sitting unlinked.

**Adversarially verified — nothing is actually orphaned.** A breadth-first crawl from the
homepage using raw HTML only found 53/58 products at hop 0 (the homepage alone surfaces 24
product links), and 58/58 at hop 1 via PDP related-product modules. **True orphan count: 0.**

What remains is real but lower severity: the safety net is *incidental*. Reachability
depends on fixed related-product modules happening to cover every product, not on
deterministic pagination. It holds at 58 products; it is not guaranteed to hold at 200. And
no category page past the first 20 items is addressable or shareable.

*Escalation trigger:* re-run the reachability check after catalog growth; if orphans become non-empty, this returns to High.

### 13. `/shop/decor` is an empty, indexable, sitemap-promoted category

"Decor & Antiques — 0 pieces / No matches." `index, follow`, priority 0.7 in the sitemap —
identical priority to the populated `/shop/rugs`. The site's own nav already disables this
entry (`aria-disabled="true"`), so the frontend treats it as inactive while indexing does not.

Pick one: populate it, `noindex` it, or remove it from the sitemap and nav.

### 14. Templated meta descriptions across 22 of 58 products

All sampled pillows and poufs return word-for-word identical descriptions differing only in
the price digit:

> "ONE OF A KIND Moroccan [pillows|poufs], $X USD. Ships from Morocco in 5-7 business days,
> 14-day returns. Exact-piece photos before payment."

No colour, pattern, or size. Rugs by contrast get unique descriptions including real
dimensions. Google is likely to rewrite these snippets.

### 15. Thin product content in pillows and poufs

Measured word counts (real extraction, not the truncated CLI output):

| Category | Range | Sections |
|---|---|---|
| Rugs / vintage | 359–446w | Full: Specifications, Description, Materials, Construction, Condition, Provenance, Care |
| Poufs | 264w | Missing Construction |
| Pillows | 219–245w | Missing Construction |

Pillows and poufs fall below the 400-word product floor while making identical provenance claims.

### 16. Sitemap hygiene

- `/accessibility-statement` appears **twice**, with *contradictory* metadata (`monthly`/0.7 vs `yearly`/0.4) — a templating bug pulling one page into two groups
- `<lastmod>` present on **2 of 79** entries (the blog posts only) — the entire commerce catalog ships no freshness signal, while `changefreq=weekly` claims otherwise on 60 entries
- `priority`/`changefreq` are boilerplate and ignored by Google; recommend removing both

**Verified clean:** all 78 unique URLs return 200 with zero redirects. No noindex or
robots-disallowed URL is listed. Navigation coverage matches the sitemap exactly.

### 17. `Organization` duplicated on every product rather than `@id`-referenced

Every product's `offers.seller` and `brand` re-embed a flat inline Organization object with
no `@id` link back to `https://www.loomandhearthstudio.com/#organization`. Should reference
the canonical node.

### 18. `OfferShippingDetails` missing `deliveryTime` on all sampled products

Only `shippingDestination` and `shippingRate` are present.

### 19. `robots.txt` `Disallow: /account` conflicts with the page's own `noindex`

A disallowed URL is never crawled, so its `noindex` is never read. "Sign in" is linked
sitewide, so Google can still index the bare URL. Same pattern applies to `/cart` and
`/checkout`. Also: two separate `User-agent: *` groups exist (one Cloudflare-managed, one
custom) — Google merges them, stricter parsers may not.

---

## Low

| # | Finding | Detail |
|---|---|---|
| 20 | Brand double-stamped in rug/vintage titles | `Beni Ourain Diamond Rug, Ivory & Brown \| Loom & Hearth Studio \| Loom & Hearth` (77 chars). Pillows use a clean single-brand template. |
| 21 | No security headers beyond HSTS | No CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy` on a checkout-capable store. |
| 22 | Homepage `Cache-Control: no-store` | Disqualifies the homepage from bfcache. No `fetchpriority="high"` on the LCP hero. |
| 23 | 1372 ms long task on homepage | 27× the 50 ms threshold, unthrottled. Coincides with an 88 KB JS chunk. Inferred link, not profiled. |
| 24 | Hamburger touch target 40×40 px | Below the 48×48 recommended minimum. All other targets measured fine. |
| 25 | Blog post 2 under length floor | ~1,290–1,630w vs the 1,500w floor. Post 1 is ~2,410–2,750w. |
| 26 | "Founder sourcing note" heading is vestigial | Text beneath it is "Unique item. Quantity is fixed to 1." — not founder voice. Real sourcing narrative lives under "Provenance". |
| 27 | `mpn` convention inconsistent | Rugs/vintage/pillows use a CUID; poufs use a URL slug. Not a violation. |
| 28 | `sameAs` missing YouTube | Only Instagram, Pinterest, TikTok. No YouTube, Wikipedia, or LinkedIn entity. |
| 29 | `ai-input` signal unset | `Content-Signal` sets `search=yes, ai-train=no, use=reference` but omits `ai-input`, the field that would explicitly permit citation. |
| 30 | No `llms.txt` | 404. Google ignores it; noted for completeness only, not weighted as a gap. |
| 31 | No UCP profile | `/.well-known/ucp` → 404. Emerging spec, forward-looking only. |

---

## What's genuinely working

Worth stating plainly, because it constrains what should change:

- **Product/Offer schema is complete and passes merchant-listing requirements** on all 8 sampled products — price, `priceCurrency`, `availability`, `image`, `hasMerchantReturnPolicy`, `shippingDetails`, `itemCondition`, `seller`, and `mpn`+`brand` satisfying `identifier_exists`. Merchant listings are not blocked.
- **Page type matches the market.** The "moroccan rugs" SERP is 7–8/10 transactional category grids; `/shop/rugs` is exactly that. The site is not structurally mismatched — problems are execution-level.
- **Everything is server-rendered.** Every page tested returned full HTML on first byte, `is_spa: false`. No crawler needs to execute JS.
- **Product content is individualized, not templated, where it counts.** Provenance and Condition sections carry falsifiable per-item detail: *"comes from the same acquisition series as LH-R-0035"*, *"My mother bought and recorded the piece as Zemmour at the time of acquisition"*. The site distinguishes "(Attributed)" from "(Verified)" provenance rather than asserting authority uniformly — unusually honest, and a real asset.
- **All 78 URLs return 200, zero redirect chains.** `http→https`, non-www→www, and trailing-slash all resolve in a single correct hop.
- **`/faq` is a strong citability asset** — `FAQPage` schema, H2s phrased as literal buyer questions, self-contained answers in the 60–180 word range.
- **BreadcrumbList present on all product pages.** Canonicals correct and self-referencing throughout. No faceted-nav URL bloat.
- **The AI crawler split actually achieves its intent.** `ClaudeBot` and `GPTBot` are blocked (training), while `Claude-SearchBot`, `Claude-User`, `OAI-SearchBot` and `PerplexityBot` are not — these are independent tokens, so live browsing and citation remain permitted. `Google-Extended` governs Gemini training only and has no bearing on Search or AI Overviews eligibility. Correctly configured, not accidental.
- **Mobile rendering is clean** — no horizontal scroll, no overlap, no broken images across 4 templates × 2 viewports. Mobile nav verified usable by actual interaction.
- **CLS measured near zero** (0 to 0.0014) across all 5 page/viewport combinations, despite no explicit `width`/`height` attributes — consistent with Next.js `fill`-mode images in CSS-sized containers.

---

## Prioritized action plan

Sequenced by dependency and value-per-effort, not by severity label alone.

### P0 — this week (cheap, high value, no dependencies)

1. **Fix the Beni Ourain slug mismatch.** Align the category filter value with the product
   taxonomy (`beni-ourain` vs `beni-ourain-style`). Highest value-per-effort item in the audit.
2. **Ship `/og/default-placeholder.jpg`** (1200×630) so no shared URL renders imageless,
   then give category pages real per-page images.
3. **Resolve `/shop/decor`** — populate, `noindex`, or remove from sitemap + nav.
4. **Unblock the mobile hero CTA** — the cookie modal is a direct conversion blocker on the
   homepage's primary action.

### P1 — this month (high value, some build effort)

5. **Route category/product images through `next/image`.** Single biggest performance lever:
   ~11.9 MB → 1–2 MB expected on `/shop/rugs`. Also resolves the LCP oversizing.
6. **Create the six style landing pages** (`azilal-style`, `boujad-style`, `zemmour-style`,
   `flatweave-hanbel`, `mixed-technique`, plus a fixed `beni-ourain`). *Depends on #1* — fix
   the taxonomy first, then the pages have inventory to show.
7. **Link `/trade`** from the footer and main nav.
8. **Fix `Article` schema** — ISO 8601 date, populate `image`, add `author`/`publisher`.
9. **Add `BreadcrumbList` + `ItemList`** to the 6 top-level category templates.
10. **Replace `LocalBusiness` with `OnlineStore`** unless a physical showroom exists.

### P2 — next quarter (compounding, higher effort)

11. **Write real category copy** (400+ words) that *explains the weaving styles*. This one
    item unblocks three separate findings at once: the category thin-content gap (#7), the
    GEO citability gap (no self-contained answer for "what is a Zemmour rug"), and the SXO
    first-time-buyer persona gap. It is the highest-leverage content work available.
12. **Name the founder.** Byline, bio, photo, `Person` schema, `author` on both posts. This
    is the central E-E-A-T fix and cannot be substituted by more content.
13. **Unique meta descriptions** for the 22 pillow/pouf PDPs; add Construction sections to
    lift them over the 400-word floor.
14. **Build crawlable pagination** (`?page=N` with `rel=next`, or paginated routes).
15. **Sitemap cleanup** — dedupe `/accessibility-statement`, add real `lastmod`, drop
    `priority`/`changefreq`.

### P3 — backlog

16. Security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
17. Trim double-stamped brand from rug/vintage titles.
18. `Organization` `@id`-referencing; `deliveryTime` in `shippingDetails`.
19. Resolve the `robots.txt` `Disallow` vs `noindex` conflict on `/account`, `/cart`, `/checkout`.
20. Hamburger touch target to 48×48.

---

## What was NOT verified

Stated explicitly so nothing here is mistaken for a clean bill of health:

- **Image alt text was not audited.** No image-specific agent was run; alt-text coverage
  across 58 products is unknown. Run `/seo images https://www.loomandhearthstudio.com`.
- **No Core Web Vitals field data.** No Google API credentials are configured, so there is
  no CrUX 75th-percentile data. All performance numbers are single-run, unthrottled lab
  measurements — optimistic floors, not user experience.
- **Sold-out product behavior is unknown.** Every SKU is one-of-a-kind (catalog-wide, not
  just "vintage"), but no sold-out item existed in the sample, so what happens to a PDP
  after its single unit sells — soft-404, stale `InStock`, redirect, or orphaned sitemap
  entry — could not be determined. Worth deciding deliberately before the first sell-out.
- **No backlink data.** Domain is 5 months old; Moz/Bing keys aren't configured and Common
  Crawl returned nothing. Expected for a new domain, not a finding.
- **No marketplace data.** Google Shopping and Amazon visibility require the DataForSEO
  extension, which isn't installed.
- **The 1372 ms long task was not profiled** to a specific function — the link to the 88 KB
  JS chunk is inferred from timing coincidence, not proven.

---

## Tooling defects found while running this audit

Three bugs in the claude-seo skill itself, surfaced by dogfooding it. All would silently
mislead other users:

| File | Line | Defect |
|---|---|---|
| `scripts/schema_ecommerce_validate.py` | 216 | `elif isinstance(shipping, dict)` skips required-field validation entirely when `shippingDetails` is a **list** — valid schema.org, and what this site emits. The missing `deliveryTime` was reported as PASS. |
| `scripts/render_page.py` | 554–557 | `--json` truncates `extracted_text` to 500 chars with no accompanying word-count or length field. Any agent measuring content depth via the CLI under-reports — this would have produced false thin-content findings across the entire site. |
| `scripts/capture_screenshot.py` | — | Uses Playwright `networkidle`, which never resolves on `/shop` and `/shop/rugs` (45–60s timeouts). Needs a `domcontentloaded` + settle fallback. Independently corroborates the 36-concurrent-image finding on those routes. |

The second is the most dangerous: it doesn't error, it just makes every page look thin.
