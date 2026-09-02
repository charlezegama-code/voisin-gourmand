interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

export function StarRating({ rating, size = "sm", showValue = true }: StarRatingProps) {
  const starSize = size === "sm" ? "text-sm" : "text-base";
  const filled = Math.round(rating);

  return (
    <span className={`inline-flex items-center gap-1 ${starSize}`}>
      <span aria-hidden="true" className="text-terracotta-500 tracking-tight">
        {"★".repeat(filled)}
        <span className="text-terracotta-200">{"★".repeat(5 - filled)}</span>
      </span>
      {showValue && <span className="font-medium text-ink">{rating.toFixed(1)}</span>}
    </span>
  );
}
