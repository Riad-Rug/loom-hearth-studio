# Trade Page Implementation Plan

Source audit: [docs/trade-page-audit-2026-05-06.md](/home/hp/loom-hearth-studio/docs/trade-page-audit-2026-05-06.md)

## Objective

Rebuild `/trade` from a polished placeholder into a clear trade conversion page for interior designers, specifiers, and project buyers.

Success means:

- the page speaks in present-tense operational language
- the hero proves the offer visually and structurally
- the page no longer depends on the generic static-page layout grammar
- the CTA path is trade-specific
- accessibility and contrast issues are cleaned up

## Working Direction

- Design anchor: `Swiss`
- Why: the page needs stronger hierarchy, precision, and editorial credibility than the current soft static-page treatment
- Signature move: a right-side trade proof panel or facts rail in the hero

## Phase 1: Fix Trust, Hierarchy, and Accessibility

Goal: remove the “not finished yet” tone and clean up structural issues before deeper layout work.

### Tasks

1. Rewrite all roadmap-style copy in `app/trade/page.tsx`
   - remove “framework,” “will expand,” “drop into it later,” and similar language
   - rewrite all sections in present tense
   - replace vague claims with concrete trade-language promises

2. Tighten heading hierarchy in `app/trade/page.tsx`
   - keep section titles as `h2`
   - change workflow step titles from `h2` to `h3`

3. Fix contrast problems in shared tokens and page-specific usage
   - review `app/globals.css`
   - review `features/content-pages/content-pages.module.css`
   - improve contrast for:
     - terracotta text on white
     - cream text on terracotta buttons
     - muted olive text on pale backgrounds

### Deliverable

- trust-clean copy
- corrected semantic structure
- Lighthouse accessibility pass without current contrast failure

## Phase 2: Break the Trade Page Out of Generic Content-Page Styling

Goal: stop treating Trade like a standard informational page.

### Tasks

1. Create a dedicated Trade page stylesheet/module
   - new file target:
     - `features/trade/trade-page.module.css`
   - optionally create:
     - `features/trade/trade-page-view.tsx`

2. Move Trade-specific structure out of the shared content-page system
   - reduce dependence on:
     - `features/content-pages/content-pages.module.css`

3. Establish a dedicated layout grammar
   - stronger desktop grid
   - tighter vertical rhythm
   - fewer generic cards
   - more editorial structure

### Deliverable

- `/trade` has its own visual system while still using global brand tokens

## Phase 3: Rebuild the Hero as a Real Trade Conversion Surface

Goal: make the first screen prove the value of the trade program.

### Tasks

1. Redesign hero into a two-column layout
   - left:
     - headline
     - short operating promise
     - primary CTA
   - right:
     - trade proof panel or visual asset

2. Add a trade facts rail or proof block
   - response time
   - project hold support
   - shipping origin
   - categories covered
   - direct studio contact

3. Improve CTA strategy
   - one primary CTA:
     - `Start Trade Inquiry`
   - one secondary CTA:
     - `View Available Categories` or `See Trade Process`

### Asset plan

Preferred: use a real trade-support visual

Candidates:

- tear sheet preview
- sourcing board / finish board
- project deck imagery
- high-resolution rug detail collage

If no asset exists yet:

- build a structured proof panel in code first
- do not leave empty hero space

### Deliverable

- a hero that feels intentional on desktop, tablet, and mobile

## Phase 4: Add Proof and Utility Content

Goal: make the page useful to a trade buyer, not just persuasive.

### New sections

1. `What You Receive`
   - professional discount
   - project holds
   - high-resolution imagery
   - direct sourcing support

2. `Categories Available for Trade`
   - rugs
   - vintage rugs
   - poufs
   - pillows
   - decor

3. `How Project Holds Work`
   - when holds are possible
   - how long they last
   - what information the studio needs

4. `Trade FAQ`
   - who qualifies
   - how fast the studio replies
   - whether tear sheets are available
   - how one-of-one review works

### Deliverable

- the page answers the first operational questions before the user has to contact the studio

## Phase 5: Final UX and Responsive Pass

Goal: ensure the rebuilt page holds up across breakpoints and interaction modes.

### Tasks

1. Validate desktop, tablet, and mobile layouts in Chrome DevTools
2. Re-run Lighthouse snapshot
3. Check:
   - no horizontal overflow
   - clear focus states
   - accessible contrast
   - mobile CTA spacing
   - readable line lengths
   - no awkward dead space in the hero

### Deliverable

- production-ready trade page pass

## File Plan

### Files to update

- `app/trade/page.tsx`
- `app/globals.css`

### Files to reduce dependency on

- `features/content-pages/content-pages.module.css`

### Likely new files

- `features/trade/trade-page.module.css`
- `features/trade/trade-page-view.tsx`

## Recommended Order of Execution

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5

## First Implementation Slice

The best first coding slice is:

1. rewrite the copy in `app/trade/page.tsx`
2. fix heading hierarchy
3. create a dedicated Trade module
4. rebuild the hero before touching lower sections

Reason:

- that removes the highest-trust issues first
- it immediately changes the page from placeholder to deliberate
- it gives the rest of the page a stronger system to follow

## Definition of Done

The work is done when:

- the page no longer reads like an in-progress framework
- the hero contains proof, not empty space
- the layout no longer feels like a reused static page
- the CTA structure supports a trade workflow
- the page passes a fresh manual visual check and accessibility check
