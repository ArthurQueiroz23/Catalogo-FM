import clsx from 'clsx';

export type BadgeTone = 'green' | 'gray' | 'coral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-verde-50 text-verde-700',
  gray: 'bg-creme-300 text-ink-600',
  coral: 'bg-coral-100 text-coral-800',
};

export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-pilula px-3 py-0.5 text-xs font-bold',
        TONE_CLASSES[tone]
      )}
    >
      {children}
    </span>
  );
}
