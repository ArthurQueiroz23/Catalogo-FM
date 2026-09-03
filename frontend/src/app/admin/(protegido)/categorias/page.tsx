'use client';

import { ImageOff, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { CategoriaFormModal } from '@/components/admin/CategoriaFormModal';
import { SortableList } from '@/components/admin/SortableList';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCategorias, useExcluirCategoria, useReordenarCategorias } from '@/hooks/useCategorias';
import type { CategoriaResponse } from '@/types/api';

export default function AdminCategoriasPage() {
  const { data: categorias, isLoading, isError, error, refetch } = useCategorias();
  const reordenar = useReordenarCategorias();
  const excluir = useExcluirCategoria();

  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaResponse | null>(null);
  const [categoriaExcluindo, setCategoriaExcluindo] = useState<CategoriaResponse | null>(null);

  function abrirCriacao() {
    setCategoriaEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(categoria: CategoriaResponse) {
    setCategoriaEditando(categoria);
    setModalAberto(true);
  }

  async function confirmarExclusao() {
    if (!categoriaExcluindo) return;
    await excluir.mutateAsync(categoriaExcluindo.id);
    setCategoriaExcluindo(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Painel"
        title="Categorias"
        description="Os blocos do catálogo. Arraste para mudar a ordem em que aparecem no site."
        contagem={
          categorias ? { valor: categorias.length, singular: 'categoria', plural: 'categorias' } : undefined
        }
        acao={
          <Button onClick={abrirCriacao}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova categoria
          </Button>
        }
      />

      <div>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[4.75rem] rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          // Falha de carregamento não é catálogo vazio: sem esta ramificação, uma sessão
          // expirada (401) caía no EmptyState e o painel oferecia "criar a primeira categoria"
          // sobre um catálogo cheio — ver src/lib/auth.ts.
          <ErrorState error={error} recurso="as categorias" onRetry={() => refetch()} />
        ) : !categorias || categorias.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="Nenhuma categoria cadastrada"
            description="Crie a primeira categoria para começar a organizar o catálogo."
            action={
              <Button onClick={abrirCriacao} variant="secondary">
                <Plus className="h-4 w-4" />
                Nova categoria
              </Button>
            }
          />
        ) : (
          <SortableList
            items={categorias}
            className="flex flex-col gap-2"
            handleClassName="left-3 top-1/2 -translate-y-1/2"
            onReorder={(novaOrdem) => reordenar.mutate(novaOrdem.map((item, index) => ({ id: item.id, ordem: index })))}
            renderItem={(categoria) => (
              <div
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-creme-50 py-3 pl-10 pr-4
                  shadow-suave ring-1 ring-coral-100 transition-shadow hover:shadow-peca"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-creme-100 ring-1 ring-coral-100">
                  {categoria.imagemUrl ? (
                    <Image src={categoria.imagemUrl} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-coral-200">
                      <ImageOff className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink-900">{categoria.nome}</p>
                  <p className="text-[0.8125rem] text-ink-500">
                    {categoria.totalProdutos} {categoria.totalProdutos === 1 ? 'peça' : 'peças'} (inclui as ocultas)
                  </p>
                </div>

                <Badge tone={categoria.ativo ? 'green' : 'gray'}>{categoria.ativo ? 'Ativa' : 'Inativa'}</Badge>

                <div className="ml-auto flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(categoria)}
                    aria-label={`Editar ${categoria.nome}`}
                    title="Editar"
                    className="btn-icone"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoriaExcluindo(categoria)}
                    aria-label={`Excluir ${categoria.nome}`}
                    title="Excluir"
                    className="btn-icone"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          />
        )}
      </div>

      <CategoriaFormModal open={modalAberto} onClose={() => setModalAberto(false)} categoria={categoriaEditando} />

      <ConfirmDialog
        open={categoriaExcluindo !== null}
        title="Excluir categoria"
        description={`Tem certeza que deseja excluir "${categoriaExcluindo?.nome}"? Essa ação não pode ser desfeita. Categorias com produtos vinculados não podem ser excluídas.`}
        confirmLabel="Excluir"
        loading={excluir.isPending}
        onConfirm={confirmarExclusao}
        onCancel={() => setCategoriaExcluindo(null)}
      />
    </div>
  );
}
