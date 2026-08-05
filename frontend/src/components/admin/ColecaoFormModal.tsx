'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAtualizarColecao, useCriarColecao } from '@/hooks/useColecoes';
import { colecaoSchema, type ColecaoFormValues } from '@/lib/schemas';
import type { ColecaoResponse } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';

interface ColecaoFormModalProps {
  open: boolean;
  onClose: () => void;
  colecao: ColecaoResponse | null;
}

const VALORES_PADRAO: ColecaoFormValues = { nome: '', descricao: '', ativo: true };

export function ColecaoFormModal({ open, onClose, colecao }: ColecaoFormModalProps) {
  const criar = useCriarColecao();
  const atualizar = useAtualizarColecao(colecao?.id ?? -1);
  const salvando = criar.isPending || atualizar.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ColecaoFormValues>({ resolver: zodResolver(colecaoSchema), defaultValues: VALORES_PADRAO });

  useEffect(() => {
    if (!open) return;
    reset(colecao ? { nome: colecao.nome, descricao: colecao.descricao ?? '', ativo: colecao.ativo } : VALORES_PADRAO);
  }, [open, colecao, reset]);

  async function onSubmit(valores: ColecaoFormValues) {
    const payload = { ...valores, descricao: valores.descricao || null };
    if (colecao) {
      await atualizar.mutateAsync(payload);
    } else {
      await criar.mutateAsync(payload);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={colecao ? 'Editar coleção' : 'Nova coleção'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Nome" required error={errors.nome?.message} {...register('nome')} />
        <Textarea label="Descrição" error={errors.descricao?.message} {...register('descricao')} />
        <Switch label="Coleção ativa" description="Coleções inativas não aparecem no site" {...register('ativo')} />

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
