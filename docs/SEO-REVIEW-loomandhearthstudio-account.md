# SEO Review — `loomandhearthstudio.com/account`

**Target URL:** https://www.loomandhearthstudio.com/account
**Resolved URL:** https://www.loomandhearthstudio.com/account/login (307 redirect)
**Date:** 2026-08-22
**Method:** `/seo page` — raw fetch + headless Chromium render, HTML parse, robots.txt and sitemap.xml checks, asset status verification across 11 sampled URLs.
**Platform detected:** Next.js on Vercel, behind Cloudflare.

---

## Summary

`/account` 307-redirects to `/account/login`, a `noindex, nofollow` customer login page. As a page there is almost nothing to optimize, and that is the correct configuration — a login form should not rank.

The valuable finding is not on this page. Crawling it surfaced a **sitewide broken `og:image`** affecting all 79 URLs in the sitemap.

---

## Page Score Card — `/account/login`

```
On-Page SEO:     80/100  ████████░░
Content Quality:    N/A   (129 words — correct for an auth page)
Technical:       75/100  ███████░░░
Schema:          50/100  █████░░░░░
Images:          40/100  ████░░░░░░  (no content images; og:image is a 404)
```

Content Quality is scored N/A rather than penalized: word count, E-E-A-T signals, and
keyword depth are not applicable to an authentication form.

---

## Critical

### 1. `og:image` points at a file that does not exist — sitewide

Every page declares the same Open Graph image, and it returns **404**:

```
https://www.loomandhearthstudio.com/og/default-placeholder.jpg  →  404
```

Verified identical on all sampled URLs:

| URL | og:image | Status |
|---|---|---|
| `/` | `/og/default-placeholder.jpg` | 404 |
| `/shop` | `/og/default-placeholder.jpg` | 404 |
| `/shop/rugs` | `/og/default-placeholder.jpg` | 404 |
| `/shop/rugs/beni-ourain` | `/og/default-placeholder.jpg` | 404 |
| `/shop/vintage` | `/og/default-placeholder.jpg` | 404 |
| `/shop/poufs` | `/og/default-placeholder.jpg` | 404 |
| `/shop/pillows` | `/og/default-placeholder.jpg` | 404 |
| `/shop/decor` | `/og/default-placeholder.jpg` | 404 |
| `/about`, `/contact`, `/blog` | `/og/default-placeholder.jpg` | 404 |

**Impact:** every share on Instagram, Pinterest, Facebook, iMessage, Slack and X renders
with no preview image. The site's own `sameAs` lists Instagram, Pinterest and TikTok as its
primary channels, so this sits directly on the main acquisition path for a visual product.

**Fix, in two parts:**

1. Ship the missing default at `/og/default-placeholder.jpg` — 1200×630, under 300 KB.
2. Give shop and product pages a real per-page image (the product photograph) rather than
   any placeholder. A placeholder that exists is the floor, not the goal.

Add dimensions alongside it so scrapers reserve layout:

```html
<meta property="og:image" content="https://www.loomandhearthstudio.com/og/…" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="…" />
```

---

## High

### 2. `LocalBusiness` schema asserts a storefront that may not exist

The sitewide JSON-LD declares:

```json
"@type": ["Organization", "LocalBusiness"],
"address": {
  "@type": "PostalAddress",
  "streetAddress": "5830 E 2ND ST, STE 7000 #34442",
  "addressLocality": "Casper",
  "addressRegion": "WY",
  "postalCode": "82609",
  "addressCountry": "US"
}
```

Two problems:

- `LocalBusiness` asserts a physical place customers can visit. The address is in the
  suite/mailbox format typical of registered-agent and mail-forwarding services. If there
  is no walk-in showroom in Casper, this is a misrepresentation that risks a manual action
  while buying nothing — a mail-drop address is not eligible for map pack results.
- The markup carries no `telephone`, `openingHours`, `geo`, or `priceRange`, so even taken
  at face value the `LocalBusiness` claim is incomplete.

**Recommended replacement** — `OnlineStore` is the accurate schema.org subtype for this
business and preserves every `Organization` property already present:

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "OnlineStore"],
  "@id": "https://www.loomandhearthstudio.com/#organization",
  "name": "Loom & Hearth Studio",
  "url": "https://www.loomandhearthstudio.com/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.loomandhearthstudio.com/brand/logo.png"
  },
  "sameAs": [
    "https://www.instagram.com/loomandhearthstudio/",
    "https://www.pinterest.com/loomandhearthstudio/",
    "https://www.tiktok.com/@loomandhearthstudio"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "hello@loomandhearthstudio.com",
    "availableLanguage": ["English"]
  }
}
```

Keep `LocalBusiness` **only** if a real showroom exists — and then add `telephone`,
`openingHours`, `geo`, and `priceRange`.

---

## Medium

### 3. `robots.txt` `Disallow: /account` conflicts with the page's `noindex`

```
Disallow: /account          ← in robots.txt
<meta name="robots" content="noindex, nofollow">   ← on the page
```

A disallowed URL is never crawled, so the `noindex` directive is never read. Because
"Sign in" is linked from the sitewide header, Google can still index the bare URL from
those internal links, with no snippet.

- To remove it fully: drop the `Disallow` and let the `noindex` do the work.
- The `Disallow` is only correct if a URL-only listing is acceptable.

Low practical stakes on a login page, but the same mistake applies to `/cart` and
`/checkout`, which carry the same `Disallow`.

### 4. Duplicate `User-agent: *` groups in `robots.txt`

Cloudflare's managed block writes one group (`Allow: /`); the custom rules add a second
containing the disallows. Google merges groups sharing a user-agent, so the rules do apply
— but stricter third-party parsers honor only the first matching group. Worth
consolidating into one.

---

## Low

| Issue | Detail | Fix |
|---|---|---|
| Brand duplicated in title | `Customer login \| Loom & Hearth Studio \| Loom & Hearth` (53 chars) | Drop the trailing `\| Loom & Hearth` |
| `/account` returns 307 | Temporary redirect, not 308/301 | Conventional for an auth gate; no practical cost on a noindex route |
| `og:image:width` / `:height` absent | Scrapers cannot reserve layout | Add with the image fix above |

---

## Correctly configured

- Self-referencing canonical: `https://www.loomandhearthstudio.com/account/login`
- Exactly one descriptive H1: "Sign in to your account"
- Meta description at 125 characters — within range, and accurate to the page
- `cache-control: private, no-cache, no-store, max-age=0, must-revalidate` — right for auth
- `strict-transport-security: max-age=63072000` (2 years)
- Content is server-rendered; the H1 and form are present in raw HTML, not JS-injected
- `noindex, nofollow` on a login page is the correct choice

---

## AI crawler posture — informational

Cloudflare's managed block disallows `ClaudeBot`, `GPTBot`, `CCBot`, `Google-Extended`,
`Applebot-Extended`, `Bytespider`, `meta-externalagent`, and sets
`Content-Signal: search=yes, ai-train=no, use=reference`.

`OAI-SearchBot` and `PerplexityBot` are **not** blocked. That means AI-search citation
remains possible while model training is refused — which is usually the intended split.
This reads as correctly configured rather than accidental. Flagged only so the choice is a
known one.

---

## Recommended next step

The `og:image` finding came from crawling a single login page. A full crawl will likely
surface more issues of the same class — placeholder assets, schema applied sitewide from
one template, canonical and redirect patterns:

```
/seo audit https://www.loomandhearthstudio.com
```

---

## Priority order

1. Ship the missing `og:image` and add per-page images for shop and product pages — **all 79 URLs**
2. Replace `LocalBusiness` with `OnlineStore` unless a physical showroom exists
3. Resolve the `robots.txt` / `noindex` conflict on `/account`, `/cart`, `/checkout`
4. Consolidate the duplicate `User-agent: *` groups
5. Trim the duplicated brand from the title tag
