import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: 'brand' | 'accent' | 'gray' | 'amber';
}

const TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, string> = {
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-accent-50 text-accent-600',
  gray: 'bg-gray-100 text-gray-600',
  amber: 'bg-amber-50 text-amber-600',
};

export function StatCard({ icon: Icon, label, value, tone = 'brand' }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <span className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', TONE_CLASSES[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}
