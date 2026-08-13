import { Instagram, MessageCircle, Phone } from 'lucide-react';
import { montarLinkInstagram, siteConfig } from '@/lib/config';
import { montarLinkWhatsApp } from '@/lib/whatsapp';

/**
 * Faixa de contato acima do cabeçalho: Instagram e WhatsApp sempre à mão, como na vitrine de
 * uma loja física. Fica **fora** do `<header>` sticky de propósito — no celular ela rola para
 * fora da tela e devolve altura para o catálogo, enquanto a busca e o menu continuam grudados
 * no topo.
 *
 * Cada contato só aparece se estiver configurado em `frontend/.env.local` (ver `.env.example`):
 * nenhum endereço é embutido no código, então uma variável em branco simplesmente esconde a
 * linha em vez de gerar um link quebrado.
 */
export function TopBar() {
  const instagramUrl = siteConfig.instagramHandle
    ? montarLinkInstagram(siteConfig.instagramHandle)
    : null;

  const whatsappUrl = siteConfig.whatsappNumber
    ? montarLinkWhatsApp(siteConfig.whatsappNumber, 'Olá! Vim pelo catálogo e gostaria de tirar uma dúvida.')
    : null;

  // Sem nenhum contato configurado a faixa não tem conteúdo — não renderiza uma barra vazia.
  if (!instagramUrl && !whatsappUrl && !siteConfig.telefone) {
    return null;
  }

  const estiloLink =
    'inline-flex min-h-11 items-center gap-2 rounded-pilula px-2.5 text-sm font-semibold ' +
    'text-ink-800 transition-colors hover:bg-coral-300/60 foco-marca';

  return (
    <div className="bg-coral-400/90">
      <div className="container flex flex-wrap items-center justify-between gap-x-2 py-0.5">
        <div className="flex items-center gap-1">
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={estiloLink}
              aria-label={`Instagram da loja: @${siteConfig.instagramHandle}`}
            >
              <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />
              {/* O arroba é ruído no celular, onde o ícone já identifica a rede. */}
              <span className="hidden sm:inline">@{siteConfig.instagramHandle}</span>
            </a>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={estiloLink}
              aria-label="Falar com a loja no WhatsApp"
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </div>

        {siteConfig.telefone && (
          <a
            href={`tel:${siteConfig.telefone.replace(/\D/g, '')}`}
            className={estiloLink}
            aria-label={`Ligar para ${siteConfig.telefone}`}
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            {siteConfig.telefone}
          </a>
        )}
      </div>
    </div>
  );
}
