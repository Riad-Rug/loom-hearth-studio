import { storePromise } from "@/lib/order/store-promise";
import type { ProductCategory } from "@/types/domain";

export const catalogLanding = {
  eyebrow: "Collection",
  title: "Moroccan Rugs, Poufs & Pillows",
  description:
    "Handcrafted Moroccan rugs, poufs, pillows, and decor \u2014 sourced directly from Marrakech. Every rug is ONE OF A KIND. When a piece sells, it does not return.",
  bullets: [
    "Hand-knotted rugs, poufs and pillow covers sewn from handmade wool textiles, and handcrafted decor",
    "Every rug is ONE OF A KIND \u2014 sold pieces are not restocked",
    "Filter by category or sort by price and arrival date",
  ],
} as const;

/** The shop header's three widths: above 900px, 769 to 900px, 768px and below. */
export type CatalogViewport = "desktop" | "tablet" | "phone";

/**
 * One stretch of header text. A plain string shows at every width; an object
 * shows only at the widths in `on`, and with `link` it is the
 * international-shipping inquiry link. Keep the spaces inside the run that
 * owns them, so the line reads correctly with any run hidden.
 */
export type CatalogIntroRun =
  | string
  | { text: string; on: readonly CatalogViewport[]; link?: true };

/** A paragraph shows at every width where at least one of its runs shows. */
export type CatalogIntroParagraph = readonly CatalogIntroRun[];

export type CatalogIntro = {
  paragraphs: readonly CatalogIntroParagraph[];
  /** The line that closes the header, set in the smaller trust-note style. */
  closing: CatalogIntroParagraph;
};

const desktopOnly = (text: string): CatalogIntroRun => ({ text, on: ["desktop"] });
const desktopAndTablet = (text: string): CatalogIntroRun => ({ text, on: ["desktop", "tablet"] });
const phoneOnly = (text: string): CatalogIntroRun => ({ text, on: ["phone"] });
const shipsWorldwide = `Ships worldwide from ${storePromise.shipsFromCity}`;
const freeShippingClause = `, free on orders of $${storePromise.freeShippingThresholdUsd} or more`;

/** The shipping line every shop header carries unless its intro says otherwise. */
export const catalogShippingScopeNote: CatalogIntroParagraph = [
  shipsWorldwide,
  desktopAndTablet(freeShippingClause),
  ".",
];

/**
 * Shop header copy. Each paragraph is written once and narrower screens drop
 * runs from it, so the page carries a single copy of the text while a phone
 * still gets a shorter header than a desktop column. The widths match the
 * catalog's own breakpoints (.hideOnDesktop / .hideOnTablet / .hideOnPhone in
 * catalog-page.module.css): 900px is where the filter sidebar collapses above
 * the grid, 768px where the grid drops to phone gutters.
 *
 * Keyed by "shop" for the /shop landing and by ProductCategory for a category
 * route. A route with no entry here keeps the default header instead: the
 * restock note, the shipping-scope note, then its own editorial description
 * from `catalogCategories`. Rug-style collections always keep the default,
 * because their own description is the point of the page.
 */
export const catalogIntros: Partial<Record<"shop" | ProductCategory, CatalogIntro>> = {
  shop: {
    paragraphs: [
      [
        desktopAndTablet("Handmade "),
        "Moroccan rugs, pillows, poufs, vintage pieces and ",
        desktopAndTablet("artisanal "),
        phoneOnly("handmade "),
        "decor, sourced",
        desktopAndTablet(" and selected"),
        " across Morocco.",
      ],
      [
        desktopOnly(
          "Some pieces are old, some are newly made — each one is chosen for its materials, craftsmanship and character.",
        ),
      ],
    ],
    closing: catalogShippingScopeNote,
  },
  rugs: {
    paragraphs: [
      [
        "Handmade ",
        desktopAndTablet("Moroccan "),
        "rugs selected ",
        phoneOnly("across Morocco "),
        "for their wool, weave, condition and character.",
      ],
      [
        desktopOnly("Explore "),
        desktopAndTablet("Beni Ourain, Azilal, Boujad, "),
        desktopOnly("Beni M'Guild, "),
        desktopAndTablet("Zemmour, Taznakht"),
        desktopOnly(", Glaoua, Boucherouite"),
        desktopAndTablet(" and other weaving traditions from across Morocco."),
      ],
    ],
    closing: [
      desktopAndTablet(shipsWorldwide),
      desktopOnly(freeShippingClause),
      desktopAndTablet("."),
      phoneOnly(" Shop the collection below."),
    ],
  },
  vintage: {
    paragraphs: [
      [
        "Vintage Moroccan rugs selected for their ",
        desktopAndTablet("wool, weave, "),
        "condition",
        phoneOnly(", craftsmanship"),
        " and character.",
      ],
      [
        desktopAndTablet("Each vintage Moroccan rug is carefully checked"),
        desktopOnly(" for wear, repairs and structural condition"),
        desktopAndTablet(" before it is listed."),
      ],
    ],
    closing: [
      desktopAndTablet(shipsWorldwide),
      desktopOnly(freeShippingClause),
      desktopAndTablet(". "),
      "Shop the collection below.",
    ],
  },
  poufs: {
    paragraphs: [
      [
        "Our poufs are made from handmade textiles, including Bettania, handira, flatweave rugs and pile rugs.",
        desktopOnly(
          " Each pouf is cut and sewn to bring the textile's colors, patterns and texture into a different form.",
        ),
      ],
      [
        desktopAndTablet("A large rug may give us enough material for two poufs"),
        desktopOnly(
          ". More often, we make a pouf and pillows from the same rug or Bettania",
        ),
        desktopAndTablet(", so you may find pieces in the collection that go together."),
      ],
    ],
    closing: [
      desktopAndTablet(shipsWorldwide),
      desktopOnly(freeShippingClause),
      desktopAndTablet("."),
      phoneOnly(" Shop the collection below."),
    ],
  },
  pillows: {
    paragraphs: [
      [
        "Our pillow covers are made from handmade textiles, including Bettania, handira, flatweave rugs and pile rugs.",
      ],
      [
        desktopAndTablet("One textile can give us enough material for several covers"),
        desktopOnly(". Sometimes we make poufs from the same rug or Bettania too"),
        desktopAndTablet(", so you may find pillow covers and poufs that go together."),
      ],
      ["Covers only; filling is not included."],
    ],
    closing: [
      desktopAndTablet(shipsWorldwide),
      desktopOnly(freeShippingClause),
      desktopAndTablet("."),
      phoneOnly(" Shop the collection below."),
    ],
  },
};

export type CatalogFaq = { question: string; answer: string };

/**
 * Long-form copy set below the product grid. `body` is plain text with a blank
 * line between paragraphs, and both it and FAQ answers accept inline
 * [text](/path) links. The first paragraph shows in full, the second is cut to
 * two lines, and the rest open with "Read more"; FAQs always show.
 */
export type CatalogGuide = {
  heading: string;
  body: string;
  faqs?: readonly CatalogFaq[];
};

/**
 * Category routes whose editorial description is rendered in its own section
 * below the product grid rather than in the page header. These are exactly the
 * routes carrying intro copy up top (see `catalogIntros`): the long read is
 * worth keeping on the page for what it says about the pieces, but not at the
 * cost of pushing the grid below the fold. The prose itself stays in
 * `catalogCategories`, so there is one description per route either way.
 * Rug-style pages carry their own guide in rug-style-collections.ts.
 */
export const catalogBelowGridEssays: Partial<
  Record<"shop" | ProductCategory, Omit<CatalogGuide, "body">>
> = {
  rugs: { heading: "About Moroccan rugs" },
  vintage: { heading: "About vintage Moroccan rugs" },
  poufs: {
    heading: "About Moroccan poufs",
    faqs: [
      {
        question: "Can I find a pillow that matches my pouf?",
        answer:
          "Sometimes. When a textile is large enough, it becomes both a pouf and [pillow covers](/shop/pillows), and each piece is listed on its own.",
      },
      {
        question: "How do I clean a wool pouf?",
        answer:
          "Vacuum the cover on low suction. For a spill, blot with cold water and a little wool-safe detergent instead of rubbing, and avoid steam and high heat.",
      },
    ],
  },
  pillows: {
    heading: "About Moroccan pillow covers",
    faqs: [
      {
        question: "Is the pillow insert included?",
        answer:
          "No. You get the cover only. The listing gives its exact size, so you can buy an insert to match.",
      },
      {
        question: "How do I care for a wool pillow cover?",
        answer:
          "Spot clean with cold water and a little wool-safe detergent, and blot instead of rubbing. Avoid machine washing and high heat.",
      },
    ],
  },
};

export const catalogCategories = [
  {
    key: "rugs",
    label: "Rugs",
    title: "Moroccan Rugs",
    href: "/shop/rugs",
    description:
      "Moroccan rugs are often sold by names such as Beni Ourain, Azilal, Boujad, Beni M'Guild, Zemmour, Glaoua, Boucherouite and Taznakht. Those names are useful, but I prefer to start with something more basic: where the rug comes from, how it was woven, and what the materials can tell us.\n\nGeography has always influenced weaving in Morocco. Colder mountain regions often produced heavier, higher-pile rugs, while other areas developed lighter flatweaves or combinations of pile and flatweave. Local wool, available dyes, trade routes and weaving traditions all played a part in how rugs from different parts of Morocco developed.\n\nThe Middle Atlas is closely associated with thick wool rugs made for colder conditions. The best-known examples are Beni Ourain rugs, usually recognized for their ivory wool and darker geometric lines. Other Middle Atlas traditions, including Beni M'Guild rugs, are often much richer in colour, with deep reds, oranges and other warm tones.\n\nIn the High Atlas, weaving can take several forms. Glaoua rugs are known for combining techniques, often mixing flatwoven sections with pile and graphic bands. Rugs sold as Azilal are frequently lighter in ground colour, with expressive geometric forms and stronger contrasts.\n\nAcross the central plains, you find other very different traditions. Boujad rugs are often associated with warm reds, pinks, oranges and painterly compositions, while Zemmour rugs are known for strong geometric structures and, in many examples, rich red grounds.\n\nFurther south, around Taznakht and the Siroua region, rugs can become especially detailed. Some combine pile, flatweave and other weaving techniques within the same piece, with dense patterns and complex colour combinations.\n\nThese regional and tribal names are useful, especially because they are the terms most people use when looking for Moroccan rugs. But I do not treat every label as absolute proof of origin.\n\nAttribution can be complicated. Rugs move between villages, markets, dealers and cities, and similar techniques may appear across neighbouring areas. When I am confident about a rug's origin or tradition, I say so. When I am not, I would rather describe it carefully than give it a more precise label than the evidence supports.\n\nWhen I examine a rug, I pay attention to the wool, weave, back, knots, weight, pile and overall construction. Hand-spun wool often has natural variations in thickness, and the back of a hand-knotted rug can reveal individual knots rather than the regular structure of machine-made fabric. I also look at condition, repairs, wear and how the pile changes when it catches the light.\n\nSome rugs in the collection are older pieces that cannot simply be reproduced, while others come from continuing Moroccan weaving traditions. In every case, the aim is the same: to describe each rug as accurately as I can and let the materials, construction and design speak for themselves.",
    bullets: [
      "Hand-knotted pile rugs, Moroccan flatweaves (hanbel), and ONE OF A KIND vintage pieces",
      "Construction details \u2014 pile depth, fibre type, knot structure \u2014 documented in every listing",
      "Filter by style or sort by price and arrival date",
    ],
  },
  {
    key: "vintage",
    label: "Vintage Rugs",
    title: "Vintage Moroccan Rugs",
    href: "/shop/vintage",
    description:
      "\u201cVintage\u201d gets used loosely in this market, so here's what it means on this site.\n\nFor me, identifying a vintage Moroccan rug starts with its colors, texture and signs of wear, but also the quality of the weaving and how well it has held up over the years. Handling rugs every day, I often find that older pieces feel denser and more solid than the newer, lighter rugs made for the tourist market. Some also still have their original grading labels attached to the back, providing another detail I look at when assessing the piece and its history.\n\nI check the edges for fraying, look for areas where the pile has worn through, and inspect the knots on the back. I also check how the rug lies on the floor, looking for waves or buckling.\n\nYou may notice variations in color across a rug. I see these as part of its character.\n\nSome rugs have had repairs over the years. When that's the case, I point them out in the listing. A repair doesn't put me off a rug, as long as it's been done well.\n\nHave a question about a rug? [Get in touch](https://www.loomandhearthstudio.com/contact) and I'll be happy to tell you more about it.",
    bullets: [
      "Assessed for wool quality, knot consistency, and structural integrity before listing",
      "Condition and any repairs disclosed honestly, not softened in copy",
      "Sort by price, size, or arrival date",
    ],
  },
  {
    key: "poufs",
    label: "Poufs",
    title: "Moroccan Poufs",
    href: "/shop/poufs",
    description:
      "Each pouf here is sewn from a handwoven Moroccan textile, such as a flatweave, a knotted pile rug, a Battania blanket or a handira. My mother cuts the panels, matches the faces and closes the seams by hand, then fits a zipper.\n\nThe textile was never woven to be a pouf, so the sides do not always match. One pouf can combine two or three different weavings, and a pile top can sit over a plain flatweave base. No two poufs are the same, even when they come from the same textile.\n\nPoufs ship flat and unstuffed. You fill yours at home with folded blankets, spare textiles or a pouf insert of the right size, and you can make it as firm as you like.",
    bullets: [
      "Cut from handwoven wool textiles: flatweaves, pile rugs and blankets",
      "Panels cut, matched and sewn by hand, so no two are identical",
      "Ships flat and unstuffed",
    ],
  },
  {
    key: "pillows",
    label: "Pillows",
    title: "Moroccan Pillow Covers",
    href: "/shop/pillows",
    description:
      "The covers here are cut from handwoven Moroccan textiles. Battania is a handwoven wool blanket. Hanbel is the Moroccan flatweave sold elsewhere as kilim, so a hanbel cover is the same kind of piece as a kilim pillow cover.\n\nSome of these textiles are vintage, so a cover can show small signs of age along with the uneven weave and shifts in tone that come from handwork. Some covers use one textile on both sides. Others pair a patterned front with a plain back, or a hanbel front with Battania behind it, so one pillow gives you two looks.\n\nOne textile can give enough material for several covers, and sometimes for [a pouf](/shop/poufs) as well, so you may find pieces that go together. Each listing gives the exact size of the cover.",
    bullets: [
      "Covers cut from Battania blankets and hanbel flatweaves, also sold as kilim",
      "Some textiles are vintage and show their age",
      "Covers only; insert not included",
    ],
  },
  {
    key: "decor",
    label: "Decor & Antiques",
    title: "Moroccan Decor & Antiques",
    href: "/shop/decor",
    description:
      "This is a small, deliberately limited category. Every piece here \u2014 ceramics, vessels, small furniture, worked metal \u2014 passed the same test the rugs do: I looked at it in person, checked how it was made, and decided it was good enough to stand next to a rug I'd sell under my own name. Nothing gets added just to make the shop look fuller.\n\nMost of what ends up here is old rather than new \u2014 pieces that were made for use, not for export, and show it in small ways: a repaired handle, a worn glaze, a join that was clearly done by hand and not a mould. Where a piece is genuinely old by trade convention, I say so. Where it's a well-made newer piece, I say that instead. The word \u201cauthentic\u201d doesn't tell you anything on its own, so I try not to use it without something specific behind it.",
    bullets: [
      "Ceramics, vessels, small furniture, and worked metal \u2014 assessed in person, not sourced remotely",
      "Age and condition described specifically rather than labeled \u201cauthentic\u201d",
      "A small, curated set \u2014 not a catch-all category",
    ],
  },
] as const satisfies ReadonlyArray<{
  key: ProductCategory;
  label: string;
  title: string;
  href: string;
  description: string;
  bullets: readonly string[];
}>;

// "featured" is the default and needs no client-side reordering: the catalog
// repository already lists products by `updatedAt desc` (see
// PrismaProductRepository.listAll/listByCategory), and a search hands back best
// match first. "newest" is the explicit sort by listing date (createdAt).
export const catalogSortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type CatalogSortOption = (typeof catalogSortOptions)[number]["value"];

export const defaultCatalogSortOption = "featured" satisfies CatalogSortOption;


// Multi-select, like category: no selection means "every price", so there's no
// "Any" option to check. One table feeds the filter logic and the controls. A band
// covers min <= price < max (no max means open-ended), so a $250 piece sits in
// "$250-400". Cut to the stock: most of the catalog sits under $300 and nothing
// sits above $600, so the old Under $300 / $300-600 / $600+ split said little.
export const catalogPriceBands = [
  { value: "under-100", label: "Under $100", min: 0, max: 100 },
  { value: "100-250", label: "$100\u2013250", min: 100, max: 250 },
  { value: "250-400", label: "$250\u2013400", min: 250, max: 400 },
  { value: "400-plus", label: "$400 and over", min: 400, max: null },
] as const satisfies ReadonlyArray<{
  value: string;
  label: string;
  min: number;
  max: number | null;
}>;

export type CatalogPriceBand = (typeof catalogPriceBands)[number];
export type CatalogPriceFilter = CatalogPriceBand["value"];

// Category filter options for the shop sidebar. Ordered the way the shop reads
// left to right in the header's Collection menu rather than by catalogCategories
// order; `vintage` is a real ProductCategory of its own (not a rug sub-style),
// so every option maps 1:1 onto a category key and its route.
export const catalogCategoryFilterOptions = [
  { value: "rugs", label: "Rugs", href: "/shop/rugs" },
  { value: "poufs", label: "Poufs", href: "/shop/poufs" },
  { value: "pillows", label: "Pillows", href: "/shop/pillows" },
  { value: "vintage", label: "Vintage Rugs", href: "/shop/vintage" },
  { value: "decor", label: "Decor & Antiques", href: "/shop/decor" },
] as const satisfies ReadonlyArray<{
  value: ProductCategory;
  label: string;
  href: string;
}>;

export type CatalogCategoryFilterOption = (typeof catalogCategoryFilterOptions)[number];

// Multi-select, like category and price: no selection means "every size", so
// there's no "All" option to check.
export type CatalogSizeFilter =
  | "accent"
  | "small"
  | "medium"
  | "large"
  | "oversized";

export type CatalogSizeFilterOption = {
  value: CatalogSizeFilter;
  label: string;
  /** Concrete footprint range, shown as a second line on rug-only views. */
  hint?: string;
  /** Spoken form of label + hint, so screen readers don't read "ft²" raw. */
  spokenLabel?: string;
};

// Size buckets are category-relative: the server classifies each product against
// its own category's footprint scale (see getProductSizeBucket in
// lib/catalog/service.ts). On rug-only views the tiers carry the concrete area
// range, because "Medium" alone tells a shopper nothing about their room.
export const rugSizeFilterOptions: readonly CatalogSizeFilterOption[] = [
  { value: "accent", label: "Accent", hint: "to 13 ft²", spokenLabel: "Accent, up to 13 square feet" },
  { value: "small", label: "Small", hint: "13–17 ft²", spokenLabel: "Small, 13 to 17 square feet" },
  { value: "medium", label: "Medium", hint: "17–21 ft²", spokenLabel: "Medium, 17 to 21 square feet" },
  { value: "large", label: "Large", hint: "21–32 ft²", spokenLabel: "Large, 21 to 32 square feet" },
  {
    value: "oversized",
    label: "Oversized",
    hint: "32 ft² +",
    spokenLabel: "Oversized, 32 square feet and up",
  },
];

// Mixed views span rugs and much smaller pieces, so a single area range would be
// wrong for half the grid: names only, each piece measured against its own scale.
export const genericSizeFilterOptions: readonly CatalogSizeFilterOption[] = [
  { value: "accent", label: "Accent" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "oversized", label: "Oversized" },
];

