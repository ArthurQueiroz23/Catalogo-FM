import { forwardRef } from 'react';
import clsx from 'clsx';
import { classesCampo } from './Input';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className, id, ...props },
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
      <select
        id={inputId}
        ref={ref}
        className={classesCampo(Boolean(error), clsx('min-h-11', className))}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-ajuda` : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${inputId}-ajuda`} className="text-sm font-semibold text-coral-800">
          {error}
        </p>
      )}
    </div>
  );
});
