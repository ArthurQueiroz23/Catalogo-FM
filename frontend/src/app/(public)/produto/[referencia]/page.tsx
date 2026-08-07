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
    return { title: 'Peça não encontrada' };
  }

  const descricao = produto.descricao ?? `${produto.nome} — Ref. ${produto.referencia} — Fruto da Malha`;
  const capa = produto.imagens.find((imagem) => imagem.principal)?.url ?? produto.imagens[0]?.url;

  return {
    title: produto.nome,
    description: descricao,
    alternates: { canonical: `/produto/${produto.referencia}` },
    // A foto da peça no Open Graph é o que faz o link aparecer com imagem quando a cliente
    // compartilha no WhatsApp — o canal onde a loja de fato vende.
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

  // Mesma ordem de dados das páginas do catálogo impresso:
  // referência → descrição → tecido → tamanho → sexo.
  const ficha = [
    { rotulo: 'Categoria', valor: produto.categoria.nome },
    produto.colecao && { rotulo: 'Coleção', valor: produto.colecao.nome },
    produto.tecido && { rotulo: 'Tecido', valor: produto.tecido },
    { rotulo: 'Sexo', valor: SEXO_LABEL[produto.sexo] },
  ].filter(Boolean) as { rotulo: string; valor: string }[];

  return (
    <div className="container py-6 sm:py-8">
      <nav aria-label="Você está aqui" className="mb-5 text-sm text-ink-500">
        <Link href="/" className="rounded-pilula transition-colors hover:text-coral-700 foco-marca">
          Início
        </Link>
        <span className="mx-2 text-coral-300">/</span>
        <Link
          href={`/categoria/${produto.categoria.slug}`}
          className="rounded-pilula transition-colors hover:text-coral-700 foco-marca"
        >
          {produto.categoria.nome}
        </Link>
        <span className="mx-2 text-coral-300">/</span>
        <span className="text-ink-700">{produto.nome}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery nome={produto.nome} imagens={produto.imagens} videos={produto.videos} />
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-coral-600">
            Referência {produto.referencia}
          </p>
          <h1 className="mt-1.5 text-[1.75rem] font-bold leading-tight text-ink-900 sm:text-4xl">
            {produto.nome}
          </h1>
          <p className="mt-3 text-3xl font-bold text-coral-700">{formatarPreco(produto.preco)}</p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {ficha.map((item) => (
              <div key={item.rotulo}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-400">{item.rotulo}</dt>
                <dd className="mt-0.5 font-semibold text-ink-800">{item.valor}</dd>
              </div>
            ))}
          </dl>

          {produto.descricao && <p className="ficha-peca mt-6 whitespace-pre-line">{produto.descricao}</p>}

          {produto.observacoes && (
            <p className="ficha-peca mt-4 whitespace-pre-line rounded-peca bg-coral-50 p-4">
              {produto.observacoes}
            </p>
          )}

          <div className="mt-8">
            <ProductAddToCart produto={produto} />
          </div>
        </div>
      </div>
    </div>
  );
}
