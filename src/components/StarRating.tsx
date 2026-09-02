import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

export function StarRating({ rating, size = "sm", showValue = true }: StarRatingProps) {
  const px = size === "sm" ? 13 : 15;
  const filled = Math.round(rating);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            width={px}
            height={px}
            strokeWidth={0}
            className={i < filled ? "fill-terracotta-500 text-terracotta-500" : "fill-terracotta-100 text-terracotta-100"}
          />
        ))}
      </span>
      {showValue && (
        <span className={`font-semibold text-ink ${size === "sm" ? "text-xs" : "text-sm"}`}>{rating.toFixed(1)}</span>
      )}
    </span>
  );
}
