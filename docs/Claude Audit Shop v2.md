# Shop Page Re-Audit (v2)

## What Was Fixed Since Last Audit

These are all genuine improvements - well done:

- "IN STUDIO" replaced with the clear **"AVAILABLE NOW"** - no more mystery badge
- **Dimensions** are now a dedicated line below the product name (`55" x 55"`, `4'11" x 5'7"`) - major clarity win
- **Price is now dark neutral** - reads as data, not a decorative label
- **Search box added** with useful placeholder: "Search by name, size, or material"
- **Price filters** added (Under $500 / $500-$600 / $600+)
- **Size filters** added (Small / Medium / Large)
- **Category counts** now shown (Rugs (48), Poufs (4))
- **4-column grid** - products are much more visible at this width
- The stray "Top" text link is gone
- "BROWSE ALL 52 PIECES" redundant button removed

## Your Instinct Is Correct - The Filter Section Is the Biggest Problem

The filter groups container measures **227px tall** on its own. Combined with the product count row, search input label, sort control, and card padding, the entire filter zone occupies approximately **350px** before the first product image appears. On a standard 1080p monitor, a visitor lands on the shop page and sees: header -> sidebar -> a wall of filter controls -> then finally one row of products peeking at the very bottom.

**The fix:** Collapse all three filter rows into a single compact horizontal toolbar. Replace the stacked pill groups with lightweight dropdowns:

```text
[ Search by name, size, or material          ] [Category v] [Price v] [Size v]  Sort: Featured v
```

One row. ~52px tall. This is how 1stDibs, RH, and Net-a-Porter handle dense filter sets - the options are still all there, just triggered on click rather than always visible. You go from 350px of filter UI to 52px, recovering **nearly 300px** - that's two full extra rows of products visible on load.

The "SHOP BY" label, "PRICE" label, and "SIZE" label above each row are also unnecessary overhead - the dropdown button label does that job. Removing them alone saves ~45px.

## Remaining Issues

### 1. 15 products still show "IMAGE COMING SOON"

Acknowledged as a work-in-progress - but the current layout now exposes this more harshly because the 4-column grid means placeholder cards are more prominent (each is wider). Once photos are ready, the shop will look dramatically different. If there's a way to sort imaged products to the top by default, that would help in the interim.

### 2. Three dead categories in the sidebar

**Pillows (0)**, **Decor (0)**, and **Vintage (0)** are all clickable links that lead to empty states. Clicking "Pillows (0)" as a shopper is a confusing dead end.

**Fix:** Hide categories with a zero count entirely. Show them only when inventory exists.

### 3. Product names still truncate mid-sentence

Despite the dimension split, the display names themselves are still being cut:

- `"Flatweave Wool Pouf Ivory, Red Stripe and Geometric 2"` - what's the "2"?
- `"Flatweave Interlocking Triangle Composition in"` - in what?
- `"High Atlas Flatweave Plain Banded Face and Pile-"` - Pile-what?

The truncation limit is too tight relative to the card width. Allowing 3 lines instead of 2 (or slightly reducing the font size to `15px` from `16.96px`) would let most names complete without cutting.

### 4. "Pillows (0)" / "Decor (0)" / "Vintage (0)" should not appear

Same issue as #2 - these make the collection look sparse before a visitor has even engaged with it. The sidebar should only surface categories with inventory.

### 5. The sidebar collection card is disproportionately large

"The Full Collection" heading is `32px` bold, and the paragraph below it runs four lines. For a sidebar element, this is very heavy - it draws more visual attention than the products themselves. The sidebar's job is to orient and filter, not to be a feature section.

**Fix:** Reduce the heading to `20-22px`. Tighten the description to one sentence: *"Handcrafted rugs, poufs, and decor from Marrakech. One of one - sold pieces are not restocked."* Save the longer copy for a collection landing page or the About section.

### 6. The sort control and "52 pieces" are in different visual zones

The piece count (`52 pieces`) and the trust line (`Every rug is one of one. Sold pieces are not restocked.`) live inside the filter card, while the sort dropdown lives at the top right of that same card. Once you collapse the filters to a single row (fix above), place the sort control on the same line as the piece count: `52 pieces - Every rug is one of one.` on the left, `Sort: Featured v` on the right. Clean, compact, one row.

## Design & Premium Feel

### 7. The filter card's rounded border makes the shop feel "containerised"

The search + filters live inside a rounded beige card - the same visual pattern discussed on the trade page. This has the effect of making the filters feel like a widget on a dashboard rather than part of an editorial shop experience. Consider removing the card wrapper entirely and letting the filter toolbar sit as a clean borderless row directly on the page background.

### 8. Product cards have uneven image heights

Because images are uploaded at different aspect ratios (flat rugs vs. poufs photographed upright vs. rugs photographed overhead), the card images have inconsistent heights. This creates a ragged grid that undermines the premium aesthetic.

**Fix:** Set a fixed aspect ratio on all product card images (`aspect-ratio: 4/3` or `aspect-ratio: 1/1`) with `object-fit: cover`. This locks the grid to a uniform row height regardless of how the photo was taken.

### 9. "1 OF 1 AVAILABLE NOW" badge is heavier than the product name

The dark charcoal pill badge on each product image is visually dominant - it's often the first thing the eye lands on, more than the rug itself. For a shop where scarcity is a selling point, the message is right, but the treatment overshadows the product.

**Fix:** Lighten the badge to a semi-transparent dark overlay (`rgba(0,0,0,0.55)`) with `12px` text, or move the "1 of 1" message out of the image entirely and into the card text area as a small label. Let the photograph lead.

## Priority List

| # | Fix | Impact |
|---|---|---|
| 1 | **Collapse filter rows into a single horizontal dropdown toolbar** - cuts 300px of wasted space | Critical |
| 2 | **Hide zero-count categories** (Pillows, Decor, Vintage) | Clarity |
| 3 | Allow 3-line product name display or reduce font size slightly to reduce truncation | Readability |
| 4 | Reduce sidebar heading size + shorten description paragraph | Proportion |
| 5 | Set fixed aspect ratio on all product card images for grid uniformity | Premium feel |
| 6 | Lighten "1 OF 1 AVAILABLE NOW" badge weight / move out of image | Visual hierarchy |
| 7 | Remove filter card's rounded border wrapper - let filters sit as a clean toolbar | Polish |
