import { forwardRef } from 'react';
import clsx from 'clsx';
import { classesCampo } from './Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, rows = 4, ...props },
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
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        className={classesCampo(Boolean(error), clsx('resize-y leading-relaxed', className))}
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
