import type { CatalogGuide } from "@/features/catalog/catalog-data";

/**
 * Written copy for a rug Type or Region page, keyed by its slug
 * (lib/catalog/rug-facets.ts). A Type or Region without an entry gets a plain
 * header and stays noindex until its guide copy is written here.
 */
export type RugStylePageCopy = {
  /** The page's H1. */
  heading: string;
  /** The <title>, before the " | Loom & Hearth" suffix. Under 45 characters keeps the whole title near 60. */
  metaTitle: string;
  /** Search-result snippet. Keep it at or under 155 characters. */
  metaDescription: string;
  /** Set below the product grid. */
  guide: CatalogGuide;
};

export type RugStyleCollection = {
  /** Short name used for nav labels, breadcrumbs and links to the page. */
  title: string;
  /** The paragraph under the H1. */
  description: string;
  bullets: readonly string[];
  category: "rugs" | "vintage";
  /** Absent on `vintage`, whose /shop/rugs/vintage URL redirects to /shop/vintage. */
  page?: RugStylePageCopy;
};

export const rugStyleCollections = {
  "beni-ourain": {
    title: "Beni Ourain Rugs",
    description:
      "Browse Beni Ourain rugs selected for hand-knotted wool construction, pale fields, and restrained geometric pattern. Each rug is reviewed as an individual piece before it is listed.",
    bullets: [
      "Hand-knotted wool pile rugs with visible construction notes",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
    page: {
      heading: "Beni Ourain Rugs",
      metaTitle: "Beni Ourain Rugs: Hand-Knotted Moroccan Wool",
      metaDescription:
        "Hand-knotted Beni Ourain rugs from the Middle Atlas, undyed ivory wool with dark diamond lines. See photos and video of the exact rug before you pay.",
      guide: {
        heading: "About Beni Ourain rugs",
        body:
          "Beni Ourain rugs come from the Middle Atlas, where rugs were woven thick for cold winters. The classic Beni Ourain is hand-knotted from undyed ivory wool, with a lattice of diamonds or zigzags in dark brown or black.\n\nThe lines are drawn freehand, so a diamond can lean or widen from one end of the rug to the other. Hand-spun wool varies in thickness, and undyed wool from different fleeces differs a little in tone, so the ivory is rarely one flat color. I see both as a record of how the rug was made, not as faults.\n\nNot every Beni Ourain follows the classic pattern. Some weavers used fuller designs or added color, and some worked the design into the pile itself, with high and low areas instead of lines. In each listing I describe the pattern, the pile and the construction, and I photograph the back so you can see the knots.",
        faqs: [
          {
            question: "Will a Beni Ourain rug shed?",
            answer:
              "Yes, at first. A new wool pile rug sheds loose fibers in its first weeks on the floor. Vacuum on low suction without a beater brush, and the shedding stops once those fibers have worked out.",
          },
          {
            question: "How do I clean an ivory wool rug?",
            answer:
              "Vacuum it regularly on low suction. Blot spills with cold water and a little wool-safe detergent instead of rubbing. For a deep clean, use a professional who works with hand-knotted wool, and avoid steam, high heat and machine washing.",
          },
        ],
      },
    },
  },
  boujad: {
    title: "Boujad Rugs",
    description:
      "Browse Boujad rugs from the plains around Boujad in central Morocco, hand-knotted in wool and recognised for expressive, folk-art motifs drawn across warm pink, magenta, and purple grounds. Each rug is reviewed as an individual piece before it is listed.",
    bullets: [
      "Hand-knotted wool pile rugs with expressive, freely drawn motifs",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
    page: {
      heading: "Boujad Rugs",
      metaTitle: "Boujad Rugs: Warm-Toned Moroccan Wool Rugs",
      metaDescription:
        "Boujad rugs from central Morocco in warm reds, pinks and purples, in knotted pile and flatweave. Approve photos and video of the exact rug before you pay.",
      guide: {
        heading: "About Boujad rugs",
        body:
          "Boujad, also spelled Bejaâd, is a town on the plains of central Morocco. Rugs from the area are known for warm grounds in red, pink, orange and purple, with motifs drawn loosely across the field rather than set in a strict repeat.\n\nA Boujad composition often has no border and no formal symmetry. Blocks of color shift across the rug, and lines and small shapes sit wherever the weaver put them, which is why these rugs are often called painterly.\n\nThe name covers more than one technique. Many Boujad rugs are knotted pile, and weavers in the area also make flatweaves, some with motifs embroidered on top. Each listing says how the rug was made and what it is made of.",
        faqs: [
          {
            question: "Are Boujad and Bejaâd rugs the same?",
            answer:
              "Yes. Bejaâd is another spelling of Boujad, and both names are used for rugs from the same area.",
          },
          {
            question: "How does a flatweave feel compared with a pile rug?",
            answer:
              "A knotted pile rug is thicker and softer underfoot. A flatweave has no pile, so it is thinner and lighter, and it does not shed.",
          },
        ],
      },
    },
  },
  azilal: {
    title: "Azilal Rugs",
    description:
      "Browse Azilal rugs from the Azilal region of the central Atlas, hand-knotted in wool with colourful abstract and geometric drawing set on a pale ivory ground. A more decorative relative of the Beni Ourain, reviewed piece by piece before listing.",
    bullets: [
      "Hand-knotted wool pile rugs with colour drawing on an ivory field",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
    page: {
      heading: "Azilal Rugs",
      metaTitle: "Azilal Rugs: Hand-Knotted High Atlas Wool",
      metaDescription:
        "Azilal rugs from the High Atlas, hand-knotted wool pile with bright, freely drawn motifs on an ivory ground. Approve photos and video before you pay.",
      guide: {
        heading: "About Azilal rugs",
        body:
          "Azilal rugs are named for the Azilal region of the High Atlas. Like Beni Ourain rugs, they are hand-knotted in wool, usually on an undyed ivory ground. The difference is the drawing on top, which is freer and carries far more color.\n\nThe motifs are rarely planned as a repeat. A weaver may change a shape partway across, leave part of the field open, or fill it with small knots of color, so two Azilal rugs seldom look alike. Hand-spun wool adds its own variation in thickness and tone.\n\nWhen a rug here is listed as Azilal-type, I am attributing it from its construction and design, not from a seller's label or a documented origin. When I have firmer evidence, the listing says what it is.",
        faqs: [
          {
            question: "How is an Azilal different from a Beni Ourain?",
            answer:
              "Both are hand-knotted wool pile rugs on a pale ground. A Beni Ourain keeps mostly to dark lines on ivory. An Azilal adds bright color and looser, more varied drawing.",
          },
          {
            question: "Are the colors natural dyes?",
            answer:
              "Not always. When I have assessed a rug's dye, the listing says whether I read it as natural or synthetic. I do not claim natural dye where I cannot verify it.",
          },
        ],
      },
    },
  },
  "beni-m-guild": {
    title: "Beni M'Guild Rugs",
    description:
      "Browse Beni M'Guild rugs from the Middle Atlas, hand-knotted in thick wool with deep reds, oranges, and blacks arranged in banded diamond and lozenge patterns. Woven for real everyday use, and reviewed as an individual piece before it is listed.",
    bullets: [
      "Hand-knotted wool pile rugs with a heavier, everyday-use pile",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
    page: {
      heading: "Beni M'Guild Rugs",
      metaTitle: "Beni M'Guild Rugs: Thick Middle Atlas Wool",
      metaDescription:
        "Beni M'Guild rugs from the Middle Atlas, thick hand-knotted wool in deep reds, oranges and black. See photos and video of the exact rug before you pay.",
      guide: {
        heading: "About Beni M'Guild rugs",
        body:
          "Beni M'Guild rugs come from the Middle Atlas, the same mountains as Beni Ourain rugs, and they are thick pile rugs too. Where a Beni Ourain keeps to ivory and dark lines, a Beni M'Guild is usually full of color, with deep reds, oranges and black.\n\nThe pattern is often built from diamonds and lozenges, set in bands or in a lattice across the field. These rugs were made for everyday use on cold floors, so the pile is heavy and the wool dense.\n\nOlder Beni M'Guild rugs often show their use, with worn areas in the pile and colors that have softened over time. When a rug has wear or repairs, I point them out in the listing, and you see photos and video of the exact rug before you pay.",
        faqs: [
          {
            question: "How is a Beni M'Guild different from a Beni Ourain?",
            answer:
              "Both are thick, hand-knotted pile rugs from the Middle Atlas. A Beni Ourain is mostly undyed ivory with dark lines. A Beni M'Guild uses strong color, usually reds, oranges and black.",
          },
          {
            question: "Can a wool pile rug be used outdoors?",
            answer:
              "No. Wool absorbs moisture and will mildew outdoors, so keep a pile rug inside.",
          },
        ],
      },
    },
  },
  zemmour: {
    title: "Zemmour Rugs",
    description:
      "Browse Zemmour rugs from the Middle Atlas plateau, woven in both knotted pile and flatweave (hanbel) form and known for tightly banded geometric pattern, often on a red ground. Each rug is reviewed as an individual piece before it is listed.",
    bullets: [
      "Handwoven wool pieces in banded geometric pattern, pile or flatweave",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
    page: {
      heading: "Zemmour Rugs",
      metaTitle: "Zemmour Rugs: Banded Moroccan Wool Rugs",
      metaDescription:
        "Zemmour rugs and hanbel flatweaves from around Khémisset, with tight bands of pattern in red, ivory and black. Approve photos and video before you pay.",
      guide: {
        heading: "About Zemmour rugs",
        body:
          "Zemmour rugs come from the Zemmour region around Khémisset and Tiflet, between Rabat and Meknès. They are known for tight bands of geometric pattern, such as diamonds, zigzags and lozenges, often worked in ivory and black on a deep red ground.\n\nZemmour weavers made both knotted pile rugs and flatweaves, called hanbel. In a hanbel the pattern is built into the cloth as it is woven, with extra wefts and sometimes embroidery raised a little above a flat ground. With no pile, the rug is thin and firm, and light enough to move.\n\nA narrow Zemmour flatweave works as a runner in a hallway or beside a bed, and a firmly woven one can hang on a wall like a panel. Each listing gives the exact size and says whether the piece is pile or flatweave.",
        faqs: [
          {
            question: "Can a Zemmour flatweave hang on a wall?",
            answer:
              "Yes. A flatweave is thin and light, so it hangs flat. Some Zemmour pieces are woven so densely that they read more like a graphic panel than a blanket.",
          },
          {
            question: "Do Zemmour flatweaves shed?",
            answer:
              "No. A flatweave has no cut pile, so there are no loose fibers to work out. A new pile rug sheds for its first weeks, and a flatweave does not.",
          },
        ],
      },
    },
  },
  boucherouite: {
    title: "Boucherouite Rugs",
    description:
      "Browse Boucherouite rugs, woven from recycled fabric and yarn scraps rather than spun fleece, which makes them the most improvisational and vividly coloured of the Moroccan rug traditions. A comparatively recent craft, reviewed piece by piece before listing.",
    bullets: [
      "Handwoven rag rugs built from recycled fabric and mixed yarn",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
    page: {
      heading: "Boucherouite Rag Rugs",
      metaTitle: "Boucherouite Rugs: Moroccan Rag Rugs",
      metaDescription:
        "Boucherouite rag rugs, knotted or woven from strips of recycled fabric and yarn, so no two color mixes match. See the exact rug before you pay.",
      guide: {
        heading: "About Boucherouite rugs",
        body:
          "Boucherouite rugs are Moroccan rag rugs. The name comes from the Moroccan Arabic for scraps of cloth. Instead of spun wool, they are made from strips of old clothing, fabric offcuts and leftover yarn, knotted as pile or woven flat.\n\nBecause the material is whatever was at hand, the colors are often bright and unexpected. The pattern tends to be improvised, with blocks, stripes and outlines that change as the weaver's supply changed.\n\nIt is a recent craft compared with wool rug weaving. One boucherouite can combine cotton, wool and synthetic fiber, so I list the materials I can identify in each piece.",
        faqs: [
          {
            question: "Is every boucherouite one of a kind?",
            answer:
              "Yes. Each one is made from a different mix of scraps, so no two match, and when one sells it does not come back.",
          },
          {
            question: "How is a boucherouite different from a Beni Ourain?",
            answer:
              "A Beni Ourain is knotted from undyed wool in a traditional pattern. A boucherouite is made from whatever cloth was at hand, so its colors and layout are improvised.",
          },
        ],
      },
    },
  },
  "flatweave-hanbel": {
    title: "Flatweave (Hanbel) Rugs",
    description:
      "Browse hanbel flatweaves, woven without a knotted pile so they sit lighter and thinner than a pile rug, typically carrying banded geometric design. Historically used as floor coverings and as blankets, and reviewed as an individual piece before listing.",
    bullets: [
      "Flatwoven wool pieces with no knotted pile, light enough to layer",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
    page: {
      heading: "Moroccan Flatweave (Hanbel) Rugs",
      metaTitle: "Moroccan Kilim Rugs: Hanbel Flatweaves",
      metaDescription:
        "Moroccan hanbel flatweaves, the rugs often sold as kilims. No pile, so they are thin, light and do not shed. Approve photos and video before you pay.",
      guide: {
        heading: "About Moroccan flatweaves",
        body:
          "A flatweave has no knotted pile. In Morocco it is called a hanbel, and elsewhere it is often sold as a kilim. The pattern is made by the weft threads themselves as they pass over and under the warp, so the rug is thin and firm, and light enough to fold.\n\nMoroccan flatweaves were used as floor coverings and as blankets, and each region builds pattern its own way. Zemmour weavers set tight bands of diamonds across a red ground. Around Taznakht and the Siroua mountains, a weaver may fill the whole field with interlocking triangles worked in tapestry weave.\n\nMany flatweaves are reversible, because the design runs through the cloth instead of sitting on top. Some also carry raised work, such as thick cord or embroidery standing above the flat ground. The listing says which techniques a piece uses.",
        faqs: [
          {
            question: "Is a hanbel the same as a kilim?",
            answer:
              "In practice, yes. Kilim is the general word for a flatwoven rug, and hanbel is the Moroccan name for one.",
          },
          {
            question: "Can a flatweave be used outdoors?",
            answer:
              "Only lightly. A wool flatweave can handle some covered outdoor use in a dry climate, but it is not made for it, and wool left in damp conditions will mildew.",
          },
        ],
      },
    },
  },
  "mixed-technique": {
    title: "Mixed Technique Rugs",
    description:
      "Browse rugs that combine more than one construction in a single piece, most often knotted pile worked alongside flatwoven bands. Construction is stated per rug, and each one is reviewed as an individual piece before it is listed.",
    bullets: [
      "Handwoven pieces combining pile and flatweave in one rug",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
    page: {
      heading: "Mixed-Technique Moroccan Rugs",
      metaTitle: "Mixed-Technique Moroccan Rugs",
      metaDescription:
        "Moroccan rugs combining flatweave, knotted pile and brocade in one piece, from Taznakht, the Siroua and the High Atlas. See the exact rug before you pay.",
      guide: {
        heading: "About mixed-technique rugs",
        body:
          "A mixed-technique rug uses more than one way of weaving in a single piece. The usual base is a flatwoven ground with areas of knotted pile. Many add a third technique, such as brocade, where extra weft threads build small motifs that lie flat in the cloth, or embroidery worked on top.\n\nThe approach is closely tied to southern Morocco, around Taznakht and the Siroua mountains, and to Glaoua rugs from the High Atlas. Some are laid out in bands. Others are grids of compartments, with each square worked in a different color or technique.\n\nBecause each technique makes a different surface, these rugs look different up close than from across the room. The pile stands up and catches the light, the flat areas stay thin, and the whole rug is usually lighter than a pile rug of the same size. Each listing names the techniques used and where they appear.",
        faqs: [
          {
            question: "What does chedoui mean?",
            answer:
              "Chedoui is a trade term for paired work in two colors, usually ivory set against a darker ground. A chedoui à carreaux arranges that work in a grid of squares.",
          },
          {
            question: "Do mixed-technique rugs shed?",
            answer:
              "The pile areas can shed a little at first, like any new pile rug. The flatwoven areas do not.",
          },
        ],
      },
    },
  },
  vintage: {
    title: "Vintage Moroccan Rugs",
    description:
      "Browse vintage Moroccan rugs selected for structure, patina, and exact-piece character. These are collected pieces, not repeatable stock.",
    bullets: [
      "ONE OF A KIND vintage rugs with condition notes",
      "Selected for structural integrity, not age alone",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "vintage",
  },
} as const satisfies Record<string, RugStyleCollection>;

export type RugStyleCollectionSlug = keyof typeof rugStyleCollections;

export function getRugStyleCollection(slug: string): RugStyleCollection | null {
  return rugStyleCollections[slug as RugStyleCollectionSlug] ?? null;
}

/** Anchor for the parent rugs landing route, used as the first item in style menus. */
export const allRugsNavLink = {
  href: "/shop/rugs",
  label: "All Moroccan Rugs",
} as const;
