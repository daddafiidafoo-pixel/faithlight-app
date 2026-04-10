import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, Check, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useI18n } from '@/components/I18nProvider';

const BACKGROUND_THEMES = [
  { id: 'gradient-purple', name: 'Purple', bg: 'bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600' },
  { id: 'gradient-sunset', name: 'Sunset', bg: 'bg-gradient-to-br from-orange-400 via-red-500 to-purple-600' },
  { id: 'gradient-ocean', name: 'Ocean', bg: 'bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600' },
  { id: 'gradient-forest', name: 'Forest', bg: 'bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600' },
  { id: 'gradient-night', name: 'Night', bg: 'bg-gradient-to-br from-slate-800 via-slate-900 to-black' },
  { id: 'solid-black', name: 'Black', bg: 'bg-black' },
];

export default function VerseShareImageGenerator({ verse, verseRef }) {
  const { t, isRTL } = useI18n();
  const [theme, setTheme] = useState(BACKGROUND_THEMES[0].id);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const imageRef = useRef(null);

  if (!verse || !verseRef) {
    return null;
  }

  const selectedTheme = BACKGROUND_THEMES.find(t => t.id === theme);

  const generateImage = async () => {
    if (!imageRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(imageRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Download the image
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `verse-${verseRef.replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setGenerating(false);
    }
  };

  const shareToInstagram = async () => {
    // Instagram requires image to be shared via native share or saved to camera roll
    // This opens Instagram with the verse text in clipboard
    const text = `"${verse}"\n\n— ${verseRef}\n\n#BibleVerse #Scripture #FaithLight`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Open Instagram
    window.open('https://www.instagram.com/', '_blank');
  };

  const shareToWhatsApp = () => {
    const text = `📖 *${verseRef}*\n\n_"${verse}"_\n\n✨ Shared via FaithLight`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Image Preview */}
      <div className="flex justify-center">
        <div
          ref={imageRef}
          className={`${selectedTheme.bg} rounded-2xl p-8 w-full max-w-md aspect-square flex flex-col justify-center items-center text-white shadow-2xl`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Decorative Top Element */}
          <div className="mb-6 opacity-40">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.716-5-7-5-6 0-6.002 5-6 7s-.994 11 6 11z" />
            </svg>
          </div>

          {/* Verse Text */}
          <p className="text-center text-xl md:text-2xl font-bold leading-relaxed mb-6">
            "{verse}"
          </p>

          {/* Verse Reference */}
          <p className="text-center text-sm md:text-base font-semibold opacity-90 mb-6">
            — {verseRef}
          </p>

          {/* Decorative Bottom Element */}
          <div className="mt-auto opacity-40">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 3c0-3-7-6-7-6-6 0-6.002 5-6 7s.994 11-6 11c-3 0-7-1-7-8V5c0-1.25 4.716-5 7-5 6 0 6.002 5 6 7s-.994 11 6 11z" />
            </svg>
          </div>

          {/* FaithLight Watermark */}
          <p className="text-xs opacity-60 mt-6">FaithLight</p>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{t('scripture.choose_theme', 'Choose Background')}</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {BACKGROUND_THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-2 rounded-lg border-2 transition-all ${
                theme === t.id
                  ? 'border-indigo-600 ring-2 ring-indigo-300'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              title={t.name}
            >
              <div className={`${t.bg} rounded h-8 w-full`} />
              <p className="text-xs text-center mt-1 text-gray-600">{t.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={generateImage}
          disabled={generating}
          className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('scripture.generating', 'Generating...')}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {t('scripture.save_image', 'Save Image')}
            </>
          )}
        </Button>

        <Button
          onClick={shareToWhatsApp}
          variant="outline"
          className="flex-1 gap-2"
          title="Share to WhatsApp"
        >
          💬 {t('scripture.whatsapp', 'WhatsApp')}
        </Button>

        <Button
          onClick={shareToInstagram}
          variant="outline"
          className="flex-1 gap-2"
          title="Share to Instagram"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              {t('scripture.copied', 'Copied')}
            </>
          ) : (
            <>
              📷 {t('scripture.instagram', 'Instagram')}
            </>
          )}
        </Button>
      </div>

      {/* Info Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <p>
          {t(
            'scripture.share_tips',
            '💡 Save the image and share to WhatsApp, Instagram, or Facebook. For Instagram, paste the verse text in your caption.'
          )}
        </p>
      </div>
    </div>
  );
}