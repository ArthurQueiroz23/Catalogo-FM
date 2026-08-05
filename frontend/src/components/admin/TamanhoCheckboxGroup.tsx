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
    return <p className="text-sm text-gray-400">Nenhum tamanho cadastrado ainda.</p>;
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
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                selecionado
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
              )}
            >
              {tamanho.nome}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
