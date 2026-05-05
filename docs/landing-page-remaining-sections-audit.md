# Landing Page Audit: Remaining Sections

Date: 2026-04-28  
Scope: proof, customer reviews, how-it-works, narrative cards, guide, FAQ, newsletter on `/`

## Direction

Problem: after the first three sections, the page explains the business clearly but the visual rhythm collapses into repeated cards and repeated copy structures, so the lower half becomes informative without feeling intentionally paced.

Chosen anchor: `Organic`, same as the first audit. The lower sections should deepen that system through alternating density, darker material contrast, and more editorial sequencing. They should not drift into generic “content blocks under the fold”.

Differentiator: the back half of the homepage should move like an editorial proof deck, not a CMS stack. That means each section needs a different job and a visibly different composition: proof, process, story, education, objection handling, conversion.

Skill synthesis:
- `frontend-design`: keep a single anchor and stop the repeated-card drift.
- `frontend-design-pro`: remove generic section treatment and tighten visual hierarchy.
- `web-artifacts-builder`: frame fixes as implementation-ready component changes.
- `web-design-guidelines`: findings below include interaction, focus, copy, and form issues.
- `webconsulting-branding`: borrow the discipline around focus states and spacing consistency, not the teal/cyan visual language.

## Findings

### Critical

- [components/analytics/newsletter-signup-intent-form.tsx](/home/hp/loom-hearth-studio/components/analytics/newsletter-signup-intent-form.tsx:42): the newsletter input lacks `autocomplete="email"`. This is a direct form-guideline miss on a primary conversion surface.
- [components/analytics/newsletter-signup-intent-form.tsx](/home/hp/loom-hearth-studio/components/analytics/newsletter-signup-intent-form.tsx:42): the email field also lacks `spellCheck={false}` and `autoCapitalize="none"`, which is avoidable friction for email entry.
- [components/analytics/newsletter-signup-intent-form.tsx](/home/hp/loom-hearth-studio/components/analytics/newsletter-signup-intent-form.tsx:77): `"Joining..."` uses three periods instead of an ellipsis. This is minor by itself, but it is a direct guideline failure on the only async label in the section.

### High

- [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:272): the proof section combines two separate jobs inside one dark panel: business proof and rotating testimonial. The result is conceptually dense and visually top-heavy.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:477): the proof section is laid out as intro-left, everything-else-right. That makes the left column feel underfilled while the right column carries both proof cards and the review module.
- [components/reviews/customer-review-carousel.tsx](/home/hp/loom-hearth-studio/components/reviews/customer-review-carousel.tsx:92): the carousel controls are functionally accessible, but the component has no explicit pause affordance and depends on hover/focus pause. On touch devices the auto-rotation remains effectively implicit.
- [components/reviews/customer-review-carousel.module.css](/home/hp/loom-hearth-studio/components/reviews/customer-review-carousel.module.css:119): dot controls are visually tiny, which weakens touch usability and makes the state control feel decorative rather than intentional.
- [features/home/how-it-works-section.tsx](/home/hp/loom-hearth-studio/features/home/how-it-works-section.tsx:45): each step compresses number and title into one uppercase paragraph. That reduces scan quality and makes the process feel like legal instruction rather than a calm buying flow.
- [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:116): the two narrative cards are content-rich but visually interchangeable. They read as repeated CMS cards rather than a deliberate “who we are / how we choose” pair.

### Medium

- [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:158): `READ THE FULL GUIDE` is generic CTA copy. The section would be stronger with a label that states the content payoff.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:835): the guide section uses the same soft panel grammar as adjacent sections, so the educational block lacks a distinct editorial role.
- [features/home/home-page-view.tsx](/home/hp/loom-hearth-studio/features/home/home-page-view.tsx:193): the FAQ opens the first item by default but otherwise behaves like a plain accordion with no prioritization. It handles objections, but it does not feel curated.
- [features/home/home-page.module.css](/home/hp/loom-hearth-studio/features/home/home-page.module.css:983): the FAQ summary has no custom `:focus-visible` styling. It likely inherits native behavior, but the section’s bespoke styling stops short of intentional keyboard affordance.
- [components/reviews/customer-review-carousel.module.css](/home/hp/loom-hearth-studio/components/reviews/customer-review-carousel.module.css:70): the review metadata is all-caps and compressed into a single string. It feels more like inventory tagging than social proof.
- [components/analytics/newsletter-signup-intent-form.tsx](/home/hp/loom-hearth-studio/components/analytics/newsletter-signup-intent-form.tsx:47): the placeholder content is not a good pattern hint. For this field, a concrete example email is more useful than a repeated label.

## Best Fixes

### 1. Proof + Reviews

This should become two beats, not one overloaded slab.

- Keep the dark proof section, but make it purely about sourcing and buying confidence.
- Move customer reviews into a separate adjacent or immediately following surface with lighter contrast.
- Restructure proof into:
  - short intro
  - one dominant proof statement
  - three supporting proof cards
- Rework the carousel controls:
  - larger dot hit targets
  - visible active-state emphasis
  - optional explicit pause button on mobile
- Break the metadata string into separate pieces visually instead of `NAME - COUNTRY - TYPE`.

### 2. How It Works

The content is strong; the information design is not.

- Split each step into:
  - small step number
  - real step heading
  - body copy
- Reduce the legal-explanatory density in the section intro. It should explain the trust mechanism, not repeat every lighting condition before the steps start.
- Keep the mobile timeline treatment, but make desktop feel less like three equal cards and more like a guided progression.
- Rename the CTA to something more specific than `INQUIRE ABOUT A PIECE`.

Better CTA direction:

> Ask About a Specific Rug

### 3. Narrative Pair

These sections should feel like editorial contrast, not twin cards.

- Give `WHO WE ARE` and `DESIGN DIRECTION` different weight:
  - brand story card larger and more grounded
  - design-direction card narrower, sharper, more criteria-led
- Introduce one visual differentiator:
  - a quote line
  - a sourcing note
  - a material checklist
- Preserve the Organic anchor, but reduce the “same container, same padding, same card, same rhythm” effect.

### 4. Guide

This section currently reads as SEO-supporting content, and it looks like it.

- Reframe it as an educational editorial spread:
  - stronger title
  - shorter body
  - a three-point “what to look for” list
- Change the CTA from generic guide language to specific outcome language.

Better CTA direction:

> Learn How to Judge Knot Density

or

> Read the Rug Buying Guide

- Consider using a tighter crop or more diagrammatic image rather than another ambient lifestyle photo.

### 5. FAQ

This section needs stronger curation and calmer interaction design.

- Group the questions by buyer intent:
  - exact piece
  - color accuracy
  - shipping and pricing
  - irregularities and returns
- Keep one default-open item, but choose the most trust-critical one and visually anchor it.
- Add explicit `summary:focus-visible` styling so keyboard interaction feels designed, not incidental.
- Tighten the panel copy lengths so answers do not all feel equally long and equally weighted.

### 6. Newsletter

This is the final conversion ask, so it should feel more decisive.

- Fix the form mechanics first:
  - `autocomplete="email"`
  - `spellCheck={false}`
  - `autoCapitalize="none"`
  - `"Joining…"` with a real ellipsis
- Upgrade the field placeholder to an example pattern, not a label echo.
- Reduce the amount of equal-weight copy in the section intro. Lead with the free guide or lead with first access, not both at the same volume.
- Visually separate the form box from the editorial copy so the action remains obvious on desktop.

## Implementation Priorities

1. Fix newsletter form attributes and async copy in [components/analytics/newsletter-signup-intent-form.tsx](/home/hp/loom-hearth-studio/components/analytics/newsletter-signup-intent-form.tsx:22).
2. Separate proof and reviews into distinct visual beats.
3. Rework the how-it-works cards into proper number / heading / body structure.
4. Redesign the narrative pair so the two cards stop competing as equals.
5. Add deliberate focus styling for FAQ summaries and improve carousel touch affordance.

## What Not To Do

- Do not keep stacking more identical cream cards below the fold.
- Do not solve the proof-section density problem by only trimming copy.
- Do not leave the newsletter form as a generic email field plus generic CTA.
- Do not let the guide section remain an obviously SEO-shaped block with a decorative lifestyle image.
