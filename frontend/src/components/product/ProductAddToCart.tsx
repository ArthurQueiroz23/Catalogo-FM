'use client';

import { Check, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore } from '@/store/cart-store';
import type { ProdutoResponse } from '@/types/api';

export function ProductAddToCart({ produto }: { produto: ProdutoResponse }) {
  const adicionarItem = useCartStore((state) => state.adicionarItem);
  const [quantidades, setQuantidades] = useState<Record<number, number>>({});
  const [confirmacaoVisivel, setConfirmacaoVisivel] = useState(false);

  const totalSelecionado = useMemo(
    () => Object.values(quantidades).reduce((soma, qtd) => soma + qtd, 0),
    [quantidades]
  );

  function alterarQuantidade(tamanhoId: number, valor: number) {
    setQuantidades((atual) => ({ ...atual, [tamanhoId]: valor }));
    setConfirmacaoVisivel(false);
  }

  function handleAdicionar() {
    if (totalSelecionado === 0) return;

    const tamanhosEscolhidos = produto.tamanhosDisponiveis
      .map((tamanho) => ({
        tamanhoId: tamanho.id,
        tamanhoNome: tamanho.nome,
        quantidade: quantidades[tamanho.id] ?? 0,
      }))
      .filter((t) => t.quantidade > 0);

    adicionarItem(
      {
        produtoId: produto.id,
        referencia: produto.referencia,
        nome: produto.nome,
        preco: produto.preco,
        imagemUrl: produto.imagens.find((img) => img.principal)?.url ?? produto.imagens[0]?.url ?? null,
      },
      tamanhosEscolhidos
    );

    setQuantidades({});
    setConfirmacaoVisivel(true);
  }

  if (produto.tamanhosDisponiveis.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
        Nenhum tamanho disponível cadastrado para este produto no momento.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-900">Escolha os tamanhos e quantidades</p>
      <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-100">
        {produto.tamanhosDisponiveis.map((tamanho) => (
          <div key={tamanho.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-gray-700">{tamanho.nome}</span>
            <QuantityStepper
              value={quantidades[tamanho.id] ?? 0}
              onChange={(valor) => alterarQuantidade(tamanho.id, valor)}
              label={tamanho.nome}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdicionar}
        disabled={totalSelecionado === 0}
        className="btn-primary mt-4 w-full"
      >
        <ShoppingBag className="h-4 w-4" />
        Adicionar à seleção{totalSelecionado > 0 ? ` (${totalSelecionado})` : ''}
      </button>

      {confirmacaoVisivel && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4" /> Adicionado à seleção!
          </span>
          <Link href="/selecao" className="font-semibold underline">
            Ver seleção
          </Link>
        </div>
      )}
    </div>
  );
}
