import { Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { montarLinkInstagram, siteConfig } from '@/lib/config';
import { montarLinkWhatsApp } from '@/lib/whatsapp';
import { Logo } from './Logo';

/**
 * O rodapé reproduz a página de contato do catálogo impresso (p.2): a chamada "Atacado de
 * confiança para o seu negócio CRESCER!" sobre o creme rabiscado, com os contatos em linhas
 * de ícone.
 *
 * É também o último ponto de conversão da página, por isso o botão de WhatsApp aparece aqui
 * como ação principal — e não apenas como mais um link de contato na lista.
 */
export function Footer() {
  const anoAtual = new Date().getUTCFullYear();

  const whatsappUrl = siteConfig.whatsappNumber
    ? montarLinkWhatsApp(siteConfig.whatsappNumber, 'Olá! Vim pelo catálogo e gostaria de tirar uma dúvida.')
    : null;

  const contatos = [
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

  const estiloContato =
    'inline-flex min-h-11 max-w-full items-center gap-2.5 rounded-pilula text-ink-600 ' +
    'transition-colors hover:text-coral-800 foco-marca';

  return (
    <footer className="painel-rabiscos mt-20 border-t border-coral-100 bg-creme-200/60">
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1.1fr] lg:gap-12">
        <div>
          <Logo comAssinatura href={null} />
          <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-ink-600">
            Atacado de confiança para o seu negócio crescer. Escolha as peças no catálogo e
            converse com a gente pelo WhatsApp.
          </p>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Falar no WhatsApp
            </a>
          )}
        </div>

        <nav aria-label="Navegação do rodapé">
          <p className="olho">Catálogo</p>
          <ul className="mt-3 space-y-0.5 text-[0.9375rem]">
            {[
              { href: '/', rotulo: 'Início' },
              { href: '/produtos', rotulo: 'Catálogo completo' },
              { href: '/categoria', rotulo: 'Categorias' },
              { href: '/selecao', rotulo: 'Minha seleção' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-pilula text-ink-600 transition-colors hover:text-coral-800 foco-marca"
                >
                  {link.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="olho">Fale com a gente</p>
          <ul className="mt-3 space-y-0.5 text-[0.9375rem]">
            {contatos.map((contato) => (
              <li key={contato.href}>
                <a
                  href={contato.href}
                  {...(contato.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={estiloContato}
                >
                  <contato.icone className="h-4 w-4 shrink-0 text-coral-600" aria-hidden="true" />
                  {/* `min-w-0` + `break-all`: o e-mail é uma palavra só e mais larga que a coluna
                      do rodapé no tablet — sem isto ele vaza da grade e cria rolagem horizontal
                      na página inteira. */}
                  <span className="min-w-0 break-all">{contato.texto}</span>
                </a>
              </li>
            ))}
            {siteConfig.endereco && (
              <li className="flex items-start gap-2.5 py-2.5 text-ink-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-coral-600" aria-hidden="true" />
                <span className="whitespace-pre-line leading-relaxed">{siteConfig.endereco}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-coral-100/80">
        <p className="container py-5 text-center text-sm text-ink-500">
          © {anoAtual} Fruto da Malha · Vestindo carinho
        </p>
      </div>
    </footer>
  );
}
