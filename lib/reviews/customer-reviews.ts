export type CustomerReview = {
  id: string;
  customerName: string;
  country: "USA" | "Canada" | "Australia";
  productType: "Rug" | "Pouf" | "Pillows";
  body: string;
};

export const customerReviews: CustomerReview[] = [
  {
    id: "chloe-m-rug",
    customerName: "Chloe M.",
    country: "USA",
    productType: "Rug",
    body: "Love this rug. Looks even better in person.",
  },
  {
    id: "daniel-k-pouf",
    customerName: "Daniel K.",
    country: "Canada",
    productType: "Pouf",
    body: "I bought the pouf mostly because I liked how it looked in the photos. Now my dog has basically claimed it and uses it more than we do. Still one of my favorite things I bought for the house.",
  },
  {
    id: "mia-r-pillows",
    customerName: "Mia R.",
    country: "Australia",
    productType: "Pillows",
    body: "Really happy with the pillows. Good texture, nice colors, didnt feel cheap at all.",
  },
  {
    id: "ashley-t-rug",
    customerName: "Ashley T.",
    country: "USA",
    productType: "Rug",
    body: "I was stressed for a bit because shipping took longer than I expected, but Riad kept replying and updating me. The rug was worth the wait.",
  },
  {
    id: "kevin-l-pouf",
    customerName: "Kevin L.",
    country: "Canada",
    productType: "Pouf",
    body: "Great product. Great service. Would buy again.",
  },
  {
    id: "hannah-b-rug",
    customerName: "Hannah B.",
    country: "Australia",
    productType: "Rug",
    body: "I had been looking for something that didnt feel mass-produced, and this was exactly that. The room felt warmer the second we put it down.",
  },
  {
    id: "marcus-d-pillows",
    customerName: "Marcus D.",
    country: "USA",
    productType: "Pillows",
    body: "These were kind of an impulse buy, but they actually pulled the whole couch together. My wife noticed right away, which says a lot.",
  },
  {
    id: "emma-s-rug",
    customerName: "Emma S.",
    country: "Canada",
    productType: "Rug",
    body: "I was nervous ordering from abroad, not going to lie. But the process was clear, and the rug arrived in beautiful condition. It feels special.",
  },
  {
    id: "lauren-p-pouf",
    customerName: "Lauren P.",
    country: "Australia",
    productType: "Pouf",
    body: "I got the pouf for a corner that felt empty and boring. It fixed that immediately. Super simple, but made a big difference.",
  },
  {
    id: "josh-w-rug",
    customerName: "Josh W.",
    country: "USA",
    productType: "Rug",
    body: "Not usually someone who writes reviews, but this one deserved it. Beautiful piece, and very easy communication throughout.",
  },
];
