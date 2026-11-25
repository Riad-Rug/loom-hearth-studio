type CompareAtPriceProps = {
  /** Formatted former price ("$549.00"); nothing renders without it. */
  label?: string;
  className?: string;
};

/**
 * The struck-through "was" price shown next to a sale price. Screen readers do
 * not announce <s>, so the visually hidden prefix says what the number is.
 */
export function CompareAtPrice({ label, className }: CompareAtPriceProps) {
  if (!label) {
    return null;
  }

  return (
    <s className={className}>
      <span className="sr-only">Was </span>
      {label}
    </s>
  );
}
