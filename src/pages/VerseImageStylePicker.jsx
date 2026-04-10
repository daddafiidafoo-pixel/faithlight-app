import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, Download, Share2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import html2canvas from 'html2canvas';

const BACKGROUNDS = [
  { id: 'sunrise', name: 'Sunrise', image: 'linear-gradient(135deg, #FFA500 0%, #FFD700 50%, #FFF 100%)' },
  { id: 'ocean', name: 'Ocean', image: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7aa8d1 100%)' },
  { id: 'forest', name: 'Forest', image: 'linear-gradient(135deg, #1a4d2e 0%, #2d8659 50%, #52b788 100%)' },
  { id: 'night', name: 'Night Sky', image: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a3e 50%, #2a2a5a 100%)' },
  { id: 'desert', name: 'Desert', image: 'linear-gradient(135deg, #D4A574 0%, #E8C4A0 50%, #F5DEB3 100%)' },
  { id: 'autumn', name: 'Autumn', image: 'linear-gradient(135deg, #8B4513 0%, #CD853F 50%, #FFD700 100%)' },
  { id: 'minimal', name: 'Minimal', image: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' },
  { id: 'dark', name: 'Dark', image: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' },
];

const FONTS = [
  { id: 'serif', name: 'Serif', style: 'Georgia, serif' },
  { id: 'sans', name: 'Sans', style: 'Inter, sans-serif' },
  { id: 'elegant', name: 'Elegant', style: '"Palatino Linotype", Palatino, serif' },
  { id: 'modern', name: 'Modern', style: 'system-ui, sans-serif' },
];

const ALIGNMENTS = [
  { id: 'center', name: 'Center', value: 'center' },
  { id: 'left', name: 'Left', value: 'left' },
  { id: 'right', name: 'Right', value: 'right' },
];

const FILTERS = [
  { id: 'none', name: 'None', filter: 'none' },
  { id: 'sepia', name: 'Sepia', filter: 'sepia(0.4)' },
  { id: 'blur', name: 'Blur', filter: 'blur(2px)' },
  { id: 'brightness', name: 'Bright', filter: 'brightness(1.2)' },
  { id: 'contrast', name: 'Contrast', filter: 'contrast(1.3)' },
  { id: 'saturate', name: 'Saturate', filter: 'saturate(1.5)' },
  { id: 'invert', name: 'Invert', filter: 'invert(0.15)' },
];

export default function VerseImageStylePicker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const verse = searchParams.get('verse') || 'John 3:16';
  const verseText = searchParams.get('text') || 'For God so loved the world...';

  const [bg, setBg] = useState(BACKGROUNDS[0]);
  const [font, setFont] = useState(FONTS[0]);
  const [alignment, setAlignment] = useState(ALIGNMENTS[0]);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const exportImage = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      return canvas.toDataURL('image/png');
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await exportImage();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `verse-${verse.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  const handleShare = async () => {
    const dataUrl = await exportImage();
    if (!dataUrl) return;

    if (navigator.share) {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'verse.png', { type: 'image/png' });
      navigator.share({ files: [file], text: `"${verseText}" — ${verse}` });
    } else {
      navigator.clipboard?.writeText(`"${verseText}" — ${verse}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(createPageUrl('VerseImageGenerator'))}
            className="hover:bg-purple-500 p-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Design Your Card</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Preview */}
        <div className="mb-8 flex justify-center">
          <div
            ref={cardRef}
            style={{
              width: 400,
              height: 500,
              background: bg.image,
              filter: filter.filter,
              borderRadius: 16,
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: alignment.value,
              textAlign: alignment.value,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', borderRadius: 16 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p
                style={{
                  color: 'white',
                  fontSize: 28,
                  fontFamily: font.style,
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  marginBottom: 20,
                }}
              >
                "{verseText}"
              </p>
              <p
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 16,
                  fontFamily: font.style,
                  letterSpacing: 2,
                }}
              >
                — {verse}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Background */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Background</h3>
            <div className="grid grid-cols-4 gap-3">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBg(b)}
                  className={`h-16 rounded-lg border-2 transition-all ${
                    bg.id === b.id ? 'border-purple-600 scale-105 ring-2 ring-purple-300' : 'border-gray-200'
                  }`}
                  style={{ background: b.image }}
                  title={b.name}
                />
              ))}
            </div>
          </Card>

          {/* Font */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Typography</h3>
            <div className="grid grid-cols-4 gap-3">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFont(f)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    font.id === f.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: f.style }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Alignment */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Text Alignment</h3>
            <div className="grid grid-cols-3 gap-3">
              {ALIGNMENTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAlignment(a)}
                  className={`p-3 rounded-lg border-2 transition-all font-medium ${
                    alignment.id === a.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Filters */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Image Filter</h3>
            <div className="grid grid-cols-7 gap-3">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f)}
                  className={`p-2 rounded-lg border-2 transition-all text-xs font-medium ${
                    filter.id === f.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleDownload}
              disabled={exporting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Download'}
            </Button>
            <Button
              onClick={handleShare}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Share'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}