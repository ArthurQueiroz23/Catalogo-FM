'use client';

import {
  Camera,
  Copy,
  Eye,
  EyeOff,
  Package,
  Pencil,
  Plus,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
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
import { SEXO_OPCOES } from '@/lib/rotulos';
import type { ProdutoSummaryResponse, Sexo, StatusProduto } from '@/types/api';

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

  const { data, isLoading, isPlaceholderData, isError, error, refetch } = useProdutosAdmin(filtro);
  const alterarStatus = useAlterarStatusProduto();
  const duplicar = useDuplicarProduto();
  const excluir = useExcluirProduto();

  const temFiltro = Boolean(q || categoria || sexo || status);

  function atualizarFiltro<T>(setter: (valor: T) => void) {
    return (valor: T) => {
      setter(valor);
      setPage(0);
    };
  }

  function limparFiltros() {
    setQ('');
    setCategoria('');
    setSexo('');
    setStatus('');
    setPage(0);
  }

  async function confirmarExclusao() {
    if (!produtoExcluindo) return;
    await excluir.mutateAsync(produtoExcluindo.id);
    setProdutoExcluindo(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Painel"
        title="Peças"
        description="Cadastre, publique e organize as peças que aparecem no catálogo."
        contagem={
          data ? { valor: data.totalElements, singular: 'peça cadastrada', plural: 'peças cadastradas' } : undefined
        }
        acao={
          <Link href="/admin/produtos/novo" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nova peça
          </Link>
        }
      />

      {/* Filtros num painel próprio: separados da lista, deixam claro que a contagem exibida é
          o resultado de um recorte, e não o catálogo inteiro. */}
      <section className="superficie p-4 sm:p-5" aria-label="Filtros">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-bold text-ink-700">
            <SlidersHorizontal className="h-4 w-4 text-coral-600" aria-hidden="true" />
            Filtrar
          </p>
          {temFiltro && (
            <button
              type="button"
              onClick={limparFiltros}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-pilula px-3 text-[0.8125rem]
                font-bold text-ink-500 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Buscar por nome, referência..."
            aria-label="Buscar peça"
            value={q}
            onChange={(event) => atualizarFiltro(setQ)(event.target.value)}
          />
          <Select
            placeholder="Todas as categorias"
            aria-label="Filtrar por categoria"
            options={(categorias ?? []).map((c) => ({ value: c.slug, label: c.nome }))}
            value={categoria}
            onChange={(event) => atualizarFiltro(setCategoria)(event.target.value)}
          />
          <Select
            placeholder="Todos os sexos"
            aria-label="Filtrar por sexo"
            options={SEXO_OPCOES}
            value={sexo}
            onChange={(event) => atualizarFiltro(setSexo)(event.target.value as Sexo | '')}
          />
          <Select
            placeholder="Todos os status"
            aria-label="Filtrar por status"
            options={STATUS_OPCOES}
            value={status}
            onChange={(event) => atualizarFiltro(setStatus)(event.target.value as StatusProduto | '')}
          />
        </div>
      </section>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[4.75rem] rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          // Falha de carregamento não é lista vazia: sem esta ramificação, uma sessão expirada
          // (401) caía no EmptyState e o painel pedia para "cadastrar a primeira peça" sobre um
          // catálogo cheio — ver src/lib/auth.ts.
          <ErrorState error={error} recurso="as peças" onRetry={() => refetch()} />
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhuma peça encontrada"
            description={
              temFiltro
                ? 'Nenhuma peça corresponde a estes filtros. Tente limpar o recorte.'
                : 'Cadastre a primeira peça para ela aparecer no catálogo.'
            }
            action={
              temFiltro ? (
                <Button variant="secondary" onClick={limparFiltros}>
                  Limpar filtros
                </Button>
              ) : (
                <Link href="/admin/produtos/novo" className="btn-secondary">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Nova peça
                </Link>
              )
            }
          />
        ) : (
          <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <ul className="flex flex-col gap-2">
              {data.content.map((produto) => (
                <li
                  key={produto.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-creme-50 p-3
                    shadow-suave ring-1 ring-coral-100 transition-shadow hover:shadow-peca"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-creme-100 ring-1 ring-coral-100">
                    {produto.imagemPrincipalUrl ? (
                      <Image
                        src={produto.imagemPrincipalUrl}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-coral-200">
                        <Camera className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 basis-48">
                    {/* O `truncate` precisa ficar no elemento de texto, não no contêiner
                        flex: num `display:flex`, o corte com reticências não se aplica ao
                        conteúdo, e o nome longo era cortado na borda do card sem aviso. */}
                    <p className="flex items-center gap-1.5 font-bold text-ink-900">
                      {produto.destaque && (
                        <Star
                          className="h-3.5 w-3.5 shrink-0 fill-coral-400 text-coral-400"
                          aria-label="Peça em destaque"
                        />
                      )}
                      <span className="truncate">{produto.nome}</span>
                    </p>
                    <p className="truncate text-[0.8125rem] text-ink-500">
                      Ref. {produto.referencia} · {produto.categoriaNome}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge tone={produto.status === 'ATIVO' ? 'green' : 'gray'}>
                      {produto.status === 'ATIVO' ? 'Ativo' : 'Oculto'}
                    </Badge>
                    <p className="w-24 text-right font-bold tabular-nums text-ink-800">
                      {formatarPreco(produto.preco)}
                    </p>
                  </div>

                  <div className="ml-auto flex shrink-0 gap-0.5">
                    <Link
                      href={`/admin/produtos/${produto.id}`}
                      aria-label={`Editar ${produto.nome}`}
                      title="Editar"
                      className="btn-icone"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
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
                      title={produto.status === 'ATIVO' ? 'Ocultar do site' : 'Publicar no site'}
                      className="btn-icone"
                    >
                      {produto.status === 'ATIVO' ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicar.mutate(produto.id)}
                      aria-label={`Duplicar ${produto.nome}`}
                      title="Duplicar"
                      className="btn-icone"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdutoExcluindo(produto)}
                      aria-label={`Excluir ${produto.nome}`}
                      title="Excluir"
                      className="btn-icone"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={produtoExcluindo !== null}
        title="Excluir produto"
        description={`"${produtoExcluindo?.nome}" vai sumir do site e do painel. Se você só quer tirar a peça do ar por um tempo, use "ocultar" (o ícone de olho) — assim ela continua aqui e você pode trazê-la de volta quando quiser.`}
        confirmLabel="Excluir"
        loading={excluir.isPending}
        onConfirm={confirmarExclusao}
        onCancel={() => setProdutoExcluindo(null)}
      />
    </div>
  );
}
