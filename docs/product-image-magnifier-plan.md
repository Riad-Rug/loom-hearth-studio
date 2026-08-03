# Product Image Magnifier Implementation Plan

Target surface: `features/pdp/product-detail-page-view.tsx`

## Objective

Replace the current click-to-lightbox zoom on the PDP hero image with a **hover-to-magnify loupe** on desktop, and fix the cropping complaint at the same time.

Success means:

- moving the cursor over the hero photo reveals a magnified detail of the piece under the cursor
- the hero photo is never cropped — the full frame the studio shot is the frame the customer sees
- the hero frame does not jump around when the customer switches gallery thumbnails
- touch users keep a working way to see the photo large
- keyboard and screen-reader users keep a working way to see the photo large
- no new npm dependency
- no extra image bytes are downloaded unless the customer actually engages the magnifier

## Current Behaviour (what is being replaced)

| Concern | Where | Today |
| --- | --- | --- |
| Hero frame | `product-detail-page-view.tsx:163` | `aspect-[4/5] overflow-hidden` — a fixed portrait box |
| Hero image fit | `product-detail-page-view.tsx:174` | `object-cover object-center` — **crops** anything that is not 4:5 |
| Zoom trigger | `product-detail-page-view.tsx:166-171` | `<button aria-label="Zoom in on …">` with `cursor-zoom-in`, sets `isLightboxOpen` |
| Zoom surface | `product-detail-page-view.tsx:345-370` | Headless UI `Dialog` + `DialogBackdrop` + `DialogPanel`, full image at `object-contain` |
| Thumbnails | `product-detail-page-view.tsx:126-156` | `TabList` of 5rem `aspect-square` tabs, `object-cover`, `item.thumbSrc` |

The 4:5 + `object-cover` pair is the crop the studio owner is unhappy about. A 2.2:1 runner rug or a landscape styled-in-room shot loses roughly half its frame.

Out of scope: the thumbnail rail. It is a navigation control, not the product photo — see "Why thumbnails keep `object-cover`" below.

## Data Model (verified)

Gallery items reach the view through `ProductDetailPageViewModel["gallery"]`:

- Type: `lib/catalog/contracts.ts:79-88` — `{ id, label, src, thumbSrc, publicId, altText, role, isDerived? }`
- Built by: `createGalleryItem` in `lib/catalog/service.ts:802-816`
  - `src` = `buildCloudinaryUrl(publicId, { w: 1600, q: "auto", f: "auto" })` — full frame, **no crop transformation**
  - `thumbSrc` = `buildCloudinaryUrl(publicId, { c: "fill", g: "auto", w: 240, h: 240, … })` — square crop, correct for thumbs
- `createDisplayGallery` (`product-detail-page-view.tsx:375-383`) only relabels the last item as `Condition` and adds `tone`; it does not touch image URLs.

Three facts that unlock this feature:

1. **Cloudinary already serves arbitrary widths.** `buildCloudinaryUrl` (`lib/cloudinary/url.ts:11-25`) serializes any `CloudinaryTransformation` (`lib/cloudinary/types.ts:16-24`). A high-res zoom source is a one-line URL build — `{ w: 2600, q: "auto", f: "auto" }` — with no new backend work, no new API call, no upload change.
2. **Intrinsic image dimensions are already persisted.** `MediaAsset` carries optional `width`/`height` (`types/domain/common.ts:22-31`); the admin upload writes them from the Cloudinary response (`features/admin/admin-product-form.tsx:288-289`); `parseImages` reads them back off the `images` JSON column (`lib/catalog/product-validation.ts:560-567`). They are simply **not forwarded** by `createGalleryItem`. Forwarding them is a two-file change and is what makes an uncropped, non-jumping hero possible without a client-side measure pass.
3. **Only the active hero image is in the DOM.** Headless UI `TabPanel` unmounts unselected panels by default (no `static` prop is used at `product-detail-page-view.tsx:159-191`), so hero-image work — including zoom prefetch — is naturally scoped to the selected gallery item.

Caveat: legacy or seeded rows may have missing or nominal dimensions (`lib/catalog/launch-product-data.ts` uses a flat `1600 × 1200` for many entries). The plan therefore treats persisted dimensions as a fast path and falls back to `naturalWidth`/`naturalHeight` read on image load.

## Decision 1: Hand-roll, do not add a dependency

`package.json` dependencies are deliberately thin: `@headlessui/react`, `next`, `react`, `next-auth`, `prisma`, `tailwindcss`. No image-zoom library is present, and no existing dependency does loupe magnification (Headless UI ships behaviour primitives — dialogs, tabs, menus — not image interactions).

**Decision: hand-roll it.** Roughly 80–110 lines of component code, no new package.

Rationale:

- the whole interaction is one `pointermove` handler, one rect, and a `background-position` calculation — there is no library-grade complexity to buy
- the popular options (`react-image-magnify`, `react-inner-image-zoom`) ship their own inline styles and class names, which fight the `var(--color-…)` / `var(--space-…)` / `var(--radius-…)` token system used throughout this file, and would need overriding anyway
- most are React 17-era and not verified against React 19, which this repo is on
- bundle cost lands on every PDP, the highest-traffic template on the site

Tradeoff being accepted: edge cases (rect invalidation on scroll, pointer capture, touch suppression) become our problem. They are enumerated in Phase 3 and the QA checklist so they are not rediscovered in production.

## Decision 2: Cursor-following lens, not a side panel

**Chosen: a lens overlay that follows the cursor inside the hero frame**, showing a magnified crop of the region under the pointer.

Why:

- **There is no room for a side panel.** The PDP grid is `grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]` (`product-detail-page-view.tsx:122`) and the right column is the sticky purchase panel (`product-detail-page-view.tsx:196-251`) holding price, Reserve CTA, and the verification promise. A zoom panel would have to overlay the CTA on hover — covering the primary conversion element every time the customer inspects the product is a bad trade. Below `1100px` the grid collapses to one column and there is no second column at all.
- **A lens matches how people inspect a rug.** The customer wants to judge weave density, pile height, colour saturation, and wear. A lens is the on-screen equivalent of leaning in — it keeps the whole piece visible for context while showing the detail, which is exactly the "we do not soften condition in copy" posture the page already takes (`product-detail-page-view.tsx:229-234`).
- **It costs no layout.** The lens is absolutely positioned and `pointer-events-none`; nothing reflows on hover, so there is no jank and no CLS.

Rejected alternatives:

| Option | Why rejected |
| --- | --- |
| Side-by-side zoom panel | No free column; would overlay the Reserve CTA, or force a reflow on hover. Dead on mobile and tablet where the grid is single-column. |
| Whole-container inner zoom (scale the image, pan with cursor) | Destroys the overview. On a large rug the customer loses track of which part of the piece they are looking at, which is the opposite of the goal. Also, at 2.5× the whole frame is soft unless a very large source is fetched. |
| Pure CSS `background-position` with no JS | Cannot read cursor coordinates without JS. A CSS-only approximation (hover + fixed transform-origin) magnifies a fixed point, not the point under the cursor — that is not a magnifier. |
| Keep the lightbox as the only zoom | This is the thing the owner asked to replace. It is retained as a fallback path, not as the primary desktop interaction. |

Recommended parameters (tune during visual QA):

- magnification: `2.5×`
- lens: `180px` square, `var(--radius-md)` corners, `2px` border in `var(--color-border)`, soft shadow
- square rather than circular: rugs, pillows, and weave detail are rectilinear; a square crop reads as "a detail photo", a circle reads as a gimmick and clashes with the Swiss/editorial grammar the rest of the site uses

## Decision 3: The crop fix — a fixed stage, a fluid image box

The crop and the magnifier are the same problem. Fix the frame and the lens maths becomes trivial.

Replace `aspect-[4/5] overflow-hidden` + `object-cover` with a **two-element structure**:

1. **The stage** (outer, fixed height, keeps the layout stable)
   - fixed height: `min(78vh, 40rem)` — expressed with the token scale where possible; the `78vh` cap keeps the Reserve CTA above the fold on laptop screens
   - keeps the current framing: `border border-[color:var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-panel)]`
   - `display: grid; place-items: center`
   - height is identical for every gallery item, so switching thumbnails never shifts the page

2. **The image box** (inner, exactly the photo's own aspect ratio, never cropped)
   - `height: 100%; aspect-ratio: <W> / <H>; max-width: 100%;`
   - the `<img>` inside is `block w-full h-full object-contain`
   - a portrait rug fills the stage height and is narrow; a landscape styled shot hits `max-width: 100%` and shrinks in height, centred

Result: the image box always has exactly the photo's own proportions, so **`object-contain` never actually letterboxes** — the box is the photo. Any leftover space is stage background, which reads as a mat around a print rather than as a broken layout. No pixel of any photo is ever cut off.

Aspect ratio source, in order:

1. `item.width / item.height` forwarded from the view model (server-known, no layout shift on first paint)
2. `naturalWidth / naturalHeight` captured in the hero `<img>`'s `onLoad` and stored in component state, for legacy rows with missing dimensions
3. `4 / 5` as a last-resort default, matching today's framing

Also set the `width` and `height` attributes on the hero `<img>` from the same numbers to suppress CLS.

### How this interacts with the magnifier

Because the image box has the photo's exact ratio, **the image box's bounding rect equals the rendered pixel rect of the photo**. Cursor-to-source mapping is then a straight proportion — no letterbox offset maths, no `object-fit` correction. This is why the crop fix is sequenced before the magnifier in the implementation order: doing it the other way round means writing letterbox-compensation code and then deleting it.

### Why thumbnails keep `object-cover`

The thumbnail rail (`product-detail-page-view.tsx:126-156`) stays exactly as it is:

- it is a **navigation control**, not the product photo; uniform square targets are what make a rail scannable and keep the `grid-cols-[5rem_1fr]` rail (line 125) and the mobile `auto-cols-[4.5rem]` horizontal scroller (line 126) from going ragged
- `thumbSrc` is already `c_fill,g_auto` at 240×240 (`lib/catalog/service.ts:809-811`) — Cloudinary's auto-gravity picks a sensible crop centre, which is the right behaviour for a 5rem chip
- the crop complaint is about the **hero**; a customer is not judging weave from an 80px chip

This distinction should be stated to the studio owner so the remaining square thumbnails do not read as the fix being half-applied.

## Decision 4: Mobile and touch fallback — keep the Dialog

Hover does not exist on touch. Options considered:

| Option | Verdict |
| --- | --- |
| **Keep the existing `Dialog` lightbox, opened by tap** | **Chosen.** Already built (`product-detail-page-view.tsx:345-370`), already renders `object-contain` (uncropped), already focus-trapped and escape-dismissable via Headless UI. Zero new surface area, zero new bugs, and it is the pattern shoppers already expect from a product photo on mobile. |
| Custom pinch/pan zoom inside the page | Rejected for now. Requires pointer-event gesture handling, momentum, and bounds clamping; fights the page's own scroll; a large new bug surface for a marginal gain over a full-screen tap view. |
| Long-press lens | Rejected. Undiscoverable, and it collides with the OS text/image context menu. |

Improvement worth making while the Dialog is open for edit: on touch, the native pinch-zoom inside the Dialog already gives the customer real magnification for free, provided the viewport meta does not set `user-scalable=no`. **Verify this during QA** rather than building a gesture layer.

So the split is:

- `(hover: hover) and (pointer: fine)` → lens magnifier on hover; click still opens the Dialog as a secondary "see it big" path
- everything else → tap opens the Dialog, exactly as today

Detect with `window.matchMedia`, mirroring the existing pattern in `features/cart/cart-drawer.tsx:24-37` (`isPointerFine` state, `change` listener, cleanup). Do **not** branch on viewport width — a touchscreen laptop and an iPad Pro are both wide and both hoverless.

## Decision 5: Accessibility

Hover conveys nothing to keyboard or screen-reader users, so the magnifier must be strictly additive.

1. **The hero stays a real `<button>`.** Keep the element at `product-detail-page-view.tsx:166-171` and keep its `onClick` opening the Dialog. Enter and Space therefore continue to open a focus-trapped, escape-dismissable, uncropped full view. That is the keyboard equivalent of the magnifier and it already works.
2. **The lens is decorative.** `aria-hidden="true"` and `pointer-events-none`. It carries no information the alt text does not.
3. **Nothing is announced on hover.** No live region — a hover position is not information, and announcing it would be noise.
4. **Add a visible focus ring** to the hero button (`focus-visible:ring-2 focus-visible:ring-[color:var(--color-green)] focus-visible:ring-offset-2`). It currently has none.
5. **Reword the label.** `aria-label="Zoom in on …"` describes an interaction that, on desktop, now happens on hover. Use `aria-label={`View ${item.altText || product.name} full size`}` so it describes what the click does.
6. **Fix the thumbnail focus ring while in here.** `product-detail-page-view.tsx:131` applies `focus:outline-none` and only draws a ring for the `selected` state — a keyboard user tabbing the rail has no visible focus indicator. Swap to `focus-visible:ring-2 focus-visible:ring-[color:var(--color-green)]` layered on the existing selected/unselected rings. Small, adjacent, and a genuine WCAG 2.4.7 failure today.
7. **Respect `prefers-reduced-motion`.** The lens should track the cursor with no easing or transition regardless; do not add a scale-in animation on lens appearance for reduced-motion users. Precedent: `features/catalog/catalog-page.module.css:853`.
8. **`cursor-zoom-in` stays** as the affordance on desktop.

## Decision 6: Performance

1. **Never load the zoom source eagerly.** Add `zoomSrc` to the gallery view model as a *URL string only*. Do not render it into the initial markup — no `<img>`, no `background-image`, no `<link rel=preload>`. A `w_2600` rug photo is roughly 400–700KB; multiplied across a 4–6 image gallery it would dwarf the rest of the page.
2. **Fetch on intent.** On the first `pointerenter` of the hero, construct `new Image()`, assign `zoomSrc`, and flip a `zoomReady` flag in its `onload`. Cache the loaded ids in a `Set` so re-hovering and returning to a previously viewed gallery item does not re-request.
3. **Degrade gracefully during the fetch.** Until `zoomReady`, render the lens using the already-decoded `item.src`. It is an upscale and slightly soft, but the lens is responsive from the first pixel of hover instead of dead for 300ms. Swap to `zoomSrc` when it lands.
4. **Optionally warm the active image on idle.** A single `requestIdleCallback` prefetch of the *active* item's `zoomSrc` after first paint hides Cloudinary's first-request derivation latency (a `w_2600` derivative is generated on first hit and cached thereafter). Prefetch **only** the active item, never the whole gallery. Treat this as a tuning step, gated on whether hover feels sluggish in QA.
5. **Do not re-render React on `pointermove`.** Keep the cursor position in a `useRef`, schedule a `requestAnimationFrame`, and write CSS custom properties (`--lens-x`, `--lens-y`, `--lens-bg-x`, `--lens-bg-y`) directly onto the lens element via its ref. A `useState` position would re-render the whole PDP subtree at pointer frequency. Cancel any pending frame on `pointerleave` and on unmount.
6. **Cache the image box rect.** Read `getBoundingClientRect()` once on `pointerenter` and invalidate it on `scroll` and `resize` (the left gallery column is not sticky, so page scroll does move it). Alternative accepted if simpler: read the rect inside the rAF callback — one layout read per frame for one element is affordable, and it is immune to rect staleness. Pick one and comment which and why.
7. **Use `background-image` on the lens, not a second `<img>`.** One decoded bitmap shared with the browser cache, and panning is a single `background-position` write.
8. **Panel unmounting is already on our side.** Headless UI unmounts unselected `TabPanel`s, so only the active hero image and its zoom state exist at any time.

## Phase 1: Forward Intrinsic Dimensions and a Zoom Source

Goal: give the client everything it needs, without a second network round trip or a client-side measure pass.

### Tasks

1. Extend the gallery item shape in `lib/catalog/contracts.ts:79-88`
   - add `width?: number`
   - add `height?: number`
   - add `zoomSrc: string`

2. Populate them in `createGalleryItem`, `lib/catalog/service.ts:802-816`
   - forward `image.width` and `image.height` straight through from `MediaAsset`
   - add `zoomSrc: buildCloudinaryUrl(image.publicId, { transformation: { w: 2600, q: "auto", f: "auto" } })`
   - keep `src` and `thumbSrc` exactly as they are — nothing about existing rendering changes

3. Confirm `createDisplayGallery` (`product-detail-page-view.tsx:375-383`) passes the new fields through
   - it spreads `...item`, so it should need no edit; verify rather than assume

4. Run `npm run typecheck`
   - any other consumer of `ProductDetailPageViewModel["gallery"]` that constructs gallery items literally (rather than spreading) will surface here; fix those call sites

### Deliverable

- every gallery item carries an uncropped high-res URL and, where known, its true proportions
- no visual change yet
- no additional bytes on the wire yet

## Phase 2: Rebuild the Hero Frame (the crop fix)

Goal: the customer sees the whole photograph. Ship this even if Phase 3 slips — it is the complaint the owner actually raised.

### Tasks

1. Extract a `ProductHeroImage` component inside `features/pdp/product-detail-page-view.tsx`
   - the file already colocates helper components (`ProductBreadcrumb`, `RugPurchaseShell`, `SoldPurchaseShell`, `MultiUnitPurchaseShell`), so follow that convention rather than creating a new file
   - props: `item: DisplayGalleryItem`, `productName: string`, `isBroken: boolean`, `onImageError: (id: string) => void`, `onOpenLightbox: () => void`
   - it replaces the body of the `TabPanel` at `product-detail-page-view.tsx:161-189`

2. Convert the `TabPanel` (line 163) into the **stage**
   - remove `aspect-[4/5] overflow-hidden`
   - add a fixed height of `min(78vh, 40rem)` and `grid place-items-center`
   - keep `border border-[color:var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-panel)] max-[700px]:order-1`
   - on `max-[700px]`, reduce the stage height (roughly `60vh`) so the hero does not eat the whole phone screen above the specs

3. Add the **image box** inside the stage
   - `height: 100%; aspect-ratio: <W>/<H>; max-width: 100%;` via an inline `style` (the ratio is per-image data, not a design token, so an inline style is correct here — do not generate arbitrary Tailwind classes for it)
   - resolve the ratio: view-model `width`/`height` → `onLoad` natural size → `4 / 5`

4. Change the `<img>` fit at `product-detail-page-view.tsx:174`
   - `object-cover object-center` → `object-contain`
   - add `width` / `height` attributes from the resolved dimensions
   - add an `onLoad` handler that records `naturalWidth`/`naturalHeight` into a `naturalSizeById` state map, used only when the server did not supply dimensions

5. Update the `PlaceholderMedia` fallback (`product-detail-page-view.tsx:180-187`)
   - it takes an `aspectRatio` prop typed as `` `${number} / ${number}` `` (`components/media/placeholder-media.tsx:10`); keep `"4 / 5"` for the no-image case, since there is no photo whose proportions could be honoured

6. Leave the thumbnail `TabList` (lines 126-156) untouched

### Deliverable

- no product photo is cropped anywhere on the PDP hero
- the hero frame height is identical across all gallery items, so switching thumbnails does not shift the page
- lightbox, thumbnails, and error/placeholder states all behave exactly as before

## Phase 3: The Hover Magnifier

Goal: cursor-following loupe on pointer-fine devices only.

### Tasks

1. Add pointer-capability detection in `ProductDetailPageView`
   - `const [isPointerFine, setIsPointerFine] = useState(false)`
   - `useEffect` with `window.matchMedia("(hover: hover) and (pointer: fine)")`, a `change` listener, and cleanup — copy the shape from `features/cart/cart-drawer.tsx:24-37`
   - initial `false` so SSR and first paint are the safe, no-lens state; the effect corrects it before the customer can hover

2. Add magnifier state inside `ProductHeroImage`
   - `isLensVisible: boolean` (React state — changes at most twice per hover, so a re-render is fine)
   - `zoomLoadedIds: Set<string>` (lifted to the parent so it survives thumbnail switches)
   - refs: `imageBoxRef`, `lensRef`, `rectRef`, `frameRef` (pending rAF id)

3. Wire the handlers on the **image box** (not the stage — the box is the photo)
   - `onPointerEnter`: bail if `!isPointerFine` or `event.pointerType !== "mouse"`; cache the rect; kick off the `zoomSrc` fetch if not already loaded; set `isLensVisible`
   - `onPointerMove`: store coordinates in a ref, schedule one rAF, write the CSS custom properties on `lensRef.current`
   - `onPointerLeave`: cancel the pending frame, clear `isLensVisible`
   - cancel the pending frame in a `useEffect` cleanup too, so an unmount mid-hover cannot write to a detached node

4. Implement the lens element
   - absolutely positioned child of the image box, `aria-hidden="true"`, `pointer-events-none`
   - `background-image: url(<zoomReady ? zoomSrc : src>)`
   - `background-size: calc(var(--lens-zoom) * 100%)` against the box dimensions
   - `background-position` from `--lens-bg-x` / `--lens-bg-y`
   - position via `transform: translate3d(var(--lens-x), var(--lens-y), 0)` so movement stays off the main thread's layout path
   - style with tokens: `rounded-[var(--radius-md)]`, `border-[color:var(--color-border)]`, shadow consistent with the mobile CTA bar shadow at `product-detail-page-view.tsx:330`

5. Clamp the lens
   - keep the lens fully inside the image box: clamp the centre to `[halfLens, boxSize - halfLens]` on both axes
   - clamp the background position to `[0, (zoom - 1) * boxSize]` so the lens never shows blank edges past the photo

6. Reset on gallery change
   - clear `isLensVisible` when `activeImageIndex` changes; extend the existing reset effect at `product-detail-page-view.tsx:58-62` (which already resets on `product.id`) if a cross-product reset is also needed

7. Add a small hover hint
   - one line under the stage, `text-[var(--color-text-subtle)] text-[0.78rem]`, rendered only when `isPointerFine`: `Hover the photo to inspect the weave.`
   - discoverability matters — a magnifier that nobody knows exists converts nothing

### Deliverable

- hovering the hero on a mouse-driven device shows a magnified crop that tracks the cursor
- no lens on touch, no lens during SSR, no lens for pen or coarse pointers
- no React re-render per pointer frame

## Phase 4: Keep the Lightbox as the Fallback Path

Goal: touch, keyboard, and assistive-technology users lose nothing.

### Tasks

1. Keep `isLightboxOpen` state (`product-detail-page-view.tsx:55`), its reset effect (lines 58-62), and the entire `Dialog` block (lines 345-370)
   - **do not delete the lightbox** — it is now the touch primary path and the keyboard alternative to hover

2. Keep the hero `<button>`'s `onClick` opening the Dialog on all devices
   - on desktop it is the secondary "show me this properly big" action, and the keyboard equivalent of the lens
   - on touch it is the only zoom path

3. Update the button's `aria-label` (line 167)
   - `` `View ${item.altText || product.name} full size` ``

4. Add `focus-visible` styling to the hero button (line 168)

5. Fix the thumbnail focus ring at `product-detail-page-view.tsx:131`
   - replace `focus:outline-none` with a `focus-visible:ring-2 focus-visible:ring-[color:var(--color-green)]` treatment layered over the existing selected/unselected inset rings

6. Verify the Dialog image is uncropped
   - line 364 already uses `object-contain`; confirm no regression

### Deliverable

- every input modality has a working way to see the photo large
- keyboard focus is visible everywhere in the gallery

## Phase 5: QA and Responsive Pass

### Checklist

Crop:

- [ ] a portrait rug, a landscape styled shot, and a near-square detail shot all render whole, nothing clipped
- [ ] switching thumbnails does not change the stage height or shift the page
- [ ] a product whose images have no persisted `width`/`height` still renders correctly via the `onLoad` fallback
- [ ] no layout shift on first paint when dimensions *are* persisted

Magnifier:

- [ ] the lens shows the region actually under the cursor, at all four corners and all four edges
- [ ] the lens never escapes the image box and never shows blank background
- [ ] the lens disappears on `pointerleave`, including a fast exit
- [ ] no lens on a touchscreen laptop (`hover: none` with a wide viewport)
- [ ] scrolling mid-hover does not desynchronise the lens
- [ ] browser zoom at 150% and 200% still maps correctly

Fallbacks:

- [ ] tap on mobile opens the Dialog; pinch-zoom works inside it (check the viewport meta does not set `user-scalable=no`)
- [ ] Tab reaches the hero button; Enter and Space open the Dialog; Escape closes; focus returns to the button
- [ ] focus rings visible on both the hero and every thumbnail
- [ ] screen reader announces the alt text and the button label, and says nothing extra on hover

Performance:

- [ ] DevTools Network shows **no** `w_2600` request on page load
- [ ] the first hover triggers exactly one `w_2600` request; subsequent hovers of the same image trigger none
- [ ] Performance panel shows no per-frame React commits during a sustained hover
- [ ] `npm run typecheck` and `npm run lint` pass

### Deliverable

- production-ready PDP gallery pass across desktop, tablet, and mobile

## File Plan

### Files to update

- `features/pdp/product-detail-page-view.tsx` — lines 55, 58-62, 126-156 (focus ring only), 159-191 (hero rebuild), 345-370 (retain, relabel), plus a new colocated `ProductHeroImage` component
- `lib/catalog/service.ts` — `createGalleryItem`, lines 802-816
- `lib/catalog/contracts.ts` — gallery item type, lines 79-88

### Files to read but not change

- `lib/cloudinary/url.ts`, `lib/cloudinary/types.ts` — URL building already supports everything needed
- `features/cart/cart-drawer.tsx:24-37` — the pointer-capability pattern to copy
- `components/media/placeholder-media.tsx` — the no-image fallback contract
- `app/globals.css` — design tokens

### Likely new files

None. The feature fits the existing colocation convention in `features/pdp/product-detail-page-view.tsx`. If `ProductHeroImage` grows past roughly 150 lines, split it into `features/pdp/product-hero-image.tsx` — but do not start there.

### Dependencies added

None.

## Recommended Order of Execution

1. Phase 1 — data plumbing
2. Phase 2 — crop fix
3. Phase 3 — magnifier
4. Phase 4 — fallbacks and a11y
5. Phase 5 — QA

Phases 1 and 2 are independently shippable and resolve the owner's crop complaint on their own. Phase 3 depends on Phase 2 — building the magnifier against the current `object-cover` frame means writing letterbox-compensation maths and then deleting it.

## First Implementation Slice

1. Forward `width`, `height`, and `zoomSrc` through `lib/catalog/service.ts` and `lib/catalog/contracts.ts`
2. Extract `ProductHeroImage` and rebuild the hero as stage + image box with `object-contain`
3. Show it to the studio owner before writing a line of magnifier code

Reason:

- the crop is the complaint that was actually raised; the magnifier is the proposed treatment
- it confirms the stage height (`min(78vh, 40rem)`) and the matted-frame look against real rug photography before that decision gets baked into the lens geometry
- if the stage height is wrong, finding out now costs an hour; finding out after Phase 3 costs a rewrite

## Definition of Done

The work is done when:

- no PDP hero photo is cropped, at any aspect ratio
- the hero frame is stable across gallery thumbnail switches
- hovering the hero on a mouse-driven device magnifies the region under the cursor, smoothly
- touch users tap to open the full uncropped image
- keyboard users reach the same full image via Enter or Space, with a visible focus ring
- the high-resolution zoom image is requested only on hover intent, never on page load
- no new npm dependency was added
- `npm run typecheck` and `npm run lint` pass, and the QA checklist above is clean
