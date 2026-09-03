'use client';

import { Pencil, Plus, Ruler, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { SortableList } from '@/components/admin/SortableList';
import { TamanhoFormModal } from '@/components/admin/TamanhoFormModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useExcluirTamanho, useReordenarTamanhos, useTamanhos } from '@/hooks/useTamanhos';
import type { TamanhoResponse } from '@/types/api';

export default function AdminTamanhosPage() {
  const { data: tamanhos, isLoading, isError, error, refetch } = useTamanhos();
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
      <PageHeader
        eyebrow="Painel"
        title="Tamanhos"
        description="A grade usada nas peças. Arraste para definir a ordem de exibição (ex.: RN antes de P)."
        contagem={tamanhos ? { valor: tamanhos.length, singular: 'tamanho', plural: 'tamanhos' } : undefined}
        acao={
          <Button onClick={abrirCriacao}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo tamanho
          </Button>
        }
      />

      <div className="max-w-xl">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState error={error} recurso="os tamanhos" onRetry={() => refetch()} />
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
              <div
                className="flex items-center gap-4 rounded-2xl bg-creme-50 py-2.5 pl-10 pr-4 shadow-suave
                  ring-1 ring-coral-100 transition-shadow hover:shadow-peca"
              >
                <p className="flex-1 font-bold text-ink-900">{tamanho.nome}</p>
                <Badge tone={tamanho.ativo ? 'green' : 'gray'}>{tamanho.ativo ? 'Ativo' : 'Inativo'}</Badge>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(tamanho)}
                    aria-label={`Editar ${tamanho.nome}`}
                    title="Editar"
                    className="btn-icone"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTamanhoExcluindo(tamanho)}
                    aria-label={`Excluir ${tamanho.nome}`}
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
