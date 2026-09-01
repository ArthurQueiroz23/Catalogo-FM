/**
 * Bloco de um formulário do painel: título, explicação curta e os campos.
 *
 * O formulário de peça tinha 12 campos empilhados sem nenhuma divisão — para trocar um preço,
 * a administradora percorria a tela inteira procurando o campo certo. Agrupar em blocos com
 * nome ("Identificação", "Preço e organização", "Publicação") transforma a busca visual numa
 * leitura de três títulos.
 */
export function FormSection({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="superficie-solida p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="titulo-bloco text-base">{titulo}</h2>
        {descricao && <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-500">{descricao}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
