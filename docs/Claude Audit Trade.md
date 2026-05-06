I now have a thorough picture of the page. Let me compile the full audit.

---

# Trade Page UI/UX Audit loomandhearthstudio.com/trade

---

## 🔴 Critical Bugs

### 1. Navigation font too small (11px)
All nav links SHOP, LOOKBOOK, STORY, TRADE, ACCOUNT render at **11px**. WCAG 2.1 requires a minimum of 14px for UI controls; 16px is the web standard. A designer squinting at your nav is already a bad first impression.

**Fix:** Set nav link font-size to at least `14px` (ideally `15–16px`).

### 2. Announcement bar text too small (10.24px)
"COLOUR VERIFIED BEFORE PAYMENT IS CAPTURED / FREE SHIPPING..." renders at **10.24px** essentially unreadable without zooming. This is also your only persistent trust signal that appears sitewide.

**Fix:** Minimum `12px`, ideally `13–14px` for small-caps/uppercase text.

### 3. Right column text getting clipped on scroll
During the "What you receive / Project Holds" two-column section, the right column text (`"The studio confirms hold timing based on the item, destination market..."`) is cut off at the viewport edge, indicating a horizontal overflow or fixed-width issue in the layout grid at certain scroll positions.

**Fix:** Audit the two-column CSS grid for `overflow: hidden` on the parent or missing `min-width: 0` on flex/grid children.

---

## 🟠 Conversion / UX Issues

### 4. The actual discount percentage is never stated anywhere
This is the **#1 conversion problem** on the page. Interior designers land here and read:
- "Professional pricing on active inventory"
- "Trade pricing across rugs, poufs, pillows"
- "Professional discount"

but the actual percentage is never revealed. Competitors typically state 10–30% clearly. Designers need to justify a trade account to their business. "Professional pricing" doesn't help them make that case.

**Fix:** State the discount tier upfront in the hero. Even a range ("typically 15–20% off listed prices") converts far better than vague language.

### 5. Primary CTA navigates away to a generic contact page
"Start a trade inquiry" sends the user to `/contact?inquiryType=trade-request` a generic "Get in touch" page. The heading doesn't change, the intro copy says "Tell us what you're looking for," and the inquiry type is just a pre-selected tab. This breaks the trade-specific context the page worked hard to build.

**Fix:** Either embed the trade inquiry form directly on the trade page (below the hero or at the bottom), or route to a dedicated `/trade/apply` page with trade-specific heading and copy.

### 6. "REVIEW SOURCING FRAMEWORK" link is visually confusing
This text sits below the CTAs as a small all-caps label with no arrow, no underline, and no visual affordance that it's clickable. It's unclear whether it scrolls down the page, opens a document, or goes somewhere else entirely.

**Fix:** Add a `↓` arrow if it anchors down, or make it look like a proper text link with underline on hover and a brief parenthetical like "(scroll to see the workflow)".

### 7. No social proof or designer testimonials
The entire page is claims-based. Interior designers are skeptical buyers who trust peer opinions. There are no testimonials, no project names, no "used by designers at [type of studio]."

**Fix:** Add 2–3 short quotes from designers who've used the trade program, ideally with company name (e.g., "Exactly what I needed for a client presentation — Mariam A., residential designer, Dubai").

### 8. No eligibility criteria
Who qualifies? Interior designers? Architects? Stylists? Hospitality? Anyone? The page never says. This creates uncertainty — a designer might not enquire because they're unsure they qualify.

**Fix:** Add a one-line eligibility note: "Open to interior designers, architects, stylists, and trade professionals. No formal registration required — just introduce yourself."

### 9. No sticky CTA on scroll
The page is long and the only CTAs are in the hero. As the user reads through "What Trade Includes," "Support," "Categories," and the "Workflow" there's no repeat CTA anywhere until they've left the page.

**Fix:** Add a sticky bottom bar on scroll (after ~500px) with "Start a trade inquiry", or repeat the primary CTA at the end of the page above the footer.

### 10. Hold duration is never specified
"Project holds: Available during client review" is mentioned in the hero sidebar and again in the body but no duration is given. How long? 48 hours? A week? This is a key selling point that's undermined by vagueness.

**Fix:** State the hold window clearly: "Complimentary holds for up to 5 business days while your client reviews."

---

## 🟡 Visual Design Issues

### 11. Zero product photography on the entire page
The trade page has **one image** (the logo). Interior designers are visual professionals they respond to beautiful imagery of the actual rugs they'd be sourcing. A page full of text cards is the wrong format for this audience.

**Fix:** Add a single full-width hero image or a 2–3 image editorial strip showing rugs in designed spaces. Even a mood board treatment would work.

### 12. Category chips (Rugs, Vintage rugs, Poufs) look clickable but aren't
In the right hero sidebar, these pill-shaped tags have borders and look like interactive filters, but clicking them does nothing. This is a false affordance.

**Fix:** Either link them to their respective shop categories or restyle them as non-interactive labels (e.g., plain text with a dash or bullet separator).

### 13. Significant content repetition across sections weakens the page
The same three benefits exact-piece review, project holds, direct studio contact appear in:
- The hero bullet list
- The right sidebar card
- The "What Trade Includes" section
- The "What You Receive" section
- The "Categories Available for Trade" section

This makes the page feel padded rather than progressive. Each section should add new information, not restate the same three points.

**Fix:** Restructure so each section earns its place: hero = hook & top benefits; middle = specifics (hold timing, imagery process); bottom = workflow steps + CTA.

### 14. "TRADE PROGRAM / PROFESSIONAL DISCOUNT / DEDICATED CONTACT" eyebrow is cluttered
Using slashes to cram three separate value propositions into one eyebrow label looks like a breadcrumb path and is easy to skim past. It's trying to say too much in too small a space.

**Fix:** Pick one strong eyebrow label ("Interior Design Trade Program") and move the other benefits into the bullet list below.

### 15. No visual differentiation between section cards
Every section uses the same rounded beige card with the same typography treatment. There's no visual rhythm or contrast to guide the eye down the page.

**Fix:** Vary the card treatment a darker background for one section, a full-bleed image for another, an alternating layout. Give the eye something different to land on.

---

## 🔵 Accessibility Issues

| Element | Current Size | Minimum Recommended |
|---|---|---|
| Announcement bar text | 10.24px | 13px |
| Navigation links | 11px | 14px |
| Tagline "Handcrafted Moroccan rugs" | 11.52px | 14px |
| Eyebrow labels | 12px | 12px (acceptable for uppercase tracking) |
| Body text | 16px | passes |

**No images on the trade page other than the logo** — no opportunity to audit alt text for content images, but the logo does have a proper alt attribute.

---

## 🟢 What's Working Well

- **The H1 headline is excellent.** "Trade pricing and project support for interior designers" is clear, specific, and keyword-rich.
- **The terracotta CTA button** has strong visual contrast and is immediately readable.
- **The two-card right sidebar** (quick stats + trade support summary) is a smart use of the hero space.
- **The 3-step workflow** is a clean, confidence-building closer.
- **The contact form** pre-selects "Trade / project" tab the routing works correctly.
- **Brand voice** throughout is sophisticated and well-suited to the target audience.
- **WhatsApp contact option** on the inquiry page is a strong trust signal for international designers.

---

## Priority Fix List

| Priority | Fix |
|---|---|
| 🔴 P0 | State the actual trade discount % in the hero |
| 🔴 P0 | Increase nav and announcement bar font sizes |
| 🔴 P1 | Embed or dedicate the trade inquiry form (don't route to generic contact page) |
| 🟠 P1 | Add at least one product/lifestyle image |
| 🟠 P1 | Add a sticky CTA or repeat CTA at bottom of page |
| 🟠 P1 | Add eligibility criteria and specify hold duration |
| 🟡 P2 | Fix the category chips (link them or restyle as non-interactive) |
| 🟡 P2 | Add 2–3 designer testimonials |
| 🟡 P2 | Reduce content repetition restructure sections to be progressive |
| 🟡 P2 | Fix right column overflow/clipping in the two-column sections |
| 🔵 P3 | Add visual variety between section cards |
| 🔵 P3 | Clarify the "REVIEW SOURCING FRAMEWORK" link affordance |
