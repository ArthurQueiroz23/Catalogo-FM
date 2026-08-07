import { Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { montarLinkInstagram, siteConfig } from '@/lib/config';
import { montarLinkWhatsApp } from '@/lib/whatsapp';
import { Logo } from './Logo';

/**
 * O rodapé reproduz a página de contato do catálogo impresso (p.2): a chamada "Atacado de
 * confiança para o seu negócio CRESCER!" sobre o creme, com os contatos em linhas de ícone.
 */
export function Footer() {
  const anoAtual = new Date().getUTCFullYear();

  const contatos = [
    siteConfig.whatsappNumber && {
      icone: MessageCircle,
      texto: 'Falar no WhatsApp',
      href: montarLinkWhatsApp(siteConfig.whatsappNumber, 'Olá! Vim pelo catálogo e gostaria de tirar uma dúvida.'),
      externo: true,
    },
    siteConfig.instagramHandle && {
      icone: Instagram,
      texto: `@${siteConfig.instagramHandle}`,
      href: montarLinkInstagram(siteConfig.instagramHandle),
      externo: true,
    },
    siteConfig.email && { icone: Mail, texto: siteConfig.email, href: `mailto:${siteConfig.email}`, externo: false },
    siteConfig.telefone && {
      icone: Phone,
      texto: siteConfig.telefone,
      href: `tel:${siteConfig.telefone.replace(/\D/g, '')}`,
      externo: false,
    },
  ].filter(Boolean) as { icone: typeof Mail; texto: string; href: string; externo: boolean }[];

  return (
    <footer className="mt-16 border-t border-coral-100 bg-creme-200/60">
      <div className="container grid gap-10 py-12 md:grid-cols-3">
        <div>
          <Logo comAssinatura href={null} />
          <p className="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-ink-600">
            Atacado de confiança para o seu negócio crescer.
          </p>
        </div>

        <nav aria-label="Navegação do rodapé">
          <p className="text-lg font-bold text-coral-700">Catálogo</p>
          <ul className="mt-3 space-y-1 text-[0.9375rem]">
            {[
              { href: '/', rotulo: 'Início' },
              { href: '/categoria', rotulo: 'Categorias' },
              { href: '/selecao', rotulo: 'Minha seleção' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-pilula text-ink-600 transition-colors hover:text-coral-700 foco-marca"
                >
                  {link.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-lg font-bold text-coral-700">Fale com a gente</p>
          <ul className="mt-3 space-y-1 text-[0.9375rem]">
            {contatos.map((contato) => (
              <li key={contato.href}>
                <a
                  href={contato.href}
                  {...(contato.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-pilula text-ink-600 transition-colors hover:text-coral-700 foco-marca"
                >
                  <contato.icone className="h-4 w-4 shrink-0 text-coral-500" />
                  {contato.texto}
                </a>
              </li>
            ))}
            {siteConfig.endereco && (
              <li className="flex items-start gap-2.5 py-2 text-ink-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coral-500" />
                <span className="whitespace-pre-line leading-relaxed">{siteConfig.endereco}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-coral-100 py-5">
        <p className="container text-center text-sm text-ink-400">
          © {anoAtual} Fruto da Malha · Vestindo carinho
        </p>
      </div>
    </footer>
  );
}
