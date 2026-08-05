'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAtualizarCategoria, useCriarCategoria } from '@/hooks/useCategorias';
import { categoriaSchema, type CategoriaFormValues } from '@/lib/schemas';
import type { CategoriaResponse } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { SingleImageUpload } from './SingleImageUpload';

interface CategoriaFormModalProps {
  open: boolean;
  onClose: () => void;
  categoria: CategoriaResponse | null;
}

const VALORES_PADRAO: CategoriaFormValues = { nome: '', descricao: '', imagemUrl: null, ativo: true };

export function CategoriaFormModal({ open, onClose, categoria }: CategoriaFormModalProps) {
  const criar = useCriarCategoria();
  const atualizar = useAtualizarCategoria(categoria?.id ?? -1);
  const salvando = criar.isPending || atualizar.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CategoriaFormValues>({ resolver: zodResolver(categoriaSchema), defaultValues: VALORES_PADRAO });

  useEffect(() => {
    if (!open) return;
    reset(
      categoria
        ? { nome: categoria.nome, descricao: categoria.descricao ?? '', imagemUrl: categoria.imagemUrl, ativo: categoria.ativo }
        : VALORES_PADRAO
    );
  }, [open, categoria, reset]);

  async function onSubmit(valores: CategoriaFormValues) {
    const payload = { ...valores, descricao: valores.descricao || null };
    if (categoria) {
      await atualizar.mutateAsync(payload);
    } else {
      await criar.mutateAsync(payload);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={categoria ? 'Editar categoria' : 'Nova categoria'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Nome" required error={errors.nome?.message} {...register('nome')} />
        <Textarea label="Descrição" error={errors.descricao?.message} {...register('descricao')} />
        <Controller
          name="imagemUrl"
          control={control}
          render={({ field }) => (
            <SingleImageUpload label="Imagem de capa" value={field.value ?? null} onChange={field.onChange} pasta="categorias" />
          )}
        />
        <Switch label="Categoria ativa" description="Categorias inativas não aparecem no site" {...register('ativo')} />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvando}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
