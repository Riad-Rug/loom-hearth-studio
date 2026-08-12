import type { BlogPost } from "@/types/domain";

export type BlogPostImage = {
  id: string;
  src: string;
  alt: string;
};

type PlaceholderBlogPost = BlogPost & {
  categoryLabel: string;
  readTime: string;
  images: BlogPostImage[];
  targetKeyword: string;
  updatedAt: string;
  ctaLabel: string;
  bodyFormat?: "plain" | "markdown";
};

export type BlogPostRecord = PlaceholderBlogPost;

export const blogPostMaxImages = 5;
export const blogPostMinImages = 1;

export const blogPosts: BlogPostRecord[] = [
  {
    id: "blog-marrakech-bazaar-grandfather",
    slug: "marrakech-rug-bazaar-my-grandfather",
    categorySlug: "sourcing",
    categoryLabel: "Sourcing stories",
    title: "The Marrakech Rug Bazaar My Grandfather Ran Since 1967",
    excerpt:
      "I grew up visiting my grandfather's rug bazaar in Marrakech, surrounded by Moroccan rugs, handmade objects and traditional craftsmanship. This is the story of what I learned from him, how the trade worked, and how those same values shape the way I source Moroccan rugs today.",
    bodyFormat: "markdown",
    body: [
      "I was four or five when I first visited my grandfather's bazaar in Marrakech. There was this big arch and a wooden door with coloured glass that immediately caught my eye. And when I stepped inside, it felt like the whole world opened up: rugs stacked high, lanterns overhead, wood and metal everywhere. It felt endless, like anything could be there.",
      "I didn't grow up in the bazaar. Most of my visits were during school holidays, when we came to Marrakech. For about a year, when I was ten or eleven, we lived in Marrakech, and I got to spend more time there.",
      "Every visit felt like an adventure. I'd go from room to room, peek behind chests, convinced there was always something I'd never seen before, even if it had been sitting there for years.",
      "And my grandfather had this lovely habit: he'd hand me a small gift before I left. One visit, it was a small leather wallet. Another time, it was a daadou, a hand drum with a clay body and animal skin stretched across the top. Another time, an oud.",
      "At that age, I only understood the feeling. It was alive, a little overwhelming, wonderful.",
      "As I got older, I started to see my grandfather differently. He had a presence that's hard to describe unless you met him. Immaculately dressed, clean-shaven, wearing perfume, he carried himself with quiet confidence.",
      "![Riad's grandfather standing in Marrakech, wearing a wool wrap over a shirt and tie](https://res.cloudinary.com/dnyhdvqra/image/upload/v1786401416/loom-hearth/blog/hwbioujzjvfqhx4dugod.jpg)",
      "Almost every day, on his way home from the bazaar for lunch, he'd stop at the butcher and buy what was needed for that evening. There was rarely a guest list: friends, merchants, travellers, customers from that morning. If you crossed his path that day, you might find yourself at his table.",
      "Watching him, I learned that the work wasn't only about things. It was about relationships, fairness and trust. Deals were sealed with a handshake. If he shook on it, that was his word.",
      "As I got older, I began to ask more questions. The bazaar wasn't just a place full of handmade pieces. It was the result of years of work, travel and building relationships.",
      "He didn't wait for things to come to him. He went out to find exceptional work and the people behind it. He took Moroccan craftsmanship to trade fairs abroad without ever having gone to school — he couldn't read or write, and he picked up what he needed of each language along the way. He built those connections through honesty, respect and instinct.",
      "There's a part of this history that people don't really know about now. Before the 1990s, you couldn't simply export a rug out of Morocco. You needed a licence, and in Marrakech only one or two people held one. My grandfather was one of them.",
      "Every rug had to be graded first at Dar Si Issa, a government office where they counted threads, measured density and classified the piece. That process determined whether a rug could leave the country. Between the weavers working in the back rooms, the pieces he sourced across Morocco and the rugs eventually sent abroad, the bazaar became part of a much wider trade in Moroccan craftsmanship.",
      "By its busiest years, the bazaar employed around twenty people, and caring for the pieces was a job in itself.",
      "I'll admit something I had wrong for a long time. I assumed that if a rug was handmade, the dyes in it were natural. They often aren't. Synthetic dyes have been used here for a long time, and you can usually see it in the colours — the natural range is narrow, madder and indigo and walnut and saffron and pomegranate and iron, so when a rug is full of hot, high-key colour, something modern did that.",
      "I sell synthetic-dyed rugs and I'm not apologising for them. A dye that holds its colour is not a flaw. Some of the best pieces I've handled were dyed that way, and the weaving, the wool and the hand behind them are exactly what they look like. A dye that bleeds or fades in patches is a real problem. That's the distinction worth caring about, not natural versus synthetic.",
      "What I won't do is let you believe you're buying plant dye when you aren't. Nobody should feel bad about the rug on their floor. They should just never have been lied to about it. So my listings say what they can support, and stop there.",
      "The bazaar is still standing, and the name is still on it: Bazar Berber, Fabrication de Tapis. My mom runs it now. Rugs aren't woven in the building anymore, but every [pouf](/shop/poufs) and every [pillow](/shop/pillows) I sell is made there, by her. Same rooms, same door with the coloured glass. When one of those ships out to you, it started in the building I used to run around in as a kid.",
      "Looking back, I understand that what made the bazaar special wasn't any single rug or object. It was the care behind every decision, the respect for the people who made each piece, and the relationships built over time.",
      "Those are the values I try to carry into how I source pieces today. My goal isn't simply to sell Moroccan rugs. It's to keep the craft in front of people, and to put each piece with someone who will value it.",
      "It's also why buying from me works the way it does. You reserve a piece and your card is authorised, not charged. I photograph that exact rug in daylight within 72 hours and send you the pictures. You only pay once you've seen it and approved it. Then it ships from Casablanca and reaches you in five to ten days, free over $150.",
      "A handshake used to be enough. This is the closest thing I can offer you from a distance.",
      "You can see what's available right now in the [rug collection](/shop/rugs).",
    ].join("\n\n"),
    publishedAt: "August 10, 2026",
    readTime: "5 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "Inside my grandfather's Marrakech rug bazaar, with stacked wool rugs, antique doors and copper lanterns",
      },
    ],
    seoTitle: "My Grandfather's Marrakech Rug Bazaar | Loom & Hearth Studio",
    seoDescription:
      "My grandfather ran a rug bazaar in Marrakech from 1967. How the export trade worked, how I returned to it, and what I first got wrong about dye.",
    targetKeyword: "Marrakech rug bazaar",
    updatedAt: "2026-08-11T09:00:00.000Z",
    ctaLabel: "Read the story",
  },
  {
    id: "blog-beni-ourain-guide",
    slug: "how-to-read-a-beni-ourain-rug",
    categorySlug: "rugs",
    categoryLabel: "Moroccan rugs",
    title: "How to Read a Beni Ourain Rug Before It Reaches the Room",
    excerpt:
      "A practical guide to pile depth, knot density, pattern spacing, and the back-of-rug indicators that separate a well-constructed Beni Ourain from a poor one.",
    body: [
      "The best Beni Ourain rugs read through wool before they read through pattern. A strong piece has pile depth that catches light, enough weight to sit convincingly in the room, and a softness that still feels architectural rather than floppy. When the wool looks flat, thin, or overly uniform, the rug usually reads more decorative than substantial.",
      "Pattern matters most in restraint. The linework should feel breathable, a little irregular, and spacious enough that the eye can still read the field from a distance. Tighter repeated diamonds can make a calm room feel busy, while a looser drawing gives the floor quiet structure without taking attention from the furniture above it.",
      "The reverse of the rug helps settle the question. A back with visible knots, stable tension, and honest irregularity tells you more about the rug than a styled room image ever will. That is why Beni Ourain pieces should be judged through pile, pattern spacing, and construction together rather than through trend language alone.",
    ].join("\n\n"),
    publishedAt: "April 12, 2026",
    readTime: "6 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "https://res.cloudinary.com/dnyhdvqra/image/upload/loom-hearth/products/rugs/znccufadjhla24dsv8ca",
        alt: "Overhead Beni Ourain rug photography showing plush wool pile, charcoal linework, and proportion across the full field.",
      },
    ],
    seoTitle: "How to read a Beni Ourain rug | Loom & Hearth Studio",
    seoDescription:
      "A Loom & Hearth Studio guide to judging a Beni Ourain rug through pile depth, knot read, and pattern spacing before it reaches the room.",
    targetKeyword: "beni ourain rug",
    updatedAt: "2026-04-12T09:30:00.000Z",
    ctaLabel: "Read the guide",
  },
  {
    id: "blog-layering-poufs-and-sabra-pillows",
    slug: "layering-poufs-and-sabra-pillows",
    categorySlug: "styling",
    categoryLabel: "Styling notes",
    title: "Layering Poufs and Sabra Pillows Without Losing the Room",
    excerpt:
      "A room-by-room guide to combining Moroccan poufs and cactus silk pillows — scale, spacing, colour contrast, and how to avoid too much competing texture.",
    body: [
      "Poufs work best when they solve two things at once: movement and texture. A single leather or striped floor pouf can soften the edge of a seating group, but it should still feel grounded by the rug beneath it and by enough negative space around it to keep the room breathable.",
      "Sabra pillows do the opposite job. They sharpen a sofa, bench, or daybed with a little geometry and faded colour, especially when the rest of the palette stays warm and restrained. The goal is not to stack as many as possible, but to let one or two handmade pieces carry the contrast.",
      "The most believable rooms mix the two with discipline. Use the pouf as the lower, quieter anchor and the pillows as the brighter accent note. That hierarchy keeps the room readable and keeps wool, leather, and cactus silk in balance.",
    ].join("\n\n"),
    publishedAt: "April 9, 2026",
    readTime: "5 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "https://images.pexels.com/photos/31371152/pexels-photo-31371152/free-photo-of-warm-moroccan-sunlight-on-traditional-cushions.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        alt: "Traditional Moroccan cushions in warm sunlight with woven texture and faded sabra-style patterning.",
      },
    ],
    seoTitle: "Layering poufs and sabra pillows | Loom & Hearth Studio",
    seoDescription:
      "Styling notes on using Moroccan poufs and cactus silk pillows with rugs, benches, and daybeds.",
    targetKeyword: "sabra pillows",
    updatedAt: "2026-04-09T14:10:00.000Z",
    ctaLabel: "Read the styling note",
  },
  {
    id: "blog-sourcing-notes-morocco",
    slug: "why-direct-sourcing-changes-the-collection",
    categorySlug: "sourcing",
    categoryLabel: "Sourcing stories",
    title: "Why Direct Sourcing in Morocco Changes the Collection",
    excerpt:
      "What becomes possible when rugs, poufs, pillows, and decor are selected in person: better material judgment, stronger category direction, and a more coherent point of view.",
    body: [
      "Collections feel sharper when they are edited close to the source. Seeing Moroccan pieces in person makes it easier to compare wool density, leather finish, hand feel, dye softness, and the small construction details that disappear in a marketplace thumbnail.",
      "That proximity also changes the mix. Instead of buying to fill categories abstractly, the collection can be built around what actually holds up: a quieter rug, a stronger sabra pillow, a more sculptural pouf, or a small decor object that finishes a shelf without feeling ornamental.",
      "For a direct storefront, that matters. The goal is not volume. It is to keep every piece aligned to the same room, the same material world, and the same standard of selection.",
    ].join("\n\n"),
    publishedAt: "April 5, 2026",
    readTime: "4 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
        alt: "A warm Moroccan interior with woven lamps, rattan furniture, and built-in seating that reflects Loom & Hearth Studio's sourcing direction.",
      },
    ],
    seoTitle: "Why direct sourcing changes the collection | Loom & Hearth Studio",
    seoDescription:
      "A sourcing story on how in-person selection in Morocco shapes the Loom & Hearth Studio collection.",
    targetKeyword: "direct sourcing morocco",
    updatedAt: "2026-04-05T11:45:00.000Z",
    ctaLabel: "Read the story",
  },
  {
    id: "blog-taznakht-difference",
    slug: "what-makes-a-taznakht-rug-different",
    categorySlug: "rugs",
    categoryLabel: "Moroccan rugs",
    title: "What Makes a Taznakht Rug Different from Other Moroccan Rugs",
    excerpt:
      "How tighter geometry, denser wool, and a more deliberate pattern logic set Taznakht rugs apart from softer, looser Moroccan families.",
    body: [
      "Taznakht rugs usually announce themselves through control. The patterning is tighter, the repeat more deliberate, and the field more architected than the softer drawing found in many other Moroccan weaving families. That makes them feel a little more graphic and a little less atmospheric at first glance.",
      "The wool structure matters just as much. Taznakht pieces often carry a denser handle and a cleaner edge between colour blocks, which helps the pattern stay readable in larger rooms. They can take stronger reds, terracottas, ochres, and dark outlining without collapsing into visual noise.",
      "The practical distinction is simple: when you want a Moroccan rug that behaves more like structure than haze, Taznakht is often the right direction. It holds geometry, carries colour with conviction, and still keeps the handwoven irregularity that prevents it from feeling mechanical.",
    ].join("\n\n"),
    publishedAt: "April 2, 2026",
    readTime: "5 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "https://res.cloudinary.com/dnyhdvqra/image/upload/loom-hearth/products/rugs/terracotta-field-rug-hero",
        alt: "Overhead Moroccan rug image with tighter geometric repeat and terracotta-led palette associated with Taznakht weaving.",
      },
    ],
    seoTitle: "What makes a Taznakht rug different | Loom & Hearth Studio",
    seoDescription:
      "A guide to the construction, geometry, and palette differences that set Taznakht rugs apart from other Moroccan weaving families.",
    targetKeyword: "taznakht rug",
    updatedAt: "2026-04-02T10:00:00.000Z",
    ctaLabel: "Read the guide",
  },
  {
    id: "blog-flatweave-vs-pile",
    slug: "difference-between-flatweave-and-pile-rug",
    categorySlug: "rugs",
    categoryLabel: "Moroccan rugs",
    title: "The Difference Between a Flatweave and a Pile Rug and When Each Belongs in a Room",
    excerpt:
      "A practical buying note on when you need plush pile, when you need a flatter weave, and how each changes movement, texture, and visual weight.",
    body: [
      "Pile rugs create softness first. They catch light, hold shadow, and bring warmth to a room even before furniture is layered onto them. If the room needs depth, acoustic softness, or a stronger sense of comfort, pile usually does the heavier architectural work.",
      "Flatweaves behave differently. They are lighter in profile, easier to layer, and more pattern-forward because the eye reads the surface without the interruption of taller wool. In rooms where furniture already has weight, a flatweave often gives enough colour and structure without making the floor feel heavy.",
      "The best choice usually comes down to what the room is missing. Use pile when you need softness and mass. Use flatweave when you need drawing, pattern, and a lower-profile textile that still changes the room materially.",
    ].join("\n\n"),
    publishedAt: "March 30, 2026",
    readTime: "5 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "Moroccan rug imagery comparing a flatter woven surface with a denser piled wool texture.",
      },
    ],
    seoTitle: "Flatweave vs pile rug | Loom & Hearth Studio",
    seoDescription:
      "A practical guide to the difference between flatweave Moroccan rugs and pile rugs, and when each belongs in a room.",
    targetKeyword: "flatweave vs pile rug",
    updatedAt: "2026-03-30T09:20:00.000Z",
    ctaLabel: "Read the guide",
  },
  {
    id: "blog-vintage-rugs-worth-it",
    slug: "why-vintage-moroccan-rugs-cost-more",
    categorySlug: "rugs",
    categoryLabel: "Moroccan rugs",
    title: "Why Vintage Moroccan Rugs Cost More and Whether They're Worth It",
    excerpt:
      "What you are paying for in a vintage Moroccan rug: age, survival, patina, construction integrity, and the sourcing judgment required to know what still holds up.",
    body: [
      "Vintage rugs cost more because age alone is not the point — survival is. A piece that has kept its structure, retained enough pile or surface integrity, and still reads convincingly after years of use is rarer than a newer rug made to a broad commercial template.",
      "Patina matters when it comes from use, light, and fibre, not from damage pretending to be romance. The best vintage pieces show colour softening, a believable surface, and enough structure left in the weave to keep performing in a room rather than existing only as a collectible object.",
      "Whether they are worth it depends on what you need. If you want a ONE OF A KIND piece with age written into the surface and a room that feels less newly assembled, vintage often earns its price. If you need dense, plush utility first, a newer rug can be the better answer.",
    ].join("\n\n"),
    publishedAt: "March 27, 2026",
    readTime: "6 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "https://res.cloudinary.com/dnyhdvqra/image/upload/loom-hearth/products/vintage-desert-find-1",
        alt: "Vintage Moroccan rug with visible age, softened palette, and worn-in surface presented in overhead light.",
      },
    ],
    seoTitle: "Why vintage Moroccan rugs cost more | Loom & Hearth Studio",
    seoDescription:
      "A practical explanation of what drives the price of vintage Moroccan rugs and how to judge whether a piece is worth it.",
    targetKeyword: "vintage moroccan rugs",
    updatedAt: "2026-03-27T13:15:00.000Z",
    ctaLabel: "Read the guide",
  },
  {
    id: "blog-rug-size-decisions",
    slug: "how-rug-size-decisions-work-in-a-real-room",
    categorySlug: "rugs",
    categoryLabel: "Moroccan rugs",
    title: "How Rug Size Decisions Actually Work in a Real Room",
    excerpt:
      "A room-planning guide to what the rug should sit under, where the edge should fall, and why the wrong size makes a room feel unresolved.",
    body: [
      "Rug size is less about numbers in isolation than about what the textile is being asked to hold together. In a living room, the rug should usually ground the seating group clearly enough that the arrangement feels intentional instead of scattered across the floor.",
      "The most common mistake is choosing the rug that fits the empty floor rather than the furniture plan. That usually leaves the rug floating in the middle of the room, too small to anchor the conversation area and too visible as a disconnected object. A better measure is where the front legs land and how much edge remains around the group.",
      "Once that relationship is right, the room calms down immediately. The rug stops being an accessory and starts behaving like structure, which is exactly what a strong Moroccan piece should do.",
    ].join("\n\n"),
    publishedAt: "March 24, 2026",
    readTime: "5 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "Moroccan rug shown in a lived-in room with visible furniture legs and clear rug edge placement.",
      },
    ],
    seoTitle: "How rug size decisions work in a real room | Loom & Hearth Studio",
    seoDescription:
      "A practical guide to choosing Moroccan rug size through furniture placement, edge position, and room structure.",
    targetKeyword: "rug size guide",
    updatedAt: "2026-03-24T10:05:00.000Z",
    ctaLabel: "Read the guide",
  },
  {
    id: "blog-zemmour-rugs",
    slug: "zemmour-rugs-the-geometric-tradition-behind-the-pattern",
    categorySlug: "rugs",
    categoryLabel: "Moroccan rugs",
    title: "Zemmour Rugs: The Geometric Tradition Behind the Pattern",
    excerpt:
      "Why Zemmour rugs feel more graphic: stronger pattern logic, firmer palettes, and a geometry that stays readable at room scale.",
    body: [
      "Zemmour rugs often carry a stronger sense of pattern architecture than softer, more open weaving families. The geometry feels interlocked rather than drifting, and the palette usually has enough depth in its reds, browns, and ochres to make the surface hold from across the room.",
      "That does not make them rigid. The hand is still present in the small irregularities, the slight shifts in line, and the places where motif logic bends rather than snapping into mechanical repetition. That balance is what keeps the rug alive rather than merely patterned.",
      "When buyers say they want a Moroccan rug with clearer structure, Zemmour is often part of that conversation. The pattern reads sooner, the room gets stronger framework, and the textile still keeps the softness that comes from being woven rather than printed into place.",
    ].join("\n\n"),
    publishedAt: "March 21, 2026",
    readTime: "5 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "Geometric Moroccan rug with red and ochre pattern language associated with Zemmour weaving traditions.",
      },
    ],
    seoTitle: "Zemmour rugs explained | Loom & Hearth Studio",
    seoDescription:
      "An introduction to Zemmour rugs, their geometric pattern language, and how they differ from other Moroccan rug families.",
    targetKeyword: "zemmour rugs",
    updatedAt: "2026-03-21T08:40:00.000Z",
    ctaLabel: "Read the guide",
  },
  {
    id: "blog-rug-as-palette",
    slug: "use-one-rug-as-the-starting-point-for-a-rooms-palette",
    categorySlug: "styling",
    categoryLabel: "Styling notes",
    title: "How to Use One Rug as the Starting Point for a Room's Entire Palette",
    excerpt:
      "A practical styling note on pulling three usable colours from one rug and letting the textile set the rest of the room's temperature.",
    body: [
      "A rug already contains the room's colour argument. Instead of decorating around it loosely, start by identifying one dominant tone, one support tone, and one smaller accent that already exist in the wool. That three-part read is usually enough to guide walls, upholstery, wood, and smaller accessories without forcing a scheme.",
      "The important step is proportion, not matching. Let the dominant rug colour remain the minority elsewhere in the room, then use the support tone to spread more quietly across larger surfaces. The accent should stay rare enough that it still feels deliberate when it reappears.",
      "When you work this way, the rug stops feeling like something dropped onto the floor after the fact. It becomes the colour lead, and the rest of the room starts behaving like it belongs to the same material family.",
    ].join("\n\n"),
    publishedAt: "March 19, 2026",
    readTime: "4 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "Moroccan interior scene where the rug leads the palette across textiles, walls, and supporting objects.",
      },
    ],
    seoTitle: "Use one rug as the starting point for a room palette | Loom & Hearth Studio",
    seoDescription:
      "A styling note on building a room palette from the colours already present in one Moroccan rug.",
    targetKeyword: "rug room palette",
    updatedAt: "2026-03-19T12:00:00.000Z",
    ctaLabel: "Read the styling note",
  },
  {
    id: "blog-single-statement-rug",
    slug: "the-case-for-a-single-statement-rug-in-a-low-furnished-room",
    categorySlug: "styling",
    categoryLabel: "Styling notes",
    title: "The Case for a Single Statement Rug in a Low-Furnished Room",
    excerpt:
      "Why one strong Moroccan rug can do more for a restrained room than layering extra furniture, pattern, or accessory clutter around it.",
    body: [
      "Low-furnished rooms depend on proportion and one or two real decisions. A strong rug can do the visual work that extra side tables, throw blankets, or decorative filler often fail to do because it anchors the entire floor plane at once.",
      "That only works when the rug has enough weight and pattern logic to hold the space by itself. If the piece is timid, the room feels underfurnished. If the rug is right, the restraint stops reading as lack and starts reading as confidence.",
      "This is where ONE OF A KIND Moroccan rugs can be especially effective. Their irregularity and surface depth create enough movement to keep the room alive even when the furniture remains sparse.",
    ].join("\n\n"),
    publishedAt: "March 14, 2026",
    readTime: "4 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "A low-furnished room structured by a single Moroccan rug with minimal supporting furniture.",
      },
    ],
    seoTitle: "The case for a single statement rug | Loom & Hearth Studio",
    seoDescription:
      "A styling note on using one strong Moroccan rug to carry a restrained, low-furnished room.",
    targetKeyword: "statement rug",
    updatedAt: "2026-03-14T10:20:00.000Z",
    ctaLabel: "Read the styling note",
  },
  {
    id: "blog-moroccan-textiles-neutral-room",
    slug: "moroccan-textiles-in-a-neutral-room",
    categorySlug: "styling",
    categoryLabel: "Styling notes",
    title: "Moroccan Textiles in a Neutral Room: What to Keep and What to Edit Out",
    excerpt:
      "A guide to mixing Moroccan rugs, pillows, and poufs into pale interiors without turning the room busy or over-signalled.",
    body: [
      "Neutral rooms usually need editing more than they need additions. Moroccan textiles work best there when one material or pattern family is allowed to lead and the rest of the room stays quiet enough to let it register.",
      "That usually means choosing between emphasis points instead of stacking them. If the rug carries the strongest geometry, the pillows should be lower-contrast. If the pouf becomes the sculptural note, the rest of the floor should stay calmer. The room starts to lose itself when every handmade object asks for the same level of attention.",
      "The question is not whether Moroccan textiles belong in a restrained room. They do. The question is how much of that language the room can hold before the edit stops feeling deliberate.",
    ].join("\n\n"),
    publishedAt: "March 10, 2026",
    readTime: "4 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "Neutral Moroccan-influenced room using a restrained mix of rug, pouf, and textile accents.",
      },
    ],
    seoTitle: "Moroccan textiles in a neutral room | Loom & Hearth Studio",
    seoDescription:
      "A styling guide to editing Moroccan rugs, pillows, and poufs into pale, restrained interiors.",
    targetKeyword: "moroccan textiles neutral room",
    updatedAt: "2026-03-10T09:10:00.000Z",
    ctaLabel: "Read the styling note",
  },
  {
    id: "blog-rug-edge-open-plan",
    slug: "placing-a-rug-in-an-open-plan-space",
    categorySlug: "styling",
    categoryLabel: "Styling notes",
    title: "Placing a Rug in an Open-Plan Space: Where the Edge Should Fall",
    excerpt:
      "How to use a Moroccan rug to zone an open room without letting the furniture drift or the rug feel stranded between functions.",
    body: [
      "Open-plan rooms do not need a rug to fill empty floor. They need a rug to tell the room where one function starts and where another ends. That means the rug edge should usually respond to the furniture grouping rather than to the architecture alone.",
      "The strongest placements create a clean, believable perimeter around the living zone so the sofa, chairs, and table feel intentionally bound together. If the rug edge falls halfway through a circulation path or stops too close to key legs, the zone feels unresolved.",
      "A Moroccan rug can make this easier because it carries enough visual weight to define space without adding built structure. But the edge still has to land in the right place, or even a strong rug will feel misplaced.",
    ].join("\n\n"),
    publishedAt: "March 7, 2026",
    readTime: "5 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "Open-plan room with a Moroccan rug clearly defining the living zone through edge placement.",
      },
    ],
    seoTitle: "Placing a rug in an open-plan space | Loom & Hearth Studio",
    seoDescription:
      "A practical styling note on where the edge of a Moroccan rug should fall in an open-plan room.",
    targetKeyword: "open plan rug placement",
    updatedAt: "2026-03-07T15:05:00.000Z",
    ctaLabel: "Read the styling note",
  },
  {
    id: "blog-semmarine-souk",
    slug: "how-the-semmarine-souk-works",
    categorySlug: "sourcing",
    categoryLabel: "Sourcing stories",
    title: "How the Semmarine Souk Works and Why It Produces ONE OF A KIND Pieces",
    excerpt:
      "A place-based sourcing story about the Marrakech trade context behind the collection and why bazaar buying produces different pieces from catalogue sourcing.",
    body: [
      "The Semmarine souk is not organised like an export catalogue. Pieces arrive through relationships, timing, local movement, and the daily rhythm of who is trading what on a given day. That means a buyer working there sees actual variation rather than a flattened menu of standardised options.",
      "For a collection like this, that matters because ONE OF A KIND rugs are rarely found by asking for a category alone. They are found by being present when the right piece appears, by comparing it against what is already in hand, and by rejecting the majority that do not hold up closely enough.",
      "The result is slower and less scalable, but also sharper. A bazaar-sourced collection can stay tied to the peculiarities of individual textiles instead of becoming a clean spreadsheet of interchangeable stock.",
    ].join("\n\n"),
    publishedAt: "March 4, 2026",
    readTime: "4 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "Marrakech bazaar aisle with stacked rugs and low seating, reflecting the Semmarine souk trade environment.",
      },
    ],
    seoTitle: "How the Semmarine souk works | Loom & Hearth Studio",
    seoDescription:
      "A sourcing story on the Semmarine souk in Marrakech and why bazaar buying produces ONE OF A KIND rugs.",
    targetKeyword: "Semmarine souk",
    updatedAt: "2026-03-04T11:30:00.000Z",
    ctaLabel: "Read the story",
  },
  {
    id: "blog-check-the-back-first",
    slug: "what-changes-when-you-check-the-back-of-the-rug-first",
    categorySlug: "sourcing",
    categoryLabel: "Sourcing stories",
    title: "What Changes When You Check the Back of the Rug Before the Front",
    excerpt:
      "Why construction-first sourcing changes what gets chosen: knot regularity, warp tension, and structure become visible the moment the rug is turned over.",
    body: [
      "The front of a rug tells you how it wants to be seen. The back tells you how it was made. Turning the piece over reveals knot definition, consistency, the relationship between wool and foundation, and the overall discipline of the weave in a way that styling never can.",
      "This matters because some rugs photograph better than they hold together. A convincing face can hide weak structure, loose tension, or a surface that will not wear well. The reverse exposes those risks quickly.",
      "A sourcing approach that starts with the back changes what enters the collection. It privileges integrity over first impression, which is exactly what buyers should want in a rug that needs to keep performing beyond the day it arrives.",
    ].join("\n\n"),
    publishedAt: "March 1, 2026",
    readTime: "4 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "Close-up of a Moroccan rug reverse showing weave structure, fringe, and knot definition held up by hand.",
      },
    ],
    seoTitle: "Check the back of the rug first | Loom & Hearth Studio",
    seoDescription:
      "A sourcing story on why Loom & Hearth Studio checks the back of a Moroccan rug before trusting the front.",
    targetKeyword: "rug back construction",
    updatedAt: "2026-03-01T08:55:00.000Z",
    ctaLabel: "Read the story",
  },
  {
    id: "blog-bazaar-vs-export-catalogue",
    slug: "difference-between-a-bazaar-piece-and-an-export-catalogue-piece",
    categorySlug: "sourcing",
    categoryLabel: "Sourcing stories",
    title: "The Difference Between a Bazaar Piece and an Export Catalogue Piece",
    excerpt:
      "What changes when a textile is chosen from a bazaar context instead of a catalogue built for easy remote ordering and standardisation.",
    body: [
      "Export catalogues are built to be legible at scale. They favour consistency, repeatability, predictable sizing, and images that read quickly to distant buyers. That makes sense for volume, but it also pushes selection toward pieces that fit a system rather than pieces that hold up best as textiles.",
      "Bazaar buying works differently. It starts with the actual piece in front of you and asks whether the wool, structure, balance, and room presence justify choosing it. The decision is more particular, more comparative, and less interested in whether the rug can be slotted cleanly into a repeatable assortment.",
      "Two rugs can look similar in thumbnails and still belong to different worlds in person. That is why sourcing method is not a back-end detail. It changes the collection itself.",
    ].join("\n\n"),
    publishedAt: "February 26, 2026",
    readTime: "5 min read",
    status: "active",
    images: [
      {
        id: "image-1",
        src: "",
        alt: "Moroccan bazaar rug selection scene emphasizing individual textiles rather than standardized catalogue presentation.",
      },
    ],
    seoTitle: "Bazaar piece vs export catalogue piece | Loom & Hearth Studio",
    seoDescription:
      "A sourcing story on what distinguishes a bazaar-selected Moroccan textile from an export catalogue piece.",
    targetKeyword: "bazaar piece export catalogue",
    updatedAt: "2026-02-26T10:40:00.000Z",
    ctaLabel: "Read the story",
  },
] as const;

export function getBlogCategories(posts: BlogPostRecord[] = blogPosts) {
  return Array.from(
    new Map(
      posts.map((post) => [
        post.categorySlug,
        {
          slug: post.categorySlug,
          label: post.categoryLabel,
          href: `/blog/${post.categorySlug}/${post.slug}`,
          count: posts.filter((candidate) => candidate.categorySlug === post.categorySlug).length,
        },
      ]),
    ).values(),
  );
}

export const blogCategories = getBlogCategories(blogPosts);

export function getBlogPostByParams(category: string, slug: string) {
  return blogPosts.find(
    (post) => post.categorySlug === category && post.slug === slug,
  );
}

export function sanitizeBlogPost(value: unknown): BlogPostRecord {
  const candidate = isRecord(value) ? value : {};
  const fallback = blogPosts[0];

  return {
    id: sanitizeText(candidate.id, fallback.id),
    slug: sanitizeText(candidate.slug, fallback.slug),
    categorySlug: sanitizeText(candidate.categorySlug, fallback.categorySlug),
    categoryLabel: sanitizeText(candidate.categoryLabel, fallback.categoryLabel),
    title: sanitizeText(candidate.title, fallback.title),
    excerpt: sanitizeText(candidate.excerpt, fallback.excerpt),
    body: sanitizeText(candidate.body, fallback.body),
    bodyFormat: candidate.bodyFormat === "markdown" ? "markdown" : "plain",
    publishedAt: sanitizeText(candidate.publishedAt, fallback.publishedAt ?? ""),
    readTime: sanitizeText(candidate.readTime, fallback.readTime),
    status: sanitizeStatus(candidate.status, fallback.status),
    images: sanitizeBlogPostImages(candidate.images, fallback.images),
    seoTitle: sanitizeText(candidate.seoTitle, fallback.seoTitle),
    seoDescription: sanitizeText(candidate.seoDescription, fallback.seoDescription),
    targetKeyword: sanitizeText(candidate.targetKeyword, fallback.targetKeyword),
    updatedAt: sanitizeText(candidate.updatedAt, fallback.updatedAt),
    ctaLabel: sanitizeText(candidate.ctaLabel, fallback.ctaLabel),
  };
}

function sanitizeBlogPostImages(value: unknown, fallback: BlogPostImage[]): BlogPostImage[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const sanitized = value.flatMap((item, index) => {
    if (!isRecord(item)) {
      return [];
    }

    const src = typeof item.src === "string" ? item.src : "";
    const alt = typeof item.alt === "string" ? item.alt : "";

    if (!src) {
      return [];
    }

    return [
      {
        id: typeof item.id === "string" && item.id ? item.id : `image-${index + 1}`,
        src,
        alt,
      },
    ];
  });

  return sanitized.slice(0, blogPostMaxImages);
}

function sanitizeStatus(value: unknown, fallback: BlogPostRecord["status"]): BlogPostRecord["status"] {
  return value === "draft" || value === "active" || value === "archived" || value === "sold"
    ? value
    : fallback;
}

function sanitizeText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

