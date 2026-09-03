import { Instagram, MessageCircle, Phone } from 'lucide-react';
import { montarLinkInstagram, siteConfig } from '@/lib/config';
import { montarLinkWhatsApp } from '@/lib/whatsapp';

/**
 * Faixa de contato acima do cabeçalho: Instagram e WhatsApp sempre à mão, como na vitrine de
 * uma loja física. Fica **fora** do `<header>` sticky de propósito — no celular ela rola para
 * fora da tela e devolve altura para o catálogo, enquanto a busca e o menu continuam grudados
 * no topo.
 *
 * É uma faixa **discreta** (creme, texto marrom): o coral da marca fica reservado para os
 * botões de ação. Uma barra coral de ponta a ponta no topo competia com eles e roubava o
 * destaque do "Adicionar à seleção", que é o que a loja precisa que a cliente encontre.
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
    'inline-flex min-h-9 items-center gap-2 rounded-pilula px-2.5 text-[0.8125rem] font-bold ' +
    'text-ink-600 transition-colors hover:bg-coral-100/70 hover:text-coral-800 foco-marca';

  return (
    <div className="border-b border-coral-100 bg-creme-200/70">
      <div className="container flex flex-wrap items-center justify-between gap-x-2 py-1">
        {/* A assinatura do catálogo impresso ("Atacado de confiança para o seu negócio
            CRESCER!", p.2), agora dizendo também o que a loja vende — é a primeira linha que
            uma lojista lê ao chegar, e "atacado" sozinho não conta que é infantil.

            Aparece só a partir de `lg`: a frase mais longa não cabia ao lado dos três contatos
            num tablet, e a faixa quebrava em duas linhas. Abaixo disso a barra fica só com os
            contatos, como já ficava no celular. */}
        <p className="hidden text-[0.8125rem] font-semibold text-ink-500 lg:block">
          Fornecedor em atacado infantil de confiança para o seu negócio crescer
        </p>

        {/* `ml-auto`: sem a frase à esquerda, o `justify-between` deixaria os contatos colados
            na borda esquerda no tablet. */}
        <div className="ml-auto flex flex-wrap items-center gap-0.5">
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={estiloLink}
              aria-label={`Instagram da loja: @${siteConfig.instagramHandle}`}
            >
              <Instagram className="h-4 w-4 shrink-0 text-coral-600" aria-hidden="true" />
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
              <MessageCircle className="h-4 w-4 shrink-0 text-coral-600" aria-hidden="true" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}

          {siteConfig.telefone && (
            <a
              href={`tel:${siteConfig.telefone.replace(/\D/g, '')}`}
              className={estiloLink}
              aria-label={`Ligar para ${siteConfig.telefone}`}
            >
              <Phone className="h-4 w-4 shrink-0 text-coral-600" aria-hidden="true" />
              <span className="tabular-nums">{siteConfig.telefone}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
