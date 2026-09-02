import { Frown } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-terracotta-50 px-6 py-10 text-center">
      <Frown className="h-8 w-8 text-terracotta-400" strokeWidth={1.75} aria-hidden="true" />
      <p className="max-w-xs text-sm font-medium text-terracotta-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-full bg-terracotta-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
