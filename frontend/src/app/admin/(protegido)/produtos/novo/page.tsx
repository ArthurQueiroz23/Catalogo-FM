'use client';

import Link from 'next/link';
import { ProdutoForm } from '@/components/admin/ProdutoForm';

export default function NovoProdutoPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/produtos" className="text-sm text-gray-400 hover:text-gray-600">
        ← Voltar para produtos
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Novo produto</h1>
      <p className="mt-1 text-sm text-gray-500">
        Fotos e vídeos são adicionados depois de salvar, na tela de edição do produto.
      </p>

      <div className="mt-6">
        <ProdutoForm />
      </div>
    </div>
  );
}
