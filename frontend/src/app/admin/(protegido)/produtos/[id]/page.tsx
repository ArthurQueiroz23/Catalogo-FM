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
      <Link href="/admin/produtos" className="text-sm text-ink-400 hover:text-ink-600">
        ← Voltar para produtos
      </Link>

      {isLoading || !produto ? (
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          <h1 className="mt-2 text-2xl font-bold text-ink-900">{produto.nome}</h1>
          <p className="mt-1 text-[0.9375rem] text-ink-500">Ref. {produto.referencia}</p>

          <div className="mt-6 rounded-2xl border border-coral-100 bg-creme-50 p-6">
            <ProductGalleryManager
              produtoId={produto.id}
              referencia={produto.referencia}
              imagens={produto.imagens}
              videos={produto.videos}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-coral-100 bg-creme-50 p-6">
            <ProdutoForm produtoExistente={produto} />
          </div>
        </>
      )}
    </div>
  );
}
