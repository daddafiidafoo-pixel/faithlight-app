import React, { useState, useRef, useEffect } from 'react';
import { Download, Share2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const FONTS = [
  { name: 'Serif', family: 'Georgia, serif', id: 'serif' },
  { name: 'Modern', family: 'Inter, sans-serif', id: 'modern' },
  { name: 'Elegant', family: 'Playfair Display, serif', id: 'elegant' },
  { name: 'Bold', family: 'Poppins, sans-serif', id: 'bold' },
];

const THEMES = [
  {
    name: 'Serene Blue',
    id: 'serene-blue',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd700',
  },
  {
    name: 'Sunrise',
    id: 'sunrise',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd700',
  },
  {
    name: 'Forest',
    id: 'forest',
    bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd700',
  },
  {
    name: 'Golden Hour',
    id: 'golden-hour',
    bg: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    textColor: '#ffffff',
    accentColor: '#ffffff',
  },
  {
    name: 'Ocean',
    id: 'ocean',
    bg: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
    textColor: '#ffffff',
    accentColor: '#fff200',
  },
  {
    name: 'Midnight',
    id: 'midnight',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    textColor: '#ffffff',
    accentColor: '#eab308',
  },
];

export default function VerseImageGenerator({ verse, reference }) {
  const [selectedFont, setSelectedFont] = useState('modern');
  const [selectedTheme, setSelectedTheme] = useState('serene-blue');
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef(null);
  const isMountedRef = useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const theme = THEMES.find(t => t.id === selectedTheme);
  const font = FONTS.find(f => f.id === selectedFont);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
      });
      if (isMountedRef.current) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `verse-${Date.now()}.png`;
        link.click();
      }
    } finally {
      if (isMountedRef.current) setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!canvasRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      canvas.toBlob(blob => {
        if (isMountedRef.current) {
          const file = new File([blob], 'verse.png', { type: 'image/png' });
          if (navigator.share) {
            navigator.share({
              files: [file],
              title: 'Beautiful Verse',
              text: reference,
            }).catch(() => {});
          }
        }
      });
    } finally {
      if (isMountedRef.current) setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Create Verse Image</h1>
        <p className="text-slate-600 mt-2">Customize your verse and download as image</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center">
          <div
            ref={canvasRef}
            className="w-full aspect-square max-w-md rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-2xl relative overflow-hidden"
            style={{
              background: theme.bg,
              fontFamily: font.family,
            }}
          >
            {/* Decorative elements */}
            <div
              className="absolute top-8 left-8 w-16 h-16 rounded-full opacity-20"
              style={{ backgroundColor: theme.accentColor }}
            />
            <div
              className="absolute bottom-8 right-8 w-12 h-12 rounded-full opacity-20"
              style={{ backgroundColor: theme.accentColor }}
            />

            {/* Content */}
            <div className="relative z-10">
              <p
                className="text-5xl font-bold leading-tight mb-6"
                style={{ color: theme.textColor }}
              >
                "{verse}"
              </p>
              <p
                className="text-xl font-semibold"
                style={{ color: theme.accentColor }}
              >
                {reference}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-6">
          {/* Font Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Font Style</h3>
            <div className="grid grid-cols-2 gap-3">
              {FONTS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFont(f.id)}
                  className={`p-4 rounded-xl font-semibold text-center transition-all ${
                    selectedFont === f.id
                      ? 'bg-purple-600 text-white scale-105'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  style={selectedFont === f.id ? {} : { fontFamily: f.family }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Color Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`p-4 rounded-xl font-semibold text-sm transition-all border-2 ${
                    selectedTheme === t.id ? 'border-slate-900' : 'border-transparent'
                  }`}
                  style={{
                    background: t.bg,
                    color: t.textColor,
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-2xl transition-colors disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Download
            </button>
            <button
              onClick={handleShare}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}