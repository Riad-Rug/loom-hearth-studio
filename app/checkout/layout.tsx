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
    "/contact?inquiryType=product-inquiry&message=Direct%20checkout%20is%20currently%20paused.%20Please%20share%20the%20pieces%20you%20are%20interested%20in%20and%20your%20destination%20country.%20Launch%20markets%20are%20the%20United%20States%2C%20Canada%2C%20and%20Australia.%20Other%20countries%20are%20reviewed%20case%20by%20case.",
  );
}
