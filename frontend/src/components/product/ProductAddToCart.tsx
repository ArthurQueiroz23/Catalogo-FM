'use client';

import { Check, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { formatarPreco } from '@/lib/format';
import { useCartStore } from '@/store/cart-store';
import type { ProdutoResponse } from '@/types/api';

/**
 * Bloco de escolha de tamanhos e quantidades — a interação central do catálogo.
 *
 * Fica dentro de um painel próprio, com cabeçalho, linhas e rodapé de total, porque é a única
 * área da página onde a cliente **age**: solto sobre o creme, ele se misturava com a ficha da
 * peça logo acima. A linha do tamanho escolhido acende em coral, para o que já foi selecionado
 * ser visível sem precisar reler os números.
 */
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
      <p className="superficie p-5 text-[0.9375rem] text-ink-500">
        Ainda não há tamanhos cadastrados para esta peça. Fale com a gente pelo WhatsApp para
        saber sobre a disponibilidade.
      </p>
    );
  }

  return (
    <div>
      <div className="superficie-solida overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-coral-100 px-5 py-4">
          <p className="titulo-bloco text-base">Tamanhos e quantidades</p>
          {totalSelecionado > 0 && (
            <span className="chip tabular-nums">
              {totalSelecionado} {totalSelecionado === 1 ? 'peça' : 'peças'}
            </span>
          )}
        </div>

        <ul className="divide-y divide-coral-100/70">
          {produto.tamanhosDisponiveis.map((tamanho) => {
            const quantidade = quantidades[tamanho.id] ?? 0;
            return (
              <li
                key={tamanho.id}
                className={`flex items-center justify-between gap-4 px-5 py-2.5 transition-colors ${
                  quantidade > 0 ? 'bg-coral-50/70' : ''
                }`}
              >
                <span className="font-bold text-ink-800">{tamanho.nome}</span>
                <QuantityStepper
                  value={quantidade}
                  onChange={(valor) => alterarQuantidade(tamanho.id, valor)}
                  label={tamanho.nome}
                />
              </li>
            );
          })}
        </ul>

        <div className="border-t border-coral-100 bg-creme-100/70 p-5">
          {totalSelecionado > 0 && (
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <span className="text-[0.9375rem] font-semibold text-ink-500">Total selecionado</span>
              <strong className="text-xl font-extrabold tabular-nums text-ink-900">
                {formatarPreco(produto.preco * totalSelecionado)}
              </strong>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdicionar}
            disabled={totalSelecionado === 0}
            className="btn-primary btn-grande w-full"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            Adicionar à seleção
          </button>

          {totalSelecionado === 0 && (
            <p className="mt-3 text-center text-[0.8125rem] text-ink-500">
              Escolha a quantidade de pelo menos um tamanho.
            </p>
          )}
        </div>
      </div>

      {confirmacaoVisivel && (
        <div
          role="status"
          className="animate-surgir mt-3 flex flex-wrap items-center justify-between gap-2 rounded-peca
            bg-verde-50 px-4 py-3 text-[0.9375rem] text-verde-700 ring-1 ring-inset ring-verde-100"
        >
          <span className="inline-flex items-center gap-2 font-bold">
            <Check className="h-5 w-5" aria-hidden="true" /> Adicionado à sua seleção!
          </span>
          <Link href="/selecao" className="rounded-pilula font-extrabold underline underline-offset-4 foco-marca">
            Ver seleção
          </Link>
        </div>
      )}
    </div>
  );
}
