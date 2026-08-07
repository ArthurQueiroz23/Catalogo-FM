import Image from 'next/image';
import Link from 'next/link';
import { CategoryCard } from '@/components/category/CategoryCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { api } from '@/lib/api';
import type { CategoriaResponse, ProdutoSummaryResponse } from '@/types/api';

// Sempre buscado sem cache — qualquer alteração da administradora deve refletir no próximo
// carregamento da página, sem depender de revalidação manual (ver docs/ARCHITECTURE.md §3.3).
export const dynamic = 'force-dynamic';

async function buscarDadosIniciais() {
  const [categorias, destaques] = await Promise.allSettled([
    api.get<CategoriaResponse[]>('/categorias', { cache: 'no-store' }),
    api.get<ProdutoSummaryResponse[]>('/produtos/destaques', { cache: 'no-store' }),
  ]);

  return {
    categorias: categorias.status === 'fulfilled' ? categorias.value : [],
    destaques: destaques.status === 'fulfilled' ? destaques.value : [],
  };
}

export default async function HomePage() {
  const { categorias, destaques } = await buscarDadosIniciais();

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
        <Link href="/categoria" className="btn-primary animate-surgir mt-1">
          Ver o catálogo completo
        </Link>
      </section>

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

      {destaques.length > 0 && (
        <section className="container py-8 sm:py-10">
          <SectionHeading title="Peças em destaque" subtitle="Uma seleção especial da nossa vitrine" />
          <ProductGrid produtos={destaques} />
        </section>
      )}

      {categorias.length === 0 && destaques.length === 0 && (
        <div className="container py-16 text-center">
          <p className="text-lg font-semibold text-ink-700">O catálogo ainda está sendo montado.</p>
          <p className="mt-2 text-[0.9375rem] text-ink-500">
            Assim que as peças forem cadastradas, elas aparecem aqui automaticamente.
          </p>
        </div>
      )}
    </div>
  );
}
