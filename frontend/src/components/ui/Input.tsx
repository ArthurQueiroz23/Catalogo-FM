import { forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Estilo compartilhado por Input, Textarea e Select, para os três campos serem idênticos. */
export const CLASSES_CAMPO =
  'w-full rounded-2xl border bg-creme-50 px-4 py-2.5 text-[0.9375rem] text-ink-800 shadow-suave ' +
  'transition-all duration-200 placeholder:text-ink-300 focus:outline-none focus:ring-4 ' +
  'disabled:cursor-not-allowed disabled:bg-creme-200 disabled:text-ink-400 disabled:shadow-none';

export function classesCampo(temErro?: boolean, className?: string) {
  return clsx(
    CLASSES_CAMPO,
    temErro
      ? 'border-coral-700 focus:border-coral-700 focus:ring-coral-200'
      : 'border-coral-100 hover:border-coral-200 focus:border-coral-300 focus:ring-coral-100',
    className
  );
}

/** Rótulo e texto de apoio dos campos — mesmos degraus em todo formulário do projeto. */
export const CLASSES_ROTULO = 'text-sm font-bold text-ink-800';
export const CLASSES_AJUDA = 'text-[0.8125rem] leading-relaxed';

export function TextoDeApoio({ id, error, hint }: { id?: string; error?: string; hint?: string }) {
  if (!error && !hint) return null;

  return (
    <p
      id={id}
      className={clsx(CLASSES_AJUDA, error ? 'font-bold text-coral-800' : 'text-ink-500')}
    >
      {error ?? hint}
    </p>
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
        <label htmlFor={inputId} className={CLASSES_ROTULO}>
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
      <TextoDeApoio id={`${inputId}-ajuda`} error={error} hint={hint} />
    </div>
  );
});
