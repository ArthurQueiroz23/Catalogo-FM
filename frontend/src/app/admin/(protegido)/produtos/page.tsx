'use client';

import {
  Copy,
  Eye,
  EyeOff,
  ImageOff,
  Package,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCategorias } from '@/hooks/useCategorias';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  useAlterarStatusProduto,
  useDuplicarProduto,
  useExcluirProduto,
  useProdutosAdmin,
} from '@/hooks/useProdutos';
import { formatarPreco } from '@/lib/format';
import type { ProdutoSummaryResponse, Sexo, StatusProduto } from '@/types/api';

const SEXO_OPCOES = [
  { value: 'MENINO', label: 'Menino' },
  { value: 'MENINA', label: 'Menina' },
  { value: 'UNISSEX', label: 'Unissex' },
];

const STATUS_OPCOES = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Oculto' },
];

export default function AdminProdutosPage() {
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [sexo, setSexo] = useState<Sexo | ''>('');
  const [status, setStatus] = useState<StatusProduto | ''>('');
  const [page, setPage] = useState(0);
  const [produtoExcluindo, setProdutoExcluindo] = useState<ProdutoSummaryResponse | null>(null);

  const qDebounced = useDebouncedValue(q);
  const { data: categorias } = useCategorias();

  const filtro = {
    q: qDebounced || undefined,
    categoria: categoria || undefined,
    sexo: sexo || undefined,
    status: status || undefined,
    page,
    size: 20,
  };

  const { data, isLoading, isPlaceholderData } = useProdutosAdmin(filtro);
  const alterarStatus = useAlterarStatusProduto();
  const duplicar = useDuplicarProduto();
  const excluir = useExcluirProduto();

  function atualizarFiltro<T>(setter: (valor: T) => void) {
    return (valor: T) => {
      setter(valor);
      setPage(0);
    };
  }

  async function confirmarExclusao() {
    if (!produtoExcluindo) return;
    await excluir.mutateAsync(produtoExcluindo.id);
    setProdutoExcluindo(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="mt-1 text-sm text-gray-500">{data ? `${data.totalElements} produtos cadastrados` : ' '}</p>
        </div>
        <Link href="/admin/produtos/novo">
          <Button>
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Buscar por nome, referência..."
          value={q}
          onChange={(event) => atualizarFiltro(setQ)(event.target.value)}
        />
        <Select
          placeholder="Todas as categorias"
          options={(categorias ?? []).map((c) => ({ value: c.slug, label: c.nome }))}
          value={categoria}
          onChange={(event) => atualizarFiltro(setCategoria)(event.target.value)}
        />
        <Select
          placeholder="Todos os sexos"
          options={SEXO_OPCOES}
          value={sexo}
          onChange={(event) => atualizarFiltro(setSexo)(event.target.value as Sexo | '')}
        />
        <Select
          placeholder="Todos os status"
          options={STATUS_OPCOES}
          value={status}
          onChange={(event) => atualizarFiltro(setStatus)(event.target.value as StatusProduto | '')}
        />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16" />
            ))}
          </div>
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum produto encontrado"
            description="Ajuste os filtros ou cadastre um novo produto."
            action={
              <Link href="/admin/produtos/novo">
                <Button variant="secondary">
                  <Plus className="h-4 w-4" />
                  Novo produto
                </Button>
              </Link>
            }
          />
        ) : (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <div className="flex flex-col gap-2">
              {data.content.map((produto) => (
                <div
                  key={produto.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {produto.imagemPrincipalUrl ? (
                      <Image src={produto.imagemPrincipalUrl} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-gray-300">
                        <ImageOff className="h-5 w-5" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">{produto.nome}</p>
                    <p className="text-xs text-gray-400">
                      Ref. {produto.referencia} · {produto.categoriaNome}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {produto.destaque && (
                      <span title="Destaque" className="text-amber-400">
                        <Star className="h-4 w-4 fill-current" />
                      </span>
                    )}
                    <Badge tone={produto.status === 'ATIVO' ? 'green' : 'gray'}>
                      {produto.status === 'ATIVO' ? 'Ativo' : 'Oculto'}
                    </Badge>
                  </div>

                  <p className="w-24 shrink-0 text-right text-sm font-semibold text-gray-700">
                    {formatarPreco(produto.preco)}
                  </p>

                  <div className="flex shrink-0 gap-1">
                    <Link
                      href={`/admin/produtos/${produto.id}`}
                      aria-label={`Editar ${produto.nome}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        alterarStatus.mutate({
                          id: produto.id,
                          status: produto.status === 'ATIVO' ? 'INATIVO' : 'ATIVO',
                        })
                      }
                      aria-label={produto.status === 'ATIVO' ? 'Ocultar produto' : 'Ativar produto'}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      {produto.status === 'ATIVO' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicar.mutate(produto.id)}
                      aria-label={`Duplicar ${produto.nome}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdutoExcluindo(produto)}
                      aria-label={`Excluir ${produto.nome}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={produtoExcluindo !== null}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir "${produtoExcluindo?.nome}"? O produto some do site e do painel, mas pode ser recuperado pelo suporte técnico se necessário.`}
        confirmLabel="Excluir"
        loading={excluir.isPending}
        onConfirm={confirmarExclusao}
        onCancel={() => setProdutoExcluindo(null)}
      />
    </div>
  );
}
