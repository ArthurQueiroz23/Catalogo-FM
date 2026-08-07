import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: 'brand' | 'accent' | 'gray' | 'amber';
}

const TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, string> = {
  brand: 'bg-coral-50 text-coral-700',
  accent: 'bg-verde-50 text-verde-600',
  gray: 'bg-creme-300 text-ink-600',
  amber: 'bg-coral-50 text-coral-700',
};

export function StatCard({ icon: Icon, label, value, tone = 'brand' }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-coral-100 bg-creme-50 p-5 shadow-sm">
      <span className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', TONE_CLASSES[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold text-ink-900">{value}</p>
        <p className="text-xs text-ink-400">{label}</p>
      </div>
    </div>
  );
}
