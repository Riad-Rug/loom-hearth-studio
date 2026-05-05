# Landing Page Audit: First Three Sections

Date: 2026-04-28  
Scope: hero, trust badges, first merchandising section on `/`

## Direction

Problem: the first three sections are credible but visually too homogeneous, so the page does not establish a strong point of view fast enough and the third section reads like a generic card rail instead of a deliberate buying path.

Chosen anchor: `Organic`. Loom & Hearth already has the right raw material for an Organic system: earthy palette, serif display, tactile imagery, rounded forms. Replacing it with `webconsulting-branding` teal gradients or a Swiss system would make the page more generic, not better.

Reason for that choice over the safe alternative: the safe move here is “luxury ecommerce neutral”; the stronger move is an Organic editorial surface that feels sourced, tactile, and specific to handmade rugs.

Differentiator: the first three sections should read as a single guided buying sequence, with the hero establishing trust, the badges compressing proof into a narrow verification rail, and the third section becoming an asymmetric “shop by intent” composition instead of five equal cards.

Skill synthesis:
- `frontend-design`: keep one anchor and stop hybrid drift.
- `frontend-design-pro`: remove default-AI habits, especially `Inter`, repetitive rounded cards, and timid hierarchy.
- `web-artifacts-builder`: keep the fix plan component-oriented and implementation-ready rather than proposing flat mockup-only changes.
- `web-design-guidelines`: findings below include accessibility and interaction defects.
- `webconsulting-branding`: use its accessibility rigor and spacing discipline, not its visual palette or typography, because that brand system conflicts with Loom & Hearth’s current identity.

## Findings

### Critical

- [app/globals.css](/home/hp/loom-hearth-studio/app/globals.css:46): `--font-body: "Inter"` breaks the chosen Organic direction and directly violates the `frontend-design-pro` constraint against default AI fonts. The display/body pairing feels half-finished: characterful serif on headings, generic SaaS body face everywhere else.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:112): interactive states remove outlines on `:focus-visible` without adding a visible replacement. This affects hero CTAs and re-used button styles.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:404): card links in the first merchandising section also suppress outlines on `:focus-visible` without a replacement.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:716): product and narrative card focus states repeat the same problem. This is a direct Vercel guideline failure, not just a design preference.

### High

- [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:132): the third section is modeled as `featured`, but the live content is actually category-first merchandising (“Choose the category first, then the exact piece”). The IA and implementation naming diverge, which makes future edits easier to mis-handle.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:6): hero, badge rail, and third section all sit inside the same cream-card-plus-soft-shadow treatment. The first impression lacks cadence because every surface is using the same visual sentence.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:512): five equal columns in the first merchandising grid flatten priority. On a wide desktop the cards become too small to feel editorial, and on first read the user has no obvious starting point.
- [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:41): the hero paragraph is structurally just one long value statement. It explains the catalog, but it does not sharpen the main promise introduced by the eyebrow: verified colour before payment.

### Medium

- [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:94): the trust highlights are rendered as generic paragraphs inside a `div`. This should be a semantic list because it is a compact set of proof points.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:224): the badge rail forces all-copy uppercase. It scans like shipping metadata rather than premium reassurance.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:40): major headings do not use balanced wrapping. The hero survives because the line breaks are naturally strong right now, but the section becomes fragile as soon as copy changes.
- [app/globals.css](/home/hp/loom-hearth-studio/app/globals.css:79): the global background gradient plus repeated section gradients create a persistent beige haze. The page loses contrast between the canvas and the cards too early.

## Best Fixes

### 1. Hero

Keep the current message, but rewrite the composition around the verification promise.

- Replace `Inter` with a warmer but cleaner body face. Best fit: `Open Sans` if you want a low-risk change that still improves tone, or `Satoshi`/`Epilogue` if you want a stronger editorial result. Do not keep `Inter`.
- Tighten the hero copy into a two-part structure:
  - headline stays trade-led
  - paragraph starts with the verification model, then the sourcing model
- Convert the hero media from a passive slideshow to a composed stacked gallery:
  - one dominant image
  - two smaller offset crops as supporting evidence
  - keep motion subtle and disable it under `prefers-reduced-motion`
- Add visible focus rings to both CTAs. Use a ring that belongs to the brand palette rather than the browser default removal pattern.
- Apply `text-wrap: balance` to the `h1`.

Recommended copy shape:

> Hand-knotted Moroccan rugs from a family that has worked this trade for 80 years.  
> Before payment is captured, you see the exact piece in multiple light conditions. Then it ships directly from Morocco.

### 2. Trust Badges

This section should become a verification rail, not a loud strip of all-caps logistics.

- Change the container to a semantic list.
- Drop full uppercase body copy. Keep the short label in title case or sentence case.
- Reduce the icon emphasis and let one proof point lead:
  - Exact-Piece Verification
  - Direct from Morocco
  - Free shipping to the US, Canada, and Australia
  - 14-day returns
- Visually compress it:
  - thinner vertical footprint
  - stronger separators
  - lower background contrast than the hero card
- Give the “Exact-Piece Verification” item a subtle accent so it bridges the hero and the third section.

### 3. First Merchandising Section

This is the biggest design opportunity.

- Rename the content model and UI language from `featured` to category-first merchandising or equivalent. The live section is not “featured”; it is the first shopping decision.
- Replace the five-equal-card grid with an asymmetric layout:
  - one large lead card for rugs
  - two medium cards for poufs and pillows
  - two compact supporting cards for decor and vintage
- Reduce decorative sameness:
  - fewer identical rounded rectangles
  - sharper contrast between lead card and supporting cards
  - one darker or sand-toned panel to break the cream rhythm
- Make the section intro more direct. “Choose the category first, then the exact piece.” is correct; the next line should explain why that path matters to this inventory model.
- Add `text-wrap: balance` to the `h2`, and ensure card titles can handle longer content without awkward wrap.

Recommended section framing:

> Choose the category first, then the exact piece.  
> Every listing is one inventory decision, not a repeatable SKU family. Start with the type of piece you need, then confirm the exact item.

## Implementation Priorities

1. Fix focus-visible states on hero CTAs and linked cards before anything else.
2. Replace `Inter` at the token level in [app/globals.css](/home/hp/loom-hearth-studio/app/globals.css:46).
3. Rework the trust section into a semantic list with calmer typography.
4. Redesign the third section layout away from five equal columns.
5. Add balanced heading wrapping and reduce background/section gradient repetition.

## What Not To Do

- Do not import the `webconsulting-branding` teal/cyan hero gradient into this page.
- Do not switch to Swiss or generic luxury minimalism.
- Do not keep adding more cream cards with the same radius, border, and shadow recipe.
- Do not solve the weak third section by only changing copy; the structure itself needs to change.
