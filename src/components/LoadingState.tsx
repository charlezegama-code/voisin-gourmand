import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sage-600">
      <Loader2 className="h-7 w-7 motion-safe:animate-spin" strokeWidth={2.5} aria-hidden="true" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
