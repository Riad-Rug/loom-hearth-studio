# Landing Page Shop-First Section Audit

Date: May 1, 2026

Scope: Homepage `SHOP FIRST` section only.

Inputs reviewed:
- Live section in Chrome DevTools at desktop width on `http://localhost:3000/`
- [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:141)
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:520)

Skill combination used:
- `frontend-design`: Organic anchor remains the correct base, but the section needs a stronger merchandising hierarchy.
- `frontend-design-pro`: the current card system is competent, but not yet premium or memorable enough for a hero-adjacent merchandising block.
- `web-design-guidelines`: scan order and emphasis are the main issues, not accessibility basics.
- `webconsulting-branding`: used as a constraint, not as a source of new palette direction.
- `web-artifacts-builder`: not directly applicable here because this is an existing section audit, not a standalone artifact build.

## Summary

The section is directionally correct: category-first merchandising is a better IA than a generic featured-products rail. The current implementation is still too even, too card-grid-driven, and too dependent on copy to communicate hierarchy. It reads like a competent content block, not like a decisive shopping entry point.

## What Is Working

- The section title is clear and commercially aligned: “Choose the category first, then the exact piece.”
- The first card is correctly given more visual weight than the others.
- Product categories are concrete and scannable.
- Live inventory appears immediately after the category cards, which supports the shop-first strategy.

## Findings

### 1. The layout still feels like a refined grid, not a merchandising composition

The section uses a larger lead card plus four smaller cards, but the overall read is still “five cards in a container.” The eye does not get a strong enough directional push from lead category to supporting categories to live inventory.

Why it matters:
- A shop-entry section should guide choice fast.
- Equalized card language makes the section feel editorial rather than transactional.

### 2. The card imagery is inconsistent in perspective and visual authority

Some cards use close textile detail, others use object shots, others use staged room or decor scenes. The section therefore mixes taxonomy, texture, and lifestyle framing in the same merchandising beat.

Why it matters:
- The user is deciding where to shop first.
- Mixed image logic makes the category system feel less disciplined than it should.

### 3. The compact cards are visually weaker than they should be

The lower-right cards currently feel like leftovers from the layout pattern rather than deliberate category choices. One dark compact card adds contrast, but not enough structural meaning.

Why it matters:
- Small cards should either signal secondary categories clearly or create a sharp visual counterpoint.
- Right now they mostly reduce clarity.

### 4. The section background is too close in tone to the hero family

The warm sand palette is on-brand, but this section still sits too close to the hero’s atmosphere. The result is visual continuity without enough separation.

Why it matters:
- The page needs stronger chaptering between “trust-building hero” and “start shopping.”
- This section should feel like the first practical decision point.

### 5. The live inventory intro is correct in content but too quiet in hierarchy

“Available now” and “Current one-of-one pieces with live pricing” are useful, but the transition from categories to inventory is not emphatic enough.

Why it matters:
- This is the moment the section should pivot from browsing logic to actual purchasable objects.
- The handoff currently feels appended, not staged.

## Recommendation

Keep the Organic anchor, but sharpen the section into a stronger merchandising system:

1. Treat the lead category as a true anchor panel.
   Give it more asymmetry, more image dominance, and a clearer CTA edge than the supporting cards.

2. Normalize image logic by category role.
   Use one consistent rule:
   - Rugs: texture or strong product-led crop
   - Poufs/Pillows: single-object product framing
   - Decor: tighter object grouping, not broad room scene
   - Vintage: patina-led product framing

3. Reduce the sense of “five equal modules.”
   The supporting cards should feel like a staggered selection system, not a symmetric card matrix.

4. Separate the live inventory rail more clearly.
   It should read as phase two:
   - Phase one: choose a category
   - Phase two: view available one-of-one pieces now

5. Increase contrast between this section and the hero.
   Keep the palette family, but shift the section to a slightly drier, more merchandising-oriented surface so the page turns a corner visually.

## Target Direction For Implementation

If implemented next, the section should aim for this:

- One dominant left lead category with a product-led crop and stronger CTA treatment
- Three supporting category cards with tighter, more uniform image logic
- One smaller accent category that feels intentional, not leftover
- A clearer visual threshold before the live product rail
- Less “content block,” more “merchandising decision surface”

## Priority

Priority: Medium-High

This section is already functional, but it is one of the main commercial routing points on the page. Improving it will likely raise clarity more than polishing later editorial sections.
