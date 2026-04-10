import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Download, Share2, RefreshCw, Loader2, Image } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

const GRADIENT_FALLBACKS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
];

export default function AIVerseImageCard({ verse, reference }) {
  const [aiImageUrl, setAiImageUrl] = useState(null);
  const [gradientIndex, setGradientIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const generateAIBackground = async () => {
    if (!verse) { toast.error('No verse selected'); return; }
    setGenerating(true);
    try {
      const prompt = `A breathtaking, serene, spiritual landscape photo suitable as a Bible verse background. 
No text in the image. Style: cinematic, peaceful, divine light rays.
Theme inspired by: "${verse.slice(0, 80)}". 
Soft golden hour lighting, beautiful natural scenery — mountains, ocean, forest, or sky — 
with a dreamy, heavenly atmosphere. High quality, photorealistic.`;

      const result = await base44.integrations.Core.GenerateImage({ prompt });
      if (result?.url) {
        setAiImageUrl(result.url);
        toast.success('AI background generated!');
      }
    } catch (err) {
      toast.error('Image generation failed. Using gradient instead.');
      setAiImageUrl(null);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `faithlight-${reference?.replace(/\s/g, '-') || 'verse'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Image saved!');
    } catch {
      toast.error('Download failed. Try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      if (navigator.share && navigator.canShare) {
        const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
        canvas.toBlob(async (blob) => {
          const file = new File([blob], 'verse.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: reference, text: `"${verse}" — ${reference}` });
          } else {
            await navigator.share({ title: reference, text: `"${verse}" — ${reference}\n\nShared from FaithLight` });
          }
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`"${verse}" — ${reference}\n\nShared from FaithLight`);
        toast.success('Verse copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') toast.error('Share failed');
    }
  };

  const background = aiImageUrl
    ? `url(${aiImageUrl})`
    : GRADIENT_FALLBACKS[gradientIndex];

  return (
    <div className="space-y-4">
      {/* Preview Card */}
      <div
        ref={cardRef}
        style={{
          background,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '16px',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dark overlay for readability when using AI image */}
        {aiImageUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 100%)',
            borderRadius: '16px',
          }} />
        )}

        {/* Watermark */}
        <div style={{
          position: 'absolute', top: 14, right: 16,
          fontSize: 12, color: 'rgba(255,255,255,0.75)',
          fontWeight: 700, letterSpacing: 1, zIndex: 2,
          fontFamily: 'Georgia, serif',
        }}>
          FaithLight
        </div>

        {/* Decorative line */}
        <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.6)', marginBottom: 20, position: 'relative', zIndex: 2 }} />

        {/* Verse Text */}
        <p style={{
          fontSize: 20, lineHeight: 1.75, color: 'white',
          fontStyle: 'italic', fontFamily: 'Georgia, serif',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          maxWidth: 500, position: 'relative', zIndex: 2,
          marginBottom: 20,
        }}>
          "{verse || 'Select a verse to generate your card'}"
        </p>

        {/* Reference */}
        {reference && (
          <p style={{
            fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.92)',
            letterSpacing: 2, textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            position: 'relative', zIndex: 2, fontFamily: 'sans-serif',
            textTransform: 'uppercase',
          }}>
            — {reference}
          </p>
        )}

        {/* Bottom decorative line */}
        <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.6)', marginTop: 20, position: 'relative', zIndex: 2 }} />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={generateAIBackground}
          disabled={generating || !verse}
          className="gap-2 bg-purple-600 hover:bg-purple-700 col-span-2"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Generating AI Background…' : '✨ Generate AI Background'}
        </Button>

        {!aiImageUrl && (
          <Button
            variant="outline"
            onClick={() => setGradientIndex(i => (i + 1) % GRADIENT_FALLBACKS.length)}
            className="gap-2 col-span-2"
          >
            <RefreshCw className="w-4 h-4" />
            Next Gradient
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={downloading || !verse}
          className="gap-2"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Save
        </Button>

        <Button
          variant="outline"
          onClick={handleShare}
          disabled={!verse}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {aiImageUrl && (
        <button onClick={() => setAiImageUrl(null)} className="w-full text-xs text-gray-400 hover:text-gray-600 text-center">
          Remove AI background
        </button>
      )}
    </div>
  );
}