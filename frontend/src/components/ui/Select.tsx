import { forwardRef } from 'react';
import clsx from 'clsx';
import { CLASSES_ROTULO, TextoDeApoio, classesCampo } from './Input';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

/**
 * A seta nativa do `<select>` é desenhada pelo sistema operacional: cinza-azulada no Windows,
 * quadrada no Chrome, fora do vocabulário do resto da interface. Aqui ela é substituída por
 * uma seta na cor da tinta da marca, desenhada como imagem de fundo — o `<select>` continua
 * sendo o controle nativo (teclado, leitor de tela e o seletor de rolagem do celular
 * intactos), só a decoração muda.
 */
const SETA =
  "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238A6E5D' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

const ESTILO_SETA: React.CSSProperties = {
  backgroundImage: SETA,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.875rem center',
  backgroundSize: '1.1rem',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, className, id, ...props },
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
      <select
        id={inputId}
        ref={ref}
        style={ESTILO_SETA}
        className={classesCampo(Boolean(error), clsx('min-h-11 appearance-none pr-11', className))}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `${inputId}-ajuda` : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <TextoDeApoio id={`${inputId}-ajuda`} error={error} hint={hint} />
    </div>
  );
});
