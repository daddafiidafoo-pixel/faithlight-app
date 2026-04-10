import React from 'react';
import { MessageCircle, Send } from 'lucide-react';

const LABELS = {
  en: { whatsapp: 'WhatsApp', telegram: 'Telegram', share: 'Share' },
  om: { whatsapp: 'WhatsApp', telegram: 'Telegram', share: 'Qoodi' },
};

export default function VerseShareSocialButtons({ reference, verseText, language = 'en' }) {
  const L = LABELS[language] || LABELS.en;

  const shareText = `"${verseText}"\n\n— ${reference}`;

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleTelegram = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://t.me/share/url?text=${encoded}`, '_blank');
  };

  return (
    <div className="flex gap-2 w-full">
      <button
        onClick={handleWhatsApp}
        aria-label={L.whatsapp}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all min-h-[44px]"
        style={{ backgroundColor: '#25D366', color: '#fff' }}
        title={L.whatsapp}
      >
        <MessageCircle className="w-4 h-4" />
        {L.whatsapp}
      </button>
      <button
        onClick={handleTelegram}
        aria-label={L.telegram}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all min-h-[44px]"
        style={{ backgroundColor: '#0088cc', color: '#fff' }}
        title={L.telegram}
      >
        <Send className="w-4 h-4" />
        {L.telegram}
      </button>
    </div>
  );
}