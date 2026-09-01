import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Estado vazio padrão do projeto. A moldura tracejada diz "aqui caberia conteúdo" em vez de
 * parecer um erro, e a ação fica dentro do próprio bloco — quem chega numa lista vazia precisa
 * do próximo passo à mão, não no topo da página.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-peca border border-dashed border-coral-200 bg-creme-50/70 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-pilula bg-coral-100 text-coral-600 ring-1 ring-inset ring-coral-200">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="titulo-bloco">{title}</p>
      {description && <p className="max-w-sm text-[0.9375rem] leading-relaxed text-ink-500">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
