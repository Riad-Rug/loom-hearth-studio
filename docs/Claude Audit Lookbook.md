# Lookbook Page Audit - loomandhearthstudio.com/lookbook

## What's Working Well

- **The photography is strong.** All four images are atmospheric, warm, and genuinely evocative of the sourcing context. The hallway shot and the sitting area are standout images.
- **Card structure is clean** - image above, title + description + shop link below, no clutter.
- **The H1 copy is excellent.** "Moroccan rugs and decor in real interiors." is specific, confident, and SEO-useful.
- **Subtitle is clear.** "Each scene links into the collection it came from" sets the right expectation.
- **The entire card is an `<a>` tag** - so clicking anywhere on the card (image, title, description) correctly navigates to the relevant collection. Good structural decision.
- **Closing CTA section** ("Start with the rugs.") provides a logical next step after browsing.

## Critical

### 1. Only 4 entries - the page is nearly empty

The lookbook ends after 4 entries and fewer than 3 scroll lengths. For a page listed in the primary navigation alongside SHOP and TRADE, this is strikingly thin. A visitor who lands here expecting editorial depth leaves immediately. 4 entries is a launch state, not a destination.

**Fix:** Aim for a minimum of 8-10 entries to make the lookbook feel like a genuine content section. Each new product or category addition is an opportunity for a new scene. Even 6 entries at 2 columns would feel meaningfully more substantial.

## UX Issues

### 2. No visual hover state on cards despite being clickable

The whole card is an `<a>` element with `cursor: pointer` - so it's fully clickable - but there is no visible hover feedback. No image scale, no overlay, no shadow change, no title underline. A visitor hovering over the card gets the pointer cursor but no visual confirmation that they're about to navigate somewhere. On touch devices there's no feedback at all.

**Fix:** Add a subtle hover state - either a slight image scale (`transform: scale(1.02)`) with `overflow: hidden` on the image container, or a soft dark overlay on the image, or an underline on the entry title. One of these is enough.

### 3. Both the card and the internal "Shop the rugs" link go to the same place

The full card wraps an `<a>` tag, and there's a "Shop the rugs" text link inside the card body - both navigating to the same category page. This creates a redundant nested link (invalid HTML - `<a>` inside `<a>`) and gives the user no additional option.

**Fix:** Either remove the internal "Shop the rugs" link and let the card handle the navigation, or restructure so the image links to one destination and the text link offers a secondary action (e.g., image -> scene detail page, link -> category shop).

### 4. The H1 and subtitle push the first images ~370px below the fold

The "LOOKBOOK" eyebrow + 64px H1 across two lines + subtitle paragraph = approximately 370px before the first image. On a 768px laptop, the user sees the headline and maybe the very top edge of the first images. The page doesn't feel like an image-forward editorial experience on load - it reads like a text page with images below.

**Fix:** Reduce the H1 to `44-48px` and tighten the eyebrow-to-heading gap. Or create a full-bleed hero image at the top of the lookbook (a single hero scene that sets the tone), which immediately makes the page feel visual. The text intro can sit below the hero.

### 5. Navigating via a card drops the user into a generic filtered shop with no context

Clicking "A Beni Ourain rug in a low-furnished living room" takes you to `/shop/rugs/beni-ourain` - a standard shop grid labelled "Beni Ourain Rugs, 19 pieces." There's no connection back to the lookbook scene, no "You arrived here from the lookbook" breadcrumb, no caption about why these rugs were chosen for the scene. The editorial thread is completely lost the moment you click.

**Fix:** Either (a) add a breadcrumb or contextual note on the destination page ("From the lookbook: Beni Ourain rug in a low-furnished living room"), or (b) create lightweight individual lookbook entry pages that show the scene image, the description, and the specific product(s) featured in that scene with links to buy them.

## Design & Copy Issues

### 6. One title uses Title Case, the rest use sentence case

Entry titles:
- "A Beni Ourain rug in a low-furnished living room." - sentence case, period
- **"Moroccan Hallway with Vintage Textiles"** - Title Case, no period
- "Layered rugs in a low Moroccan sitting room." - sentence case, period
- "A sitting area, restrained." - sentence case, period

**Fix:** Make all four sentence case with a closing period, matching the dominant style. "Moroccan hallway with vintage textiles."

### 7. The closing CTA "Browse vintage" is too specific

The final section reads: *"Start with the rugs. Browse all rugs / Browse vintage."* If someone spent time in the lookbook looking at a sitting area with decor pieces, "Browse vintage" is a random exit. The closing CTA should reflect the breadth of the collection.

**Fix:** Replace with "Browse all rugs" and "View all pieces" - or simply one CTA: "Shop the full collection"

### 8. Image heights are inconsistent between columns

Because scenes are photographed at different aspect ratios (a tall hallway vs. a wide floor-level sitting area), the two images within each row are different heights. This creates a staggered, misaligned grid - the right column's card ends at a different vertical position than the left column's.

**Fix:** Lock all lookbook image containers to a fixed aspect ratio (`16/9` or `4/3` with `object-fit: cover`). This enforces row alignment regardless of source photo dimensions.

### 9. No room type or scene category labels on cards

Each card has a descriptive title, but there are no scannable labels - no "Living Room," "Hallway," "Sitting Room" tags - that let a visitor quickly identify which scenes match their project. As the lookbook grows, browsing without labels becomes slow.

**Fix:** Add a small eyebrow label above each H2 indicating the room type: `LIVING ROOM`, `HALLWAY`, `SITTING AREA`. This lets visitors scan at a glance and makes the grid navigable as it scales.

### 10. "Each scene links into the collection it came from" is slightly inaccurate

The subtitle promises scene-specific collection links, but the actual destination is a broad category filter (all Beni Ourain rugs, not just the one in the scene). This raises expectation of curated specificity and delivers a generic shop page.

**Fix:** Either make the destinations more specific (link to the actual product if possible, or a scene-curated selection), or change the subtitle to: *"Each scene links to the category it came from."*

## Accessibility

| Element | Issue |
|---|---|
| Card `<a>` wrapping `<a>` ("Shop the rugs") | Nested anchors - invalid HTML, breaks keyboard navigation and screen readers |
| No `aria-label` on card links | Screen reader announces the full title + description as the link text - verbose but functional |
| Image alt text | Should describe the interior scene specifically, not just the rug type |

## Priority List

| # | Fix | Impact |
|---|---|---|
| 1 | Add more entries - target 8-10 minimum | Content depth |
| 2 | Add hover state on cards (image scale or overlay) | Discoverability |
| 3 | Remove nested `<a>` - fix the redundant "Shop the rugs" link | HTML validity |
| 4 | Reduce H1 to 44-48px or add a full-bleed hero image at top | Visual-first feel |
| 5 | Add breadcrumb/context on destination shop pages | Editorial continuity |
| 6 | Fix "Moroccan Hallway with Vintage Textiles" - sentence case | Consistency |
| 7 | Replace closing CTAs with "Shop the full collection" | Clarity |
| 8 | Lock image aspect ratio across all cards | Grid alignment |
| 9 | Add room-type eyebrow labels (`LIVING ROOM`, `HALLWAY`, etc.) | Scannability |
| 10 | Fix nested anchor accessibility issue | Accessibility |
