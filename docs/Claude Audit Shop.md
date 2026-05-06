# Shop Page UI/UX Audit - loomandhearthstudio.com/shop

> Implementation note: when executing fixes from this audit, do not block the rollout on missing product photography. The live product images will be added later. Structural, UX, accessibility, and merchandising fixes should proceed independently of image-asset completion.

## Critical - Fix Before Anything Else

### 1. The majority of visible products have no images
Of the 15 products loaded by default, **10 show a gray "IMAGE COMING SOON" placeholder**. Only the 5 poufs in row one have real photography. Every row below has all-placeholder cards. This is the primary discovery page for your entire store - a visitor who lands here sees a broken shop, not a curated collection. This is the single most damaging issue on the site right now and needs to be resolved before anything else.

**Fix:** Don't list a product publicly until it has at least one image. Hide placeholder products from the default shop view, or move them to a "coming soon" section that's clearly separated from purchasable inventory.

### 2. Product names are truncated mid-dimension
Multiple names are being cut off at the worst possible point:
- `"Flatweave Wool Pouf Ivory, Red Stripe and Geometric 24" "` - the second dimension is cut
- `"Flatweave Wool Pouf Red Geometric and Striped 24"  24" "` - height is missing
- `"Flatweave Interlocking Triangle Composition in Burgundy,"` - trailing comma, truncated

A shopper reading `24"` learns nothing useful. The card either needs to be wider, the name shorter, or the dimensions displayed as a separate field below the name rather than embedded in it.

**Fix:** Split product names into a display name + a dimensions field. Show name at 2 lines max-clamped, then dimensions as a separate `14px` line below. This also makes scanning far faster.

### 3. Stray "Top" text link floating in the grid
There is a plain, unstyled text link reading **"Top"** sitting in the white space between the product grid and the trade CTA section. It anchors to `#shop-top` and is visually indistinguishable from body text - clearly a development leftover.

**Fix:** Remove it. The existing "TOP" button in the bottom-right corner already handles this.

## Conversion / UX Problems

### 4. "IN STUDIO" badge is completely unexplained
Four of the first five products (all poufs) carry a badge labelled **"IN STUDIO"**. There's no tooltip, no legend, no glossary anywhere on the page. Possibilities a shopper might guess: the item is physically in a studio showroom, it's been photographed in-studio, it's not yet shipped, it's only available for trade, it's reserved. None of these are correct guesses that would make someone more likely to buy.

**Fix:** Either remove this badge if it carries no buyer-relevant meaning, or replace it with something self-explanatory like "Available now" / "Ships from Morocco" / "In stock". If it means something specific, add a hover tooltip.

### 5. Five-column grid makes cards far too narrow
At a 1440px viewport, five columns yields cards of roughly **165px wide**. These rugs and poufs are intricate handcrafted pieces - the texture, pattern, and colour detail that justifies $500+ pricing is invisible at that width. You are actively undermining your product photography by cramming five items per row.

**Fix:** Switch to **4 columns** as the default. This gives each card ~210px (or wider without the sidebar), enough to see pattern and colour properly. Reserve 5 columns for a compact view the user could opt into.

### 6. No price filter, no size filter
With 52 products spanning $215-$880+, the only browsing tools are four category chips (HANDWOVEN, ONE OF ONE, DECOR, FRESH ARRIVALS) and a category sidebar. A designer shopping for a 6x9 rug under $600 cannot narrow down quickly.

**Fix:** Add a price range slider and a size filter (Small / Medium / Large, or specific dimensions). These are the two highest-intent filters for rug buyers.

### 7. "BROWSE ALL 52 PIECES" button is redundant
The visitor is already on the shop page looking at all 52 pieces. This button appears to do nothing the page doesn't already do, which wastes sidebar space and creates confusion.

**Fix:** Replace it with "Clear all filters" (only shown when a filter is active) or remove it entirely.

### 8. No search within the collection
52 products today, but this will grow. There's no way to search by rug name, style, colour, or material. A designer who saw a specific piece in the lookbook and wants to find it quickly has no path to do so.

**Fix:** Add a small search input at the top of the product area, above the filter chips.

### 9. "Showing 15 of 52 pieces" reveals 37 hidden products - most with no images
The pagination means a user only sees 15 products before having to click "SHOW MORE PIECES". Since 10 of those 15 have no images, the effective visible inventory is **5 purchasable products**. This should feel like a thriving collection of 52 pieces.

**Fix:** Resolve the image issue (fix #1 above) and consider whether 15 is the right initial load count, or if 20-24 makes more sense to fill the viewport properly.

### 10. Inconsistent "1 OF 1 AVAILABLE NOW" badge placement
The first rug shows this badge on the product image. The poufs with real photos in row 1 do **not** show it on their images. The placeholder cards in rows 2-3 all show the badge on the gray placeholder. The badge appears and disappears inconsistently - it's not a reliable signal.

**Fix:** Apply the badge consistently to every product image, or remove it entirely from the image and move the scarcity signal to the card's text area below the photo.

## Visual Design

### 11. The sort dropdown is a raw HTML `<select>`
The filter chips are custom-styled rounded pills. The sort control next to them is a plain browser-default dropdown - inconsistent styling that looks like a different product was spliced in. On most browsers it looks noticeably out of place against the refined aesthetic.

**Fix:** Replace with a styled custom dropdown that matches the filter pill aesthetic.

### 12. Category sidebar copy talks about itself
The "CATEGORIES" section opens with: *"Keep the collection rail in view while you scan the product wall."* This is meta-commentary about the UI, not useful browsing information. The sidebar is self-evident - it doesn't need to explain what it is.

**Fix:** Remove this sentence. Replace with category links that each show a product count: `Rugs (18)`, `Poufs (12)`, `Pillows (8)`, etc. Counts are far more useful than instructions.

### 13. "IN THIS COLLECTION" bullet section buried at the bottom of the sidebar
The three bullet points (hand-knotted rugs, one-of-one pieces, filter by category) appear at the very bottom of the left sidebar, well below the fold. Almost no one scrolls a sidebar to read editorial copy. It's wasted space in its current position.

**Fix:** Move the one most trust-building fact ("Every rug is one of one - sold pieces are not restocked") into the collection header above the product grid, where it gets read.

### 14. "FULL STUDIO EDIT" label next to piece count is unexplained
`52 PIECES - FULL STUDIO EDIT` - what is a "Full Studio Edit"? This looks like an editorial designation but has no explanation and doesn't appear to link anywhere.

**Fix:** Either remove it or turn it into a short anchor that links to a brief explanation of the curation process.

### 15. Price displayed in terracotta makes it look like a label
The terracotta colour (`$560.00`) is the same brand accent used for eyebrows and decorative labels throughout the site. Prices in this colour read like category tags, not prices. Most premium e-commerce keeps prices in dark neutral text so they scan as data, not decoration.

**Fix:** Switch product card prices to `#2f2f2f` (the body text colour). Reserve the terracotta accent for CTA elements and decorative labels only.

## Accessibility

| Issue | Detail |
|---|---|
| Category label text (MOROCCAN RUGS, POUFS) | Renders at **10.4px** - below the WCAG minimum |
| Filter chips are `<span>` elements | No `role=\"button\"`, not keyboard-navigable, invisible to screen readers |
| "IMAGE COMING SOON" placeholders | No `alt` text context for screen readers |
| Product images | Need descriptive alt text (not just product name - include colour, pattern, size) |

## What's Working Well

- **Left sidebar layout** is a strong structural choice - keeping the collection info persistent while the product grid scrolls is good UX for a curated, one-of-one store
- **"Working on a Client Project?"** trade CTA at the bottom of the shop page is well placed and well written
- **Filter chip design** (the pills themselves) is visually clean and on-brand
- **The rug images that exist** are excellent quality - warm, textural, real
- **"ONE OF ONE" badge** communicates scarcity clearly and authentically

## Priority Fix List

| # | Fix | Impact |
|---|---|---|
| 1 | Upload photos for all 15 initial products - or hide imageless products | Conversion-critical |
| 2 | Fix truncated product names - separate name from dimensions | Clarity-critical |
| 3 | Remove stray "Top" text link | Polish |
| 4 | Explain or replace "IN STUDIO" badge | Trust |
| 5 | Reduce to 4-column grid | Legibility |
| 6 | Add price range + size filters | Discovery |
| 7 | Remove/repurpose "BROWSE ALL 52 PIECES" button | Clarity |
| 8 | Style the sort dropdown to match filter chips | Visual consistency |
| 9 | Remove sidebar "Keep the collection rail in view" copy; add item counts | UX |
| 10 | Make price colour dark neutral, not terracotta | Readability |
| 11 | Add `role=\"button\"` to filter chips, fix 10.4px category label size | Accessibility |
