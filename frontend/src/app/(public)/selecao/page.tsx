'use client';

import { ArrowLeft, MessageCircle, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { quantidadeTotalPecas, valorTotalCarrinho } from '@/lib/cart';
import { siteConfig } from '@/lib/config';
import { formatarPreco } from '@/lib/format';
import { montarLinkWhatsApp, montarMensagemSelecao } from '@/lib/whatsapp';
import { useCartHasHydrated, useCartStore } from '@/store/cart-store';

export default function SelecaoPage() {
  const itens = useCartStore((state) => state.itens);
  const limparCarrinho = useCartStore((state) => state.limparCarrinho);
  const hidratado = useCartHasHydrated();

  // A seleção mora no localStorage: no primeiro quadro após o carregamento ela ainda não foi
  // lida. Mostrar o esqueleto da própria tela evita o pisca-pisca de "está vazia → tem itens".
  if (!hidratado) {
    return (
      <div className="container secao-compacta">
        <Skeleton className="h-9 w-56" />
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <Skeleton className="h-36 rounded-peca" />
            <Skeleton className="h-36 rounded-peca" />
          </div>
          <Skeleton className="h-64 rounded-peca" />
        </div>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="container secao-compacta">
        <PageHeader
          eyebrow="Pedido"
          title="Minha seleção"
          migalhas={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Minha seleção' }]}
        />
        <EmptyState
          icon={ShoppingBag}
          title="Sua seleção está vazia"
          description="Navegue pelo catálogo e escolha as peças, os tamanhos e as quantidades que quiser conversar com a gente."
          action={
            <Link href="/produtos" className="btn-primary">
              Ver o catálogo
            </Link>
          }
        />
      </div>
    );
  }

  const totalPecas = quantidadeTotalPecas(itens);
  const totalValor = valorTotalCarrinho(itens);
  const linkWhatsApp = siteConfig.whatsappNumber
    ? montarLinkWhatsApp(siteConfig.whatsappNumber, montarMensagemSelecao(itens))
    : null;

  return (
    <div className="container secao-compacta">
      <PageHeader
        eyebrow="Pedido"
        title="Minha seleção"
        description="Confira as peças escolhidas e envie tudo pelo WhatsApp — a gente responde com disponibilidade e formas de pagamento."
        contagem={{ valor: totalPecas, singular: 'peça', plural: 'peças' }}
        migalhas={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Minha seleção' }]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <div className="flex flex-col gap-3">
          {itens.map((item) => (
            <CartItemRow key={item.produtoId} item={item} />
          ))}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/produtos"
              className="inline-flex min-h-11 items-center gap-2 rounded-pilula text-[0.9375rem] font-bold
                text-coral-800 transition-colors hover:text-coral-900 foco-marca"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Continuar vendo o catálogo
            </Link>
            <button
              type="button"
              onClick={limparCarrinho}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-pilula px-3 text-[0.9375rem]
                font-bold text-ink-500 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Limpar seleção
            </button>
          </div>
        </div>

        <aside className="superficie-solida h-fit overflow-hidden lg:sticky lg:top-28">
          <h2 className="titulo-bloco border-b border-coral-100 px-6 py-4">Resumo</h2>

          <div className="p-6">
            <dl className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-[0.9375rem] text-ink-500">Peças selecionadas</dt>
                <dd className="text-lg font-extrabold tabular-nums text-ink-900">{totalPecas}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-coral-100 pt-3">
                <dt className="font-bold text-ink-900">Valor total</dt>
                <dd className="text-2xl font-extrabold tabular-nums text-coral-700">
                  {formatarPreco(totalValor)}
                </dd>
              </div>
            </dl>

            {linkWhatsApp ? (
              <>
                <a
                  href={linkWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary btn-grande mt-6 w-full"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Enviar pelo WhatsApp
                </a>
                <p className="mt-3 text-center text-[0.8125rem] leading-relaxed text-ink-500">
                  A mensagem abre pronta, com referências, tamanhos e valores. Você ainda pode
                  revisar antes de enviar.
                </p>
              </>
            ) : (
              <p className="mt-6 rounded-2xl bg-coral-50 p-4 text-sm text-coral-800 ring-1 ring-inset ring-coral-100">
                WhatsApp da loja não configurado. Defina NEXT_PUBLIC_WHATSAPP_NUMBER no frontend.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
