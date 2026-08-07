import { forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Estilo compartilhado por Input, Textarea e Select, para os três campos serem idênticos. */
export const CLASSES_CAMPO =
  'w-full rounded-2xl border-2 bg-creme-50 px-4 py-2.5 text-[0.9375rem] text-ink-800 transition-colors ' +
  'placeholder:text-ink-300 focus:outline-none focus:ring-4 focus:ring-coral-100 ' +
  'disabled:cursor-not-allowed disabled:bg-creme-200 disabled:text-ink-400';

export function classesCampo(temErro?: boolean, className?: string) {
  return clsx(
    CLASSES_CAMPO,
    temErro ? 'border-coral-700 focus:border-coral-700' : 'border-coral-100 hover:border-coral-200 focus:border-coral-300',
    className
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[0.9375rem] font-semibold text-ink-700">
          {label}
          {props.required && <span className="text-coral-600"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={classesCampo(Boolean(error), clsx('min-h-11', className))}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${inputId}-ajuda` : undefined}
        {...props}
      />
      {(hint || error) && (
        <p
          id={`${inputId}-ajuda`}
          className={error ? 'text-sm font-semibold text-coral-800' : 'text-sm text-ink-400'}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
