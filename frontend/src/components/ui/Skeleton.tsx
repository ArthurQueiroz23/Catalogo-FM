import clsx from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded-2xl bg-creme-300/70', className)} />;
}
