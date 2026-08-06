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
    return <div className="container py-16 text-center text-sm text-gray-400">Carregando sua seleção...</div>;
  }

  if (itens.length === 0) {
    return (
      <div className="container flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">Sua seleção está vazia</h1>
        <p className="max-w-sm text-gray-500">
          Navegue pelo catálogo e adicione as peças que quiser conversar com a gente.
        </p>
        <Link href="/" className="btn-primary">
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
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Minha seleção</h1>
      <p className="mt-1 text-sm text-gray-500">
        Monte sua lista de peças e envie para a vendedora pelo WhatsApp — ela responde com
        disponibilidade e formas de pagamento.
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {itens.map((item) => (
            <CartItemRow key={item.produtoId} item={item} />
          ))}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              ← Continuar vendo o catálogo
            </Link>
            <button
              type="button"
              onClick={limparCarrinho}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar seleção
            </button>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-100 bg-gray-50 p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-900">Resumo da seleção</h2>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Quantidade total de peças</dt>
              <dd className="font-semibold text-gray-900">{totalPecas}</dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-semibold text-gray-900">Valor total</dt>
              <dd className="font-bold text-brand-600">{formatarPreco(totalValor)}</dd>
            </div>
          </dl>

          {linkWhatsApp ? (
            <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full">
              <MessageCircle className="h-4 w-4" />
              Enviar seleção pelo WhatsApp
            </a>
          ) : (
            <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              WhatsApp da loja não configurado. Defina NEXT_PUBLIC_WHATSAPP_NUMBER no frontend.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
