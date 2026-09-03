'use client';

import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProductGalleryManager } from '@/components/admin/ProductGalleryManager';
import { ProdutoForm } from '@/components/admin/ProdutoForm';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProdutoAdmin } from '@/hooks/useProdutos';

export default function EditarProdutoPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: produto, isLoading, isError, error, refetch } = useProdutoAdmin(
    Number.isFinite(id) ? id : undefined
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/produtos"
        className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-pilula text-[0.9375rem] font-bold
          text-coral-800 transition-colors hover:text-coral-900 foco-marca"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para as peças
      </Link>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-72 rounded-peca" />
          <Skeleton className="h-96 rounded-peca" />
        </div>
      ) : isError || !produto ? (
        // Antes, qualquer falha aqui deixava a tela em esqueleto para sempre — `!produto` caía
        // no mesmo ramo do carregamento. Uma sessão expirada travava a edição sem dizer por quê.
        <ErrorState error={error} recurso="esta peça" onRetry={() => refetch()} />
      ) : (
        <>
          <PageHeader
            eyebrow={`Ref. ${produto.referencia}`}
            title={produto.nome}
            acao={
              produto.status === 'ATIVO' ? (
                // Ver a peça publicada é o jeito mais rápido de conferir uma alteração; quando
                // ela está oculta, o link levaria a um 404 no site, então nem aparece.
                <Link
                  href={`/produto/${produto.referencia}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Ver no site
                </Link>
              ) : (
                <Badge tone="gray">Oculta no site</Badge>
              )
            }
          />

          <div className="flex flex-col gap-5">
            <section className="superficie-solida p-5 sm:p-6">
              <ProductGalleryManager
                produtoId={produto.id}
                referencia={produto.referencia}
                imagens={produto.imagens}
                videos={produto.videos}
              />
            </section>

            <ProdutoForm produtoExistente={produto} />
          </div>
        </>
      )}
    </div>
  );
}
