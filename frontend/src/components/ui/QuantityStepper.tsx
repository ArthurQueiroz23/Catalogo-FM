'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (novoValor: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

/** Seletor de quantidade reutilizado na página do produto (por tamanho) e no carrinho. */
export function QuantityStepper({ value, onChange, min = 0, max = 999, label }: QuantityStepperProps) {
  function decrementar() {
    onChange(Math.max(min, value - 1));
  }

  function incrementar() {
    onChange(Math.min(max, value + 1));
  }

  return (
    <div className="inline-flex items-center rounded-full border border-gray-300">
      <button
        type="button"
        onClick={decrementar}
        disabled={value <= min}
        aria-label={label ? `Diminuir quantidade de ${label}` : 'Diminuir quantidade'}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums text-gray-900">{value}</span>
      <button
        type="button"
        onClick={incrementar}
        disabled={value >= max}
        aria-label={label ? `Aumentar quantidade de ${label}` : 'Aumentar quantidade'}
        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
