'use client';

import { Check, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { formatarPreco } from '@/lib/format';
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
      <p className="rounded-peca bg-creme-50 p-4 text-[0.9375rem] text-ink-500">
        Ainda não há tamanhos cadastrados para esta peça.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-3 text-lg font-bold text-ink-900">Escolha os tamanhos e as quantidades</p>

      <div className="flex flex-col divide-y divide-coral-100 overflow-hidden rounded-peca bg-creme-50/80">
        {produto.tamanhosDisponiveis.map((tamanho) => (
          <div key={tamanho.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
            <span className="text-base font-bold text-ink-800">{tamanho.nome}</span>
            <QuantityStepper
              value={quantidades[tamanho.id] ?? 0}
              onChange={(valor) => alterarQuantidade(tamanho.id, valor)}
              label={tamanho.nome}
            />
          </div>
        ))}
      </div>

      {totalSelecionado > 0 && (
        <p className="mt-3 text-center text-[0.9375rem] text-ink-600">
          {totalSelecionado} {totalSelecionado === 1 ? 'peça' : 'peças'} ·{' '}
          <strong className="font-bold text-ink-900">
            {formatarPreco(produto.preco * totalSelecionado)}
          </strong>
        </p>
      )}

      <button
        type="button"
        onClick={handleAdicionar}
        disabled={totalSelecionado === 0}
        className="btn-primary mt-4 w-full"
      >
        <ShoppingBag className="h-5 w-5" />
        Adicionar à seleção
      </button>

      {confirmacaoVisivel && (
        <div
          role="status"
          className="animate-surgir mt-3 flex flex-wrap items-center justify-between gap-2 rounded-peca bg-verde-50 px-4 py-3 text-[0.9375rem] text-verde-700"
        >
          <span className="inline-flex items-center gap-2 font-semibold">
            <Check className="h-5 w-5" /> Adicionado à sua seleção!
          </span>
          <Link href="/selecao" className="rounded-pilula font-bold underline underline-offset-2 foco-marca">
            Ver seleção
          </Link>
        </div>
      )}
    </div>
  );
}
