"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ExitIntentCapture } from "@/components/marketing/exit-intent-capture";

type AppShellProps = {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  consentBanner: ReactNode;
};

export function AppShell({ children, header, footer, consentBanner }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="site-main site-main--admin">{children}</main>;
  }

  return (
    <div className="site-shell">
      {header}
      <main className="site-main">{children}</main>
      {footer}
      {consentBanner}
      <ExitIntentCapture />
    </div>
  );
}
