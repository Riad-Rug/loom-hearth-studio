import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CheckoutProvider } from "@/features/checkout/checkout-provider";

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
  return <CheckoutProvider>{children}</CheckoutProvider>;
}
