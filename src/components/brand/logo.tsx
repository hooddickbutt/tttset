export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 2.5 23.2 16 16 29.5 8.8 16 16 2.5Zm0 6.2L12.7 16 16 23.3 19.3 16 16 8.7Z"
      />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-ink">
      <Mark className="size-7" />
      {compact ? null : <span className="font-serif text-2xl leading-none tracking-tight">Keel</span>}
    </span>
  );
}
