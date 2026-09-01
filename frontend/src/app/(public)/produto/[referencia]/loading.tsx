import { Skeleton } from '@/components/ui/Skeleton';

/** Esqueleto da página da peça — mesma composição de duas colunas da tela real. */
export default function Loading() {
  return (
    <div className="container secao-compacta">
      <Skeleton className="h-4 w-64" />

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="mx-auto aspect-[4/5] w-full max-w-[26rem] rounded-peca" />

        <div className="flex flex-col gap-4 lg:max-w-xl">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-2 h-28 w-full rounded-peca" />
          <Skeleton className="mt-2 h-64 w-full rounded-peca" />
        </div>
      </div>
    </div>
  );
}
