import clsx from 'clsx';

export type BadgeTone = 'green' | 'gray' | 'amber' | 'red' | 'blue';

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-accent-50 text-accent-700',
  gray: 'bg-gray-100 text-gray-600',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-blue-700',
};

export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', TONE_CLASSES[tone])}>
      {children}
    </span>
  );
}
