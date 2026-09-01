import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ProductAddToCart } from '@/components/product/ProductAddToCart';
import { ProductGallery } from '@/components/product/ProductGallery';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
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
    <div className="container secao-compacta">
      <Breadcrumbs
        itens={[
          { rotulo: 'Início', href: '/' },
          { rotulo: 'Categorias', href: '/categoria' },
          { rotulo: produto.categoria.nome, href: `/categoria/${produto.categoria.slug}` },
          { rotulo: produto.nome },
        ]}
      />

      {/* Duas colunas iguais, com teto de largura na galeria: sem ele, a foto ocupava metade
          de uma tela de 1440px, ficava com 800px de altura e a ficha ao lado sobrava no vazio. */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="mx-auto w-full max-w-[26rem]">
            <ProductGallery nome={produto.nome} imagens={produto.imagens} videos={produto.videos} />
          </div>
        </div>

        <div className="min-w-0 lg:max-w-xl">
          <p className="olho">Referência {produto.referencia}</p>

          <h1 className="mt-2 text-[1.625rem] font-extrabold leading-tight text-ink-900 sm:text-[2rem]">
            {produto.nome}
          </h1>

          <p className="mt-4 flex items-baseline gap-2">
            <span className="text-[2rem] font-extrabold leading-none tabular-nums text-coral-700">
              {formatarPreco(produto.preco)}
            </span>
            <span className="text-sm font-semibold text-ink-500">por peça</span>
          </p>

          {/* Ficha técnica em bloco próprio: no catálogo impresso esses dados vêm sempre juntos,
              na mesma ordem, e é assim que a cliente procura por eles. */}
          <dl className="superficie mt-6 grid grid-cols-2 gap-x-6 gap-y-4 p-5 sm:grid-cols-4">
            {ficha.map((item) => (
              <div key={item.rotulo} className="min-w-0">
                <dt className="text-[0.6875rem] font-extrabold uppercase tracking-[0.12em] text-ink-500">
                  {item.rotulo}
                </dt>
                <dd className="mt-1 break-words font-bold text-ink-800">{item.valor}</dd>
              </div>
            ))}
          </dl>

          {produto.descricao && <p className="ficha-peca mt-6 whitespace-pre-line">{produto.descricao}</p>}

          {produto.observacoes && (
            <p className="ficha-peca mt-4 whitespace-pre-line rounded-peca bg-coral-50 p-4 ring-1 ring-inset ring-coral-100">
              {produto.observacoes}
            </p>
          )}

          <div className="mt-8">
            <ProductAddToCart produto={produto} />
          </div>

          <Link
            href={`/categoria/${produto.categoria.slug}`}
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-pilula text-[0.9375rem] font-bold
              text-coral-800 transition-colors hover:text-coral-900 foco-marca"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Ver mais peças de {produto.categoria.nome}
          </Link>
        </div>
      </div>
    </div>
  );
}
