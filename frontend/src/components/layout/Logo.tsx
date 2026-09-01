import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';

/**
 * Logo oficial da Fruto da Malha, extraído do catálogo impresso (a gota coral com o bebê e o
 * letreiro manuscrito). O arquivo em `public/marca/` veio do próprio PDF, com o fundo já
 * removido e a marca d'água do app de recorte descartada — ver `docs/DESIGN_SYSTEM.md`.
 *
 * O nome ao lado do símbolo usa a manuscrita da marca (`font-marca`) — é um dos poucos lugares
 * onde ela aparece fora de títulos, porque ali ela é logotipo, não texto.
 */
const DIMENSOES = { sm: 32, md: 40, lg: 88 } as const;

/**
 * A largura de exibição é responsiva, mas o `width`/`height` do `next/image` continua fixo
 * (ele define a proporção e o tamanho do arquivo pedido). No celular de 390px, o logotipo em
 * tamanho de desktop empurrava "Fruto da Malha" para duas linhas e o cabeçalho ficava com o
 * dobro da altura necessária.
 */
const LARGURA_RESPONSIVA = {
  sm: 'w-8',
  md: 'w-[2.125rem] sm:w-10',
  lg: 'w-[4.5rem] sm:w-[5.5rem]',
} as const;

const TAMANHO_NOME = {
  sm: 'text-[1.0625rem]',
  md: 'text-[1.0625rem] sm:text-xl',
  lg: 'text-[1.75rem] sm:text-[2rem]',
} as const;

export function Logo({
  tamanho = 'md',
  comAssinatura = false,
  href = '/',
  className,
}: {
  tamanho?: keyof typeof DIMENSOES;
  comAssinatura?: boolean;
  href?: string | null;
  className?: string;
}) {
  const dimensoes = DIMENSOES[tamanho];

  const conteudo = (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <Image
        src="/marca/logo.png"
        alt=""
        width={dimensoes}
        height={Math.round(dimensoes * 1.24)}
        priority
        className={clsx('h-auto shrink-0', LARGURA_RESPONSIVA[tamanho])}
      />
      <span className="flex flex-col leading-none">
        <span className={clsx('whitespace-nowrap font-marca font-bold text-coral-700', TAMANHO_NOME[tamanho])}>
          Fruto da Malha
        </span>
        {comAssinatura && (
          <span
            className={clsx(
              'font-semibold uppercase tracking-[0.18em] text-ink-500',
              tamanho === 'lg' ? 'mt-2 text-xs' : 'mt-1 hidden text-[0.625rem] sm:block'
            )}
          >
            Vestindo carinho
          </span>
        )}
      </span>
    </span>
  );

  if (!href) {
    return conteudo;
  }

  return (
    <Link
      href={href}
      aria-label="Fruto da Malha — ir para o início"
      className="rounded-peca transition-opacity hover:opacity-90 foco-marca"
    >
      {conteudo}
    </Link>
  );
}
