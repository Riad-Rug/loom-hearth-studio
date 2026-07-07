export type CustomerReview = {
  id: string;
  customerName: string;
  country: "USA" | "Canada" | "Australia";
  productType: "Rug" | "Pouf" | "Pillows";
  body: string;
};

export const customerReviews: CustomerReview[] = [];
