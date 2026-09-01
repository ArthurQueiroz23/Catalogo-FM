import type { Metadata } from 'next';
import { Tags } from 'lucide-react';
import { CategoryCard } from '@/components/category/CategoryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/lib/api';
import type { CategoriaResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Categorias',
  description: 'Todas as categorias do catálogo Fruto da Malha.',
};

export default async function CategoriasPage() {
  const categorias = await api.get<CategoriaResponse[]>('/categorias', { cache: 'no-store' });

  return (
    <div className="container secao-compacta">
      <PageHeader
        title="Categorias"
        description="Os mesmos blocos do catálogo impresso. Toque numa categoria para ver as peças dela."
        migalhas={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Categorias' }]}
      />

      {categorias.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma categoria cadastrada ainda"
          description="Assim que a loja organizar as peças em categorias, elas aparecem aqui."
        />
      ) : (
        <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-5 lg:grid-cols-7">
          {categorias.map((categoria) => (
            <CategoryCard key={categoria.id} categoria={categoria} />
          ))}
        </div>
      )}
    </div>
  );
}
