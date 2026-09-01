import { forwardRef } from 'react';
import clsx from 'clsx';
import { CLASSES_ROTULO, TextoDeApoio, classesCampo } from './Input';

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
        <label htmlFor={inputId} className={CLASSES_ROTULO}>
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
      <TextoDeApoio id={`${inputId}-ajuda`} error={error} hint={hint} />
    </div>
  );
});
