import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/I18nProvider';
import { Download, Copy, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { buildVerseSharePayload, getLocalizedText } from './verseSharingHelpers';

export default function VerseShareActions({
  verse,
  verseRef,
  template,
  format,
  language,
  onClose
}) {
  const { lang } = useI18n();
  const [loading, setLoading] = useState(null);

  const handleCopyVerse = async () => {
    try {
      const text = `"${verse}"\n\n${verseRef}\n\n🙏 Shared via FaithLight`;
      await navigator.clipboard.writeText(text);
      toast.success('Verse copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShareToWhatsApp = () => {
    try {
      const text = encodeURIComponent(`"${verse}"\n\n${verseRef}\n\n🙏 FaithLight`);
      const url = `https://wa.me/?text=${text}`;
      window.open(url, '_blank');
      toast.success('Opening WhatsApp...');
    } catch (error) {
      toast.error('Failed to open WhatsApp');
    }
  };

  const handleSaveImage = async () => {
    setLoading('image');
    try {
      // Call backend to generate image
      const payload = buildVerseSharePayload({
        reference: verseRef,
        text: verse,
        language,
        template,
        format
      });

      const response = await base44.functions.invoke('generateVerseImage', payload);

      if (response.data?.image_url) {
        // Trigger download
        const link = document.createElement('a');
        link.href = response.data.image_url;
        link.download = `verse-${verseRef.replace(/[:/]/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Image saved!');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error saving image');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        onClick={handleSaveImage}
        disabled={loading === 'image'}
        className="gap-2"
        variant="outline"
      >
        {loading === 'image' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            {getLocalizedText('saveImage', lang)}
          </>
        )}
      </Button>

      <Button
        onClick={handleCopyVerse}
        variant="outline"
        className="gap-2"
      >
        <Copy className="w-4 h-4" />
        {getLocalizedText('copyVerse', lang)}
      </Button>

      <Button
        onClick={handleShareToWhatsApp}
        className="col-span-2 bg-green-600 hover:bg-green-700 text-white gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        {getLocalizedText('shareWhatsApp', lang)}
      </Button>
    </div>
  );
}