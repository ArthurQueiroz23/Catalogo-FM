import { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

/**
 * Botão único do projeto — site público e painel. As variantes `primary`/`secondary` são as
 * mesmas classes `.btn-primary`/`.btn-secondary` do `globals.css`, para não existirem dois
 * sistemas de botão renderizando em tamanhos diferentes na mesma função (era o caso antes).
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-base bg-coral-800 text-creme hover:bg-coral-900 active:translate-y-px',
  ghost: 'btn-fantasma',
};

/** `sm` continua com 44px de altura mínima (herdada de .btn-base) — só o texto encolhe. */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-4 text-sm',
  md: '',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
