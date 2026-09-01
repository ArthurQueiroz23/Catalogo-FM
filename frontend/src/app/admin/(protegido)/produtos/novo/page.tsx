'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProdutoForm } from '@/components/admin/ProdutoForm';
import { PageHeader } from '@/components/ui/PageHeader';

export default function NovoProdutoPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/produtos"
        className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-pilula text-[0.9375rem] font-bold
          text-coral-800 transition-colors hover:text-coral-900 foco-marca"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar para as peças
      </Link>

      <PageHeader
        eyebrow="Nova peça"
        title="Cadastrar peça"
        description="Fotos e vídeos são adicionados depois de salvar, na tela de edição da peça."
      />

      <ProdutoForm />
    </div>
  );
}
