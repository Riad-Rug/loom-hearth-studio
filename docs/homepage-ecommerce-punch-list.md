# Homepage Ecommerce Punch-List

Date: 2026-04-20
Source review: `docs/landing-page-review-2026-04-18.md`
Target page: `/`

## Implementation Map

Primary homepage files:

- `app/page.tsx`: homepage route and metadata generation
- `features/home/home-page-view.tsx`: section rendering and layout composition
- `features/home/home-page-data.ts`: homepage content schema and defaults
- `lib/homepage/content.ts`: homepage content loading plus copy normalization overrides
- `features/home/home-page.module.css`: homepage visual layout and responsive behavior
- `components/compliance/cookie-consent-banner.tsx`: cookie banner markup
- `app/globals.css`: global cookie-banner styling

Adjacent files likely needed:

- `features/catalog/catalog-data.ts`: catalog labels and shop positioning
- `features/catalog/product-card.tsx`: reusable product card reference if homepage gets real product cards
- `lib/catalog/service.ts`: product retrieval if homepage pulls live inventory
- `lib/db/repositories/product-repository.ts`: product query support if a homepage-specific product rail is needed
- `features/admin/admin-homepage-form.tsx`: admin edit support if new homepage content fields are added
- `features/admin/admin-homepage-preview.tsx`: admin preview support if new homepage sections are added
- `lib/seo/metadata.ts`: metadata helper, only if SEO fallback behavior needs adjustment

## Priority 1: Move Product Discovery Above Editorial Content

Problem:

The current section order is `hero`, `badges`, `categories`, `brandStory`, `designDirection`, `featured`, `guide`, `newsletter`. This places narrative sections before the featured shopping section.

Recommended change:

Move shopping modules before narrative modules. A stronger order is:

1. `hero`
2. `badges`
3. `featured`
4. `categories`
5. `brandStory`
6. `designDirection`
7. `guide`
8. `newsletter`

Code touchpoints:

- Update `homepageSectionOrderKeys` default behavior in `features/home/home-page-data.ts`.
- Update `defaultHomePageContent.sectionOrder` if needed.
- Confirm existing saved database content does not override the new order through `lib/homepage/content.ts`.
- If production content is stored in the database, update it through the admin homepage editor or a one-time data migration.

Acceptance checks:

- On first page load, featured shopping cards appear before long editorial narrative blocks.
- Mobile users see shopping paths before `Who We Are` and `Design Direction`.
- Existing admin section ordering still works.

## Priority 2: Replace "Featured Directions" With Commercial Product Merchandising

Problem:

The current `featured` section is category-like. It links to broad directions, not actual purchasable items. It does not show prices, availability, newness, or one-of-one scarcity.

Recommended change:

Convert the section into a real product rail, ideally `New Arrivals` or `One-of-One Rugs`.

Minimum viable version:

- Keep the current `featured.cards` schema.
- Rewrite copy to make it more commercial.
- Use cards that link to high-value collection pages such as `/shop/rugs`, `/shop/vintage`, and `/shop/poufs`.
- Add visible microcopy such as `One-of-one`, `Fresh arrivals`, or `Selected for launch`.

Better version:

- Add a new live product rail component that queries inventory.
- Render product image, title, price, category/style, and status.
- Link directly to PDPs.

Code touchpoints for minimum viable version:

- `lib/homepage/content.ts`: update `next.featured.eyebrow`, `title`, `paragraph`, card titles, descriptions, and hrefs.
- `features/home/home-page-view.tsx`: add optional badge/label rendering if extending `HomePageImageCard`.
- `features/home/home-page-data.ts`: add optional fields such as `badgeLabel` or `priceLabel` if needed.
- `features/home/home-page.module.css`: style product labels, price rows, and mobile card density.

Code touchpoints for live product version:

- `app/page.tsx`: fetch featured products alongside homepage content.
- `features/home/home-page-view.tsx`: accept featured products as props or render a dedicated product rail.
- `lib/catalog/service.ts`: expose a query such as `getHomepageFeaturedProducts`.
- `lib/db/repositories/product-repository.ts`: add a query for active/available featured or newest products.
- `features/catalog/product-card.tsx`: reuse or adapt product-card UI if compatible.

Acceptance checks:

- Users can see actual purchasable items or at least commercially specific shopping cards above editorial copy.
- Cards show either prices or clear shopping intent.
- Links go to PDPs for live products or focused collection pages for MVP.

## Priority 3: Make Hero CTAs More Ecommerce-Oriented

Problem:

The secondary hero CTA currently points to `Our Story`, which sends shopping-intent users into editorial content.

Recommended change:

Keep `SHOP RUGS` as the primary CTA. Replace the secondary CTA with a commercial action.

Preferred options:

- `New Arrivals` -> `/shop?sort=Newest` if supported, otherwise `/shop`
- `Shop Vintage Rugs` -> `/shop/vintage`
- `Browse All Pieces` -> `/shop`
- `Shop by Size` -> future filtered route if implemented

Code touchpoints:

- `lib/homepage/content.ts`: update `next.hero.secondaryCta`.
- `features/home/home-page-data.ts`: update default fallback values.
- Admin content may also need an update if database content overrides defaults.

Acceptance checks:

- Hero has two shopping-oriented paths.
- `Our Story` remains available in navigation and narrative sections, but not as the main secondary CTA.

## Priority 4: Add Transactional Trust Near the Hero

Problem:

The site has trust badges, but the most commercially important assurances are not grouped into a compact buyer-confidence block near the first CTA.

Recommended change:

Add a compact trust strip under the hero CTA or directly beneath the hero:

- Free shipping to US, Canada, and Australia
- 14-day returns
- Video colour check before payment capture
- Ships from Morocco with tracking

Current implementation:

- `badges` already renders directly after the hero through `features/home/home-page-view.tsx`.
- `HowItWorksSection` is coupled to the `badges` render branch.

Code touchpoints:

- `features/home/home-page-view.tsx`: consider moving `HowItWorksSection` out of the badges branch so badges can stay compact and the explainer can be independently positioned.
- `features/home/how-it-works-section.tsx`: shorten or convert into a lower-page proof module.
- `lib/homepage/content.ts`: tighten badge copy for mobile scanability.
- `features/home/home-page.module.css`: make badges denser on mobile and reduce vertical distance from hero.

Acceptance checks:

- The first mobile viewport or second mobile viewport communicates shipping, returns, colour verification, and tracking.
- Badges remain legible and do not become a bulky text section.

## Priority 5: Reduce Cookie Banner Obstruction on Mobile

Problem:

On mobile first visit, the cookie banner occupies too much of the viewport and blocks shopping momentum.

Recommended change:

Use a smaller mobile treatment:

- Shorten copy on small screens.
- Display buttons in a compact horizontal or stacked low-height layout.
- Remove or visually collapse the cookie category list on mobile.
- Keep the banner anchored low without covering most of the hero.

Code touchpoints:

- `components/compliance/cookie-consent-banner.tsx`: optionally add shorter mobile-friendly text structure or remove the visible category list.
- `app/globals.css`: adjust `.cookie-banner` mobile rules, max-height, padding, border radius, and action layout.

Acceptance checks:

- On a 390x844 mobile viewport, the user can still see the hero CTA while the banner is present, or the banner uses materially less vertical space than the current version.
- Accept/decline remain accessible and keyboard reachable.
- Consent behavior is unchanged.

## Priority 6: Add a Comparison or Proof Block

Problem:

The page explains sourcing well but does not quickly answer why the buyer should choose this store over marketplaces, mass retailers, or generic importers.

Recommended change:

Add a concise comparison block after product discovery:

- `Selected in person, not sourced from an export catalogue`
- `Actual piece verified on video before payment capture`
- `One-of-one inventory, not restocked in batches`
- `Family trade history in Marrakech`

Code touchpoints:

- MVP: repurpose `designDirection` copy in `lib/homepage/content.ts`.
- Better: add a new `proof` section key in `features/home/home-page-data.ts`.
- `features/home/home-page-view.tsx`: render the new proof/comparison section.
- `features/home/home-page.module.css`: add comparison grid styling.
- `features/admin/admin-homepage-form.tsx` and `features/admin/admin-homepage-preview.tsx`: support editing/preview if section is admin-managed.

Acceptance checks:

- The block is scannable in under 10 seconds.
- It supports conversion rather than adding more long-form narrative.

## Priority 7: Compress Narrative Copy

Problem:

The `brandStory`, `designDirection`, and `guide` sections are strong but too dense when stacked.

Recommended change:

Reduce homepage paragraphs and push full detail to linked pages.

Code touchpoints:

- `lib/homepage/content.ts`: shorten `next.brandStory.paragraph`, `next.designDirection.paragraph`, and `next.guide.paragraph`.
- `features/home/home-page-data.ts`: update defaults to match the shorter fallback copy.
- If content is database-managed, update through admin or migration.

Acceptance checks:

- Narrative cards are easier to scan.
- The page still communicates craft authority, but product discovery remains dominant.

## Priority 8: Fix Homepage SEO Metadata Gap

Problem:

Lighthouse reported that the document does not have a meta description, even though `app/page.tsx` passes a description into `buildManagedMetadata`.

Recommended investigation:

Check whether an admin SEO setting for `entityType: "site"` and `entityKey: "home"` exists with an empty or malformed description.

Code touchpoints:

- `app/page.tsx`: metadata generation path is already present.
- `lib/seo/metadata.ts`: confirm empty admin descriptions cannot override fallback descriptions.
- `lib/seo/settings.ts`: inspect how blank SEO settings are read.
- Admin route `/admin/seo`: verify homepage SEO values.

Potential code fix:

- In `buildManagedMetadata`, ignore blank strings after trimming before using managed SEO settings.

Acceptance checks:

- View-source or rendered metadata includes a non-empty `<meta name="description">`.
- Lighthouse no longer reports `meta-description`.

## Priority 9: Fix Color Contrast Issue

Problem:

Lighthouse reported a contrast failure.

Recommended change:

Identify the failing selector from the Lighthouse report and increase text/background contrast.

Likely code touchpoints:

- `features/home/home-page.module.css`: terracotta link labels, muted body text, badges, or secondary CTA.
- `app/globals.css`: global muted text or cookie-banner styles.

Acceptance checks:

- Lighthouse no longer reports `color-contrast`.
- Visual tone remains premium and consistent.

## Priority 10: Add Shop-by-Need Shortcuts

Problem:

The homepage offers categories but not common buying paths such as size, room, palette, or arrival status.

Recommended change:

Add a compact shortcut module after the hero or after featured products:

- `Shop large rugs`
- `Shop neutral rugs`
- `Shop colorful rugs`
- `Shop vintage`
- `Shop poufs`

Code touchpoints:

- MVP: hard-code a shortcut list in `features/home/home-page-view.tsx`.
- Better: add a `shoppingShortcuts` section to `features/home/home-page-data.ts`.
- `features/home/home-page.module.css`: add pill/grid styling.
- Catalog filtering support may require changes in `features/catalog/catalog-page-view.tsx` and catalog route/query handling.

Acceptance checks:

- Shoppers can self-segment without opening the menu.
- Shortcuts are visible early on mobile.

## Suggested Implementation Sequence

1. Update hero secondary CTA and section order.
2. Tighten badge copy and decouple `HowItWorksSection` from the badges render path.
3. Make the featured section commercial, either via MVP content or live product data.
4. Reduce mobile cookie banner height.
5. Shorten narrative copy.
6. Fix metadata fallback and contrast issue.
7. Add proof/comparison and shop-by-need shortcuts.
8. Run `npm run typecheck`, `npm run build`, and Lighthouse desktop/mobile checks.

## Verification Checklist

- Desktop homepage still renders all intended sections.
- Mobile first screen has visible shopping CTA and reduced cookie obstruction.
- Featured shopping path appears before long editorial content.
- Hero secondary CTA points to a shopping path.
- Metadata includes a non-empty homepage description.
- Lighthouse no longer reports missing meta description.
- Lighthouse no longer reports color contrast failure.
- Admin homepage editor still loads and saves current content.
- Product links resolve correctly.
