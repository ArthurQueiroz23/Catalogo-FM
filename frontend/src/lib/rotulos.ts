import type { Sexo } from '@/types/api';

/**
 * Como cada valor de `Sexo` é escrito para quem lê a tela.
 *
 * O enum do banco continua `MENINO`/`MENINA`/`UNISSEX` — mexer nele exigiria migração, e o
 * catálogo importado (75 peças) grava esses valores. O que a loja pediu foi vocabulário de
 * vitrine: "Masculino"/"Feminino" em vez de "Menino"/"Menina". Por isso a tradução vive aqui,
 * na borda de apresentação, e não no modelo.
 *
 * Fonte única de propósito: os mesmos rótulos aparecem na ficha da peça (site), no filtro da
 * lista de produtos e no formulário de cadastro (painel). Antes eram três listas soltas, e a
 * primeira troca de palavra já deixaria uma delas para trás.
 */
export const SEXO_LABEL: Record<Sexo, string> = {
  MENINO: 'Masculino',
  MENINA: 'Feminino',
  UNISSEX: 'Unissex',
};

/** As mesmas opções no formato dos `<Select>` do painel — derivadas, nunca redigitadas. */
export const SEXO_OPCOES = (Object.keys(SEXO_LABEL) as Sexo[]).map((value) => ({
  value,
  label: SEXO_LABEL[value],
}));
