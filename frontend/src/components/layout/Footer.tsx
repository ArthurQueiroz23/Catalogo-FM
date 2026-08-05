import { Instagram, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { montarLinkInstagram, siteConfig } from '@/lib/config';
import { montarLinkWhatsApp } from '@/lib/whatsapp';

export function Footer() {
  const anoAtual = new Date().getUTCFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="container grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-brand-600">Fruto da Malha</p>
          <p className="mt-2 max-w-xs text-sm text-gray-600">
            Roupas infantis com carinho, do RN aos 12 anos. Monte seu pedido e finalize direto pelo
            WhatsApp — sem pagamento pelo site.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">Navegação</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-brand-600">
                Início
              </Link>
            </li>
            <li>
              <Link href="/categoria" className="hover:text-brand-600">
                Categorias
              </Link>
            </li>
            <li>
              <Link href="/carrinho" className="hover:text-brand-600">
                Meu carrinho
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">Contato</p>
          <ul className="mt-3 space-y-3 text-sm text-gray-600">
            {siteConfig.whatsappNumber && (
              <li>
                <a
                  href={montarLinkWhatsApp(siteConfig.whatsappNumber, 'Olá! Vim pelo site e gostaria de tirar uma dúvida.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-brand-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
            )}
            {siteConfig.instagramHandle && (
              <li>
                <a
                  href={montarLinkInstagram(siteConfig.instagramHandle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-brand-600"
                >
                  <Instagram className="h-4 w-4" />@{siteConfig.instagramHandle}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4">
        <p className="container text-center text-xs text-gray-500">
          © {anoAtual} Fruto da Malha. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
