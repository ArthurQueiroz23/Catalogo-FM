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
    <div className="pb-16">
      <section className="bg-gradient-to-br from-brand-50 via-white to-accent-50">
        <div className="container flex flex-col items-start gap-4 py-14 sm:py-20">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-600 shadow-sm">
            Novo catálogo online
          </span>
          <h1 className="max-w-xl text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl md:text-5xl">
            Roupinhas com carinho, do RN aos 12 anos
          </h1>
          <p className="max-w-lg text-base text-gray-600 sm:text-lg">
            Escolha as peças, os tamanhos e as quantidades que quiser. No final, é só enviar sua
            seleção pelo WhatsApp e conversar direto com a gente.
          </p>
          <Link href="/categoria" className="btn-primary mt-2">
            Ver catálogo completo
          </Link>
        </div>
      </section>

      {categorias.length > 0 && (
        <section className="container py-12">
          <SectionHeading title="Categorias" href="/categoria" />
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
            {categorias.map((categoria) => (
              <CategoryCard key={categoria.id} categoria={categoria} />
            ))}
          </div>
        </section>
      )}

      {destaques.length > 0 && (
        <section className="container py-12">
          <SectionHeading title="Produtos em destaque" subtitle="Uma seleção especial escolhida para você" />
          <ProductGrid produtos={destaques} />
        </section>
      )}

      {categorias.length === 0 && destaques.length === 0 && (
        <div className="container py-20 text-center text-gray-500">
          <p>O catálogo ainda não tem produtos cadastrados.</p>
          <p className="mt-1 text-sm">Assim que a administradora cadastrar produtos, eles aparecem aqui automaticamente.</p>
        </div>
      )}
    </div>
  );
}
