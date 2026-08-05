'use client';

import { Pencil, Plus, Shirt, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ColecaoFormModal } from '@/components/admin/ColecaoFormModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coleções</h1>
          <p className="mt-1 text-sm text-gray-500">Agrupamentos opcionais de produtos (ex.: Verão 2026).</p>
        </div>
        <Button onClick={abrirCriacao}>
          <Plus className="h-4 w-4" />
          Nova coleção
        </Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16" />
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
              <div key={colecao.id} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{colecao.nome}</p>
                  <p className="text-xs text-gray-400">
                    {colecao.totalProdutos} {colecao.totalProdutos === 1 ? 'produto' : 'produtos'}
                  </p>
                </div>

                <Badge tone={colecao.ativo ? 'green' : 'gray'}>{colecao.ativo ? 'Ativa' : 'Inativa'}</Badge>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(colecao)}
                    aria-label={`Editar ${colecao.nome}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setColecaoExcluindo(colecao)}
                    aria-label={`Excluir ${colecao.nome}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
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
