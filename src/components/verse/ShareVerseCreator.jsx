import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/I18nProvider';
import { Loader2, Download, Share2, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATES = [
  { id: 'clean_light', name: 'Clean Light', desc: 'Minimal white & blue' },
  { id: 'faith_gradient', name: 'Faith Gradient', desc: 'Soft blue gradient' },
  { id: 'scripture_photo', name: 'Scripture Photo', desc: 'Blurred landscape' }
];

const FORMATS = [
  { id: 'square', size: '1080x1080', label: 'Square (Instagram)' },
  { id: 'story', size: '1080x1920', label: 'Story (WhatsApp/Instagram)' },
  { id: 'portrait', size: '1080x1920', label: 'Portrait (Reels/TikTok)' }
];

export default function ShareVerseCreator({ verse, verseRef, language = 'en' }) {
  const { t } = useI18n();
  const [selectedTemplate, setSelectedTemplate] = useState('clean_light');
  const [selectedFormat, setSelectedFormat] = useState('story');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleGenerate = async () => {
    if (!verse || !verseRef) {
      toast.error('Please select a verse');
      return;
    }

    setGenerating(true);
    try {
      // Call backend function to generate image
      const response = await base44.functions.invoke('generateVerseImage', {
        verse_text: verse,
        verse_reference: verseRef,
        language,
        template: selectedTemplate,
        format: selectedFormat
      });

      if (response.data?.image_url) {
        setGeneratedImage({
          url: response.data.image_url,
          id: response.data.id
        });
        toast.success('Image generated!');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Error generating image');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async (platform) => {
    if (!generatedImage) return;

    try {
      if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(verse + ' ' + verseRef)}`);
      } else if (platform === 'copy') {
        await navigator.clipboard.writeText(`${verse}\n\n${verseRef}\n\n🙏 Shared via FaithLight`);
        toast.success('Verse copied to clipboard!');
      }

      // Track the share
      if (user && generatedImage.id) {
        await base44.entities.VerseShare.update(generatedImage.id, {
          share_count: (await base44.entities.VerseShare.filter({ id: generatedImage.id }))[0]?.share_count + 1 || 1,
          shared_to: [platform]
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSave = async () => {
    if (!generatedImage) return;

    try {
      const link = document.createElement('a');
      link.href = generatedImage.url;
      link.download = `verse-${verseRef.replace(/[:/]/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (user && generatedImage.id) {
        await base44.entities.VerseShare.update(generatedImage.id, { saved: true }).catch(() => {});
      }
      toast.success('Image saved!');
    } catch (error) {
      toast.error('Failed to save image');
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">{t('verse.selectTemplate', 'Choose Design')}</h3>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedTemplate === tmpl.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-sm text-gray-900">{tmpl.name}</p>
              <p className="text-xs text-gray-500">{tmpl.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Format Selection */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">{t('verse.selectFormat', 'Choose Format')}</h3>
        <div className="space-y-2">
          {FORMATS.map(fmt => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                selectedFormat === fmt.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">{fmt.label}</p>
              <p className="text-xs text-gray-500">{fmt.size}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('common.generating', 'Generating...')}
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            {t('verse.generate', 'Generate Image')}
          </>
        )}
      </Button>

      {/* Preview & Actions */}
      {generatedImage && (
        <Card className="p-6 space-y-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={generatedImage.url}
              alt="Generated verse share"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleSave}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {t('verse.save', 'Save')}
            </Button>
            <Button
              onClick={() => handleShare('copy')}
              variant="outline"
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              {t('verse.copy', 'Copy Text')}
            </Button>
            <Button
              onClick={() => handleShare('whatsapp')}
              variant="outline"
              className="gap-2 col-span-2"
            >
              <MessageCircle className="w-4 h-4" />
              {t('verse.shareWhatsApp', 'WhatsApp')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}