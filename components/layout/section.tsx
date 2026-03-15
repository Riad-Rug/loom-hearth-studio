import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Container } from "@/components/layout/container";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  children: ReactNode;
  tone?: "default" | "muted";
  width?: "default" | "narrow" | "wide";
};

export function Section({
  children,
  className,
  tone = "default",
  width = "default",
  ...props
}: SectionProps) {
  const resolvedClassName = ["shell-section", `shell-section--${tone}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={resolvedClassName} {...props}>
      <Container width={width}>{children}</Container>
    </section>
  );
}
