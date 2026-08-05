import { forwardRef } from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

/** Alternador estilizado (checkbox por baixo) para campos booleanos como ativo/destaque/lançamento. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, id, ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3">
      <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center">
        <input id={inputId} ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <span className="absolute inset-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        {description && <span className="block text-xs text-gray-400">{description}</span>}
      </span>
    </label>
  );
});
