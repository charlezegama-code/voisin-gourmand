interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-terracotta-50 px-6 py-10 text-center">
      <span className="text-3xl" aria-hidden="true">
        😕
      </span>
      <p className="max-w-xs text-sm font-medium text-terracotta-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-full bg-terracotta-500 px-4 py-2 text-sm font-semibold text-cream shadow-sm transition hover:bg-terracotta-600 active:scale-95"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
