# Trade Page Audit

Date: May 6, 2026  
Page audited: `/trade`  
Local URL reviewed: `http://localhost:3000/trade`

## Scope

This audit combines:

- `frontend-design`: anchor fidelity, content discipline, differentiator quality
- `frontend-design-pro`: visual direction, premium editorial treatment, image strategy
- `ui-ux-pro-max`: hierarchy, responsive behavior, touch, accessibility, CTA structure
- `web-artifacts-builder`: anti-AI-slop heuristics, especially against generic centered-card layouts
- `web-design-guidelines`: latest Vercel web interface rules from `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
- `webconsulting-branding`: clarity, authority, accessibility, and structured documentation discipline

Note: `webconsulting-branding` is not a brand-token match for Loom & Hearth Studio, so its teal/Raleway system should not be adopted here. Its value in this audit is structural rigor, accessibility, and concise professional voice.

## Current Read

The page is functional, accessible enough to pass most automated checks, and visually consistent with the rest of the site. But it does not yet feel like a real trade program page. It reads as a placeholder content page using shared house styles rather than a deliberate conversion surface for interior designers, specifiers, and project buyers.

The live desktop page especially shows this problem: the hero card is oversized, mostly empty on the right, and unsupported by any proof asset, process artifact, eligibility cue, or trade-specific utility. Mobile holds together better visually, but the information architecture is still thin.

## Findings

### 1. High: the page copy signals “not finished yet,” which weakens trust for trade buyers

This is the biggest issue on the page. Multiple lines explicitly tell the user the workflow is only partially complete or waiting for future assets.

References:

- `app/trade/page.tsx:37`
- `app/trade/page.tsx:43`
- `app/trade/page.tsx:89-92`

Examples in the current page copy:

- “This framework is in place now so the full catalog can drop into it later…”
- “As the catalog, image library, and operational policies are finalized…”
- “...leaving room for final operational details once the catalog, product imagery, and trade assets are published.”

Why this matters:

- `frontend-design` content discipline explicitly rejects filler and placeholder-adjacent copy.
- A trade page needs to communicate confidence, not roadmap state.
- Designers sourcing for clients need operational certainty: discount structure, response timing, hold policy, imagery support, and what happens next.

Recommendation:

- Rewrite the page as a present-tense offer.
- Remove all “later,” “framework,” and “will expand” language.
- Replace it with concrete statements: eligibility, discount model, response SLA, hold duration, what assets are available, and how sourcing support works.

### 2. High: the hero is compositionally weak on desktop and lacks a trade-specific proof asset

The hero currently renders as a large premium card with text only. On desktop, the right side remains visually empty, which makes the section feel unfinished rather than intentional.

References:

- `app/trade/page.tsx:50-71`
- `features/content-pages/content-pages.module.css:20-27`
- `features/content-pages/content-pages.module.css:29-32`

Why this matters:

- `frontend-design-pro` requires a committed visual direction and at least one unforgettable signature detail.
- `web-artifacts-builder` explicitly warns against generic centered-card work and uniform card repetition.
- Trade buyers respond to proof: tear sheets, finish boards, studio process, client-ready imagery, sourcing examples.

Recommendation:

- Redesign the hero as a two-column editorial trade surface.
- Left: the offer, response promise, and primary CTA.
- Right: one real trade proof asset, such as:
  - a tear sheet preview
  - a project board / finish board
  - high-resolution rug detail stack
  - atelier or sourcing photography with client-facing materials

Recommended anchor:

- `frontend-design`: **Swiss**
- Reason: it is a stronger fit than the current soft-luxury treatment because trade users need precision, hierarchy, and editorial confidence more than warmth.

Recommended differentiator:

- A “spec-sheet rail” or “trade facts column” locked to the hero edge with response SLA, hold window, shipping origin, and trade access notes.

### 3. High: the page is structurally too generic because it reuses the shared content-page system

The Trade page imports the shared content page module and inherits the same card language used across static pages.

References:

- `app/trade/page.tsx:4`
- `features/content-pages/content-pages.module.css:8-18`
- `features/content-pages/content-pages.module.css:94-104`

Why this matters:

- Trade is not a generic informational page.
- It is a conversion page for a high-intent B2B-ish audience.
- Reusing the same visual shell removes differentiation and lowers perceived seriousness.

Recommendation:

- Move `/trade` to its own dedicated module instead of continuing to inherit from `content-pages.module.css`.
- Keep global brand tokens, but give the Trade page its own layout grammar:
  - tighter editorial grid
  - stronger section rhythm
  - fewer but more purposeful surfaces
  - more explicit utility blocks

### 4. Medium: heading hierarchy is too flat inside the workflow section

The workflow section heading is `h2`, and each step title is also rendered as `h2`.

References:

- `app/trade/page.tsx:86-104`

Why this matters:

- The page remains technically readable, but the information hierarchy is flattened.
- `web-design-guidelines` prefers strong heading structure.
- `ui-ux-pro-max` emphasizes visual hierarchy and clearer scannability on mobile.

Recommendation:

- Keep “A cleaner path for project buyers…” as `h2`.
- Change each step title to `h3`.

### 5. Medium: CTA structure is too thin for a trade page

Current actions:

- `Start a trade inquiry`
- `Browse the collection`
- `Contact the studio`
- `Review sourcing framework`

References:

- `app/trade/page.tsx:62-70`
- `app/trade/page.tsx:108-114`

Why this matters:

- This asks for contact before giving enough proof.
- There is no “see trade benefits,” “download tear sheet,” “view available categories,” “see response timing,” or “trade FAQ.”
- It behaves like a generic landing page CTA stack, not a qualified trade intake flow.

Recommendation:

- Keep one primary CTA: `Start Trade Inquiry`
- Replace the weaker secondary actions with higher-intent trade actions:
  - `View Available Categories`
  - `See Trade Process`
  - `Request Tear Sheets`
  - `Ask About Project Holds`

### 6. Medium: the page does not yet contain enough proof for a client-facing sourcing program

The page lists benefits, but it does not prove them.

Missing content blocks:

- example tear sheet or asset preview
- response-time expectation
- who qualifies for trade access
- hold terms
- imagery support details
- sample categories most relevant to trade buyers
- mini FAQ for procurement concerns

Why this matters:

- `frontend-design` forbids content that gestures toward utility without actually delivering it.
- `frontend-design-pro` expects premium surfaces to be supported by real visual substance.
- Interior designers are looking for material they can use in real project workflows.

Recommendation:

- Add at least three proof modules below the hero:
  - `What You Receive`
  - `How Project Holds Work`
  - `Available Categories for Trade`

### 7. Medium: automated accessibility is strong overall, but contrast still fails in the shared palette

Desktop Lighthouse snapshot:

- Accessibility: `96`
- Best Practices: `100`
- SEO: `100`

The single failing category is contrast. The shared palette creates insufficient contrast in several places.

Relevant token references:

- `app/globals.css:17-18`
- `app/globals.css:21`
- `app/globals.css:29-31`
- `features/content-pages/content-pages.module.css:35-41`
- `features/content-pages/content-pages.module.css:137-146`

Observed Lighthouse contrast failures included:

- terracotta text on white
- wool-cream text on terracotta buttons
- olive-muted text on light surfaces

Why this matters:

- `web-design-guidelines` requires sufficient contrast.
- `ui-ux-pro-max` marks contrast as critical.

Recommendation:

- Darken `--color-clay-terracotta` when used as text.
- Stop using `--color-wool-cream` as button text over terracotta if the ratio remains under 4.5:1.
- Re-test eyebrow text and muted footer/meta text after token adjustments.

### 8. Low: the page lacks a strong visual or functional differentiator

Nothing on the current page is especially memorable. It is neat and brand-consistent, but not distinctive.

Why this matters:

- `frontend-design` requires a visible differentiator.
- `frontend-design-pro` requires one premium signature move.

Recommendation:

- Introduce one signature element:
  - tear-sheet preview pinned in the hero
  - vertical “Trade Facts” rail
  - sourcing board collage
  - structured eligibility matrix

## Recommended Direction

If this page is rebuilt properly, the correct direction is:

- Anchor: `Swiss`
- Tone: precise, editorial, assured
- Palette behavior: keep Loom & Hearth warm neutrals, but use them more sparingly and structurally
- Typography behavior: maintain brand type, but use clearer hierarchy and more negative space discipline
- Signature move: a trade facts rail + visual proof panel in the hero

This would give the page a stronger professional posture without making it feel corporate or off-brand.

## Recommended Information Architecture

1. Hero
   - Trade offer
   - response SLA
   - primary CTA
   - visual proof asset
2. Trade Benefits
   - concise, measurable bullets
3. What You Receive
   - tear sheets
   - imagery
   - holds
   - direct sourcing support
4. Categories Open for Trade
   - rugs
   - vintage rugs
   - poufs
   - pillows
   - decor
5. Workflow
   - inquiry
   - piece review
   - confirmation
   - shipping / follow-through
6. Trade FAQ
   - who qualifies
   - timing
   - holds
   - pricing
7. Final CTA
   - one primary action
   - one secondary supporting action

## Implementation Priority

### Phase 1

- Rewrite all placeholder / roadmap-style copy
- Fix heading hierarchy
- fix contrast failures in shared tokens used by the page

### Phase 2

- Give `/trade` its own dedicated module instead of generic content-page styling
- redesign the hero into a real two-column conversion surface

### Phase 3

- add proof modules and trade-specific utility content
- tighten CTA strategy around a real designer workflow

## Bottom Line

The Trade page is not broken technically. It is underpowered strategically.

It currently behaves like a polished placeholder. The next pass should not be cosmetic-only. It should reposition the page from “informational brand page” to “serious trade conversion page” with stronger proof, sharper hierarchy, clearer offer language, and one committed visual direction.
