import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductAddToCart } from '@/components/product/ProductAddToCart';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ApiError, api } from '@/lib/api';
import { formatarPreco } from '@/lib/format';
import type { ProdutoResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

interface ProdutoPageProps {
  // Next.js 16: params é uma Promise (Async Request APIs) — precisa de await antes de usar.
  params: Promise<{ referencia: string }>;
}

async function buscarProduto(referencia: string): Promise<ProdutoResponse | null> {
  try {
    return await api.get<ProdutoResponse>(`/produtos/${referencia}`, { cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function generateMetadata({ params }: ProdutoPageProps): Promise<Metadata> {
  const { referencia } = await params;
  const produto = await buscarProduto(referencia);
  if (!produto) {
    return { title: 'Produto não encontrado' };
  }

  const descricao = produto.descricao ?? `${produto.nome} — Ref. ${produto.referencia} — Fruto da Malha`;
  const capa = produto.imagens.find((imagem) => imagem.principal)?.url ?? produto.imagens[0]?.url;

  return {
    title: produto.nome,
    description: descricao,
    alternates: { canonical: `/produto/${produto.referencia}` },
    // A foto do produto no Open Graph é o que faz o link aparecer com imagem quando a cliente
    // compartilha a peça no WhatsApp — o canal onde a loja de fato vende.
    openGraph: {
      type: 'website',
      title: produto.nome,
      description: descricao,
      url: `/produto/${produto.referencia}`,
      images: capa ? [{ url: capa, alt: produto.nome }] : undefined,
    },
  };
}

const SEXO_LABEL: Record<ProdutoResponse['sexo'], string> = {
  MENINO: 'Menino',
  MENINA: 'Menina',
  UNISSEX: 'Unissex',
};

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { referencia } = await params;
  const produto = await buscarProduto(referencia);

  if (!produto) {
    notFound();
  }

  return (
    <div className="container py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">
          Início
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/categoria/${produto.categoria.slug}`} className="hover:text-brand-600">
          {produto.categoria.nome}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{produto.nome}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery nome={produto.nome} imagens={produto.imagens} videos={produto.videos} />

        <div>
          <p className="text-sm text-gray-400">Ref. {produto.referencia}</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{produto.nome}</h1>
          <p className="mt-3 text-2xl font-extrabold text-brand-600">{formatarPreco(produto.preco)}</p>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-gray-400">Categoria</dt>
              <dd className="font-medium text-gray-800">{produto.categoria.nome}</dd>
            </div>
            {produto.colecao && (
              <div>
                <dt className="text-gray-400">Coleção</dt>
                <dd className="font-medium text-gray-800">{produto.colecao.nome}</dd>
              </div>
            )}
            {produto.tecido && (
              <div>
                <dt className="text-gray-400">Tecido</dt>
                <dd className="font-medium text-gray-800">{produto.tecido}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-400">Sexo</dt>
              <dd className="font-medium text-gray-800">{SEXO_LABEL[produto.sexo]}</dd>
            </div>
          </dl>

          {produto.descricao && (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-600">{produto.descricao}</p>
          )}

          {produto.observacoes && (
            <p className="mt-4 whitespace-pre-line rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
              {produto.observacoes}
            </p>
          )}

          <div className="mt-6">
            <ProductAddToCart produto={produto} />
          </div>
        </div>
      </div>
    </div>
  );
}
