export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sage-600">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-sage-200 border-t-sage-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
