'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProductGalleryManager } from '@/components/admin/ProductGalleryManager';
import { ProdutoForm } from '@/components/admin/ProdutoForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProdutoAdmin } from '@/hooks/useProdutos';

export default function EditarProdutoPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: produto, isLoading } = useProdutoAdmin(Number.isFinite(id) ? id : undefined);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/produtos" className="text-sm text-gray-400 hover:text-gray-600">
        ← Voltar para produtos
      </Link>

      {isLoading || !produto ? (
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{produto.nome}</h1>
          <p className="mt-1 text-sm text-gray-500">Ref. {produto.referencia}</p>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
            <ProductGalleryManager
              produtoId={produto.id}
              referencia={produto.referencia}
              imagens={produto.imagens}
              videos={produto.videos}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
            <ProdutoForm produtoExistente={produto} />
          </div>
        </>
      )}
    </div>
  );
}
