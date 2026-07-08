# Mobile Hero Audit

No application files were changed as part of this audit. The homepage mobile hero was reviewed using the `ui-ux-pro-max` accessibility, touch, responsive-layout, hierarchy, and performance criteria.

## Findings

### 1. High — Hero is excessively tall on mobile

At 390px wide, the layout contains:

- Sticky announcement and navigation
- 32px main top padding
- A long heading rendered at a minimum of 44.8px
- Body copy and two CTAs
- A 384px-tall image

The complete hero will substantially exceed one mobile viewport, while the product image is unlikely to appear above the fold. For an image-led artisan store, this weakens immediate product recognition.

Suggested fixes:

- Use a smaller mobile heading range around 36–40px.
- Reduce hero padding from 24px to 16–20px.
- Shorten the headline or body copy.
- Consider showing a compact hero image before the body and CTAs, or partially exposing it above the fold.

Evidence: `features/home/home-page.module.css:42`, `features/home/home-page.module.css:373`

### 2. High — CTA keyboard focus is effectively removed

The global stylesheet provides a visible focus outline, but the hero CTA rules later override it with `outline: none`. The replacement is only a subtle border or background change, especially weak on the secondary action.

This fails the skill's critical focus-state guidance and may fail WCAG 2.4.7/2.4.11 expectations.

Suggested fixes:

- Preserve the global focus outline.
- Alternatively, supply an explicit 2–3px high-contrast focus ring with sufficient offset.

Evidence: `features/home/home-page.module.css:85`, `app/globals.css:88`

### 3. Medium — Mobile content width is overly constrained

At a 320px viewport:

- The page removes 32px for outer margins.
- The hero removes another 48px for internal padding.
- Only about 240px remains for the headline and copy.

That forces an already large headline into many short lines, increasing height and reducing editorial polish.

Suggested fixes:

- At narrow widths, reduce outer margins or hero padding.
- Target approximately 280–300px of usable content width on a 320px screen.
- Test specifically at 320, 375, 390, and 430px.

### 4. Medium — Mobile typography is desktop-led

`clamp(2.8rem, 5vw, 4.5rem)` never reaches its fluid middle value on common phones; it remains locked at the 2.8rem minimum. This is effectively a fixed 44.8px mobile heading rather than responsive typography.

Suggested fixes:

- Define an explicit mobile heading size and introduce the larger clamp at tablet or desktop breakpoints.
- Keep the mobile line height around 1.02–1.08 for this serif face.

### 5. Medium — CTA copy ignores managed hero content

The component hardcodes “Shop rugs” and “Shop everything,” despite both labels and visibility being available in the content model. This can make the rendered mobile hero disagree with editorial or admin configuration.

Suggested fix:

- Render `primaryCta.label` and `secondaryCta.label`, and respect their `visible` flags.

Evidence: `features/home/home-page-view.tsx:56`, `features/home/home-page-data.ts:237`

### 6. Low — Image sizing slightly overstates the mobile display width

The image declares `sizes="100vw"` below 980px, but mobile margins and hero padding make its actual rendered width substantially less than the viewport. This can cause Next.js to select a larger image than necessary.

Suggested fixes:

- Describe the approximate rendered width in `sizes`.
- Alternatively, simplify mobile padding so the image genuinely approaches full width.

## What Is Already Working

- Both CTAs meet the 44px minimum touch height.
- The 12px CTA gap exceeds the recommended 8px separation.
- The CTA hierarchy is clear.
- Body and primary colors have strong contrast.
- The hero uses a semantic `section`, `h1`, links, and image alt text.
- `next/image`, `fill`, `object-fit: cover`, and `priority` are appropriate for the hero.
- The layout does not appear structurally prone to horizontal overflow.

## Priority Summary

The mobile hero is structurally sound, but its vertical density and missing visible focus treatment are the main issues. Fix the focus regression first, followed by tightening the mobile typography and spacing so the image contributes to the first-screen impression.
