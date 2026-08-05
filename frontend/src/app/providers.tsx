'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

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
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
