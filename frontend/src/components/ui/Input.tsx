import { forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-brand-500"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={clsx(
          'rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors',
          'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-100',
          error ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-brand-400',
          props.disabled && 'cursor-not-allowed bg-gray-50 text-gray-400',
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
});
