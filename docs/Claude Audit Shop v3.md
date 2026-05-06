# Shop Page Re-Audit (v3)

## What Was Fixed - Strong Progress

- **Filter bar is now a single compact row** - Search / Category / Price / Size / Sort all on one line. Products are visible above the fold on load. This was the right call entirely.
- **Zero-count categories hidden** - Pillows (0), Decor (0), Vintage (0) are gone. Clean.
- **Sidebar description shortened** - tighter, more readable.
- **Product names much less truncated** on rug cards in rows 2+ - "Natural Beni Ourain Rug," "Red Zemmour Rug," "Green Taznakht Rug" all display fully.

## Critical - New Bug Introduced

### 1. Alt text is rendering as visible body text inside every imageless card

This is the most urgent issue on the page right now. Every product without a photo is now displaying its full image alt text as visible paragraph text - rendered directly inside the card's image area. Examples visible on the current page:

> *"Moroccan hand-woven flatweave with deep ochre/orange ground and free-scatter field of isolated geometric motifs, leaf forms, H-ladder forms, checkerboard squares and arrow shapes, in amber, red, yellow and white, overhead view"*

> *"Beni Ourain deep-pile rug in natural ivory with near-black architectural charcoal grid dividing field into irregular rectangular sections, overhead view on wood-effect floor"*

This is happening because the `<img>` tags for these products point to images that don't yet exist (broken URLs). When a browser encounters a broken image, it renders the `alt` attribute value as inline text in place of the image. The alt text itself is excellent and detailed - it's exactly what it should be for SEO and accessibility - but it should **never be visible as body copy** to shoppers.

**Fix immediately:** Revert these cards to the clean `IMAGE COMING SOON` placeholder styling (grey background, short centred label). That was far less damaging than this. Longer term, don't publish an `<img>` tag pointing to a non-existent file - use a placeholder src like a 1x1 transparent pixel or a branded grey tile until the real photo is uploaded.

## Remaining Issues

### 1. First-row pouf names still truncate mid-dimension

The four poufs in row 1 still embed dimensions inside the product name and get cut off:

- `"Flatweave Wool Pouf Ivory, Red Stripe and Geometric 24" "` - the `x` with nothing after it is worse than no dimension at all
- `"Flatweave Wool Pouf Cream Stripe and Fuchsia Geometric 24" "` - same

Rug cards correctly show a separate dimension line (`55" x 55"`, `4'11" x 5'7"`). Apply the same treatment to poufs - strip the dimensions out of the product name and show them as a separate field below.

### 2. Filter bar: search box and dropdowns feel mismatched

The search input is a standard text field while the Category / Price / Size controls are styled pill-dropdowns. They sit on the same row but have different heights, border weights, and visual treatments. The toolbar reads as two separate components joined together rather than one unified control strip.

**Fix:** Give the search input the same border radius, border colour, and height as the dropdown pills. One visual language across the whole row.

### 3. "Sort: Featured" dropdown is visually separated from the filter controls

The sort dropdown sits at the far right of the filter row with no visual divider between it and the Size filter. "Sort" and "Filter" are conceptually different operations - sort reorders, filters narrow. Mixing them on the same row without a separator is a minor but real UX confusion.

**Fix:** Add a thin vertical rule (`1px` in light taupe) between the Size filter and the Sort dropdown, or right-align the sort control with a small gap to signal the distinction.

### 4. Sidebar "IN THIS COLLECTION" section is still at the bottom

The bullet-point content (hand-knotted rugs, rug-made poufs, every rug is one of one) reappears at the bottom of the sidebar. This was the content previously flagged as buried. As the user scrolls, this section comes into view in the sidebar and competes with the category links for attention.

**Fix:** Either remove this section entirely (the sidebar description above it already covers the same ground) or move it above the CATEGORIES section so it's visible on page load.

### 5. "Flatweave Interlocking Triangle Composition in Burgundy," - trailing comma

This product name ends with a comma, suggesting the original name was longer and got truncated at a character limit rather than a word boundary. The comma is visible in the card.

**Fix:** Review the source product title and either complete the name or remove the trailing punctuation.

## Design Observations

### 6. Product card image aspect ratio still varies

Poufs photographed upright create tall images. Rugs photographed overhead create square or wide images. Without a locked aspect ratio, the image containers collapse to different heights, creating an uneven grid.

**Fix:** Lock image containers to `aspect-ratio: 4/3` with `object-fit: cover`. Uniform row heights regardless of photo orientation.

### 7. The "1 OF 1 AVAILABLE NOW" badge still dominates

The heavy dark pill overlaying every product image is the most visually prominent element on the card - more prominent than the photo itself. For products with real images, the badge obscures part of the rug. The scarcity message is valuable; the visual weight is excessive.

**Fix:** Reduce badge font to `11px`, switch background to `rgba(0,0,0,0.5)` (semi-transparent rather than solid charcoal), and position it at the bottom edge of the image rather than the top-left. The message lands just as clearly at lower visual weight.

### 8. The sidebar card wrapper ("The Full Collection" box) still has equal visual weight to the filter controls

Both the left sidebar card and the right filter toolbar have the same rounded beige card treatment. From a visual hierarchy standpoint they look like two peers, when the product grid should be the dominant element and both sidebars/filters should be supporting elements.

## Priority List

| # | Fix | Urgency |
|---|---|---|
| 1 | **Fix alt text rendering as visible text** - revert to `IMAGE COMING SOON` placeholder immediately | Now |
| 2 | **Strip dimensions out of pouf names** - show as separate line same as rugs | High |
| 3 | **Match search input styling** to filter dropdown pills | Medium |
| 4 | **Add separator** between Size filter and Sort dropdown | Medium |
| 5 | **Remove or relocate "IN THIS COLLECTION"** sidebar section | Low |
| 6 | **Lock image aspect ratio** (`4/3` with `object-fit: cover`) | Low |
| 7 | **Lighten "1 OF 1 AVAILABLE NOW" badge** - smaller, semi-transparent, bottom-edge | Low |
| 8 | Fix trailing comma on "Flatweave Interlocking Triangle Composition in Burgundy," | Low |
