import React, { useMemo, useState, useRef } from 'react';
import verseShareLabels from './i18n/verseShareModal.json';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import VerseSharePreview from './VerseSharePreview';
import { downloadVerseShareImage, shareVerseShareImage } from './verse/verseShareExport';

export default function VerseShareModal({
  isOpen,
  onClose,
  language = 'en',
  reference,
  text
}) {
  const [format, setFormat] = useState('square');
  const [style, setStyle] = useState('faithlightBlue');
  const [shareLanguage, setShareLanguage] = useState(language);
  const [loading, setLoading] = useState(false);
  const previewRef = useRef(null);

  const t = verseShareLabels.verseShareModal;

  const verseText = useMemo(() => {
    return text?.[shareLanguage] || text?.en || '';
  }, [text, shareLanguage]);

  if (!isOpen) return null;

  const handleShareImage = async () => {
    if (!previewRef.current) return;

    setLoading(true);
    try {
      await shareVerseShareImage(
        previewRef.current,
        format,
        reference,
        `${reference}\n\n${verseText}\n\n🙏 FaithLight`
      );
      toast.success('Image shared!');
    } catch (error) {
      console.error('Share image failed:', error);
      toast.error('Failed to share image');
    } finally {
      setLoading(false);
    }
  };

  const handleShareVideo = async () => {
    console.log('Video sharing coming in v2');
    toast.info('Video sharing coming in v2');
  };

  const handleCopyVerse = async () => {
    try {
      const text = `"${verseText}"\n\n${reference}`;
      await navigator.clipboard.writeText(text);
      toast.success('Verse copied!');
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy');
    }
  };

  const handleSaveImage = async () => {
    if (!previewRef.current) return;

    setLoading(true);
    try {
      await downloadVerseShareImage(previewRef.current, format, reference);
      toast.success('Image saved!');
    } catch (error) {
      console.error('Save image failed:', error);
      toast.error('Failed to save image');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVideo = async () => {
    console.log('Video saving coming in v2');
    toast.info('Video saving coming in v2');
  };

  const languageNames = t.languageNames;
  const supportedLanguages = ['en', 'om', 'am', 'ar', 'sw', 'fr'];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4">
      <div className="w-full md:max-w-3xl bg-white rounded-t-3xl md:rounded-3xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t.title[language]}
            </h2>
            <p className="text-slate-600 mt-1">
              {t.subtitle[language]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Format Selection */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {t.chooseFormat[language]}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {['square', 'story', 'portrait'].map(item => (
                <button
                  key={item}
                  onClick={() => setFormat(item)}
                  className={`rounded-xl border px-4 py-3 font-medium transition-all ${
                    format === item
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {t.formats[item][language]}
                </button>
              ))}
            </div>
          </section>

          {/* Style Selection */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {t.chooseStyle[language]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['cleanLight', 'faithlightBlue', 'softScripture'].map(item => (
                <button
                  key={item}
                  onClick={() => setStyle(item)}
                  className={`rounded-xl border px-4 py-3 font-medium text-left transition-all ${
                    style === item
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {t.styles[item][language]}
                </button>
              ))}
            </div>
          </section>

          {/* Language Selection */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {t.chooseLanguage[language]}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {supportedLanguages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setShareLanguage(lang)}
                  className={`rounded-xl border px-3 py-2 font-medium text-sm transition-all ${
                    shareLanguage === lang
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {languageNames[lang]}
                </button>
              ))}
            </div>
          </section>

          {/* Live Preview */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {t.preview[language]}
            </h3>

            <div className="flex justify-center">
              <VerseSharePreview
                ref={previewRef}
                language={shareLanguage}
                reference={reference}
                verseText={verseText}
                format={format}
                styleKey={style}
              />
            </div>
          </section>

          {/* Actions */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              {t.actions[language]}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button
                onClick={handleShareImage}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.shareImage[language]}
              </Button>

              <Button
                onClick={handleShareVideo}
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.shareVideo[language]}
              </Button>

              <Button
                onClick={handleSaveImage}
                disabled={loading}
                variant="outline"
                className="font-semibold gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.saveImage[language]}
              </Button>

              <Button
                onClick={handleSaveVideo}
                variant="outline"
                className="font-semibold"
              >
                {t.saveVideo[language]}
              </Button>

              <Button
                onClick={handleCopyVerse}
                variant="outline"
                className="font-semibold"
              >
                {t.copyVerse[language]}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}