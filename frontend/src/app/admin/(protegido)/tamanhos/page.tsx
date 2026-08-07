'use client';

import { Pencil, Plus, Ruler, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { SortableList } from '@/components/admin/SortableList';
import { TamanhoFormModal } from '@/components/admin/TamanhoFormModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useExcluirTamanho, useReordenarTamanhos, useTamanhos } from '@/hooks/useTamanhos';
import type { TamanhoResponse } from '@/types/api';

export default function AdminTamanhosPage() {
  const { data: tamanhos, isLoading } = useTamanhos();
  const reordenar = useReordenarTamanhos();
  const excluir = useExcluirTamanho();

  const [modalAberto, setModalAberto] = useState(false);
  const [tamanhoEditando, setTamanhoEditando] = useState<TamanhoResponse | null>(null);
  const [tamanhoExcluindo, setTamanhoExcluindo] = useState<TamanhoResponse | null>(null);

  function abrirCriacao() {
    setTamanhoEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(tamanho: TamanhoResponse) {
    setTamanhoEditando(tamanho);
    setModalAberto(true);
  }

  async function confirmarExclusao() {
    if (!tamanhoExcluindo) return;
    await excluir.mutateAsync(tamanhoExcluindo.id);
    setTamanhoExcluindo(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="titulo-pagina">Tamanhos</h1>
          <p className="mt-1 text-[0.9375rem] text-ink-500">Arraste para definir a ordem de exibição (ex.: RN antes de P).</p>
        </div>
        <Button onClick={abrirCriacao}>
          <Plus className="h-4 w-4" />
          Novo tamanho
        </Button>
      </div>

      <div className="mt-6 max-w-lg">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14" />
            ))}
          </div>
        ) : !tamanhos || tamanhos.length === 0 ? (
          <EmptyState
            icon={Ruler}
            title="Nenhum tamanho cadastrado"
            action={
              <Button onClick={abrirCriacao} variant="secondary">
                <Plus className="h-4 w-4" />
                Novo tamanho
              </Button>
            }
          />
        ) : (
          <SortableList
            items={tamanhos}
            className="flex flex-col gap-2"
            handleClassName="left-3 top-1/2 -translate-y-1/2"
            onReorder={(novaOrdem) => reordenar.mutate(novaOrdem.map((item, index) => ({ id: item.id, ordem: index })))}
            renderItem={(tamanho) => (
              <div className="flex items-center gap-4 rounded-2xl border border-coral-100 bg-creme-50 py-2.5 pl-10 pr-4">
                <p className="flex-1 font-medium text-ink-900">{tamanho.nome}</p>
                <Badge tone={tamanho.ativo ? 'green' : 'gray'}>{tamanho.ativo ? 'Ativo' : 'Inativo'}</Badge>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(tamanho)}
                    aria-label={`Editar ${tamanho.nome}`}
                    className="flex h-11 w-11 items-center justify-center rounded-pilula text-ink-400 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTamanhoExcluindo(tamanho)}
                    aria-label={`Excluir ${tamanho.nome}`}
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

      <TamanhoFormModal open={modalAberto} onClose={() => setModalAberto(false)} tamanho={tamanhoEditando} />

      <ConfirmDialog
        open={tamanhoExcluindo !== null}
        title="Excluir tamanho"
        description={`Tem certeza que deseja excluir "${tamanhoExcluindo?.nome}"? Produtos que usam este tamanho impedem a exclusão.`}
        confirmLabel="Excluir"
        loading={excluir.isPending}
        onConfirm={confirmarExclusao}
        onCancel={() => setTamanhoExcluindo(null)}
      />
    </div>
  );
}
