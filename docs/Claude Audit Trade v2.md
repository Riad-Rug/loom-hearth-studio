# Trade Page - Re-Audit (v2)

## Fix Immediately (Live Bugs)

### 1. Placeholder text is live and visible to visitors
The testimonials section eyebrow reads **"TEMPORARY TRADE PROOF"** and the heading reads in large bold type: **"Existing customer feedback, reused here until trade-specific quotes are ready."**

This is an internal working note. Every designer who visits this page reads it. It tells them the testimonials aren't real trade endorsements and that the page is unfinished. Remove or replace both the eyebrow and the heading immediately - the reviews themselves are good, just retitle it something clean like "What customers say" or simply remove the section heading entirely and let the quotes stand alone.

### 2. "STEP 5" in the workflow (should be Step 3)
The third workflow card still shows **STEP 5** in the eyebrow. The HTML has it correct (Step 3) but the rendered label shows 5. This is likely a CSS counter or a CMS data entry error. Fix the display value.

### 3. Sticky bar text is truncated
**"CONTACT THE ST..."** is cut off in the sticky bottom bar at all viewport sizes tested. The button text "Contact the Studio" doesn't fit alongside "START A TRADE INQUIRY" and "TOP." Also, both buttons go to essentially the same place - having two similar CTAs side-by-side creates choice paralysis. Pick one primary action for the sticky bar.

### 4. Excessive blank gap before the closing CTA
There's roughly **300-400px of empty white space** between the FAQ card and the "Bring the project details..." closing CTA. The footer and closing section exist - they're just buried under a huge margin. Halve whatever bottom margin or padding the FAQ section has.

## What Was Fixed Since Last Audit

- Trade discount is now stated (10%)
- Hold duration specified (3 business days)
- Eligibility criteria added
- Eyebrow cleaned up to "Interior Design Trade Program"
- "See the sourcing review path" link now has directional arrow
- Sticky CTA bar added
- Testimonials section added
- FAQ section added - excellent questions, clear answers
- Closing CTA section ("Bring the project details") added
- Rug imagery added via the light comparison widget
- "Why Designers Use It" 3-column feature section added

## The "Block" Problem - Root Cause Diagnosis

You're right that the page still feels like a series of containers stacked on top of each other. Here's exactly why:

**Every single section uses the same visual recipe:** rounded corners + beige or white fill + same horizontal padding + same gap between cards. When every element has the same shape, weight, and spacing, the eye has nothing to anchor to - it all reads as undifferentiated.

Premium editorial design (think RH, 1stDibs, Restoration Hardware trade pages) achieves its feel through **contrast of mass** - alternating between contained and open, narrow and wide, light and dark. Right now your page has none of that contrast. Here's what to do section-by-section:

### Fix 1 - Remove rounded cards from at least 3 sections
The rounded corner applied to every section is the single biggest driver of the "block" feeling. Instead:

- **"What Trade Includes"** (the beige section with the 5 use-cases): Remove the card wrapper entirely. Let the warm beige color span edge-to-edge as a full-width band. No border radius. This one change immediately breaks the container grid.
- **"Why Designers Use It"** (3-column features): Same - remove the outer card, use a flat white band. The 3 columns will feel like a layout, not a card.
- **Trade FAQ**: Let it sit directly on the page background (white) with no card at all. Just the eyebrow, heading, and Q&A pairs with thin divider lines between them - it reads as editorial, not boxed.

### Fix 2 - Make the closing CTA section rich and dark
The "Bring the project details and the studio will take it from there" section is the emotional close of the page, but it's sitting in the same light rounded card as everything else. Give it a **dark charcoal or deep warm brown full-bleed background** (edge-to-edge, no border radius), white text. It will feel like a landing, not another block.

### Fix 3 - Pull the rug image out of the card
The light comparison widget (Natural / Warm / Cool) is interesting but it's nested inside the hero card. This should be treated as a **standalone visual moment** - either pull it to a full-width strip between two sections, or let it sit flush with one edge of the layout. Right now it looks like a widget inside a card, which it is.

### Fix 4 - Vary the section widths
Every section currently fills the same ~1100px content width. Add a **narrow-centred quote or stat callout** between two sections - something like "10% off. Direct contact. 3-day holds." set in large type, centred, 600px wide on a white background. It creates a moment of visual pause and makes the surrounding sections feel more distinct.

### Fix 5 - Stagger the testimonials
Three identical-sized white cards on a beige background is the most "block" section on the page (beyond the placeholder heading issue). Options:

- Make one quote larger / featured, the other two smaller
- Use a horizontal scrolling ticker or a single featured quote layout
- Or drop to one well-chosen, generous-sized quote with the reviewer's name in a larger style - one great quote beats three mediocre-sized ones visually

### Fix 6 - Add typographic section breaks
Between sections that currently have just whitespace as a separator, consider a thin horizontal rule (`1px` in warm taupe) or a centred decorative ligature from your brand mark. This tells the eye "section ended" without needing a new card container.

## Spacing Issues

| Location | Problem |
|---|---|
| Hero left column | Large blank gap below CTAs before the bottom of the card |
| FAQ - Closing CTA | ~350px of empty white space |
| Right column in 2-column sections | Text clips at viewport edge during scroll |

## Priority Order

| # | Fix |
|---|---|
| 1 | Remove "TEMPORARY TRADE PROOF" + placeholder heading - live right now |
| 2 | Fix "STEP 5" - Step 3 |
| 3 | Fix sticky bar truncation + consolidate to one CTA |
| 4 | Fix blank gap before footer |
| 5 | Remove card borders from "What Trade Includes", "Why Designers Use It", FAQ - go full-bleed |
| 6 | Give the closing CTA a dark/rich background |
| 7 | Stagger or redesign the testimonials layout |
| 8 | Pull rug image out of the card into its own strip |
| 9 | Add a narrow centred break section between blocks |
| 10 | Fix right-column overflow/clipping |
