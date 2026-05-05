# Haytham Weekly Review - Implementation Plan

## Purpose

Translate the May 2 review notes into a practical implementation sequence for the current Loom & Hearth Studio storefront.

This plan is based on:

- Source review of the current Next.js codebase
- Live audit in Chrome DevTools on:
  - `https://www.loomandhearthstudio.com/shop`
  - `https://www.loomandhearthstudio.com/shop/poufs/flatweave-wool-pouf-ivory-red-stripe-geometric`
  - local contact page rendering
- Guidance from:
  - `frontend-design`
  - `frontend-design-pro`
  - `ui-ux-pro-max`
  - `web-design-guidelines`
  - `webconsulting-branding` (used selectively for discipline around tokens/accessibility, not as a literal rebrand)

## Design Direction

### Chosen Direction

Use a **Swiss / editorial commerce** direction for the shop and PDP refresh.

Reason:

- The review asks for denser product browsing, stronger hierarchy, clearer navigation, and more purposeful components.
- The current site already has strong product imagery and long-form product naming; a cleaner editorial system will improve scanability without flattening the brand into generic luxury ecommerce.
- This is a better fit than a maximal or effect-heavy treatment because the main UX problem is structure, not lack of decoration.

### Signature Move

Turn the shop into an **editorial browse wall**:

- persistent left rail for categories
- denser 5-column desktop grid
- product metadata hidden by default and revealed as a controlled lower-card overlay on hover/focus

### Constraints

- Do **not** rebuild the whole app into a standalone artifact. `web-artifacts-builder` is not the right implementation path here because this is already a real Next.js app, not a new single-file artifact.
- Do **not** attempt a full Tailwind migration in one pass. The repo is currently CSS Modules based. Tailwind + Headless UI should be introduced selectively for reusable primitives if we decide the migration is worth it.

## Current-State Findings

### 1. Header / Navigation

Current implementation:

- Header is in:
  - `components/layout/site-header.tsx`
  - `components/layout/site-header-client.tsx`
- Navigation is custom, not Headless UI.
- Desktop dropdown behavior is click-based and relatively minimal.

Implications:

- The nav can be improved without rewriting the whole shell.
- If Tailwind + Headless UI is required, the best scope is the shared navigation primitives first, not the full storefront.

### 2. Shop Page

Current implementation:

- Main view:
  - `features/catalog/catalog-page-view.tsx`
  - `features/catalog/catalog-page.module.css`
  - `features/catalog/product-card.tsx`
- Current desktop grid is `repeat(3, minmax(0, 1fr))`.
- The collection intro and category rail are placed **below** the main product grid.
- Category rail is not sticky.
- No back-to-top control exists.
- Product descriptions are always visible.
- Product cards already support secondary-image reveal on hover.
- Live audit confirms the shop currently shows **52 items** and renders **3 cards per row** on desktop.

Implications:

- The shop needs structural reordering first, not just visual cleanup.
- Hover image swap already exists on the listing page, so that part should be preserved and sharpened.
- The biggest shop win is changing browse density and moving navigation/filtering into a persistent side rail.

### 3. PDP

Current implementation:

- PDP is in:
  - `features/pdp/product-detail-page-view.tsx`
  - `features/pdp/product-detail-page.module.css`
- Gallery thumbnail selection is click-based.
- Recommendation block is `product.similarRugs`.
- Similarity logic currently uses product/category/style/origin/material overlap in:
  - `lib/catalog/service.ts`

Implications:

- Hover-to-preview can be added without changing the gallery model.
- Recommendation logic is currently product-based, but not customer-history-based.

### 4. Contact Page

Current implementation:

- View:
  - `features/content-pages/contact-page-view.tsx`
  - `features/content-pages/content-pages.module.css`
- Submission action:
  - `app/contact/actions.ts`
- Current form includes:
  - inquiry type
  - name
  - email
  - optional studio name for trade
  - message
- It does **not** include an order number field.
- Success state currently shows links to `/lookbook` and `/shop`, not visual product recommendations.
- Contact hours are currently hardcoded as `Mon-Fri, 9am-6pm CET` in `features/content-pages/content-pages-data.ts`.
- WhatsApp CTA has no brand icon.

Implications:

- Order-help UX needs real branching.
- The post-submit state is a missed conversion opportunity.
- Local-time business hours need explicit timezone logic or at minimum corrected copy.

## Proposed Delivery Phases

## Phase 1 - High-Impact UX Fixes

Goal: fix the browsing and support flows that most directly affect conversion.

### 1. Rebuild Shop Information Hierarchy

Changes:

- Move the category rail to a persistent left sidebar on desktop.
- Keep it visible while scrolling with sticky positioning.
- Keep the product grid on the right as the primary browsing surface.
- Move collection intro content above or alongside the grid instead of after the entire product list.
- Turn the `52 pieces` count into a purposeful collection status block.

Files:

- `features/catalog/catalog-page-view.tsx`
- `features/catalog/catalog-page.module.css`

Acceptance criteria:

- On desktop, categories are always visible while browsing products.
- Users do not need to scroll past the entire grid to find collection context.
- The shop reads as a navigable collection page, not a long undifferentiated list.

### 2. Increase Desktop Product Density

Changes:

- Increase desktop grid from 3 columns to at least 5 columns where viewport width allows it.
- Reduce product-card text footprint.
- Remove always-visible description from the default card state.
- Show extra detail in a bottom overlay on hover/focus.

Files:

- `features/catalog/product-card.tsx`
- `features/catalog/catalog-page.module.css`

Acceptance criteria:

- Desktop shop fits 5 cards per row at wide breakpoints.
- Card text remains readable and aligned.
- Hover/focus states still work for keyboard users, not hover only.

### 3. Add Back-to-Top Control

Changes:

- Add a floating back-to-top button on the right edge or lower-right corner.
- Only reveal it after the user has scrolled down enough.
- Respect reduced motion.

Files:

- likely `features/catalog/catalog-page-view.tsx`
- likely `features/catalog/catalog-page.module.css`

Acceptance criteria:

- Button appears only after scroll threshold.
- Keyboard focus and accessible label are present.
- Motion is minimal and non-disruptive.

### 4. Make the "52 Pieces" Area Actionable

Changes:

- Convert the current count/header area into a real collection control surface.
- Options:
  - anchor-scroll to the product grid
  - open filters/categories
  - link to a curated collection explanation

Recommendation:

- Use it as a top-of-grid collection summary with a CTA such as `Browse All 52 Pieces`.

Files:

- `features/catalog/catalog-page-view.tsx`
- `features/catalog/catalog-page.module.css`

## Phase 2 - Contact Flow Upgrade

Goal: reduce friction for support and make the form convert better after submission.

### 5. Add Order-Help Branching + Order Number Field

Changes:

- When `Order help` is selected, reveal:
  - order number field
  - optional issue type if needed later
- Include order number in validation and in the contact email payload.

Files:

- `features/content-pages/contact-page-view.tsx`
- `app/contact/actions.ts`

Acceptance criteria:

- Order-help requests have a dedicated order number field.
- Field is sent in the admin notification email.
- Validation messaging is specific and inline.

### 6. Improve Form Validation Clarity

Changes:

- Make required asterisks visible.
- Make helper/error text consistently red where requested for required/error guidance.
- Ensure error text sits directly below the relevant field.
- Focus the first invalid field on submit.
- Confirm the name-to-email interaction bug and fix it at the input/focus/state level.

Files:

- `features/content-pages/contact-page-view.tsx`
- `features/content-pages/content-pages.module.css`

Acceptance criteria:

- Required fields are visually obvious.
- Inline errors are visible and consistent.
- No focus bug when moving from name to email.

### 7. Improve Contact Meta Panel

Changes:

- Add WhatsApp logo/icon to the CTA.
- Replace hardcoded CET copy with local-time-aware wording.

Recommendation:

- Prefer explicit wording such as `Marrakech local time` unless there is a real timezone-driven rendering requirement.

Files:

- `features/content-pages/contact-page-view.tsx`
- `features/content-pages/content-pages-data.ts`
- `features/content-pages/content-pages.module.css`

Acceptance criteria:

- WhatsApp CTA uses a real icon, not text only.
- Hours no longer mention CET if that is not the true service window reference.

### 8. Replace Success Links with Product Merchandising

Changes:

- After successful form submission, render actual product cards instead of only text links.
- Start with category-aware recommendations:
  - if inquiry came from a product, show nearby products from same category/style
  - otherwise show featured products

Files:

- `features/content-pages/contact-page-view.tsx`
- likely `lib/catalog/service.ts`

Acceptance criteria:

- Success state includes visible shoppable products.
- Recommendations are relevant to the inquiry context when available.

## Phase 3 - PDP Browsing Improvements

Goal: make PDP image browsing and recommendations feel faster and more intentional.

### 9. Hover-to-Preview Gallery

Changes:

- Change thumbnail interaction so hover previews the image on desktop.
- Keep click as the persistent/mobile-safe fallback.

Files:

- `features/pdp/product-detail-page-view.tsx`
- `features/pdp/product-detail-page.module.css`

Acceptance criteria:

- Desktop thumbnails preview on hover.
- Keyboard focus still previews/activates accessibly.
- Touch devices remain click/tap based.

### 10. Tighten Recommendation Logic

Current state:

- Similar products are already scored by category/style/origin/material overlap.

Next step:

- Keep current logic as baseline.
- Extend in stages:
  - category + style similarity
  - product co-view / co-inquiry
  - authenticated customer browsing history

Files:

- `lib/catalog/service.ts`
- possibly account/session analytics plumbing later

Acceptance criteria:

- Recommendation logic is explicit and testable.
- Customer-history-based recommendations are treated as a later data feature, not a same-pass UI tweak.

## Phase 4 - Navigation System Cleanup

Goal: improve the perceived quality of the shell without derailing feature work.

### 11. Upgrade Navigation Components

Changes:

- Improve desktop nav spacing, active-state visibility, and dropdown behavior.
- Improve mobile nav structure and hierarchy.
- If desired, migrate nav primitives to Tailwind + Headless UI:
  - `Popover`
  - `Dialog`
  - `Transition`

Files:

- `components/layout/site-header-client.tsx`
- `app/globals.css`
- possibly new shared UI component files

Recommendation:

- Limit Tailwind + Headless UI adoption to shared shell components first.
- Do not mix half-migrated patterns unpredictably across pages.

Acceptance criteria:

- Header feels more deliberate and easier to scan.
- Dropdown/mobile behaviors are accessible and stable.
- Migration does not force a full CSS rewrite.

## Architecture Note - Tailwind + Headless UI

The review explicitly mentions component types using Tailwind + Headless UI.

Current reality:

- The app does not currently depend on Tailwind or Headless UI.
- Page styling is primarily CSS Modules.

Recommended approach:

### Option A - Targeted Adoption

Best option for this repo now.

- Add Tailwind + Headless UI only for new shared primitives:
  - nav
  - dialogs
  - drawers
  - segmented controls
  - floating action button
- Keep existing CSS Modules for page-level composition during transition.

### Option B - Full Design-System Migration

Only do this if we want a broader storefront overhaul.

- Convert shared tokens
- rebuild layout primitives
- migrate catalog/contact/PDP surfaces

Recommendation:

- Start with **Option A**.

## Accessibility / Guideline Requirements

Applied from `ui-ux-pro-max` and `web-design-guidelines`:

- Hover-only behavior must always have click/focus fallback.
- All floating/icon-only buttons need `aria-label`.
- Inline validation must appear near the field.
- Focus states must remain visible.
- Avoid `outline: none` without replacement.
- Any new stateful filter/pagination UI should sync with URL where practical.
- If product count exceeds 50 and performance degrades, plan for pagination, load more, or virtualization.

## Pagination / "Show More" Recommendation

The review asks for either multiple pages or a show-more feature.

Recommendation:

- Prefer **Load more** first for this storefront.

Reason:

- Keeps the browsing flow smoother than hard pagination.
- Easier to integrate incrementally with the existing card grid.
- Can still expose real query-param state later if needed.

Future option:

- If SEO/category depth becomes more important, move to URL-driven pagination.

## Recommended Execution Order

1. Shop page restructure
2. Product-card density pass
3. Back-to-top + actionable collection header
4. Contact page order-help branch + validation fixes
5. Contact success merchandising
6. PDP hover-preview gallery
7. Recommendation logic expansion
8. Navigation system refinement
9. Tailwind + Headless UI targeted adoption

## Exact File Targets

Primary files most likely to change first:

- `components/layout/site-header-client.tsx`
- `features/catalog/catalog-page-view.tsx`
- `features/catalog/product-card.tsx`
- `features/catalog/catalog-page.module.css`
- `features/pdp/product-detail-page-view.tsx`
- `features/pdp/product-detail-page.module.css`
- `features/content-pages/contact-page-view.tsx`
- `features/content-pages/content-pages.module.css`
- `features/content-pages/content-pages-data.ts`
- `app/contact/actions.ts`
- `lib/catalog/service.ts`

## Decision Notes

### What should happen now

Implement the shop and contact improvements first.

### What should not happen in the same pass

- full recommendation-personalization system
- full Tailwind migration
- full design-system rewrite

Those are separate tracks and should not block the conversion-critical UX fixes.
