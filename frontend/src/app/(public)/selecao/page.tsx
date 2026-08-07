'use client';

import { MessageCircle, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { quantidadeTotalPecas, valorTotalCarrinho } from '@/lib/cart';
import { siteConfig } from '@/lib/config';
import { formatarPreco } from '@/lib/format';
import { montarLinkWhatsApp, montarMensagemSelecao } from '@/lib/whatsapp';
import { useCartHasHydrated, useCartStore } from '@/store/cart-store';

export default function SelecaoPage() {
  const itens = useCartStore((state) => state.itens);
  const limparCarrinho = useCartStore((state) => state.limparCarrinho);
  const hidratado = useCartHasHydrated();

  if (!hidratado) {
    return (
      <div className="container py-20 text-center text-[0.9375rem] text-ink-400">
        Carregando sua seleção...
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag className="h-14 w-14 text-coral-300" />
        <h1 className="titulo-pagina">Sua seleção está vazia</h1>
        <p className="max-w-sm text-[0.9375rem] leading-relaxed text-ink-500">
          Navegue pelo catálogo e escolha as peças que quiser conversar com a gente.
        </p>
        <Link href="/categoria" className="btn-primary mt-2">
          Ver o catálogo
        </Link>
      </div>
    );
  }

  const totalPecas = quantidadeTotalPecas(itens);
  const totalValor = valorTotalCarrinho(itens);
  const linkWhatsApp = siteConfig.whatsappNumber
    ? montarLinkWhatsApp(siteConfig.whatsappNumber, montarMensagemSelecao(itens))
    : null;

  return (
    <div className="container py-6 sm:py-8">
      <h1 className="titulo-pagina">Minha seleção</h1>
      <p className="mt-1.5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-500">
        Confira as peças escolhidas e envie tudo pela WhatsApp — a gente responde com
        disponibilidade e formas de pagamento.
      </p>

      <div className="mt-7 grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {itens.map((item) => (
            <CartItemRow key={item.produtoId} item={item} />
          ))}

          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/categoria"
              className="inline-flex min-h-11 items-center rounded-pilula text-[0.9375rem] font-semibold text-coral-700 transition-colors hover:text-coral-800 foco-marca"
            >
              ← Continuar vendo o catálogo
            </Link>
            <button
              type="button"
              onClick={limparCarrinho}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-pilula px-3 text-[0.9375rem]
                font-semibold text-ink-400 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
            >
              <Trash2 className="h-4 w-4" />
              Limpar seleção
            </button>
          </div>
        </div>

        <aside className="superficie-solida h-fit p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-ink-900">Resumo</h2>

          <dl className="mt-5 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[0.9375rem] text-ink-500">Total de peças</dt>
              <dd className="text-lg font-bold text-ink-900">{totalPecas}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-coral-100 pt-3">
              <dt className="font-bold text-ink-900">Valor total</dt>
              <dd className="text-2xl font-bold text-coral-700">{formatarPreco(totalValor)}</dd>
            </div>
          </dl>

          {linkWhatsApp ? (
            <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 w-full">
              <MessageCircle className="h-5 w-5" />
              Enviar pelo WhatsApp
            </a>
          ) : (
            <p className="mt-6 rounded-peca bg-coral-50 p-4 text-sm text-coral-800">
              WhatsApp da loja não configurado. Defina NEXT_PUBLIC_WHATSAPP_NUMBER no frontend.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
