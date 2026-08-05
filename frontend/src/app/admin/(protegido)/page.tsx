'use client';

import { Eye, EyeOff, ImageOff, Package, Tags } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { StatCard } from '@/components/admin/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDashboard } from '@/hooks/useDashboard';
import { formatarPreco } from '@/lib/format';

export default function AdminDashboardPage() {
  const { data, isLoading } = useDashboard();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Resumo do catálogo da Fruto da Malha.</p>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Package} label="Produtos cadastrados" value={data.totalProdutos} tone="brand" />
            <StatCard icon={Eye} label="Produtos ativos" value={data.totalProdutosAtivos} tone="accent" />
            <StatCard icon={EyeOff} label="Produtos ocultos" value={data.totalProdutosOcultos} tone="amber" />
            <StatCard icon={Tags} label="Categorias" value={data.totalCategorias} tone="gray" />
          </div>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Produtos recentes</h2>
              <Link href="/admin/produtos" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                Ver todos →
              </Link>
            </div>

            {data.produtosRecentes.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                Nenhum produto cadastrado ainda.{' '}
                <Link href="/admin/produtos/novo" className="font-semibold text-brand-600">
                  Cadastrar o primeiro
                </Link>
              </p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                {data.produtosRecentes.map((produto) => (
                  <Link
                    key={produto.id}
                    href={`/admin/produtos/${produto.id}`}
                    className="flex items-center gap-4 border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50"
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
                      <p className="truncate text-sm font-medium text-gray-900">{produto.nome}</p>
                      <p className="text-xs text-gray-400">Ref. {produto.referencia}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-gray-700">{formatarPreco(produto.preco)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
