'use client';

import clsx from 'clsx';
import type { TamanhoResponse } from '@/types/api';

interface TamanhoCheckboxGroupProps {
  tamanhos: TamanhoResponse[];
  value: number[];
  onChange: (novoValor: number[]) => void;
  error?: string;
}

/** Seleção múltipla dos tamanhos disponíveis de um produto, como um grupo de "pills" clicáveis. */
export function TamanhoCheckboxGroup({ tamanhos, value, onChange, error }: TamanhoCheckboxGroupProps) {
  function alternar(tamanhoId: number) {
    onChange(value.includes(tamanhoId) ? value.filter((id) => id !== tamanhoId) : [...value, tamanhoId]);
  }

  if (tamanhos.length === 0) {
    return <p className="text-[0.9375rem] text-ink-400">Nenhum tamanho cadastrado ainda.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tamanhos.map((tamanho) => {
          const selecionado = value.includes(tamanho.id);
          return (
            <button
              key={tamanho.id}
              type="button"
              onClick={() => alternar(tamanho.id)}
              aria-pressed={selecionado}
              className={clsx(
                'min-h-11 rounded-pilula border-2 px-5 text-[0.9375rem] font-bold transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-700',
                selecionado
                  ? 'border-coral-400 bg-coral-400 text-ink-900'
                  : 'border-coral-100 bg-creme-50 text-ink-600 hover:border-coral-200 hover:bg-coral-50'
              )}
            >
              {tamanho.nome}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-coral-800">{error}</p>}
    </div>
  );
}
