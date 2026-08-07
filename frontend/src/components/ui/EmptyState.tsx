import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-peca border-2 border-dashed border-coral-200 bg-creme-50/60 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-pilula bg-coral-100 text-coral-500">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-lg font-bold text-ink-800">{title}</p>
      {description && <p className="max-w-sm text-[0.9375rem] text-ink-500">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
