export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--bg-soft)] ${className}`}
    />
  )
}
