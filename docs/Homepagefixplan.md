# Homepage Fix Plan — "the admin editor and the live homepage don't match"

Status: investigation complete, no code changed yet.
Investigated: 2026-08-04, on `main` at `3e4a460`.

## Summary

The owner's complaint is real and it is **not one bug**. There are **three independent layers** of hardcoded copy sitting between the database and the rendered homepage, plus one image filter that silently discards valid saved images. The admin editor presents every one of these fields as a freely editable text input, so from the owner's seat the edit "works", persists, and then never appears.

| # | Layer | Where | Effect |
| --- | --- | --- | --- |
| 1 | `normalizeHomepageCopyAudit()` | `lib/homepage/content.ts:43-290` | Overwrites ~45 DB-loaded fields with baked-in constants on **every read**, for both the live page and the admin page |
| 2 | View-level copy constants | `features/home/home-page-view.tsx:21-99` | Overwrites hero mobile paragraph, all 5 category card descriptions, story copy, newsletter mobile title — these beat layer 1 |
| 3 | `getCloudinaryImage()` | `features/home/home-page-view.tsx:331-333` | Renders a "photo pending" placeholder for any hero/category image whose `src` is not a `res.cloudinary.com` URL, even though validation and `next.config.ts` accept it |
| 4 | Sections rendered from nothing | `features/home/home-page-view.tsx:171-245`, `295-310` | Badges, featured cards, brand story, design direction, guide, FAQ, proof, how-it-works are editable in admin but are either not rendered at all or rendered entirely from constants |

None of this is a caching problem — see [Ruled out](#ruled-out).

## Evidence

### The live page proves layer 1 is active

Live `https://www.loomandhearthstudio.com/` renders:

```
<h1>Woven by hand in Morocco. Warm underfoot in your home.</h1>
```

That string exists in exactly one place in the codebase: `lib/homepage/content.ts:55`. It is **not** what is in the database.

### The database row proves the edits are being discarded

Queried directly through Prisma against the `DATABASE_URL` in `.env` (`HomepageContentRecord`, `key = "homepage"`, model at `prisma/schema.prisma:314-320`):

```
updatedAt: 2026-03-30T13:28:14.958Z

hero.title      "Preview-managed Moroccan rugs, poufs, pillows, and decor."
hero.eyebrow    "Loom & Hearth Studio"
hero.paragraph  "we have been around for many decades"
brand.tagline   "Admin-managed studio tagline"
pageSeo.title   "Shop handcrafted Moroccan rugs, poufs, pillows, and decor."
badges          badge-1 "Direct from Morocco"
                badge-2 "United States delivery"
                badge-3 "No unexpected import charges for US orders"
                badge-4 "Video verification before payment."
categories.eyebrow  "Categories"
newsletter.title    "Admin-updated newsletter access."
footer.introMeta    "Curated for a United States launch in USD."
```

Every one of those values is stomped on read. `hero.eyebrow` becomes `"DIRECT FROM CASABLANCA"`, `categories.eyebrow` becomes `"SHOP BY CATEGORY"`, and both of those strings are what the live HTML actually contains.

> **Caveat on the DB read.** The local `.env` `DATABASE_URL` is not the production database. The live hero image is `.../v1785830541/loom-hearth/homepage/bcftu8cscaavjmiksntt.jpg` while the row above holds `.../v1774377734/loom-hearth/homepage/mnxu9y8lxhsvdqmlzgep.jpg`. The **production** row must be dumped before step 1 below is executed. The structural conclusion is unaffected — the live `<h1>` alone proves the override runs in production.

### Layer 2 beats layer 1, proving a second independent override

The audit function sets the rugs category description to *"Hand-knotted rugs selected for pile density, construction depth, and weight underfoot."* (`lib/homepage/content.ts:88`). The live page renders:

```
Hand-knotted and flatwoven rugs, selected for pile density, construction, and weight underfoot.
```

That is `categoryCardCopy["category-rugs"].desktop` at `features/home/home-page-view.tsx:60-62`, applied at line 283 as `categoryCardCopy[card.id]?.desktop ?? card.description`. All five category ids are present in that map, so `card.description` — the field the owner edits — is **never** read on desktop or mobile.

### Layer 3 is visibly broken on the live site right now

Live HTML contains `Vintage Rugs photo pending`. The vintage category card has a `images.pexels.com` `src`; `getCloudinaryImage()` (`features/home/home-page-view.tsx:331-333`) returns `""` for it, so `HomePageView` falls through to `PlaceholderMedia` at line 272.

```ts
function getCloudinaryImage(src: string) {
  return src.startsWith("https://res.cloudinary.com/") ? src : "";
}
```

This filter is stricter than everything around it:

- `next.config.ts:5-18` already whitelists `res.cloudinary.com`, `images.pexels.com`, and `images.unsplash.com`
- save-time validation (`features/home/home-page-data.ts:990`) accepts `"/local/path"` and any `https://` URL
- the admin preview (`features/admin/admin-homepage-preview.tsx:179-190`) and the admin image editor (`features/admin/admin-homepage-editor.tsx:157-168`) both accept `/`, `http:`, `https:`, and `data:`

So after `3e4a460` ("allow local image paths in URL validation") the owner can save `/brand/hero.jpg`, see it in both admin panes, and get a grey placeholder on the live site. **`3e4a460` widened what saves without widening what renders.** This is the most user-visible of the four issues and the cheapest to fix.

### Why nobody noticed until now

`normalizeHomepageCopyAudit` was introduced 2026-03-30 in `5228ffd` *"fix: finalize homepage copy audit cleanup"* — the same day as the last successful write to the row above. The commit message reads as a one-time copy cleanup; there is no indication it was intended to run forever on every request. It was then edited eight more times as if it were the copy source of truth (`0dd3e37` 2026-04-20 added the Pexels featured-card URLs, `94dcef8` 2026-07-10 was the last).

`updatedAt` has not moved since 2026-03-30. Combined with the save-blocking validator bug fixed in `3e4a460`, the picture is: **no admin save has landed since the override was introduced**, so the override never had a real edit to destroy. Fixing the validator is what exposed it.

### Why the admin UI looks like it worked

`features/admin/admin-homepage-form.tsx:62`:

```ts
const [content, setContent] = useState(() => structuredClone(props.initialContent));
```

Seeded once. `useActionState` (lines 58-61) does not remount the component or re-run the server component's fetch, and there is no effect that re-syncs `content` after a successful save. Both the editor fields and the in-admin preview (line 210) read this local state. So post-save the admin shows the owner's typed values indefinitely; only a hard reload re-runs the pipeline and reverts them. That is the exact "admin says one thing, live says another" divergence.

## What actually sticks today

Read this as: *the owner can change it and it reaches the live site.*

### Persists and renders

- `hero.image` (src / alt / publicId) — **only if the src is a `res.cloudinary.com` URL**
- `hero.primaryCta.href`, `hero.secondaryCta.href` is overwritten but `primaryCta.href` survives (audit only sets `label` on primary, `label` + `href` on secondary — `content.ts:59-64`)
- `categories.cards[].title`, `.href`, `.visible`
- `categories.cards[].image` — **Cloudinary URLs only**
- `newsletter.inputLabel`
- `footer.introTitle`, all footer link groups and headings (`components/layout/site-footer.tsx`)
- `footer.visible`
- `sectionOrder` — stored, but `HomePageView` renders a fixed hardcoded order, so it has no effect

### Persists, then silently reverts on the next page load (layer 1)

Field | Overwritten at
--- | ---
`brand.logoImageUrl`, `brand.logoImageAlt`, `brand.tagline` | `content.ts:46-49`
`pageSeo.title`, `pageSeo.description` | `content.ts:51-53`
`hero.title`, `hero.eyebrow`, `hero.paragraph` | `content.ts:55-58`
`hero.primaryCta.label` | `content.ts:59`
`hero.secondaryCta.label`, `hero.secondaryCta.href` | `content.ts:60-64`
`hero.seo.seoTitle`, `hero.seo.metaDescription` | `content.ts:65-70`
`badges.items[].label` (all 4, by id) | `content.ts:72-78`
`categories.eyebrow`, `.title`, `.paragraph` | `content.ts:80-83`
`categories.cards[].description` (all 5, by id) | `content.ts:84-121`
`brandStory.eyebrow/title/paragraph/linkLabel` | `content.ts:123-127`
`designDirection.eyebrow/title/paragraph/linkLabel` | `content.ts:129-133`
`featured.eyebrow`, `.title`, `.paragraph` | `content.ts:135-138`
`featured.cards` — **entire array rebuilt**: `id`, `title`, `description`, `priceLabel`, `href`, `visible` for all 5 | `content.ts:139-209`
`featured.cards[].image.src` + `.alt` for `featured-rugs`, `featured-poufs`, `featured-pillows` | `content.ts:150-151`, `164-165`, `178-179` |
`guide.eyebrow`, `.title`, `.paragraph` | `content.ts:211-214`
`newsletter.eyebrow`, `.title`, `.paragraph`, `.inputPlaceholder`, `.ctaLabel` | `content.ts:216-221`
`faq.eyebrow`, `.title`, `.paragraph`, and 6 `faq.items[].question/answer` by id | `content.ts:223-283`
`footer.introBody`, `footer.introMeta` | `content.ts:285-287`

`featured-decor` and `featured-vintage` images are the only two that fall back to the stored value (`content.ts:190-193`, `204-207`) — confirmed, matching the earlier read.

Note that `categories.cards[].image` is **not** touched by the audit. Hero image is not touched either.

### Persists, survives layer 1, then gets discarded at render (layers 2 and 3)

- `categories.cards[].description` — even if layer 1 were removed, `categoryCardCopy` at `home-page-view.tsx:58-83` still wins (lines 283, 286)
- `hero.paragraph` on mobile — `heroParagraphMobile`, `home-page-view.tsx:21-22`, used at line 126
- `newsletter.title` on mobile — `newsletterTitleMobile`, line 56, used at line 317
- `brandStory.*` — the story section (lines 295-310) reads `aboutBridge.eyebrow` and the constants at lines 51-54; no `content.brandStory` field is read anywhere in the view
- any hero or category image that is not a `res.cloudinary.com` URL — layer 3

### Editable in admin, rendered nowhere

`badges`, `featured` (the whole section — the live "In the warehouse now" grid comes from `listHomepageFeaturedProductCards`, not from `content.featured`), `designDirection`, `guide`, `faq`, `proof`, `howItWorks`, and every section `visible` toggle except `footer.visible` and per-category-card `visible`.

`proof`, `howItWorks`, and `faq` do not even have an editor branch in `features/admin/admin-homepage-editor.tsx:75-82` — selecting them in the rail shows only a visibility toggle and SEO fields.

### Verdict on intent

**Nothing here is a deliberate lock.** Every overwritten field is rendered by `TextField` / `TextAreaField` in `admin-homepage-editor.tsx` with no `disabled`, no `readOnly`, no helper text saying "managed in code". `badges.items[].label` (line 92), `categories.cards[].description` (line 96), `featured.cards[].image` (line 106), `newsletter.*` (line 114), `footer.introBody`/`introMeta` (line 118) are all plain editable inputs. The audit function is a launch-copy migration that was never turned off. Delete it; do not build a lock UI around it.

## Remediation

The previous recommendation — backfill once, then delete the function — is still correct, but it is **step 1 of 4**, not the whole fix. Deleting `normalizeHomepageCopyAudit` alone would leave layers 2, 3, and 4 in place, and the owner's next complaint would be identical.

Order matters. The DB currently holds stale placeholder copy (`"we have been around for many decades"`). **Deleting the override before backfilling would push that copy live.**

---

### Step 1 — Backfill the launch copy into the database (no app code changes)

New throwaway script: `scripts/backfill-homepage-copy.mjs`, following the plain-ESM, no-build convention of `scripts/live-checkout-probe.mjs` and `scripts/seed-homepage-featured-products.mjs`.

What it does:

1. `PrismaClient` → `homepageContentRecord.findUnique({ where: { key: "homepage" } })`
2. **Write the untouched row to `docs/backup-homepage-content-<timestamp>.json` first.** Non-negotiable — this is the only rollback path.
3. Apply the exact transformations currently in `lib/homepage/content.ts:43-290`. Copy them verbatim; do not retype the strings.
4. Skip the `featured.cards[].image.src` overwrites at lines 150, 164, 178 — see the note below.
5. `homepageContentRecord.update({ where: { key: "homepage" }, data: { content } })`
6. Support `--dry-run` (default) printing a per-field before/after diff, and require an explicit `--apply` to write.

Run it against **production** `DATABASE_URL`, not the one in `.env`. Confirm afterwards that `updatedAt` has moved off `2026-03-30`.

On the three Pexels/Unsplash featured images: `content.featured` is not rendered on the live homepage at all, and those URLs would be filtered out by `getCloudinaryImage` even if it were. Persisting stock-photo URLs into the owner's editable content is worse than leaving whatever is there. Leave the stored images alone.

### Step 2 — Delete the override from the read path

`lib/homepage/content.ts`:

- delete `normalizeHomepageCopyAudit` entirely (lines 43-290)
- line 22: `content: normalizeHomepageCopyAudit(createDefaultHomePageContent())` → `content: createDefaultHomePageContent()`
- line 29: `content: normalizeHomepageCopyAudit(normalizeHomepageCloudinaryImages(sanitizeHomePageContent(record.content)))` → `content: normalizeHomepageCloudinaryImages(sanitizeHomePageContent(record.content))`

Keep `normalizeHomepageCloudinaryImages` (lines 291-329). It only rewrites `res.cloudinary.com/demo/image/upload/` placeholder URLs to real ones and is not a content override.

The file drops to roughly 90 lines. Verify: `grep -c normalizeHomepageCopyAudit lib/homepage/content.ts` returns 0, then `npm run typecheck`.

**Do not merge steps 1 and 2 in the same deploy.** Deploy step 2 only after confirming the production row is backfilled, or the window between them serves placeholder copy.

### Step 3 — Fix the image filter (do this first if shipping incrementally)

`features/home/home-page-view.tsx:331-333`. Replace `getCloudinaryImage` with a permissive check matching what validation and `next.config.ts` already allow:

```ts
function getRenderableImage(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  return src.startsWith("https://") ? src : "";
}
```

Update both call sites: line 116 (`heroImage`) and line 258 (category card `imageSrc`). Keep returning `""` for empty/invalid so the `PlaceholderMedia` fallback still works for genuinely unset images.

Constraint: `next/image` with `remotePatterns` will throw at runtime on an unconfigured host. `next.config.ts:5-18` covers cloudinary, pexels, and unsplash. Either (a) accept that the owner should only ever paste those hosts or upload through the Cloudinary flow — the admin upload button always produces a Cloudinary URL — or (b) add `unoptimized` handling / a host allowlist check. Recommended: keep the allowlist implicit and mirror `remotePatterns` in a small shared helper so the two cannot drift, since drifting is exactly what caused this bug.

This step alone fixes the currently-visible "Vintage Rugs photo pending" on production.

### Step 4 — Remove the view-level copy constants

`features/home/home-page-view.tsx`. For each, delete the constant and read the content field:

| Delete | Then |
| --- | --- |
| `heroParagraphMobile` (21-22) | line 126 → `{content.hero.paragraph}`; the desktop/mobile split becomes a single `<p>` unless the owner is given a real mobile-copy field |
| `categoryCardCopy` (58-83) | lines 283 and 286 → `{card.description}` |
| `newsletterTitleMobile` (56) | line 317 → `{content.newsletter.title}` |
| `storyBodyDesktop` / `storyBodyMobile` (51-54) and the hardcoded `<h2>` (298) | lines 297-300 → `content.brandStory.eyebrow` / `.title` / `.paragraph` |
| `founderNoteDesktop` / `founderNoteMobile` (24-26) | see below |
| `howItWorksSteps` (28-49) | see below |

Before doing this, **confirm with the owner that the strings currently on the live site are the ones they want**, then make sure step 1's backfill wrote exactly those strings — otherwise step 4 changes live copy. Where the audit string and the view string disagree (the category descriptions being the clear case), **the view string is what is live today and is therefore the one to persist**. Amend the step 1 script accordingly: for `categories.cards[].description`, seed from `categoryCardCopy[id].desktop`, not from `content.ts:88-118`.

The desktop/mobile copy pairs are a real product question, not just a refactor. Two honest options:

- **Simple:** drop the mobile variants, render one string from the DB, let CSS handle the layout. Fewest moving parts, and the owner gets one field that does what it says.
- **Complete:** extend `HomePageContent` with optional `paragraphMobile` / `titleMobile` fields, expose them in the admin editor, and fall back to the desktop value when blank. More work, but preserves the current mobile-tuned copy under owner control.

`founderNoteDesktop`, `howItWorksSteps`, and the inventory chips (93-99) are sections that have **no** corresponding content model at all. They are out of scope for this fix. Either leave them as code-owned and say so, or add them to `HomePageContent` in follow-up work — but do not half-wire them.

### Step 5 — Re-sync the admin form after save

`features/admin/admin-homepage-form.tsx`. After steps 1-4 the round trip is honest, but the form still shows local state indefinitely after a save, which means the owner cannot tell a successful save from a rejected one by looking at the fields.

Minimal fix: after `actionState.status === "success"`, call `router.refresh()` and re-seed `content` from the refreshed `initialContent`.

```ts
const router = useRouter();
useEffect(() => {
  if (actionState.status === "success") router.refresh();
}, [actionState, router]);
useEffect(() => {
  setContent(structuredClone(props.initialContent));
}, [props.initialContent]);
```

The second effect must not clobber in-flight edits — gate it on the save having completed, or key the form on `updatedAt` from the server. The route is already `force-dynamic` (`app/(admin)/admin/homepage/page.tsx`) and `getHomepageContentState` calls `noStore()`, so `router.refresh()` genuinely re-reads the DB.

### Step 6 — Prune or wire the dead admin sections

Decide per section. Do not leave editable inputs for things that render nowhere — that is the same class of bug as the override, just quieter.

- **Remove from the admin rail:** `proof`, `howItWorks`, `faq` (no editor branch exists anyway — `admin-homepage-editor.tsx:75-82`), and `featured` (superseded by the live product grid from `listHomepageFeaturedProductCards`). Drop them from `homepageSectionKeys` / `homepageSectionOrderKeys` at `features/home/home-page-data.ts:3-16`, or mark them clearly as inactive in `homepageSectionDefinitions`.
- **Wire up:** `badges` and `designDirection` if those sections are wanted back on the page; otherwise remove them too.
- **`sectionOrder`:** either make `HomePageView` render sections in the stored order, or remove the reorder UI (`admin-homepage-form.tsx:195-199`). Today it is pure theatre.
- **Section `visible` toggles:** `HomePageView` checks only `card.visible` (line 104) and the hero CTA flags (line 117). Either honour `content.<section>.visible` in the view or remove the toggles.

## Ruled out

**Caching.** Not a factor.

- `getHomepageContentState` calls `noStore()` (`lib/homepage/content.ts:16`)
- `app/(admin)/admin/homepage/page.tsx` sets `export const dynamic = "force-dynamic"`
- `updateAdminHomepageAction` calls `revalidatePath("/", "layout")`, `revalidatePath("/")`, and `revalidatePath("/admin/homepage")` (`app/(admin)/admin/homepage/actions.ts:38-40`)
- `grep -rn 'unstable_cache' lib app features` → no matches
- no `fetch` cache configuration in this path

The divergence is deterministic, not stale.

**Save-path corruption.** `updateAdminHomepageAction` serialises the full content object through a single hidden `contentJson` input (`admin-homepage-form.tsx:170`) and `parseHomepageContentFormData` JSON-parses it whole (`actions.ts:48-57`). No field-by-field reconstruction, no lossy path. The DB row confirms saves land intact when validation passes.

## Separate issue: the admin preview is not the homepage

`features/admin/admin-homepage-preview.tsx` is a **bespoke schematic**, not `features/home/home-page-view.tsx`. It renders its own `PreviewSection` / `PreviewChip` / `PreviewHeadline` / `PreviewCard` primitives styled from `admin.module.css`, with "Edit section" buttons and click-to-jump targets on every element.

It also shows sections the live page does not render at all (badges at line 33, the brandStory/designDirection pair at line 59, featured cards at line 66, guide at line 84) — so even with every override removed, the admin preview would still show a page the visitor never sees.

**This is a legitimate design choice, not a bug.** It is a click-to-edit navigation map, and rebuilding it on top of `HomePageView` would mean threading click targets through the public component — a bad trade.

The honest fix is labelling, not rearchitecting:

1. Change the panel heading at `admin-homepage-form.tsx:209` from "Check live preview" to something like **"Section map — click any element to edit it"**, and drop the `Preview: local live state` status pill at line 182 which actively implies fidelity.
2. After step 6, stop rendering preview sections for content that does not appear on the live homepage.
3. Add a plain `View live homepage ↗` link next to the save button so the owner has a real verification path.

Do this **after** steps 1-4. Until the overrides are gone, "view live" would just confuse the owner further.

## Recommended order

1. **Step 3** (image filter) — independent, small, fixes a placeholder visible on production right now
2. **Step 1** (backfill, `--dry-run` first, production DB, JSON backup retained)
3. **Step 2** (delete the override) — separate deploy, only after the backfill is confirmed
4. **Step 5** (admin re-sync) — makes the round trip verifiable, which is what lets the owner confirm 1-3 worked
5. **Step 4** (view constants) — needs the owner's sign-off on which copy is canonical
6. **Step 6** and the preview labelling — cleanup

Steps 1 and 2 must not ship together.

## Verification

After each step, and all of these before calling it done:

- [ ] `npm run typecheck` and `npm run lint` pass
- [ ] `grep -rn 'normalizeHomepageCopyAudit' .` returns nothing outside `docs/` and the backfill script
- [ ] Production `HomepageContentRecord.updatedAt` is no longer `2026-03-30`
- [ ] Change `hero.title` in `/admin/homepage`, save, **hard-reload the admin page** — the new title is still there
- [ ] The same new title appears on `/` in a fresh private window
- [ ] Paste a non-Cloudinary `https://` image URL into a category card, save — it renders on `/`, not a placeholder
- [ ] Upload an image through the Cloudinary button, save, reload — it renders on `/`
- [ ] `Vintage Rugs photo pending` is gone from the live HTML
- [ ] The backup JSON from step 1 is retained somewhere durable until the owner has confirmed the live page reads correctly

## Files touched

| File | Change |
| --- | --- |
| `lib/homepage/content.ts` | delete lines 43-290; simplify lines 22 and 29 |
| `features/home/home-page-view.tsx` | replace `getCloudinaryImage` (331-333); delete copy constants (21-26, 28-49, 51-56, 58-83); update call sites 116, 126, 258, 283, 286, 297-300, 317 |
| `features/admin/admin-homepage-form.tsx` | post-save `router.refresh()` + re-seed (near line 62); relabel preview panel (182, 209); possibly remove reorder UI (195-199) |
| `features/admin/admin-homepage-editor.tsx` | only if step 6 prunes sections |
| `features/home/home-page-data.ts` | only if step 6 prunes `homepageSectionKeys` (lines 3-16) |
| `scripts/backfill-homepage-copy.mjs` | **new**, throwaway, delete after it has run successfully in production |

No new dependencies. No schema migration — `HomepageContentRecord.content` is already `Json`.
