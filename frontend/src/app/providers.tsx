'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '@/lib/api';

/**
 * Client Component isolando o React Query do restante da árvore (App Router exige que o
 * QueryClient seja criado no cliente). Usado hoje só pelo painel administrativo (estado de
 * servidor com cache/revalidação); as páginas públicas buscam dados em Server Components e não
 * dependem deste provider — ver docs/ARCHITECTURE.md §3.2.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Repetir uma resposta 4xx é inútil: sessão vencida ou recurso inexistente não
            // mudam por insistência. Sem esta regra, uma sessão expirada gerava quatro 401 por
            // tela e o painel ficava ~7s em esqueleto antes de mostrar o erro — tempo que
            // parecia "carregando" e ajudava a confundir falha de sessão com catálogo vazio.
            retry: (tentativa, erro) => {
              if (erro instanceof ApiError && erro.status >= 400 && erro.status < 500) {
                return false;
              }
              return tentativa < 3;
            },
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
