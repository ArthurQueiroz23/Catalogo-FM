'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAtualizarTamanho, useCriarTamanho } from '@/hooks/useTamanhos';
import { tamanhoSchema, type TamanhoFormValues } from '@/lib/schemas';
import type { TamanhoResponse } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';

interface TamanhoFormModalProps {
  open: boolean;
  onClose: () => void;
  tamanho: TamanhoResponse | null;
}

const VALORES_PADRAO: TamanhoFormValues = { nome: '', ativo: true };

export function TamanhoFormModal({ open, onClose, tamanho }: TamanhoFormModalProps) {
  const criar = useCriarTamanho();
  const atualizar = useAtualizarTamanho(tamanho?.id ?? -1);
  const salvando = criar.isPending || atualizar.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TamanhoFormValues>({ resolver: zodResolver(tamanhoSchema), defaultValues: VALORES_PADRAO });

  useEffect(() => {
    if (!open) return;
    reset(tamanho ? { nome: tamanho.nome, ativo: tamanho.ativo } : VALORES_PADRAO);
  }, [open, tamanho, reset]);

  async function onSubmit(valores: TamanhoFormValues) {
    if (tamanho) {
      await atualizar.mutateAsync(valores);
    } else {
      await criar.mutateAsync(valores);
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={tamanho ? 'Editar tamanho' : 'Novo tamanho'} maxWidthClassName="max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Nome" placeholder="Ex.: RN, P, M, 2 ANOS" required error={errors.nome?.message} {...register('nome')} />
        <Switch label="Tamanho ativo" description="Tamanhos inativos não aparecem para os clientes" {...register('ativo')} />

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
