import Image from 'next/image';
import Link from 'next/link';
import { CategoryCard } from '@/components/category/CategoryCard';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { api } from '@/lib/api';
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

export default async function HomePage() {
  const { categorias, destaques, produtos, totalProdutos } = await buscarDadosIniciais();

  const catalogoVazio = categorias.length === 0 && destaques.length === 0 && produtos.length === 0;

  return (
    <div className="pb-4">
      {/* Capa: a mesma composição da primeira página do catálogo — o logo em destaque sobre o
          creme rabiscado, com a assinatura "Vestindo carinho" logo abaixo. */}
      <section className="container flex flex-col items-center gap-5 py-12 text-center sm:py-16">
        <Image
          src="/marca/logo.png"
          alt="Fruto da Malha"
          width={150}
          height={186}
          priority
          className="h-auto w-28 animate-surgir sm:w-36"
        />
        <div className="animate-surgir">
          <h1 className="titulo-vitrine">Vestindo carinho</h1>
          <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-ink-600 sm:text-lg">
            Escolha as peças, os tamanhos e as quantidades que quiser. No final, é só enviar sua
            seleção pelo WhatsApp e conversar direto com a gente.
          </p>
        </div>
        <Link href="/produtos" className="btn-primary animate-surgir mt-1">
          Ver o catálogo completo
        </Link>
      </section>

      {destaques.length > 0 && (
        <section className="container py-8 sm:py-10">
          <SectionHeading
            title="Produtos em destaque"
            subtitle="Uma seleção especial da nossa vitrine"
          />
          <ProductCarousel produtos={destaques} />
        </section>
      )}

      {categorias.length > 0 && (
        <section className="container py-8 sm:py-10">
          <SectionHeading title="Categorias" href="/categoria" />
          <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
            {categorias.map((categoria) => (
              <CategoryCard key={categoria.id} categoria={categoria} />
            ))}
          </div>
        </section>
      )}

      {produtos.length > 0 && (
        <section className="container py-8 sm:py-10">
          <SectionHeading
            title="Todos os produtos"
            subtitle="Conheça nossa coleção"
            href="/produtos"
            hrefLabel="Ver tudo"
          />
          <ProductGrid produtos={produtos} />

          {/* Só oferece o caminho para o catálogo inteiro quando existe algo além da prévia. */}
          {totalProdutos > produtos.length && (
            <div className="mt-8 flex justify-center">
              <Link href="/produtos" className="btn-secondary">
                Ver as {totalProdutos} peças do catálogo
              </Link>
            </div>
          )}
        </section>
      )}

      {catalogoVazio && (
        <div className="container py-16 text-center">
          <p className="text-lg font-semibold text-ink-700">Novas peças chegando em breve.</p>
          <p className="mt-2 text-[0.9375rem] text-ink-500">
            Fale com a gente pelo WhatsApp para conhecer nossas peças.
          </p>
        </div>
      )}
    </div>
  );
}
