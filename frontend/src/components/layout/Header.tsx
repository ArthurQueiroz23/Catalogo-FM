import { Suspense } from 'react';
import { CartButton } from '@/components/cart/CartButton';
import { Logo } from './Logo';
import { NavLink } from './NavLink';
import { SearchBar } from './SearchBar';

/**
 * Cabeçalho do site público.
 *
 * Estrutura em duas linhas no celular (marca + atalhos, depois busca em largura cheia) e uma
 * linha só no computador. A busca ganhou lugar fixo porque, num catálogo de atacado, a cliente
 * costuma chegar sabendo a referência da peça — é o caminho mais curto para ela.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-coral-100 bg-creme/85 shadow-suave backdrop-blur-xl">
      <div className="container flex flex-col gap-2.5 py-2.5 lg:flex-row lg:items-center lg:gap-6 lg:py-3.5">
        <div className="flex items-center justify-between gap-4">
          <Logo comAssinatura />

          {/* Navegação do celular. Só cabe UM link de texto ao lado do logo em telas de 390px —
              com dois, o nome da marca quebra em três linhas e o cabeçalho estoura a largura da
              tela. O catálogo completo continua a um toque pelo botão do topo da home, pelo
              "Ver tudo" da seção de produtos e pelo rodapé.

              A virada para uma linha só acontece em `lg`, não em `md`: num tablet de 768px o
              logotipo, a busca e os dois links não cabiam na mesma linha, e o campo de busca
              ficava espremido a ponto de cortar o próprio texto de exemplo. */}
          <nav aria-label="Atalhos" className="flex items-center gap-0.5 lg:hidden">
            <NavLink href="/categoria">Categorias</NavLink>
            <CartButton />
          </nav>
        </div>

        <div className="lg:ml-auto lg:w-full lg:max-w-[19rem]">
          <Suspense fallback={<div className="h-11 rounded-pilula bg-creme-50 ring-1 ring-coral-100" />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          <NavLink href="/produtos">Catálogo</NavLink>
          <NavLink href="/categoria">Categorias</NavLink>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
