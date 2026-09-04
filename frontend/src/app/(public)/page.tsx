import { ArrowRight, Handshake, MessageCircle, Shirt, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { CategoryCard } from '@/components/category/CategoryCard';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { api } from '@/lib/api';
import { siteConfig } from '@/lib/config';
import { montarLinkWhatsApp } from '@/lib/whatsapp';
import type { CategoriaResponse, PageResponse, ProdutoSummaryResponse } from '@/types/api';

// Sempre buscado sem cache — qualquer alteração da administradora deve refletir no próximo
// carregamento da página, sem depender de revalidação manual (ver docs/ARCHITECTURE.md §3.3).
export const dynamic = 'force-dynamic';

/** Prévia do catálogo na home. Fecha linha certa nas grades de 2, 3 e 4 colunas. */
const PECAS_NA_PREVIA = 12;

async function buscarDadosIniciais() {
  // `allSettled` de propósito: se só os destaques falharem, a home ainda mostra categorias e
  // catálogo, em vez de derrubar a página inteira por causa de uma seção.
  const [categorias, destaques, catalogo] = await Promise.allSettled([
    api.get<CategoriaResponse[]>('/categorias', { cache: 'no-store' }),
    api.get<ProdutoSummaryResponse[]>('/produtos/destaques', { cache: 'no-store' }),
    // Sem `sort` na URL: o backend já devolve por `ordem` ASC, que é a sequência comercial do
    // catálogo impresso. Passar qualquer ordenação aqui quebraria essa sequência.
    api.get<PageResponse<ProdutoSummaryResponse>>(`/produtos?page=0&size=${PECAS_NA_PREVIA}`, {
      cache: 'no-store',
    }),
  ]);

  return {
    categorias: categorias.status === 'fulfilled' ? categorias.value : [],
    destaques: destaques.status === 'fulfilled' ? destaques.value : [],
    produtos: catalogo.status === 'fulfilled' ? catalogo.value.content : [],
    totalProdutos: catalogo.status === 'fulfilled' ? catalogo.value.totalElements : 0,
  };
}

/**
 * Como o pedido funciona. Abre a home porque este catálogo **não** é uma loja virtual: a cliente
 * monta a seleção aqui e fecha a compra no WhatsApp. Quem chega esperando "carrinho e pagamento"
 * precisa entender o caminho antes de começar a escolher — não depois.
 */
const PASSOS = [
  {
    icone: Shirt,
    titulo: 'Escolha as peças',
    texto: 'Navegue pelo catálogo e defina tamanhos e quantidades de cada peça.',
  },
  {
    icone: ShoppingBag,
    titulo: 'Confira sua seleção',
    texto: 'Revise os itens e adicione observações se precisar.',
  },
  {
    icone: MessageCircle,
    titulo: 'Envie pelo WhatsApp',
    texto: 'Sua seleção vira uma mensagem pronta, com referências, quantidades e valores.',
  },
  {
    icone: Handshake,
    titulo: 'A gente responde',
    texto: 'Confirmamos disponibilidade, formas de pagamento e o envio do seu pedido.',
  },
];

export default async function HomePage() {
  const { categorias, destaques, produtos, totalProdutos } = await buscarDadosIniciais();

  const catalogoVazio = categorias.length === 0 && destaques.length === 0 && produtos.length === 0;

  const linkWhatsApp = siteConfig.whatsappNumber
    ? montarLinkWhatsApp(siteConfig.whatsappNumber, 'Olá! Vim pelo catálogo e gostaria de tirar uma dúvida.')
    : null;

  return (
    <div>
      {/* Abertura da home: o mesmo quadro "Como funciona" que ficava mais abaixo na página,
          movido para cá — é o desenho que já existia, sem nada acrescentado dentro dele.
          Ele ocupa o lugar da antiga chamada "Vestindo carinho", que saiu: a assinatura já
          aparece no logotipo do cabeçalho e no rodapé, e a dobra mais valiosa da página rende
          mais explicando o que a cliente não consegue deduzir sozinha — que a compra se fecha
          por WhatsApp.

          O título é `h1` (e não `h2`, como quando o bloco vivia no meio da página) só pelo
          esqueleto do documento: é o primeiro título da home. A classe é a mesma, então nada
          muda visualmente.

          As duas ações ficam **fora** do quadro, logo abaixo dele, para o quadro continuar
          sendo exatamente o que era. */}
      <section className="container pt-6 sm:pt-8">
        <div className="superficie-solida px-6 py-12 sm:px-10 sm:py-14">
          <div className="mx-auto mb-10 max-w-lg text-center">
            <p className="olho">Como funciona</p>
            <h1 className="titulo-secao mt-2">Pedir é simples</h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-500">
              Aqui você monta o pedido com calma. A compra é fechada por WhatsApp, com a gente.
            </p>
          </div>

          {/* Quatro etapas não fecham em 3 colunas: `md:grid-cols-3` deixaria a quarta órfã
              numa linha só dela. A grade passa a dobrar em pares — 2×2 do `sm` ao `lg`, onde a
              linha única de 4 ainda deixaria cada coluna estreita demais para o texto — e só
              abre em fila de 4 a partir do `lg`. O `gap-y` continua no `gap-10` da base: são as
              duas linhas do 2×2 que precisam do respiro, não as colunas. */}
          <ol className="grid gap-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
            {PASSOS.map((passo, indice) => (
              <li key={passo.titulo} className="flex flex-col items-center text-center">
                <span className="relative" aria-hidden="true">
                  <span
                    className="flex h-16 w-16 items-center justify-center rounded-pilula bg-coral-100
                      text-coral-700 ring-1 ring-inset ring-coral-200"
                  >
                    <passo.icone className="h-7 w-7" />
                  </span>
                  <span
                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-pilula
                      bg-coral-400 text-xs font-extrabold tabular-nums text-white ring-2 ring-creme-50"
                  >
                    {indice + 1}
                  </span>
                </span>

                <p className="titulo-bloco mt-4 text-base">{passo.titulo}</p>
                <p className="mt-2 max-w-xs text-[0.9375rem] leading-relaxed text-ink-500">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* `flex-col` no celular para os dois ficarem em largura cheia — dois botões de 44px
            lado a lado numa tela de 390px viram dois alvos apertados. */}
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/produtos" className="btn-primary btn-grande">
            Ver catálogo completo
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          {linkWhatsApp && (
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-grande"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Falar no WhatsApp
            </a>
          )}
        </div>
      </section>

      {destaques.length > 0 && (
        <section className="container secao">
          <SectionHeading
            eyebrow="Vitrine"
            title="Peças em destaque"
            subtitle="Uma seleção especial, escolhida pela loja."
          />
          <ProductCarousel produtos={destaques} />
        </section>
      )}

      {categorias.length > 0 && (
        <section className="container secao-compacta">
          <SectionHeading title="Categorias" href="/categoria" hrefLabel="Ver todas" />
          <div className="grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-5 lg:grid-cols-7">
            {categorias.map((categoria) => (
              <CategoryCard key={categoria.id} categoria={categoria} />
            ))}
          </div>
        </section>
      )}

      {produtos.length > 0 && (
        <section className="container secao">
          <SectionHeading
            eyebrow="Catálogo"
            title="Todas as peças"
            href="/produtos"
            hrefLabel="Ver tudo"
          />
          <ProductGrid produtos={produtos} />

          {/* Só oferece o caminho para o catálogo inteiro quando existe algo além da prévia. */}
          {totalProdutos > produtos.length && (
            <div className="mt-10 flex justify-center">
              <Link href="/produtos" className="btn-secondary">
                Ver todas as peças
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>
      )}

      {catalogoVazio && (
        <div className="container secao text-center">
          <p className="titulo-pagina">Novas peças chegando em breve.</p>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink-500">
            Fale com a gente pelo WhatsApp para conhecer nossas peças.
          </p>
          {linkWhatsApp && (
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Falar no WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}
