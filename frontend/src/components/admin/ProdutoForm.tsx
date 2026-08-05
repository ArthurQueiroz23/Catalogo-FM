'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { TamanhoCheckboxGroup } from '@/components/admin/TamanhoCheckboxGroup';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { useCategorias } from '@/hooks/useCategorias';
import { useColecoes } from '@/hooks/useColecoes';
import { useCriarProduto, useAtualizarProduto } from '@/hooks/useProdutos';
import { useTamanhos } from '@/hooks/useTamanhos';
import { produtoSchema, type ProdutoFormValues } from '@/lib/schemas';
import type { ProdutoRequest, ProdutoResponse } from '@/types/api';

const SEXO_OPCOES = [
  { value: 'MENINO', label: 'Menino' },
  { value: 'MENINA', label: 'Menina' },
  { value: 'UNISSEX', label: 'Unissex' },
];

const STATUS_OPCOES = [
  { value: 'ATIVO', label: 'Ativo (visível no site)' },
  { value: 'INATIVO', label: 'Oculto (não aparece no site)' },
];

interface ProdutoFormProps {
  produtoExistente?: ProdutoResponse;
}

function valoresIniciais(produto?: ProdutoResponse): ProdutoFormValues {
  if (!produto) {
    return {
      nome: '',
      referencia: '',
      descricao: '',
      preco: 0,
      categoriaId: 0,
      colecaoId: '',
      tecido: '',
      sexo: 'UNISSEX',
      status: 'ATIVO',
      observacoes: '',
      destaque: false,
      lancamento: false,
      tamanhoIds: [],
    };
  }
  return {
    nome: produto.nome,
    referencia: produto.referencia,
    descricao: produto.descricao ?? '',
    preco: produto.preco,
    categoriaId: produto.categoria.id,
    colecaoId: produto.colecao?.id ?? '',
    tecido: produto.tecido ?? '',
    sexo: produto.sexo,
    status: produto.status,
    observacoes: produto.observacoes ?? '',
    destaque: produto.destaque,
    lancamento: produto.lancamento,
    tamanhoIds: produto.tamanhosDisponiveis.map((t) => t.id),
  };
}

export function ProdutoForm({ produtoExistente }: ProdutoFormProps) {
  const router = useRouter();
  const { data: categorias } = useCategorias();
  const { data: colecoes } = useColecoes();
  const { data: tamanhos } = useTamanhos();

  const criar = useCriarProduto();
  const atualizar = useAtualizarProduto(produtoExistente?.id ?? -1);
  const salvando = criar.isPending || atualizar.isPending;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: valoresIniciais(produtoExistente),
  });

  async function onSubmit(valores: ProdutoFormValues) {
    const payload: ProdutoRequest = {
      ...valores,
      descricao: valores.descricao || null,
      tecido: valores.tecido || null,
      observacoes: valores.observacoes || null,
      colecaoId: valores.colecaoId === '' || valores.colecaoId === undefined ? null : Number(valores.colecaoId),
    };

    if (produtoExistente) {
      await atualizar.mutateAsync(payload);
    } else {
      const criado = await criar.mutateAsync(payload);
      router.push(`/admin/produtos/${criado.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nome" required error={errors.nome?.message} {...register('nome')} />
        <Input
          label="Referência"
          required
          hint="Código usado na URL do produto e nas mensagens de WhatsApp"
          error={errors.referencia?.message}
          {...register('referencia')}
        />
      </div>

      <Textarea label="Descrição" error={errors.descricao?.message} {...register('descricao')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Preço (R$)"
          type="number"
          step="0.01"
          min="0"
          required
          error={errors.preco?.message}
          {...register('preco')}
        />
        <Select
          label="Categoria"
          required
          placeholder="Selecione"
          options={(categorias ?? []).map((c) => ({ value: String(c.id), label: c.nome }))}
          error={errors.categoriaId?.message}
          {...register('categoriaId')}
        />
        <Select
          label="Coleção"
          placeholder="Nenhuma"
          options={(colecoes ?? []).map((c) => ({ value: String(c.id), label: c.nome }))}
          {...register('colecaoId')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input label="Tecido" error={errors.tecido?.message} {...register('tecido')} />
        <Select label="Sexo" required options={SEXO_OPCOES} error={errors.sexo?.message} {...register('sexo')} />
        <Select label="Status" options={STATUS_OPCOES} {...register('status')} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Tamanhos disponíveis</p>
        <Controller
          name="tamanhoIds"
          control={control}
          render={({ field }) => (
            <TamanhoCheckboxGroup
              tamanhos={tamanhos ?? []}
              value={field.value}
              onChange={field.onChange}
              error={errors.tamanhoIds?.message}
            />
          )}
        />
      </div>

      <Textarea
        label="Observações"
        hint="Anotações internas ou detalhes extras exibidos na página do produto"
        error={errors.observacoes?.message}
        {...register('observacoes')}
      />

      <div className="flex flex-wrap gap-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <Switch label="Produto em destaque" description="Aparece na seção 'Produtos em destaque' da home" {...register('destaque')} />
        <Switch label="Lançamento" description="Aparece na seção 'Lançamentos' da home" {...register('lancamento')} />
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="secondary" onClick={() => router.push('/admin/produtos')} disabled={salvando}>
          Cancelar
        </Button>
        <Button type="submit" loading={salvando}>
          {produtoExistente ? 'Salvar alterações' : 'Criar produto e continuar'}
        </Button>
      </div>
    </form>
  );
}
