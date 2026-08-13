export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-mist-300 py-10 justify-center">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-signal" />
      </span>
      <span className="text-sm font-mono">{label}</span>
    </div>
  );
}

export function EmptyState({ title, hint }) {
  return (
    <div className="text-center py-14 px-6 border border-dashed border-ink-600 rounded-xl">
      <p className="font-display text-mist-100 text-base">{title}</p>
      {hint && <p className="text-sm text-mist-400 mt-2">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center py-14 px-6 border border-red-900/40 bg-red-950/20 rounded-xl">
      <p className="font-display text-red-200 text-base">Something went wrong</p>
      <p className="text-sm text-red-300/80 mt-2 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-sm font-medium px-4 py-2 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-100 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
