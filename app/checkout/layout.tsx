import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type CheckoutLayoutProps = {
  children: ReactNode;
};

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  void children;

  redirect(
    "/contact?inquiryType=product-inquiry&message=Direct%20checkout%20is%20currently%20paused.%20Tell%20us%20which%20piece%20you%20are%20interested%20in%20and%20we%20will%20reply%20personally%20within%2024%20hours%20with%20the%20next%20step.",
  );
}
