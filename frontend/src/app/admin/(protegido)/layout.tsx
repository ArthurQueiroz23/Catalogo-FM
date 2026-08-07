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
    <div className="flex min-h-screen">
      <AdminSidebar aberta={sidebarAberta} onFechar={() => setSidebarAberta(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-coral-100 bg-creme/90 px-3 py-2 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarAberta(true)}
            aria-label="Abrir menu"
            className="flex h-11 w-11 items-center justify-center rounded-pilula text-ink-600 hover:bg-coral-50 foco-marca"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="text-lg font-bold text-coral-700">Fruto da Malha</p>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
