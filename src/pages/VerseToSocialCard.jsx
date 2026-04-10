import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Share2, Copy, Search, Loader2, Instagram, MessageCircle, Facebook } from 'lucide-react';
import { toast } from 'sonner';

const CARD_SIZES = [
  { name: 'Square (1080x1080)', width: 1080, height: 1080, aspect: 'aspect-square' },
  { name: 'Portrait (1080x1350)', width: 1080, height: 1350, aspect: 'aspect-[4/5]' },
  { name: 'Story (1080x1920)', width: 1080, height: 1920, aspect: 'aspect-[9/16]' },
];

const CARD_THEMES = [
  { 
    name: 'Royal Purple', 
    bg: 'bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900',
    accent: 'from-purple-500 to-pink-500',
    text: 'text-white',
    textAlt: 'text-purple-100'
  },
  { 
    name: 'Ocean Dream', 
    bg: 'bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-900',
    accent: 'from-cyan-400 to-blue-500',
    text: 'text-white',
    textAlt: 'text-blue-100'
  },
  { 
    name: 'Sunset Gold', 
    bg: 'bg-gradient-to-br from-orange-900 via-amber-800 to-red-900',
    accent: 'from-yellow-400 to-orange-500',
    text: 'text-white',
    textAlt: 'text-amber-100'
  },
  { 
    name: 'Forest Peace', 
    bg: 'bg-gradient-to-br from-emerald-900 via-green-800 to-lime-900',
    accent: 'from-green-400 to-emerald-500',
    text: 'text-white',
    textAlt: 'text-green-100'
  },
  { 
    name: 'Minimal Light', 
    bg: 'bg-white',
    accent: 'from-gray-300 to-gray-400',
    text: 'text-gray-900',
    textAlt: 'text-gray-600'
  },
  { 
    name: 'Deep Plum', 
    bg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    accent: 'from-purple-400 to-violet-500',
    text: 'text-white',
    textAlt: 'text-purple-100'
  },
];

const LAYOUT_OPTIONS = [
  { id: 'centered', name: 'Centered', icon: '⭐' },
  { id: 'top', name: 'Top Aligned', icon: '⬆️' },
  { id: 'minimal', name: 'Minimal', icon: '✨' },
];

export default function VerseToSocialCard() {
  // Verse selection
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [verseAuthor, setVerseAuthor] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Customization
  const [selectedTheme, setSelectedTheme] = useState('Royal Purple');
  const [selectedSize, setSelectedSize] = useState('Square (1080x1080)');
  const [selectedLayout, setSelectedLayout] = useState('centered');
  const [includeRef, setIncludeRef] = useState(true);
  const [includeBrand, setIncludeBrand] = useState(true);

  // Actions
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef(null);

  const theme = CARD_THEMES.find(t => t.name === selectedTheme) || CARD_THEMES[0];
  const size = CARD_SIZES.find(s => s.name === selectedSize) || CARD_SIZES[0];

  // Search verse in database
  const handleSearchVerse = async () => {
    if (!verseRef.trim()) {
      setSearchError('Please enter a verse reference (e.g., John 3:16)');
      return;
    }

    setSearching(true);
    setSearchError('');
    try {
      // Try to parse verse reference
      const match = verseRef.match(/^([^:]+):(\d+):(\d+)$/);
      if (!match) {
        // Alternative format: "John 3 16" or "John 3:16"
        const parts = verseRef.match(/([A-Za-z\s]+)\s+(\d+)[:\s](\d+)/);
        if (!parts) {
          setSearchError('Format: Book Chapter:Verse (e.g., John 3:16)');
          setSearching(false);
          return;
        }
      }

      // Search in BibleVerseText entity
      const results = await base44.entities.BibleVerseText.filter({
        reference: { $regex: verseRef, $options: 'i' },
        language_code: 'en'
      });

      if (results && results.length > 0) {
        setVerseText(results[0].text);
        setVerseRef(results[0].reference);
        setVerseAuthor('');
      } else {
        setSearchError('Verse not found. Try another reference or enter text manually.');
      }
    } catch (err) {
      setSearchError('Error searching: ' + err.message);
    } finally {
      setSearching(false);
    }
  };

  // Download card as image
  const handleDownload = async () => {
    if (!cardRef.current || !verseText) return;
    setGenerating(true);
    try {
      // Use SVG-based export as fallback for better compatibility
      const element = cardRef.current;
      const rect = element.getBoundingClientRect();
      const width = size.width;
      const height = size.height;
      
      // Create canvas at high DPI for quality
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');
      
      // Scale context for high DPI
      ctx.scale(2, 2);
      
      // Draw white background (fallback for transparent)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      // Clone element and render via SVG+canvas (more reliable than html2canvas)
      const svg = new XMLSerializer().serializeToString(element);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `verse-${verseRef.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.click();
        toast.success('Card downloaded! Ready to share.');
        setGenerating(false);
      };
      img.onerror = () => {
        // Fallback: create simple text-based image
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 32px serif';
        ctx.fillText(verseRef, 40, 100);
        ctx.font = '24px serif';
        ctx.fillStyle = '#374151';
        const lines = verseText.match(/.{1,50}/g) || [];
        lines.forEach((line, i) => ctx.fillText(`"${line}"`, 40, 150 + i * 40));
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `verse-${verseRef.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.click();
        toast.success('Card downloaded! Ready to share.');
        setGenerating(false);
      };
      img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
    } catch (err) {
      toast.error('Failed to download card. Try copying text instead.');
      setGenerating(false);
    }
  };

  // Copy verse text
  const handleCopyText = async () => {
    const text = `${verseRef}\n\n"${verseText}"\n\n✨ Shared from FaithLight`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Verse copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Share to WhatsApp
  const handleShareWhatsApp = () => {
    const text = `${verseRef}\n\n"${verseText}"\n\n✨ Shared from FaithLight`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Share to Facebook
  const handleShareFacebook = () => {
    const text = `${verseRef}\n\n"${verseText}"`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Native share
  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast.error('Sharing not supported on this device');
      return;
    }
    try {
      await navigator.share({
        title: 'Scripture Verse',
        text: `${verseRef}\n\n"${verseText}"`,
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to share');
      }
    }
  };

  // Render card based on layout
  const renderCard = () => {
    const baseClasses = `${theme.bg} ${theme.text} p-8 rounded-3xl flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden`;
    
    if (selectedLayout === 'minimal') {
      return (
        <div className={`${baseClasses} ${size.aspect}`} style={{ aspectRatio: `${size.width}/${size.height}` }}>
          <div className="absolute inset-0 bg-gradient-to-br opacity-30" style={{ backgroundImage: `linear-gradient(135deg, transparent 0%, ${theme.accent})` }}></div>
          <div className="relative z-10 max-w-[85%]">
            {includeRef && <p className={`text-sm font-light ${theme.textAlt} mb-4`}>{verseRef}</p>}
            <p className="text-3xl leading-relaxed italic font-serif">"{verseText}"</p>
            {includeBrand && <p className={`text-xs mt-6 ${theme.textAlt}`}>✨ FaithLight</p>}
          </div>
        </div>
      );
    }

    if (selectedLayout === 'top') {
      return (
        <div className={`${baseClasses} ${size.aspect}`} style={{ aspectRatio: `${size.width}/${size.height}` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
          <div className="relative z-10 w-full h-full flex flex-col justify-start pt-20">
            {includeRef && <p className={`text-lg font-bold mb-6 ${theme.textAlt}`}>{verseRef}</p>}
            <p className="text-2xl leading-relaxed italic font-serif mb-auto">"{verseText}"</p>
            {includeBrand && <p className={`text-xs mt-auto pb-8 ${theme.textAlt}`}>✨ FaithLight</p>}
          </div>
        </div>
      );
    }

    // Centered (default)
    return (
      <div className={`${baseClasses} ${size.aspect}`} style={{ aspectRatio: `${size.width}/${size.height}` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
        <div className="relative z-10 max-w-[90%] flex flex-col justify-center h-full">
          {includeRef && (
            <div className="mb-8">
              <p className={`text-sm font-light ${theme.textAlt} tracking-wide`}>SCRIPTURE</p>
              <p className="text-3xl font-bold mt-2">{verseRef}</p>
            </div>
          )}
          <p className="text-2xl leading-relaxed italic font-serif mb-8">"{verseText}"</p>
          {verseAuthor && <p className={`text-base ${theme.textAlt} mb-8`}>— {verseAuthor}</p>}
          {includeBrand && (
            <div className={`mt-auto pt-6 border-t border-current border-opacity-20`}>
              <p className={`text-xs font-light ${theme.textAlt}`}>✨ FaithLight</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasVerse = verseRef && verseText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verse to Social Card</h1>
          <p className="text-gray-600">Create and share beautiful Scripture cards on social media</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Verse Selection */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">📖 Select Verse</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Reference</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., John 3:16"
                      value={verseRef}
                      onChange={(e) => setVerseRef(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchVerse()}
                      disabled={searching}
                    />
                    <Button
                      onClick={handleSearchVerse}
                      disabled={searching}
                      size="icon"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  {searchError && <p className="text-xs text-red-600 mt-2">{searchError}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Text</label>
                  <Textarea
                    value={verseText}
                    onChange={(e) => setVerseText(e.target.value)}
                    placeholder="Verse text..."
                    className="h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Author (Optional)</label>
                  <Input
                    value={verseAuthor}
                    onChange={(e) => setVerseAuthor(e.target.value)}
                    placeholder="e.g., Paul the Apostle"
                  />
                </div>
              </div>
            </Card>

            {/* Theme Selection */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">🎨 Theme</h3>
              <div className="grid grid-cols-2 gap-2">
                {CARD_THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedTheme(t.name)}
                    className={`p-2 rounded-lg text-xs font-medium transition ${
                      selectedTheme === t.name
                        ? 'ring-2 ring-indigo-500 ring-offset-2'
                        : 'border border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className={`h-8 rounded-md mb-1 ${t.bg}`}></div>
                    {t.name}
                  </button>
                ))}
              </div>
            </Card>

            {/* Size & Layout */}
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-3">📐 Size</h3>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_SIZES.map((s) => (
                      <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-semibold mb-3">📍 Layout</h3>
                <div className="grid grid-cols-3 gap-2">
                  {LAYOUT_OPTIONS.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setSelectedLayout(layout.id)}
                      className={`p-2 rounded-lg text-center text-xs font-medium transition ${
                        selectedLayout === layout.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="text-lg mb-1">{layout.icon}</div>
                      {layout.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeRef}
                    onChange={(e) => setIncludeRef(e.target.checked)}
                    className="rounded"
                  />
                  <span>Show verse reference</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBrand}
                    onChange={(e) => setIncludeBrand(e.target.checked)}
                    className="rounded"
                  />
                  <span>Show FaithLight branding</span>
                </label>
              </div>
            </Card>
          </div>

          {/* Center Column: Preview */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="font-semibold mb-4">✨ Preview</h3>
              {hasVerse ? (
                <div ref={cardRef} className="w-full">
                  {renderCard()}
                </div>
              ) : (
                <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-sm">Select a verse to see preview</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Share Actions */}
          <div className="lg:col-span-1 space-y-6">
            {hasVerse && (
              <>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">📤 Download & Share</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={handleDownload}
                      disabled={generating}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download Card
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleCopyText}
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </Button>

                    {navigator.share && (
                      <Button
                        onClick={handleNativeShare}
                        variant="outline"
                        className="w-full"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">🌐 Social Media</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={handleShareWhatsApp}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>

                    <Button
                      onClick={handleShareFacebook}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>

                    <Button
                      onClick={() => toast.info('Download card, then upload to Instagram or TikTok')}
                      className="w-full bg-pink-600 hover:bg-pink-700"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 bg-blue-50 border-blue-200">
                  <p className="text-xs text-gray-600">
                    <strong>💡 Tip:</strong> Download the card as PNG, then upload directly to Instagram, TikTok, or Facebook Stories for best results.
                  </p>
                </Card>
              </>
            )}

            {!hasVerse && (
              <Card className="p-6 bg-amber-50 border-amber-200">
                <p className="text-sm text-gray-600">
                  👆 Start by selecting a Bible verse. Search for it or paste the text manually.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}