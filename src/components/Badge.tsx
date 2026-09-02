import type { ReactNode } from "react";

interface BadgeProps {
  tone: "new" | "soldout" | "verified" | "neutral";
  icon?: ReactNode;
  children: ReactNode;
}

const TONE_STYLES: Record<BadgeProps["tone"], string> = {
  new: "bg-sage-500 text-white",
  soldout: "bg-ink/70 text-white",
  verified: "bg-white/95 text-sage-700",
  neutral: "bg-white/95 text-ink/70",
};

export function Badge({ tone, icon, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-sm ${TONE_STYLES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
