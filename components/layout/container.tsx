import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  width?: "default" | "narrow" | "wide";
};

export function Container({
  children,
  className,
  width = "default",
  ...props
}: ContainerProps) {
  const resolvedClassName = ["shell-container", `shell-container--${width}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={resolvedClassName} {...props}>
      {children}
    </div>
  );
}
