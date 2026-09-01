'use client';

import { Pencil, Plus, Shirt, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ColecaoFormModal } from '@/components/admin/ColecaoFormModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useColecoes, useExcluirColecao } from '@/hooks/useColecoes';
import type { ColecaoResponse } from '@/types/api';

export default function AdminColecoesPage() {
  const { data: colecoes, isLoading } = useColecoes();
  const excluir = useExcluirColecao();

  const [modalAberto, setModalAberto] = useState(false);
  const [colecaoEditando, setColecaoEditando] = useState<ColecaoResponse | null>(null);
  const [colecaoExcluindo, setColecaoExcluindo] = useState<ColecaoResponse | null>(null);

  function abrirCriacao() {
    setColecaoEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(colecao: ColecaoResponse) {
    setColecaoEditando(colecao);
    setModalAberto(true);
  }

  async function confirmarExclusao() {
    if (!colecaoExcluindo) return;
    await excluir.mutateAsync(colecaoExcluindo.id);
    setColecaoExcluindo(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Painel"
        title="Coleções"
        description="Agrupamentos opcionais de peças (ex.: Verão 2026). Uma peça pode ficar sem coleção."
        contagem={
          colecoes ? { valor: colecoes.length, singular: 'coleção', plural: 'coleções' } : undefined
        }
        acao={
          <Button onClick={abrirCriacao}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova coleção
          </Button>
        }
      />

      <div>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[4.25rem] rounded-2xl" />
            ))}
          </div>
        ) : !colecoes || colecoes.length === 0 ? (
          <EmptyState
            icon={Shirt}
            title="Nenhuma coleção cadastrada"
            description="Coleções são opcionais — use para agrupar produtos de uma mesma linha ou temporada."
            action={
              <Button onClick={abrirCriacao} variant="secondary">
                <Plus className="h-4 w-4" />
                Nova coleção
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {colecoes.map((colecao) => (
              <div
                key={colecao.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-creme-50 px-4 py-3
                  shadow-suave ring-1 ring-coral-100 transition-shadow hover:shadow-peca"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink-900">{colecao.nome}</p>
                  <p className="text-[0.8125rem] text-ink-500">
                    {colecao.totalProdutos} {colecao.totalProdutos === 1 ? 'peça' : 'peças'}
                  </p>
                </div>

                <Badge tone={colecao.ativo ? 'green' : 'gray'}>{colecao.ativo ? 'Ativa' : 'Inativa'}</Badge>

                <div className="ml-auto flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(colecao)}
                    aria-label={`Editar ${colecao.nome}`}
                    title="Editar"
                    className="btn-icone"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setColecaoExcluindo(colecao)}
                    aria-label={`Excluir ${colecao.nome}`}
                    title="Excluir"
                    className="btn-icone"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ColecaoFormModal open={modalAberto} onClose={() => setModalAberto(false)} colecao={colecaoEditando} />

      <ConfirmDialog
        open={colecaoExcluindo !== null}
        title="Excluir coleção"
        description={`Tem certeza que deseja excluir "${colecaoExcluindo?.nome}"? Essa ação não pode ser desfeita. Coleções com produtos vinculados não podem ser excluídas.`}
        confirmLabel="Excluir"
        loading={excluir.isPending}
        onConfirm={confirmarExclusao}
        onCancel={() => setColecaoExcluindo(null)}
      />
    </div>
  );
}
