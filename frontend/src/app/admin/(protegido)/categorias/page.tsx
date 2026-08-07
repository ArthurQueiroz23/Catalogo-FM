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
import { Skeleton } from '@/components/ui/Skeleton';
import { useCategorias, useExcluirCategoria, useReordenarCategorias } from '@/hooks/useCategorias';
import type { CategoriaResponse } from '@/types/api';

export default function AdminCategoriasPage() {
  const { data: categorias, isLoading } = useCategorias();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="titulo-pagina">Categorias</h1>
          <p className="mt-1 text-[0.9375rem] text-ink-500">Arraste para reordenar como aparecem no site.</p>
        </div>
        <Button onClick={abrirCriacao}>
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
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
              <div className="flex items-center gap-4 rounded-2xl border border-coral-100 bg-creme-50 py-3 pl-10 pr-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-creme-50">
                  {categoria.imagemUrl ? (
                    <Image src={categoria.imagemUrl} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-ink-300">
                      <ImageOff className="h-5 w-5" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink-900">{categoria.nome}</p>
                  <p className="text-sm text-ink-400">
                    {categoria.totalProdutos} {categoria.totalProdutos === 1 ? 'produto' : 'produtos'}
                  </p>
                </div>

                <Badge tone={categoria.ativo ? 'green' : 'gray'}>{categoria.ativo ? 'Ativa' : 'Inativa'}</Badge>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(categoria)}
                    aria-label={`Editar ${categoria.nome}`}
                    className="flex h-11 w-11 items-center justify-center rounded-pilula text-ink-400 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoriaExcluindo(categoria)}
                    aria-label={`Excluir ${categoria.nome}`}
                    className="flex h-11 w-11 items-center justify-center rounded-pilula text-ink-400 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
                  >
                    <Trash2 className="h-4 w-4" />
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
