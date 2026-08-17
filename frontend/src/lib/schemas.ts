import { z } from 'zod';

/**
 * Schemas Zod usados nos formulários do painel — validação client-side para dar feedback
 * imediato. O backend permanece a fonte da verdade (Bean Validation em cada DTO de request,
 * ver docs/API_CONTRACT.md); estas regras espelham as principais restrições de lá.
 */

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const categoriaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(120, 'Nome deve ter no máximo 120 caracteres'),
  descricao: z.string().max(2000, 'Descrição deve ter no máximo 2000 caracteres').optional().or(z.literal('')),
  imagemUrl: z.string().nullable().optional(),
  ativo: z.boolean(),
});

export type CategoriaFormValues = z.infer<typeof categoriaSchema>;

export const colecaoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(120, 'Nome deve ter no máximo 120 caracteres'),
  descricao: z.string().max(2000, 'Descrição deve ter no máximo 2000 caracteres').optional().or(z.literal('')),
  ativo: z.boolean(),
});

export type ColecaoFormValues = z.infer<typeof colecaoSchema>;

export const tamanhoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(20, 'Nome deve ter no máximo 20 caracteres'),
  ativo: z.boolean(),
});

export type TamanhoFormValues = z.infer<typeof tamanhoSchema>;

export const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(160, 'Nome deve ter no máximo 160 caracteres'),
  referencia: z.string().min(1, 'Referência é obrigatória').max(40, 'Referência deve ter no máximo 40 caracteres'),
  descricao: z.string().max(8000, 'Descrição deve ter no máximo 8000 caracteres').optional().or(z.literal('')),
  preco: z.coerce.number({ invalid_type_error: 'Preço é obrigatório' }).min(0, 'Preço não pode ser negativo'),
  categoriaId: z.coerce.number({ invalid_type_error: 'Categoria é obrigatória' }).int().min(1, 'Categoria é obrigatória'),
  colecaoId: z.union([z.coerce.number().int().positive(), z.literal('')]).optional(),
  tecido: z.string().max(120, 'Tecido deve ter no máximo 120 caracteres').optional().or(z.literal('')),
  sexo: z.enum(['MENINO', 'MENINA', 'UNISSEX'], { errorMap: () => ({ message: 'Sexo é obrigatório' }) }),
  status: z.enum(['ATIVO', 'INATIVO']),
  observacoes: z.string().max(4000, 'Observações devem ter no máximo 4000 caracteres').optional().or(z.literal('')),
  destaque: z.boolean(),
  lancamento: z.boolean(),
  tamanhoIds: z.array(z.number()),
}).superRefine((valores, ctx) => {
  // O preço só é exigido para PUBLICAR. Peças ainda ocultas podem ficar com 0,00 enquanto o
  // valor de venda não está definido — é assim que o catálogo é montado: primeiro as peças,
  // depois os preços. O que não pode, em hipótese alguma, é uma peça de 0,00 visível ao
  // cliente; por isso a trava fica no momento de ativar, e não no de salvar.
  if (valores.status === 'ATIVO' && valores.preco < 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['preco'],
      message: 'Informe o preço antes de deixar a peça visível no site.',
    });
  }
});

export type ProdutoFormValues = z.infer<typeof produtoSchema>;
