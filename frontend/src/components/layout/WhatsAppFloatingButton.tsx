import { MessageCircle } from 'lucide-react';
import { siteConfig } from '@/lib/config';
import { montarLinkWhatsApp } from '@/lib/whatsapp';

export function WhatsAppFloatingButton() {
  if (!siteConfig.whatsappNumber) {
    return null;
  }

  return (
    <a
      href={montarLinkWhatsApp(siteConfig.whatsappNumber, 'Olá! Vim pelo site e gostaria de tirar uma dúvida.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-pilula
        bg-[#25D366] text-white shadow-flutuante transition-transform hover:scale-105
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-700"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" strokeWidth={0} />
    </a>
  );
}
