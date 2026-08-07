export type CustomerReview = {
  id: string;
  customerName: string;
  country: "USA";
  productType: "Rug" | "Pouf" | "Pillows";
  body: string;
};

export const customerReviews: CustomerReview[] = [];
