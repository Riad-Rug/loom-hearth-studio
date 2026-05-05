# Landing Page Audit: Hero Section Only

Date: 2026-05-01  
Scope: first section after the header on `/` only  
Method: live inspection in Chrome DevTools, viewport screenshot, current implementation review in [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:24) and [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:6)

## Direction

Problem: the hero copy is strong, but the image stack currently reads like three unrelated cards dropped into one container rather than one composed visual argument.

Chosen anchor: `Organic`, same as the broader homepage. This section should feel tactile, editorial, and materially grounded. It should not drift into generic lifestyle collage or SaaS-card composition.

Reason for that choice over the safe alternative: the safe fix would be “clean up the overlap and keep the gallery.” The better fix is to make the image treatment serve the trust promise, not just decorate it.

Differentiator: the hero should show one dominant proof image and one supporting verification image, with the second image behaving like evidence rather than a decorative sticker.

Skill synthesis:
- `frontend-design`: keep the hero inside one anchor and judge the image stack for token fidelity, not just neatness.
- `frontend-design-pro`: evaluate whether the images feel art-directed or accidentally assembled.
- `web-design-guidelines`: preserve accessibility, sizing discipline, and focus-state quality while changing the visual composition.
- `webconsulting-branding`: borrow its interaction rigor and clarity standards only, not its palette or hero gradient system.

## Findings

### Critical

- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:148): the hero media container is presented as a single framed surface, but the three internal images are not visually related enough to read as one composition. The dominant rug/living-room image, the lower-left pillow crop, and the lower-right souk/interior shot come from different narrative categories, so the stack feels arbitrary rather than intentional.
- [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:49): `getHeroGalleryImages()` pulls category images by priority rather than by compositional role. That makes the hero vulnerable to a mismatched story set: room scene, product textile crop, and architectural market image can all appear together even when they do not support the same promise.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:169): the primary image is cropped as a generic interior lifestyle shot, but the headline promise is exact-piece verification. The largest image should show material evidence more clearly than it currently does. Right now the rug is present, but not dominant enough to carry the verification message.

### High

- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:174): both supporting images are pinned to the lower edge like decorative badges. They read as pasted-on cards, not secondary frames in an editorial sequence.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:161): all three frames share the same border radius, border treatment, and shadow recipe. That flattening makes the collage feel templated. The section needs hierarchy between the lead image and the evidence image.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:154): the hero media box is tall and visually quiet, but the two smaller cards consume the lower corners, creating dead center mass and edge clutter at the same time. The eye does not land cleanly.
- [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:51): the alt texts confirm the narrative mismatch. One image is a room scene, another is pillows in sunlight, another is a vintage-rug showroom. That is too many stories for a single trust-first hero.

### Medium

- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:155): the media background gradient plus the surrounding hero gradient create a washed cream-on-cream effect behind the image stack. The frames do not separate sharply enough from the canvas.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:184): the third image is a narrow vertical crop with strong architecture and orange detail, which visually overpowers the lower-right corner. It steals attention from the CTA row rather than supporting it.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:191): the images scale slightly, but there is no stronger compositional motion or relationship between them. The section suggests collage without fully committing to a believable editorial stack.

## Best Fixes

### 1. Reduce the Story Count

Use two images, not three.

- Lead image: one room scene where the rug occupies more of the frame and reads immediately as the piece being evaluated.
- Support image: one tighter material or light-condition proof shot.
- Remove the third image entirely unless it serves the same rug and the same verification narrative.

Best principle: one hero image should establish desire, one image should establish proof.

### 2. Change the Composition Logic

The current stack behaves like a collage of equal-status cards. It should become a lead-plus-evidence composition.

- Keep one large dominant frame.
- Reposition one smaller frame so it overlaps the lead image with intent, closer to an annotation or evidence slip.
- Avoid two small cards sitting symmetrically on the bottom edge.
- Give the secondary frame a different radius or lighter shadow so it reads as a supporting layer, not a duplicate component.

### 3. Match the Images to the Promise

The hero copy sells exact-piece confirmation before payment. The imagery should show that.

- Prefer one rug-forward room image where the rug pattern, scale, and field are legible.
- Prefer one close-up or alternate-light image that implies verification.
- Do not mix pillows, decor, and bazaar architecture into the hero if the headline is about rug verification.

### 4. Increase Visual Separation

- Reduce the cream haze behind the hero media surface.
- Darken or sharpen the inner media frame edge slightly so the lead image holds its own.
- Let the dominant image breathe with more uninterrupted area; do not trap it between equal corner inserts.

## Recommended Structural Direction

Best composition for this page:

> One dominant rug-in-room image.  
> One smaller supporting verification crop partially overlapping the lower edge.  
> No third decorative image.

If a third visual is required later, it should come from the same piece and the same proof narrative, not from a different category.

## Implementation Priorities

1. Replace the current three-image gallery logic with a hero-specific curated pair.
2. Rework the frame positioning so the second image behaves like evidence, not a sticker.
3. Tighten the lead image crop so the rug itself carries more of the visual weight.
4. Reduce the cream-on-cream background haze around the media container.

## What Not To Do

- Do not keep the current three-image mix and only tweak spacing.
- Do not solve this by making the cards smaller; the problem is narrative mismatch, not just scale.
- Do not add more overlap or more shadow without reducing the number of competing images.
- Do not let the hero pull imagery from unrelated categories if the headline is specifically about rug verification.
