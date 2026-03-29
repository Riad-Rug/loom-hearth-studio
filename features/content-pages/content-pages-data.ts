import type { FaqItem, PolicyPage, Testimonial } from "@/types/domain";

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

Today, we continue that work with a more focused approach  selecting Moroccan rugs, transforming some into one-of-one poufs and pillows, and curating decor with a clear point of view.

Every piece is chosen in person, not mass-produced, and not sourced from generic export catalogs. The goal is simple: bring objects with real material depth and character into homes that value design.

All orders ship directly from Morocco within 57 business days, with shipping and customs already included in the final price  no surprises at delivery.`,
} as const;

export const aboutSections: AboutSection[] = [
  {
    eyebrow: "Craft",
    title: "Rooted in Moroccan sourcing, material knowledge, and direct selection.",
    body:
      "We work directly with artisans, souks, and trusted suppliers across Morocco, selecting pieces based on texture, construction, and presence \u2014 not trends. Many items are one-of-one, and even repeatable designs remain handmade, which means no two pieces are exactly alike.\n\nOur poufs and pillows are often made from rugs or rug materials, giving them the same depth, irregularity, and character as the originals they come from.",
  },
  {
    eyebrow: "Direction",
    title: "Built for interiors that value texture, warmth, and individuality.",
    body: `Loom & Hearth Studio is not a marketplace and not a mass-production brand. The collection is intentionally focused on Moroccan rugs, rug-based poufs, pillows, and supporting decor  pieces that work together and build a coherent interior.

The direction is simple: fewer, better objects with real presence. Pieces that feel collected over time, not selected from a catalog.`,
  },
] as const;

export const aboutBridge = {
  eyebrow: "How we source",
  title: "Selected in person, not pulled from a catalog.",
  body:
    "We work directly across Morocco to source handcrafted rugs, rug-based poufs and pillows, and supporting decor with real texture, construction, and presence. The process is hands-on by design, so the collection stays focused, distinctive, and materially honest.",
} as const;

export const contactData = {
  eyebrow: "Contact",
  title: "Contact Loom & Hearth Studio",
  body:
    "Contact Loom & Hearth Studio for inquiries about handmade Moroccan rugs, custom sourcing, vintage textiles, and curated home decor.",
  formTitle: "Send a customer inquiry",
  formBody:
    "Send us a message about a specific piece, a sourcing request, or any question about the collection. We review every message personally and respond within 24 hours.",
  ctaLabel: "Send message",
  supportTitle: "Studio support",
  supportBody:
    "Send us a message about a specific piece, a sourcing request, or any question about the collection. We review every message personally and respond within 24 hours.",
  reassuranceLabel: "Support note",
  reassuranceText:
    "Every inquiry about a rug includes a video of the actual piece before payment is taken. Include the product name and your room dimensions if you have them  it helps us respond with something useful.",
  responseTimeLabel: "Response timing",
  responseTimeText: "Within 24 hours",
  emailLabel: "hello@loomandhearthstudio.com",
  hoursLabel: "Monday to Friday, 9am  6pm CET",
  locationLabel: "Morocco sourcing studio - U.S. launch market",
} as const;

export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    group: "Shipping",
    question: "Will I receive tracking?",
    answer: "Yes, tracking is provided once your order ships.",
    sortOrder: 1,
  },
  {
    id: "faq-2",
    group: "Shipping",
    question: "Do I need to handle customs?",
    answer: "No, we take care of duties and customs.",
    sortOrder: 2,
  },
  {
    id: "faq-3",
    group: "Holds",
    question: "Can you reserve a rug for me?",
    answer:
      "We can place a temporary hold for account holders while you review a piece. Longer or paid holds can be arranged case by case.",
    sortOrder: 3,
  },
  {
    id: "faq-4",
    group: "Inquiry",
    question: "Can I see the rug before purchasing?",
    answer: "Yes, we send a video of the exact piece before payment.",
    sortOrder: 4,
  },
] as const;

export const lookbookItems: LookbookItem[] = [
  {
    id: "lookbook-1",
    title: "Modern Moroccan Living Room with Beni Ourain Rug",
    description:
      "A refined living room featuring a handwoven Beni Ourain rug paired with warm wood tones and natural light. Designed for a calm, textured, and grounded interior.",
    ctaLabel: "Shop Beni Ourain Rugs",
    href: "/shop/rugs",
    imageSrc:
      "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
    imageAlt:
      "A warm Moroccan living room with layered seating, natural light, and a visible handcrafted rug anchoring the space.",
  },
  {
    id: "lookbook-2",
    title: "Handwoven Moroccan Rug Texture Detail",
    description:
      "Close-up view of traditional Moroccan weaving techniques, highlighting natural wool fibers, texture depth, and artisanal craftsmanship.",
    ctaLabel: "Explore Handmade Rugs",
    href: "/shop/rugs",
    imageSrc:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    imageAlt:
      "A close, textural view of a handmade Moroccan rug in a softly lit interior setting.",
  },
  {
    id: "lookbook-3",
    title: "Layered Moroccan Interior with Vintage Textiles",
    description:
      "A curated interior blending vintage Moroccan rugs, soft textiles, and earthy tones to create a rich, layered living environment.",
    ctaLabel: "Shop Vintage Rugs",
    href: "/shop/vintage",
    imageSrc:
      "https://images.pexels.com/photos/36167991/pexels-photo-36167991.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
    imageAlt:
      "A layered interior scene with Moroccan textiles, a pouf, and warm earthy materials styled together.",
  },
  {
    id: "lookbook-4",
    title: "Minimal Moroccan Styling with Neutral Decor",
    description:
      "A minimalist approach to Moroccan decor using neutral palettes, soft textures, and subtle handcrafted elements for a modern aesthetic.",
    ctaLabel: "Discover Home Styling",
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
    body: [
      "All orders ship directly from Morocco with Aramex or DHL.",
      "We offer international delivery with duties included in the final price.",
      "Rugs are rolled, wrapped in polypropylene, and boxed for international transit so they arrive protected and presentation-ready.",
    ].join("\n\n"),
    seoTitle: "Shipping policy | Loom & Hearth Studio",
    seoDescription:
      "Shipping policy for Loom & Hearth Studio orders shipped from Morocco with duties included for international delivery.",
  },
  {
    slug: "returns-policy",
    title: "Returns policy",
    body: [
      "Damaged items",
      "If your item arrives damaged, contact us within 48 hours of delivery with photos of the package and the item. If the damage is confirmed, we will arrange a replacement or a refund.",
    ].join("\n\n"),
    seoTitle: "Returns policy | Loom & Hearth Studio",
    seoDescription: "Returns policy information for the Loom & Hearth Studio launch.",
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    bodyFormat: "markdown",
    body: String.raw`**Loom and Hearth Studio LLC**
Effective date: March 29, 2026
Last updated: March 29, 2026

---

## 1. Who we are

This website is operated by **Loom and Hearth Studio LLC**, a company registered in the state of Wyoming, United States. We sell handcrafted Moroccan rugs, poufs, pillows, and home décor, shipping all orders directly from Morocco.

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
Email: hello@loomandhearthstudio.com

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

This website is operated by **Loom and Hearth Studio LLC**, a company registered in the state of Wyoming, United States. We source and sell handcrafted Moroccan rugs, poufs, pillows, and home décor. All products are sourced in Morocco and ship directly from Morocco to your delivery address.

For any legal or commercial questions, contact us at:
**hello@loomandhearthstudio.com**

By accessing this website or placing an order, you agree to these Terms of Service in full. If you do not agree, do not use the site or place an order.

---

## 2. What we sell

We sell handcrafted Moroccan rugs, poufs, pillows, and home décor items. Products are sourced directly from artisans and bazaars in Morocco and are described on each product page.

**One-of-one products.** Many rugs in our collection are unique, one-of-one handmade pieces. These are identified clearly on their product pages. For one-of-one items:

- The photographs and description represent the exact item being sold  not a representative sample or a style reference.
- Once sold, the item will not be restocked. A similar piece may be listed in the future as a separate product.
- Product pages for sold one-of-one items remain visible on the site marked as Sold Out. This is intentional.

**Multi-unit products.** Poufs, pillows, and some décor items may have more than one unit available. These products may have variants such as size or colour, which are specified on the product page.

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

All prices are displayed in United States Dollars (USD). Prices include the cost of the item and, for US orders, duties and customs fees as described in section 6. Prices do not include return shipping.

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

**If we cannot reach you.** If we do not receive a response within 7 days of the order date after two contact attempts, we will capture payment and dispatch your order as described.

Accepting the pre-shipment verification offer significantly reduces the likelihood of returns due to colour or size mismatch. We encourage all buyers to take advantage of it.

---

## 6. Shipping and delivery

### 6.1 All orders ship from Morocco

Every item in our collection is sourced and stored in Morocco. All orders are packed and dispatched from Morocco.

### 6.2 Carriers

We ship using DHL Express, FedEx International, or Aramex, selected based on destination and shipment weight.

### 6.3 Estimated delivery times

- United States: 7 to 14 business days from dispatch
- Europe: 10 to 18 business days from dispatch
- Australia: 14 to 21 business days from dispatch

These are estimates, not guarantees. Customs clearance, carrier delays, and circumstances outside our control may extend delivery times. We will provide you with a tracking number when your order is dispatched so you can monitor progress.

### 6.4 Dispatch timing

Orders are dispatched after pre-shipment verification is complete and payment is captured. Allow up to 7 days from the order date for this process before dispatch. Actual dispatch is typically faster.

### 6.5 Risk of loss

Risk of loss and damage passes to you when the item is handed to the carrier for shipment. If your item is lost or significantly delayed, contact us within 30 days of the expected delivery date and we will open an investigation with the carrier and work toward a resolution.

### 6.6 Import duties and customs  United States

For orders shipping to the United States, import duties are included in the product price. You will not be charged additional customs fees at the door for US orders under normal circumstances.

We handle all customs documentation for US shipments. The duty treatment for each product is based on the applicable Harmonised Tariff Schedule code and Morocco-United States Free Trade Agreement eligibility. In the rare event of an unexpected customs charge on a US order that arises from our documentation, contact us and we will resolve it.

### 6.7 Import duties and customs  all other destinations

For orders shipping outside the United States, import duties, VAT, GST, and any applicable customs fees are the buyer's responsibility. These charges are assessed by your country's customs authority and are outside our control. We do not collect or pre-pay these charges for non-US orders.

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
Email: hello@loomandhearthstudio.com

We aim to respond to all inquiries within 5 business days.`,
    seoTitle: "Terms of Service | Loom & Hearth Studio",
    seoDescription: "Terms of Service for Loom & Hearth Studio.",
  },
] as const;



