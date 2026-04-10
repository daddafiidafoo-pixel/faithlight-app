import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Twitter, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LABELS = {
  en: { copy: 'Copy', copied: 'Copied!', share: 'Share Verse', whatsapp: 'WhatsApp', twitter: 'Twitter', more: 'More' },
  am: { copy: 'ቅዳ', copied: 'ተቀድቷል!', share: 'ቃሉን አጋራ', whatsapp: 'ዋትስአፕ', twitter: 'ትዊተር', more: 'ተጨማሪ' },
  om: { copy: 'Cuqaasi', copied: 'Cuqaasamee!', share: 'Aayata Qooduu', whatsapp: 'WhatsApp', twitter: 'Twitter', more: 'Dabalata' },
  ar: { copy: 'نسخ', copied: 'تم النسخ!', share: 'مشاركة الآية', whatsapp: 'واتساب', twitter: 'تويتر', more: 'المزيد' },
  fr: { copy: 'Copier', copied: 'Copié!', share: 'Partager', whatsapp: 'WhatsApp', twitter: 'Twitter', more: 'Plus' },
  sw: { copy: 'Nakili', copied: 'Imenakiliwa!', share: 'Shiriki Aya', whatsapp: 'WhatsApp', twitter: 'Twitter', more: 'Zaidi' },
};

function getL(lang, key) {
  return (LABELS[lang] || LABELS.en)[key];
}

export default function VerseShareButton({ verse, explanation, lang = 'en' }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  if (!verse) return null;

  const shareText = explanation
    ? `"${verse.verseText}" — ${verse.reference}\n\n${explanation}\n\nShared via FaithLight 🙏`
    : `"${verse.verseText}" — ${verse.reference}\n\nShared via FaithLight 🙏`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    setOpen(false);
  };

  const handleTwitter = () => {
    const tweetText = `"${verse.verseText}" — ${verse.reference} | #FaithLight #Bible`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
    setOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: verse.reference, text: shareText });
      setOpen(false);
    } else {
      handleCopy();
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md"
      >
        <Share2 size={15} />
        {getL(lang, 'share')}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full mb-2 right-0 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-w-[180px]"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} className="text-gray-400" />}
                {copied ? getL(lang, 'copied') : getL(lang, 'copy')}
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors border-t border-gray-100"
              >
                <MessageCircle size={15} className="text-green-500" />
                {getL(lang, 'whatsapp')}
              </button>

              <button
                onClick={handleTwitter}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors border-t border-gray-100"
              >
                <Twitter size={15} className="text-blue-400" />
                {getL(lang, 'twitter')}
              </button>

              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <Share2 size={15} className="text-indigo-400" />
                  {getL(lang, 'more')}
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}