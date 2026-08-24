import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type CartLayoutProps = {
  children: ReactNode;
};

export default function CartLayout({ children }: CartLayoutProps) {
  return <>{children}</>;
}
