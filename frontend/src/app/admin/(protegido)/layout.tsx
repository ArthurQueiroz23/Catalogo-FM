'use client';

import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { estaAutenticado } from '@/lib/auth';

/**
 * Layout do painel administrativo autenticado. A sessão é um JWT em localStorage (ver
 * docs/ARCHITECTURE.md §2.7/§3.2), então a checagem só pode acontecer no cliente — por isso
 * este layout (e, na prática, todas as telas sob /admin/(protegido)) é Client Component.
 * `/admin/login` fica fora deste grupo de rotas de propósito, para não herdar esse guard.
 */
export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [verificado, setVerificado] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(false);

  useEffect(() => {
    if (!estaAutenticado()) {
      router.replace('/admin/login');
      return;
    }
    // A verificação depende de localStorage (indisponível durante a renderização no servidor),
    // então precisa ser feita aqui e não num inicializador de estado preguiçoso — do contrário
    // o resultado divergiria entre o HTML gerado no servidor e a primeira renderização no
    // cliente, causando um erro de hidratação do React.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVerificado(true);
  }, [router]);

  if (!verificado) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar aberta={sidebarAberta} onFechar={() => setSidebarAberta(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarAberta(true)}
            aria-label="Abrir menu"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-bold text-brand-600">Fruto da Malha</p>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
