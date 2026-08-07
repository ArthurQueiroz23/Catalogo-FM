'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (novoValor: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

/**
 * Seletor de quantidade, reaproveitado na página da peça (por tamanho) e na seleção.
 * Botões de 44px: é a interação principal do catálogo e o público é majoritariamente mobile,
 * então o alvo de toque segue o mínimo da WCAG 2.2 / Apple HIG.
 */
export function QuantityStepper({ value, onChange, min = 0, max = 999, label }: QuantityStepperProps) {
  const estiloBotao =
    'flex h-11 w-11 items-center justify-center rounded-pilula text-ink-700 transition-colors ' +
    'hover:bg-coral-100 hover:text-coral-800 disabled:cursor-not-allowed disabled:opacity-30 ' +
    'disabled:hover:bg-transparent foco-marca';

  return (
    <div className="inline-flex items-center rounded-pilula border-2 border-coral-200 bg-creme-50">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={label ? `Diminuir quantidade de ${label}` : 'Diminuir quantidade'}
        className={estiloBotao}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        aria-live="polite"
        className={`w-9 text-center text-base font-bold tabular-nums ${
          value > 0 ? 'text-coral-800' : 'text-ink-300'
        }`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={label ? `Aumentar quantidade de ${label}` : 'Aumentar quantidade'}
        className={estiloBotao}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
