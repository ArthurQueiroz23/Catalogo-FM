import Image from 'next/image';
import Link from 'next/link';

/**
 * Logo oficial da Fruto da Malha, extraído do catálogo impresso (a gota coral com o bebê e o
 * letreiro manuscrito). O arquivo em `public/marca/` veio do próprio PDF, com o fundo já
 * removido e a marca d'água do app de recorte descartada — ver `docs/DESIGN_SYSTEM.md`.
 */
export function Logo({
  tamanho = 'md',
  comAssinatura = false,
  href = '/',
}: {
  tamanho?: 'sm' | 'md' | 'lg';
  comAssinatura?: boolean;
  href?: string | null;
}) {
  const dimensoes = { sm: 34, md: 44, lg: 96 }[tamanho];

  const conteudo = (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/marca/logo.png"
        alt=""
        width={dimensoes}
        height={Math.round(dimensoes * 1.24)}
        priority
        className="h-auto w-auto"
        style={{ width: dimensoes, height: 'auto' }}
      />
      <span className="flex flex-col leading-none">
        <span
          className={
            tamanho === 'lg'
              ? 'text-3xl font-bold text-coral-700'
              : 'text-lg font-bold text-coral-700 sm:text-xl'
          }
        >
          Fruto da Malha
        </span>
        {comAssinatura && (
          <span className="mt-1 text-sm text-ink-500">Vestindo carinho</span>
        )}
      </span>
    </span>
  );

  if (!href) {
    return conteudo;
  }

  return (
    <Link href={href} aria-label="Fruto da Malha — ir para o início" className="rounded-pilula foco-marca">
      {conteudo}
    </Link>
  );
}
