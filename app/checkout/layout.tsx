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
    "/contact?inquiryType=product-inquiry&message=Direct%20checkout%20is%20currently%20paused.%20Please%20share%20the%20pieces%20you%20are%20interested%20in%20and%20the%20studio%20will%20follow%20up%20with%20availability%20and%20next%20steps.",
  );
}
