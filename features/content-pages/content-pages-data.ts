import type { FaqItem, PolicyPage, Testimonial } from "@/types/domain";
import { publicBusinessDetails } from "@/config/public-business-details";

type AboutSection = {
  eyebrow: string;
  title: string;
  body: string;
};

type LookbookItem = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export const aboutHero = {
  eyebrow: "About",
  title: "A direct source for handcrafted Moroccan rugs, poufs, pillows, and home decor.",
  body: `Loom & Hearth Studio is built on real roots in Marrakech, where our family has worked in the bazaar trade for decades. Our grandfather's shop in the Semmarine souk, steps from Jemaa el-Fnaa, was known for handcrafted pieces sourced across Morocco.

Today, we continue that work with a more focused scope \u2014 selecting hand-knotted Moroccan rugs, turning some into one of one poufs and pillows, and adding a small selection of supporting decor.

Every piece is chosen in person. Nothing is mass-produced. Nothing comes from an export catalogue assembled for foreign buyers. You are getting the rug the weaver made \u2014 not a category managed by a middleman.

We source directly through the family bazaar. Not through cooperatives. That is what makes the difference in what you receive.`,
} as const;

export const aboutSections: AboutSection[] = [
  {
    eyebrow: "Craft",
    title: "Built on material knowledge and direct selection.",
    body:
      "We select based on construction and fibre quality \u2014 not trends. For rugs, that means checking pile density by weight and feel, examining the back for knot structure, and assessing warp tension. Many pieces are one of one. Even repeatable designs remain handmade \u2014 no two are exactly alike.\n\nOur poufs and pillows are often made from rugs or rug material, which means they carry the same fibre, weave structure, and colour as the source piece.",
  },
  {
    eyebrow: "Direction",
    title: "A focused collection. Not a marketplace.",
    body: `Loom & Hearth Studio is not a marketplace. We do not list everything we encounter. The collection stays deliberately narrow \u2014 hand-knotted rugs, rug-based poufs, pillows, and a small selection of supporting decor.

The criterion is simple: does this piece hold up on its own, in a room, without explanation?`,
  },
] as const;

export const aboutBridge = {
  eyebrow: "How we source",
  title: "Selected in person, not pulled from a catalog.",
  body:
    "We work directly across Morocco \u2014 primarily through the family bazaar in Marrakech \u2014 to source rugs, rug-made poufs, pillows, and supporting decor. Every piece is assessed in person for construction, fibre quality, and condition before it enters the collection.",
} as const;

export const contactData = {
  eyebrow: "Contact",
  title: "Contact Loom & Hearth Studio",
  body:
    "Questions about a specific piece, your order, or a sourcing request? We review every message personally. If you are asking about a rug, include the product name and your room dimensions \u2014 it helps us respond with something specific.\n\nEvery rug inquiry includes a video of the actual piece before payment is taken.",
  formTitle: "SEND AN INQUIRY",
  formBody:
    "Include the product name and your room dimensions if relevant. We respond within 24 hours.",
  ctaLabel: "SEND MESSAGE",
  supportTitle: "Studio support",
  supportBody:
    "Reach us directly for the fastest response. Public trader and legal contact details are below.",
  reassuranceLabel: "Support note",
  reassuranceText:
    "Every inquiry about a rug includes a video of the actual piece before payment is taken. Include the product name and your room dimensions if you have them \u2014 it helps us respond with something useful.",
  responseTimeLabel: "Response timing",
  responseTimeText: "Within 24 hours",
  legalNameLabel: publicBusinessDetails.legalName,
  addressLabel: publicBusinessDetails.address,
  emailLabel: publicBusinessDetails.email,
  complaintsLabel: publicBusinessDetails.complaintsLine,
  hoursLabel: "Monday to Friday, 9am \u2013 6pm CET (GMT+1)",
  locationLabel: "Morocco sourcing studio - U.S. launch market",
} as const;

export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    group: "Ordering",
    question: "Can I see the rug before I pay?",
    answer:
      "Yes. Before your payment is captured, we send you a video of the actual piece \u2014 texture, colour in natural light, and size in context. If it is not right for your space, your payment is released. No charge. This applies to every rug order.",
    sortOrder: 1,
  },
  {
    id: "faq-2",
    group: "Ordering",
    question: "Can you reserve a piece for me?",
    answer:
      "Account holders can request a short hold while reviewing a piece. For longer holds, contact us directly \u2014 we handle these case by case.",
    sortOrder: 2,
  },
  {
    id: "faq-3",
    group: "Ordering",
    question: "Are the rugs really one of one?",
    answer:
      "Every rug in this collection is a unique piece. When it sells, it does not come back. The photographs in each listing show the exact rug you will receive \u2014 not a representative sample of the style.",
    sortOrder: 3,
  },
  {
    id: "faq-4",
    group: "Ordering",
    question: "How do I know the rug is genuinely hand-knotted?",
    answer:
      "Look at the back. On a hand-knotted rug, the knot structure is visible on the reverse \u2014 individual knots, slightly irregular, tied into the warp threads. Machine-made and tufted rugs have a smooth or latex-backed reverse. We photograph the back of every rug in the listing, and you can verify this in the pre-shipment video.",
    sortOrder: 4,
  },
  {
    id: "faq-5",
    group: "Ordering",
    question: "Do you offer samples?",
    answer:
      "No. The pieces in this collection are one of one \u2014 there is no sample stock. What we offer instead is a pre-shipment video of the actual piece in natural light before your payment is captured. This gives you the most accurate read of colour, pile depth, and size before committing.",
    sortOrder: 5,
  },
  {
    id: "faq-6",
    group: "Products",
    question: "Does the rug shed?",
    answer:
      "New wool pile rugs shed in the first weeks of use. This is normal. Loose fibres from the weaving process work their way out during the break-in period. Vacuum on low suction without a beater brush. Shedding reduces significantly within the first month and stops. Flatweave kilims do not shed.",
    sortOrder: 6,
  },
  {
    id: "faq-7",
    group: "Products",
    question: "What is abrash?",
    answer:
      "Abrash is colour variation across the field of a rug \u2014 horizontal shifts in tone where the weaver used wool from more than one dye batch. In natural undyed rugs like Beni Ourain, it reflects variation in the wool's natural colour across different fleeces. In vintage rugs, it reflects how natural dye has interacted with light and use over time. It is not a defect. It is a visible record of handmade construction.",
    sortOrder: 7,
  },
  {
    id: "faq-8",
    group: "Products",
    question: "Is the colour in the photos accurate?",
    answer:
      "We calibrate listing photographs for colour accuracy, but screen calibration varies by device. This is why we offer the pre-shipment video \u2014 filmed in natural light, it gives the most accurate read of the rug's true colour. If colour is critical to your decision, use the video before approving shipment.",
    sortOrder: 8,
  },
  {
    id: "faq-9",
    group: "Products",
    question: "Are your rugs naturally dyed?",
    answer:
      "We note in each listing whether the dye is assessed as natural or synthetic, and whether that assessment is based on physical evidence or attributed provenance. We do not make natural dye claims we cannot verify. Most commercially produced Moroccan rugs use synthetic dye \u2014 we state this clearly rather than assume.",
    sortOrder: 9,
  },
  {
    id: "faq-10",
    group: "Products",
    question: "What size rug do I need?",
    answer:
      "Living room with sofa and two chairs: an 8\u00d710 ft rug grounds the seating group without leaving furniture legs floating. Smaller groupings work with a 6\u00d79 ft. Dining room: the rug should extend at least 24 inches beyond the table edge on all sides so chairs stay on the rug when pulled out. Bedroom: a 9\u00d712 ft rug under a king bed with the rug visible on both sides of the frame is the standard. Send us your room dimensions and we will give you a specific recommendation.",
    sortOrder: 10,
  },
  {
    id: "faq-11",
    group: "Shipping",
    question: "Where do orders ship from?",
    answer: "All orders ship from Morocco.",
    sortOrder: 11,
  },
  {
    id: "faq-12",
    group: "Shipping",
    question: "How long does shipping take?",
    answer:
      "Orders ship from Morocco to the United States, Canada, Australia, and United Kingdom. Delivery timing varies by destination, carrier availability, and customs processing, and we confirm the destination timing with you before payment is captured. If you are outside those launch markets, you can still inquire and we will review shipping availability case by case before payment is captured. We send tracking when the order leaves Morocco.",
    sortOrder: 12,
  },
  {
    id: "faq-13",
    group: "Shipping",
    question: "Will I receive tracking?",
    answer: "Yes. A tracking number is sent by email when your order is dispatched.",
    sortOrder: 13,
  },
  {
    id: "faq-14",
    group: "Shipping",
    question: "Do I need to pay customs or import duties?",
    answer:
      "Import duties, VAT, GST, and customs fees depend on the destination. We confirm destination-specific shipping and delivery conditions with you before payment is captured, and any charges due on arrival remain the buyer\'s responsibility unless we confirm otherwise in writing before capture.",
    sortOrder: 14,
  },
  {
    id: "faq-15",
    group: "Shipping",
    question: "What carriers do you use?",
    answer:
      "DHL Express, FedEx International, and Aramex. Carrier is selected based on destination and shipment dimensions.",
    sortOrder: 15,
  },
  {
    id: "faq-16",
    group: "Returns",
    question: "What is your return policy?",
    answer:
      "14 days from confirmed delivery, provided the piece is unwashed, unaltered, free of pet hair embedded in the pile, and free of strong odours. The buyer covers return shipping in all cases, except where an item was materially misdescribed in the listing. Refunds are processed within 5 business days of confirmed return receipt.",
    sortOrder: 16,
  },
  {
    id: "faq-17",
    group: "Returns",
    question: "How do I avoid needing to return a rug?",
    answer:
      "The most common reasons for returns are colour mismatch and size mismatch. The pre-shipment video addresses both directly. Accept the video before your rug ships and you will see the actual colour in natural light and can confirm the size in context.",
    sortOrder: 17,
  },
  {
    id: "faq-18",
    group: "Rug Care",
    question: "How do I clean a Moroccan rug?",
    answer:
      "Vacuum regularly on low suction without a beater brush. Spot clean with cold water and a small amount of wool-safe detergent \u2014 blot, do not rub. For deep cleaning, use a professional who works with hand-knotted wool textiles. Avoid steam, high heat, and machine washing.",
    sortOrder: 18,
  },
  {
    id: "faq-19",
    group: "Rug Care",
    question: "My rug smells like wool. Is that normal?",
    answer:
      "Yes. Natural wool carries a lanolin smell that is more pronounced when the rug is new or has been stored. It fades with air circulation. Lay the rug flat in a well-ventilated room for a few days if the smell is strong at arrival.",
    sortOrder: 19,
  },
  {
    id: "faq-20",
    group: "Rug Care",
    question: "Can I use the rug outdoors?",
    answer:
      "Hand-knotted wool pile rugs are not suitable for outdoor use. Wool absorbs moisture and will mildew in sustained outdoor conditions. Kilim flatweaves can tolerate limited covered outdoor use in dry climates, but are not built for it.",
    sortOrder: 20,
  },
] as const;

export const lookbookItems: LookbookItem[] = [
  {
    id: "lookbook-1",
    title: "Modern Moroccan Living Room with Beni Ourain Rug",
    description:
      "A living room with a hand-knotted Beni Ourain rug on a pale wood floor. Ivory field, sparse geometric pattern. Natural light from the north.",
    ctaLabel: "Shop Beni Ourain Rugs",
    href: "/shop/rugs",
    imageSrc:
      "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
    imageAlt:
      "A Moroccan living room with low seating, natural light, and a visible handcrafted rug anchoring the floor.",
  },
  {
    id: "lookbook-2",
    title: "Handwoven Moroccan Rug Texture Detail",
    description:
      "Close view of a hand-knotted Moroccan pile rug. Individual knots visible in the warp structure, natural wool, pile depth varying across the field.",
    ctaLabel: "See the rug collection",
    href: "/shop/rugs",
    imageSrc:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    imageAlt:
      "A close, textural view of a handmade Moroccan rug in a softly lit interior setting.",
  },
  {
    id: "lookbook-3",
    title: "Moroccan Hallway with Vintage Textiles",
    description:
      "A hallway with vintage Moroccan rugs and woven textiles. Warm terracotta tones, pendant lights, wall hangings in stacked arrangement.",
    ctaLabel: "Shop Vintage Rugs",
    href: "/shop/vintage",
    imageSrc:
      "https://images.pexels.com/photos/36167991/pexels-photo-36167991.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
    imageAlt:
      "A Moroccan interior scene with textiles, a pouf, and terracotta, wood, and woven materials.",
  },
  {
    id: "lookbook-4",
    title: "Minimal Moroccan Styling with Neutral Decor",
    description:
      "A sitting area with cactus silk pillows, a low wood table, and neutral Moroccan decor. Pale walls, natural light, no competing pattern.",
    ctaLabel: "See the decor collection",
    href: "/shop/decor",
    imageSrc:
      "https://images.pexels.com/photos/31371152/pexels-photo-31371152/free-photo-of-warm-moroccan-sunlight-on-traditional-cushions.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    imageAlt:
      "A minimal Moroccan decor vignette with neutral textiles and handcrafted accents in warm sunlight.",
  },
] as const;

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    quote:
      "Placeholder testimonial content preserving the testimonials listing surface described in the PRD.",
    customerName: "Studio Client",
    location: "United States",
    sortOrder: 1,
  },
  {
    id: "testimonial-2",
    quote:
      "This section remains static for now, but the layout is ready to receive final customer stories later.",
    customerName: "Editorial Buyer",
    location: "United States",
    sortOrder: 2,
  },
  {
    id: "testimonial-3",
    quote:
      "A trust-focused presentation is in place here without introducing review systems or external integrations.",
    customerName: "Home Decor Client",
    location: "United States",
    sortOrder: 3,
  },
] as const;

export const policyPages: PolicyPage[] = [
  {
    slug: "shipping-policy",
    title: "Shipping policy",
    showPageHeader: false,
    bodyFormat: "markdown",
    body: String.raw`# Shipping Policy

**Loom and Hearth Studio LLC**
Effective date: March 29, 2026
Last updated: March 29, 2026

---

## 1. Where all orders ship from

Every item in the Loom & Hearth Studio collection is sourced and stored in Morocco. All orders are packed and dispatched directly from Morocco. There is no warehouse or fulfilment centre in the United States or elsewhere  your piece travels directly from Morocco to your door.

---

## 2. Where we ship

At launch, we ship to the **United States, Canada, Australia, and United Kingdom**. Shipping is included in the product price for these launch markets. If you are outside those launch markets, you can still send an inquiry and we will review shipping availability case by case before payment is captured.

---

## 3. Shipping cost

Shipping is included in the price of every item for the United States, Canada, Australia, and United Kingdom. There is no separate shipping charge at checkout. What you see on the product page is what you pay for the item and shipping from Morocco to your launch-market delivery address. For other countries, shipping is quoted only after a case-by-case review.

---

## 4. How dispatch works  the pre-shipment window

Before your order ships, we contact you within 24 hours of purchase to offer a short video of the actual piece you ordered  shown in natural Moroccan light with a tape measure for scale. This is our pre-shipment verification process. It exists because colour, texture, and scale are difficult to fully communicate through photographs alone, and we would rather you see the piece before it is packed than have any uncertainty after delivery.

Once you confirm you are happy, payment is captured and your order is packed and dispatched. This means the time from order to dispatch can be up to 7 days. In practice it is usually faster  most verifications are completed within 48 hours.

If we are unable to confirm your destination, timing, or delivery conditions within the verification window, we will not capture payment until that confirmation is complete.

For the full details of how the verification works, see the [Terms of Service](https://www.loomandhearthstudio.com/terms-and-conditions).

---

## 5. Carriers

We ship using **Aramex**, **DHL Express**, and **FedEx International**, selected based on the destination, package weight, and dimensions. You will be notified of the carrier and tracking number when your order is dispatched.

We do not allow carrier selection at checkout. We choose the carrier best suited to your shipment on a per-order basis.

---

## 6. Estimated delivery times

All delivery time estimates below are measured from the **date of dispatch**  not the date of order. Allow up to 7 days for the pre-shipment verification window before dispatch begins.

| Destination | Estimated delivery after dispatch |
|---|---|
| United States | 7 to 14 business days |
| Canada, Australia, and United Kingdom | Confirmed before payment is captured based on destination, carrier availability, and customs processing |
| Other countries | Inquiry only. Shipping availability is reviewed case by case before payment is captured |

These are estimates, not guarantees. International shipments from Morocco pass through customs clearance, which can add time outside our control. Carrier delays, public holidays, and weather events can also affect timelines. We will always provide you with a tracking number so you can monitor your shipment in real time.

If your shipment has not arrived within the estimated window, contact us before opening a dispute  most delays resolve themselves within a few days, and we can check the carrier status on your behalf.

---

## 7. Tracking

Every order ships with a tracking number. You will receive your tracking number by email at the time of dispatch. Use it to monitor progress directly on the carrier's website.

If your tracking number is not working or showing no updates within 48 hours of receiving it, contact us and we will investigate with the carrier.

---

## 8. Customs and import duties

Import duties, VAT, GST, and customs fees vary by destination. We review destination-specific shipping, customs, and delivery conditions with you before payment is captured.

Unless we confirm otherwise in writing before capture, any duties, VAT, GST, brokerage, or customs fees assessed on arrival remain the buyer's responsibility.

---

## 9. Customs holds and delays

International shipments are occasionally held by customs for inspection. This is a routine part of international trade and is outside our control. Customs holds can add anywhere from a few days to several weeks to the delivery timeline.

If your shipment is held by customs in your destination market:

- You will typically receive a notice from the carrier or CBP directly.
- Contact us immediately with the notice details and we will assist.
- Do not pay any unexpected fee without contacting us first.

We cannot initiate customs clearance on your behalf from our end once a shipment is in transit, but we can provide supporting documentation if CBP requests additional information about the origin or nature of the goods.

---

## 10. Packaging

All items are packed to survive international transit. Rugs are rolled pile-side inward, wrapped in a moisture barrier, and secured inside heavy-duty outer packaging rated for carrier handling. Fragile or decorative items receive additional internal protection as needed.

Every order includes a brand presentation layer inside the outer packaging  your piece arrives ready to unwrap, not just ready to survive shipping.

---

## 11. Risk of loss

Risk of loss and damage transfers to you when the item is handed to the carrier for shipment. From that point, the carrier is responsible for the physical integrity of the package in transit.

If your item arrives damaged, see section 12 below.

---

## 12. Items damaged in transit

If your order arrives visibly damaged  damage that occurred during international shipping and is not the result of handling after delivery  contact us within **48 hours of delivery** at hello@loomandhearthstudio.com with:

- Your order number
- Clear photographs of the damaged item
- Photographs of the outer packaging, including any visible damage to the box or wrapping

Do not discard the outer packaging until the matter is fully resolved. Carriers require the original packaging as evidence when processing a damage claim.

We will open a carrier investigation promptly and work toward a resolution. Where possible, we will source a replacement. If a replacement cannot be found, we will issue a full refund.

---

## 13. Lost or significantly delayed shipments

A shipment is considered lost if tracking shows no movement for 14 consecutive calendar days and the carrier confirms the shipment cannot be located.

If your shipment appears lost or significantly delayed beyond the estimated delivery window, contact us within **30 days of the dispatch date**. We will open a formal carrier investigation. If the carrier confirms the shipment is lost, we will resolve with a replacement or full refund.

We cannot open a carrier claim after 30 days from dispatch. Contact us promptly if something seems wrong  do not wait.

---

## 14. Incorrect or incomplete delivery address

You are responsible for providing an accurate and complete delivery address at checkout. If a shipment is returned to us due to an incorrect address, refused delivery, or failure to collect from a carrier facility:

- We will contact you to arrange re-shipment.
- Re-shipment costs are at your expense.
- If you choose not to receive the re-shipment, we will issue a refund for the item price minus the original outbound shipping cost absorbed in the price.

If you realise your address is incorrect after placing an order, contact us immediately at hello@loomandhearthstudio.com. We can correct the address before dispatch if we have not yet shipped.

---

## 15. Contact

For any question about your shipment, tracking, or delivery:

**Loom and Hearth Studio LLC**
Address: ${publicBusinessDetails.address}
Email: ${publicBusinessDetails.email}
${publicBusinessDetails.complaintsLine}

We aim to respond to all shipping enquiries within 2 business days.`,
    seoTitle: "Shipping policy | Loom & Hearth Studio",
    seoDescription:
      "Shipping policy for Loom & Hearth Studio orders shipped from Morocco with customs handled to help prevent unexpected import charges for US buyers.",
  },
  {
    slug: "returns-policy",
    title: "Returns policy",
    showPageHeader: false,
    bodyFormat: "markdown",
    body: String.raw`# Return and Refund Policy

**Loom and Hearth Studio LLC**
Effective date: March 29, 2026
Last updated: March 29, 2026

---

## 1. Our commitment

We want every piece you receive to be exactly right. That is why we offer a pre-shipment video verification on every order  so you can see the actual item in natural light before payment is captured and before anything ships. If you take advantage of that process, the likelihood of a return is significantly reduced.

If something is still not right after delivery, this policy explains exactly what you are entitled to, how to request a return, and what happens next. Nothing in this policy removes or limits any rights you have under the consumer protection laws of your country of residence.

---

## 2. Return window

You have **14 days from the date of confirmed delivery** to request a return.

The delivery date is determined by the tracking record from the carrier. If you have not received a delivery confirmation but believe your item has arrived, contact us at hello@loomandhearthstudio.com and we will verify with the carrier.

Requests received after 14 days from confirmed delivery will not be accepted, except where required by applicable consumer protection law in your country.

---

## 3. Items that are eligible for return

To be accepted for return, an item must meet all of the following conditions at the time it is received back in Morocco:

- Unused and in the same condition as delivered
- Unwashed and unaltered  no cleaning, trimming, cutting, or modification of any kind
- Free of embedded pet hair in the pile or fringe
- Free of absorbed smoke, strong perfume, or other odour not present at delivery
- Rolled and packaged with reasonable care for return transit

Items that do not meet these conditions will not be accepted for return and will be sent back to you at your expense.

---

## 4. Items that are not eligible for return

The following are not eligible for return:

**Custom or bespoke orders.** If an item was sourced, reserved, or modified specifically for you at your request, it is not eligible for return unless it was materially misdescribed.

**Items damaged after delivery.** Damage caused by use, cleaning, pets, moisture, or improper storage after the item has been delivered is not eligible for return.

**Natural variation.** Handmade products show inherent variation in knot density, colour consistency, and pattern symmetry. These are characteristics of authentic handcraft and are not defects. Variation of this kind is not grounds for return. Our product descriptions and pre-shipment verification process exist specifically to show you these qualities before you commit.

**Minor wear disclosed in the listing.** Some vintage and one-of-one pieces have minor condition notes  light pile wear, small repairs, slight fading  disclosed in the product description. Returning an item solely for a disclosed condition that was accurately described in the listing is not accepted.

---

## 5. What qualifies as a material misdescription

A material misdescription is a significant factual error in the product listing that a reasonable buyer would have relied on when making their purchase decision  and that is meaningfully different from the actual item received.

Examples that qualify:

- Dimensions stated as significantly larger or smaller than the actual item (more than 10% variance)
- A pile rug described and sold as a flatweave, or vice versa
- An item described as having no repairs that has a visible, significant repair
- A material error  for example, an item described as wool that is primarily synthetic

Examples that do not qualify:

- Colour appearing slightly different on your screen than in photographs (this is why we offer pre-shipment video)
- Natural variation in pattern or weave density inherent to handmade production
- Minor tonal differences in areas of abrash that were visible in photographs

If you believe your item was materially misdescribed, contact us before returning. Do not ship the item back without speaking to us first  we will review your claim and respond within 3 business days.

---

## 6. How to request a return

**Step 1.** Email hello@loomandhearthstudio.com within 14 days of confirmed delivery. Use the subject line "Return Request  Order [your order number]."

**Step 2.** Include the following in your email:
- Your order number
- The item you are returning
- The reason for the return
- Photographs showing the current condition of the item

**Step 3.** We will review your request and respond within 3 business days. We will either approve the return and provide return instructions, request additional information, or explain why the return does not qualify under this policy.

**Do not ship the item back before receiving written approval from us.** Unapproved returns will not be accepted and cannot be refunded.

---

## 7. Return shipping

### Buyer-paid returns

In most cases, return shipping is at your expense. This includes:

- Returns where you have changed your mind
- Returns where the item matches its description but is not what you expected
- Returns due to colour or size perception that was not resolved via the pre-shipment verification offer

You are responsible for choosing a carrier, paying for shipping from your location back to Morocco, and ensuring the item is adequately packaged to arrive without damage. We strongly recommend using a tracked and insured service. Loom and Hearth Studio LLC is not responsible for items lost or damaged in return transit.

### Returns we cover

If your return is approved on the basis of material misdescription, we will provide a prepaid return shipping label or reimburse your documented return shipping cost up to a reasonable amount for the destination. We will confirm the arrangement in writing before you ship.

---

## 8. Packaging your return

Rugs must be rolled pile-side inward and wrapped securely. Use sturdy outer packaging suitable for international transit. If the item arrives back in Morocco in a damaged state due to inadequate packaging, we reserve the right to reduce the refund amount to reflect the damage, or in cases of severe damage, to decline the refund.

If you need guidance on how to package your item for return, email us and we will advise.

---

## 9. Refunds

### Timeline

Once we receive your return and confirm the item meets the eligibility conditions in section 3, we will issue your refund within **5 business days**.

### Method

Refunds are issued to the original payment method used at checkout. We cannot issue refunds to a different card or account.

### Amount

**Full refund:** Issued when the item is returned in eligible condition and the return was approved.

**Partial refund:** We reserve the right to issue a partial refund if the returned item shows signs of use, odour, or damage not present at delivery that reduce its resale value. We will notify you of any deduction and the reason before processing.

**Return shipping costs:** Original shipping costs are non-refundable. If you paid a separate shipping charge at checkout, that amount is not included in your refund.

### Processing time

After we process the refund, the time for funds to appear in your account depends on your card issuer or payment provider  typically 3 to 10 business days. This is outside our control.

---

## 10. Exchanges

Exchanges are available subject to current inventory. Because many of our rugs are one-of-one pieces, a direct exchange for the same item is not possible  but if you are interested in a different piece from the collection, contact us before returning and we will do our best to find a suitable alternative.

To request an exchange, email hello@loomandhearthstudio.com with your order number and the item you have in mind. We will confirm availability and hold the alternative item for you while your return is in transit.

---

## 11. Items damaged in transit to you

If your item arrives visibly damaged  meaning the damage occurred during international shipping and is not a result of use after delivery  contact us within **48 hours of delivery** with:

- Your order number
- Photographs of the damaged item
- Photographs of the outer packaging

We will open a carrier investigation and work toward a resolution  replacement where possible, or a full refund if a replacement cannot be sourced. Do not discard the packaging until the investigation is resolved, as the carrier may require it as evidence.

---

## 12. Pre-shipment verification and returns

We offer a pre-shipment video verification on every order. Before payment is captured and before your item ships, we send you a video of the actual piece in natural Moroccan light  showing colour, texture, pile height, and size in context.

Accepting this offer is the most effective way to ensure you are completely happy with your purchase before it leaves Morocco. If after watching the video you have any concerns  about colour, scale, texture, or anything else  tell us before confirming. That is the right moment to raise it.

If you accepted the pre-shipment verification and confirmed you were happy with the item, and subsequently return it for reasons visible in the verification video, that will be taken into account when assessing your return. This does not remove your right to return within 14 days  but it is relevant to whether a return shipping cost exemption applies.

---

## 13. Your statutory rights

Nothing in this policy excludes or limits rights you have under the consumer protection laws of your country of residence. Where those rights provide for a longer return window, a different standard of proof, or other protections not covered here, those rights apply in addition to this policy.

If you are unsure about your rights, contact us  we will deal with you fairly.

---

## 14. Contact

For return requests, questions about this policy, or anything related to an order:

**Loom and Hearth Studio LLC**
Address: ${publicBusinessDetails.address}
Email: ${publicBusinessDetails.email}
${publicBusinessDetails.complaintsLine}
Subject line: Return Request  Order [your order number]

We aim to respond to all return-related enquiries within 3 business days.`,
    seoTitle: "Returns policy | Loom & Hearth Studio",
    seoDescription: "Returns policy information for the Loom & Hearth Studio launch.",
  },
  {
    slug: "accessibility-statement",
    title: "Accessibility Statement",
    showPageHeader: false,
    bodyFormat: "markdown",
    body: String.raw`# Accessibility Statement

Loom & Hearth Studio is committed to making this website accessible to as many people as possible.

We are working toward conformance with **WCAG 2.1 Level AA**.

If you experience an accessibility issue on this site, or if you need assistance accessing any content, email us at hello@loomandhearthstudio.com.

We aim to respond within 5 business days.`,
    seoTitle: "Accessibility Statement | Loom & Hearth Studio",
    seoDescription: "Accessibility statement for the Loom & Hearth Studio website.",
  },  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    bodyFormat: "markdown",
    body: String.raw`**Loom and Hearth Studio LLC**
Effective date: March 29, 2026
Last updated: March 29, 2026

---

## 1. Who we are

This website is operated by **Loom and Hearth Studio LLC**, a company registered in the state of Wyoming, United States. We sell handcrafted Moroccan rugs, poufs, pillows, and home dÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©cor, shipping all orders directly from Morocco.

For any privacy-related questions or requests, contact us at:
**hello@loomandhearthstudio.com**

---

## 2. What personal data we collect and why

We collect only what is necessary to operate this store and communicate with you. The table below lists every category of personal data we collect, what we use it for, and the legal basis that permits us to process it.

| Data | Purpose | Legal basis |
|---|---|---|
| Full name | Creating your account; processing and fulfilling orders | Contract performance |
| Email address | Account registration; order confirmations; password reset emails; newsletter (if you opted in) | Contract performance / Legitimate interest / Consent (newsletter only) |
| Password (stored as a one-way hash  never the raw password) | Authenticating your account | Contract performance |
| Shipping address  street, city, state, postal code, country | Delivering your order; customs documentation | Contract performance |
| Phone number (optional, collected at checkout) | Carrier delivery coordination if required | Contract performance |
| Order details  items ordered, prices, quantities, Stripe session and payment intent identifiers, order status | Fulfilling your order; resolving disputes; financial record-keeping | Contract performance / Legal obligation |
| Session token | Keeping you logged in during your visit | Legitimate interest (security) |
| Hashed login identifier (a one-way SHA-256 hash derived from your email address, IP address, and the login surface  the raw IP and raw email are never stored in this record) | Preventing automated login abuse and brute-force attacks | Legitimate interest (security) |

We do not run third-party analytics, advertising pixels, session recording tools, or behavioral tracking on this site. No Google Analytics, Meta Pixel, Pinterest tag, PostHog, or equivalent service is currently installed.

---

## 3. Cookies and local storage

### Strictly necessary  no consent required

| Name | Type | Purpose | Expiry |
|---|---|---|---|
| \`loom_hearth_cookie_consent\` | First-party cookie | Stores your cookie consent preference so we do not ask again | 180 days |
| Auth.js session cookies (\`next-auth.session-token\` and related) | First-party cookies | Keeps you authenticated while browsing and at checkout | Session / rolling |

### Local storage (not cookies)

Your shopping cart and checkout state are saved in your browser's local storage, not in cookies. This data never leaves your device until you place an order.

We do not set any advertising, analytics, or third-party tracking cookies. If this changes, this policy will be updated before any new cookie is activated.

---

## 4. Third parties who receive your data

We share your data with the following third parties only to the extent necessary to operate the store. We do not sell your personal data to anyone.

**Stripe**  payment processing. When you place an order, your email address, order line items, and order metadata are transmitted to Stripe to create a checkout session. Your payment card details are entered directly on Stripe's servers and are never seen or stored by us. Stripe's privacy policy is available at stripe.com/privacy.

**Postmark**  transactional email delivery. When you place an order or request a password reset, we transmit your email address, name, order details, and shipping address to Postmark to deliver your confirmation or reset email. Postmark's privacy policy is available at postmarkapp.com/privacy-policy.

**Vercel**  website hosting. This site is hosted on Vercel's infrastructure. As with any web host, Vercel's servers process requests from your browser and may retain standard server access logs including IP addresses for a limited period as part of normal hosting operations. Vercel's privacy policy is available at vercel.com/legal/privacy-policy.

**Shipping carriers (DHL Express, FedEx International, Aramex)**  order fulfilment. When your order is dispatched, we share your full name, shipping address, and where required by the carrier, your phone number with the carrier responsible for delivering your order. These carriers process your data solely to complete delivery.

No other third-party service currently receives your personal data. If we add a tool that requires sharing your data  for example an email marketing platform or analytics service  we will update this policy before activating that tool.

---

## 5. How long we keep your data

| Data category | Retention period | Reason |
|---|---|---|
| Order records (name, email, shipping address, order details, Stripe references) | 7 years from the order date | Tax and financial record-keeping obligations |
| Account data (name, email, password hash) | Until you request deletion, or 3 years of account inactivity | Allowing you to access your order history |
| Session tokens | Until the session expires or you log out | Authentication |
| Password reset tokens | Until used or expired (short-lived) | Security |
| Hashed login rate-limit records | 24 hours from creation | Security  short-term abuse prevention |
| Newsletter subscriber email | Until you unsubscribe or request deletion | Marketing consent |

When a retention period ends, we delete or anonymise the relevant data.

---

## 6. International data transfers

Loom and Hearth Studio LLC is operated from Morocco. When you interact with this site, your data is processed in Morocco and on servers operated by our third-party providers located in the United States and European Union.

If you are located in the European Union or United Kingdom, transfers of your personal data to countries outside the EEA and UK are governed by the Standard Contractual Clauses approved by the European Commission, or by an equivalent transfer mechanism applicable under UK data protection law.

---

## 7. Your rights  EU and UK residents (GDPR and UK GDPR)

If you are located in the European Union or United Kingdom, you have the following rights under the General Data Protection Regulation (GDPR) and UK GDPR:

- **Right of access**  you may request a copy of all personal data we hold about you.
- **Right to erasure**  you may request that we delete all personal data we hold about you, subject to our legal retention obligations (for example, we must retain order records for tax purposes).
- **Right to portability**  you may request your data in a structured, machine-readable format (CSV).
- **Right to rectification**  you may request that we correct inaccurate data.
- **Right to object**  you may object to processing based on legitimate interest, including direct marketing.
- **Right to restrict processing**  you may request that we limit processing while a dispute is resolved.

We will respond to all rights requests within 30 days. To submit a request, email **hello@loomandhearthstudio.com** with the subject line "Privacy Request" and a description of what you are requesting.

If you are unsatisfied with our response, you have the right to lodge a complaint with the supervisory authority in your country of residence.

---

## 8. Your rights  California residents (CCPA)

If you are a California resident, the California Consumer Privacy Act (CCPA) gives you the following rights:

- **Right to know**  you may request disclosure of the categories and specific pieces of personal information we have collected about you, the purposes for collection, and the categories of third parties with whom we share it.
- **Right to deletion**  you may request that we delete your personal information, subject to legal retention obligations.
- **Right to opt out of sale**  we do not sell your personal information to any third party. There is nothing to opt out of.
- **Right to non-discrimination**  exercising any of these rights will not result in different pricing or service levels.

To submit a request, email **hello@loomandhearthstudio.com** with the subject line "California Privacy Request." We will respond within 45 days.

---

## 9. Newsletter and marketing emails

If you subscribed to our newsletter, we will send you updates about new arrivals, lookbook releases, and early access to new pieces. You can unsubscribe at any time by clicking the unsubscribe link in any email we send, or by emailing **hello@loomandhearthstudio.com**.

We do not send marketing emails to anyone who has not explicitly opted in.

---

## 10. Security

We take reasonable technical and organisational measures to protect your personal data, including:

- All connections to this site are encrypted via HTTPS.
- Passwords are stored as one-way hashes  we cannot read your password.
- Login attempts are rate-limited to reduce the risk of unauthorised access.
- Payment card data is processed entirely by Stripe and never stored on our servers.

No system is entirely secure. If you have reason to believe your account has been compromised, contact us immediately at **hello@loomandhearthstudio.com**.

---

## 11. Children

This site is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe we have inadvertently collected data from a child, contact us and we will delete it promptly.

---

## 12. Changes to this policy

When we make material changes to this policy, we will update the "Last updated" date at the top of this page. If the changes are significant, we will notify registered account holders by email.

We encourage you to review this policy periodically.

---

## 13. Contact

For any question, request, or concern about this Privacy Policy or how we handle your data:

**Loom and Hearth Studio LLC**
Address: ${publicBusinessDetails.address}
Email: ${publicBusinessDetails.email}
${publicBusinessDetails.complaintsLine}

We aim to respond to all inquiries within 5 business days.`,
    seoTitle: "Privacy Policy | Loom & Hearth Studio",
    seoDescription: "Privacy Policy for Loom & Hearth Studio.",
  },
  {
    slug: "terms-and-conditions",
    title: "Terms of Service",
    bodyFormat: "markdown",
    body: String.raw`**Loom and Hearth Studio LLC**
Effective date: March 29, 2026
Last updated: March 29, 2026

---

## 1. Who we are

This website is operated by **Loom and Hearth Studio LLC**, a company registered in the state of Wyoming, United States. We source and sell handcrafted Moroccan rugs, poufs, pillows, and home dÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©cor. All products are sourced in Morocco and ship directly from Morocco to your delivery address.

For any legal or commercial questions, contact us at:
**hello@loomandhearthstudio.com**

By accessing this website or placing an order, you agree to these Terms of Service in full. If you do not agree, do not use the site or place an order.

---

## 2. What we sell

We sell handcrafted Moroccan rugs, poufs, pillows, and home dÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©cor items. Products are sourced directly from artisans and bazaars in Morocco and are described on each product page.

**One-of-one products.** Many rugs in our collection are unique, one-of-one handmade pieces. These are identified clearly on their product pages. For one-of-one items:

- The photographs and description represent the exact item being sold  not a representative sample or a style reference.
- Once sold, the item will not be restocked. A similar piece may be listed in the future as a separate product.
- Product pages for sold one-of-one items remain visible on the site marked as Sold Out. This is intentional.

**Multi-unit products.** Poufs, pillows, and some dÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©cor items may have more than one unit available. These products may have variants such as size or colour, which are specified on the product page.

We make every effort to represent colour, texture, size, and condition accurately. Natural lighting conditions in Morocco and the hand-made nature of all products mean that slight variation in colour rendering across different screens is inherent. Our pre-shipment verification process (described in section 5) exists specifically to address this before payment is captured.

---

## 3. Placing an order

### 3.1 How a contract is formed

Browsing the site and adding items to your cart does not create a contract. A contract between you and Loom and Hearth Studio LLC is formed when:

1. You submit your order through the checkout, and
2. We send you an order confirmation email to the email address you provided.

The confirmation email constitutes our acceptance of your order. If we are unable to accept your order for any reason, we will notify you and no charge will be applied.

### 3.2 Accurate information

When placing an order you agree to provide accurate, complete, and current information  including your name, email address, and shipping address. Orders placed with incorrect or incomplete shipping addresses may be delayed or undeliverable. We are not responsible for non-delivery resulting from inaccurate information you provide.

### 3.3 Our right to cancel before dispatch

We reserve the right to cancel any order before the item is handed to the carrier  for example if:

- The item is found to be damaged during pre-shipment verification.
- A pricing or product description error is identified on the listing.
- The order cannot be fulfilled for reasons outside our control.

If we cancel your order, we will notify you promptly by email and release any payment authorisation in full. No charge will be applied to your payment method.

---

## 4. Pricing and payment

### 4.1 Prices

All prices are displayed in United States Dollars (USD). Prices include the cost of the item and shipping for the United States, Canada, Australia, and United Kingdom. Prices for other countries are confirmed only after a case-by-case shipping review. Prices do not include return shipping or any import duties, VAT, GST, brokerage, or customs fees unless we confirm otherwise in writing before payment is captured.

We reserve the right to correct pricing errors on the site at any time. If an error is identified after you have placed an order, we will contact you to confirm whether you wish to proceed at the correct price, or cancel for a full release of any held funds.

### 4.2 How payment works  authorisation and capture

**This is important to read.** Our payment process works in two steps, and understanding it prevents confusion when you check your bank statement.

**Step 1  Authorisation at checkout.** When you complete checkout, your payment method is authorised for the order total. This places a hold on the funds on your card or account. You will see this as a pending charge. No money is transferred to us at this point.

**Step 2  Capture after verification.** Payment is captured  meaning funds are actually collected  only after your pre-shipment verification is complete (see section 5). The capture window is up to 7 days from the order date.

If you confirm after seeing the verification video that you are happy with the item, we capture payment and your order ships. If we cancel the order for any reason, or if you choose not to proceed after the verification, the authorisation is released in full and no funds are collected. The time for a released authorisation to disappear from your statement depends on your card issuer  typically 3 to 7 business days.

### 4.3 Payment processing

Payments are processed by Stripe. Your card details are entered directly on Stripe's secure servers and are never seen or stored by Loom and Hearth Studio LLC.

---

## 5. Pre-shipment verification

We offer a pre-shipment video verification for every order. This is a core part of how we operate  not a delay.

**How it works.** Within 24 hours of your order being placed, we will contact you by email to offer a short video of the actual piece you purchased  shown in natural light in Morocco, with a tape measure for scale, so you can see the colour, texture, and size before your payment is captured and your item ships.

**Your options.** You can confirm by reply email, request a live video call via WhatsApp or FaceTime, or receive a short recorded video clip  whichever suits you best.

**If you are happy.** We capture payment and your item ships.

**If something is not right.** Contact us before confirming and we will work with you to resolve it before the item ships. This is the right moment to raise any concern  it is far easier to resolve before shipment than after.

**If we cannot reach you.** If we do not receive a response within 7 days of the order date after two contact attempts, we will keep the order on hold and will not capture payment until destination, timing, and delivery conditions are confirmed.

Accepting the pre-shipment verification offer significantly reduces the likelihood of returns due to colour or size mismatch. We encourage all buyers to take advantage of it.

---

## 6. Shipping and delivery

### 6.1 All orders ship from Morocco

Every item in our collection is sourced and stored in Morocco. All orders are packed and dispatched from Morocco.

### 6.2 Carriers

We ship using DHL Express, FedEx International, or Aramex, selected based on destination and shipment weight.

### 6.3 Estimated delivery times

- United States: 7 to 14 business days from dispatch
- Canada, Australia, and United Kingdom: timing is confirmed before payment is captured based on destination, carrier availability, and customs processing
- Other countries: inquiry only, with shipping availability reviewed case by case before payment is captured

These are estimates, not guarantees. Customs clearance, carrier delays, and circumstances outside our control may extend delivery times. We will provide you with a tracking number when your order is dispatched so you can monitor progress.

### 6.4 Dispatch timing

Orders are dispatched after pre-shipment verification is complete and payment is captured. Allow up to 7 days from the order date for this process before dispatch. Actual dispatch is typically faster.

### 6.5 Risk of loss

Risk of loss and damage passes to you when the item is handed to the carrier for shipment. If your item is lost or significantly delayed, contact us within 30 days of the expected delivery date and we will open an investigation with the carrier and work toward a resolution.

### 6.6 Import duties and customs

Import duties, VAT, GST, brokerage, and customs fees vary by destination. We confirm the destination-specific shipping and import conditions with you before payment is captured.

Unless we confirm otherwise in writing before capture, any import duties, VAT, GST, brokerage, or customs fees assessed by the destination country remain the buyer's responsibility.

---

## 7. Returns and refunds

Our full Return and Refund Policy is published at [loomandhearthstudio.com/returns-policy](https://www.loomandhearthstudio.com/returns-policy). That page governs all returns and takes precedence over any summary here.

In brief: we accept returns within 14 days of confirmed delivery for items in original, unaltered condition. Return shipping is at the buyer's cost except where an item was materially misdescribed in its listing. Refunds are issued within 5 business days of confirmed return receipt.

---

## 8. Accounts

You may browse and purchase as a guest or create an account. If you create an account, you are responsible for keeping your login credentials secure and for all activity that occurs under your account. Notify us immediately at hello@loomandhearthstudio.com if you suspect unauthorised access.

We reserve the right to suspend or close accounts that are used in breach of these Terms.

---

## 9. Intellectual property

All content on this website  including product photographs, written descriptions, blog posts, brand assets, and design  is owned by or licensed to Loom and Hearth Studio LLC. You may not reproduce, copy, redistribute, or use any content from this site for commercial purposes without our prior written permission.

---

## 10. Accuracy of product information

We make every reasonable effort to ensure that product descriptions, dimensions, weights, and photographs accurately represent each item. However:

- Handmade products have natural variation in texture, weave density, and colour tone that is inherent to the craft and is not a defect.
- Colour rendering varies across screens and viewing conditions. Our pre-shipment video process is designed specifically to address this before dispatch.
- Minor imperfections consistent with age or hand production are disclosed in the product description where present and are not grounds for return unless they constitute a material misdescription.

If you believe an item was materially misdescribed  meaning the listing contained a significant factual error that influenced your purchase decision  contact us before initiating a return. We will address it fairly.

---

## 11. Limitation of liability

To the fullest extent permitted by applicable law, the total liability of Loom and Hearth Studio LLC to you for any claim arising from your use of this site or from the purchase of any product is limited to the purchase price you paid for the item giving rise to the claim.

We are not liable for indirect, consequential, incidental, or punitive damages of any kind.

Nothing in these Terms excludes or limits liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for any other liability that cannot lawfully be excluded.

---

## 12. Consumer rights

If you are purchasing as a consumer in your country of residence, you may have rights under applicable consumer protection law that cannot be excluded or limited by these Terms. Nothing in these Terms is intended to exclude or waive those rights. In any conflict between these Terms and your non-waivable statutory rights, your statutory rights prevail.

---

## 13. Governing law and disputes

These Terms are governed by the laws of Morocco.

If you have a dispute with us, we ask that you contact us first at hello@loomandhearthstudio.com. We will make a genuine effort to resolve any issue directly within a reasonable timeframe. If direct resolution is not possible, we are open to mediation as a next step before any formal legal proceedings.

Where mandatory consumer protection laws in your country of residence apply to your purchase, those laws may also govern certain aspects of this agreement. We do not seek to exclude their application.

---

## 14. Changes to these Terms

We may update these Terms from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of the site after an update constitutes acceptance of the revised Terms. We encourage you to review this page periodically.

For material changes, we will notify registered account holders by email.

---

## 15. Contact

For any question about these Terms:

**Loom and Hearth Studio LLC**
Address: ${publicBusinessDetails.address}
Email: ${publicBusinessDetails.email}
${publicBusinessDetails.complaintsLine}

We aim to respond to all inquiries within 5 business days.`,
    seoTitle: "Terms of Service | Loom & Hearth Studio",
    seoDescription: "Terms of Service for Loom & Hearth Studio.",
  },
] as const;




