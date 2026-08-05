import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-300">
        <Icon className="h-6 w-6" />
      </span>
      <p className="font-semibold text-gray-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-gray-400">{description}</p>}
      {action}
    </div>
  );
}
