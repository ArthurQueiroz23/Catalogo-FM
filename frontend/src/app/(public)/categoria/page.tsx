import type { Metadata } from 'next';
import { CategoryCard } from '@/components/category/CategoryCard';
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
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Categorias</h1>

      {categorias.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">Nenhuma categoria cadastrada ainda.</p>
      ) : (
        <div className="mt-8 grid grid-cols-3 gap-y-8 sm:grid-cols-4 md:grid-cols-6">
          {categorias.map((categoria) => (
            <CategoryCard key={categoria.id} categoria={categoria} />
          ))}
        </div>
      )}
    </div>
  );
}
