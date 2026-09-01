import { Breadcrumbs, type Migalha } from './Breadcrumbs';

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string | null;
  /** Contagem exibida como etiqueta ao lado do título (ex.: "69 peças"). */
  contagem?: { valor: number; singular: string; plural: string };
  migalhas?: Migalha[];
  acao?: React.ReactNode;
}

/**
 * Cabeçalho padrão das páginas de listagem do site público (catálogo, categoria, busca).
 *
 * Antes cada página montava o seu: mesma informação, três espaçamentos e três tamanhos de
 * fonte diferentes. Aqui o bloco é um só — trilha, rótulo, título, contagem, descrição — e a
 * linha de base fecha a seção antes da grade começar.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  contagem,
  migalhas,
  acao,
}: PageHeaderProps) {
  return (
    <header className="mb-8">
      {migalhas && migalhas.length > 0 && <Breadcrumbs itens={migalhas} />}

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          {eyebrow && <p className="olho mb-1.5">{eyebrow}</p>}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="titulo-pagina">{title}</h1>
            {contagem && (
              <span className="chip tabular-nums">
                {contagem.valor} {contagem.valor === 1 ? contagem.singular : contagem.plural}
              </span>
            )}
          </div>

          {description && (
            <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-500">{description}</p>
          )}
        </div>

        {acao && <div className="shrink-0">{acao}</div>}
      </div>
    </header>
  );
}
