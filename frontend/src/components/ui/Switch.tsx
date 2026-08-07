import { forwardRef } from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

/** Alternador estilizado (checkbox por baixo) para campos booleanos como ativo/destaque. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, id, ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="flex min-h-11 cursor-pointer items-start gap-3 py-1">
      <span className="relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center">
        <input id={inputId} ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <span className="absolute inset-0 rounded-pilula bg-creme-300 transition-colors peer-checked:bg-coral-400 peer-focus-visible:ring-4 peer-focus-visible:ring-coral-100" />
        <span className="absolute left-1 h-5 w-5 rounded-pilula bg-creme-50 shadow-peca transition-transform peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="block text-[0.9375rem] font-semibold text-ink-800">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-ink-400">{description}</span>}
      </span>
    </label>
  );
});
