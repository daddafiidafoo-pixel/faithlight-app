import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Image, Type, Palette, Share2, ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bibleBookNames';

const BACKGROUNDS = [
  { id: 'sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
  { id: 'ocean', label: 'Ocean', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)' },
  { id: 'forest', label: 'Forest', gradient: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)' },
  { id: 'gold', label: 'Gold', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  { id: 'night', label: 'Night', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' },
  { id: 'rose', label: 'Rose', gradient: 'linear-gradient(135deg, #e11d48 0%, #9333ea 100%)' },
  { id: 'dawn', label: 'Dawn', gradient: 'linear-gradient(135deg, #fde68a 0%, #f9a8d4 100%)' },
  { id: 'pure', label: 'Pure', gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' },
];

const FONTS = [
  { id: 'serif', label: 'Serif', family: 'Georgia, serif' },
  { id: 'sans', label: 'Sans', family: 'system-ui, sans-serif' },
  { id: 'italic', label: 'Italic', family: 'Georgia, serif', style: 'italic' },
];

const SIZES = [
  { id: 'sm', label: 'Small', fontSize: '18px', lineHeight: '1.7' },
  { id: 'md', label: 'Medium', fontSize: '22px', lineHeight: '1.65' },
  { id: 'lg', label: 'Large', fontSize: '26px', lineHeight: '1.6' },
];

const BOOK_API_MAP = {
  GEN:'genesis',EXO:'exodus',LEV:'leviticus',NUM:'numbers',DEU:'deuteronomy',
  JOS:'joshua',JDG:'judges',RUT:'ruth','1SA':'1+samuel','2SA':'2+samuel',
  '1KI':'1+kings','2KI':'2+kings',PSA:'psalms',PRO:'proverbs',ECC:'ecclesiastes',
  ISA:'isaiah',JER:'jeremiah',EZK:'ezekiel',DAN:'daniel',
  MAT:'matthew',MRK:'mark',LUK:'luke',JHN:'john',ACT:'acts',ROM:'romans',
  '1CO':'1+corinthians','2CO':'2+corinthians',GAL:'galatians',EPH:'ephesians',
  PHP:'philippians',COL:'colossians',HEB:'hebrews',JAS:'james',REV:'revelation',
};

const OT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'Kakuu Moofaa');
const NT_BOOKS = BIBLE_BOOKS.filter(b => b.testament === 'Kakuu Haaraa');

export default function VerseMediaGenerator() {
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[1]);
  const [textColor, setTextColor] = useState('white');
  const [verseText, setVerseText] = useState('For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.');
  const [reference, setReference] = useState('John 3:16');
  const [bookId, setBookId] = useState('JHN');
  const [chapter, setChapter] = useState(16);
  const [verseNum, setVerseNum] = useState(16);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState('style'); // 'verse' | 'style' | 'preview'
  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  const isDark = selectedBg.id === 'night' || (textColor === 'white');

  const fetchVerse = useCallback(async () => {
    const apiBook = BOOK_API_MAP[bookId] || bookId.toLowerCase();
    setLoadingVerse(true);
    try {
      const resp = await fetch(`https://bible-api.com/${apiBook}+${chapter}:${verseNum}?translation=kjv`);
      const json = await resp.json();
      if (json.verses?.length) {
        setVerseText(json.verses[0].text.trim());
        const bookName = BIBLE_BOOKS.find(b => b.book_id === bookId)?.name_en || bookId;
        setReference(`${bookName} ${chapter}:${verseNum}`);
      }
    } catch { /* keep existing */ }
    setLoadingVerse(false);
  }, [bookId, chapter, verseNum]);

  const handleExport = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `verse-${reference.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    }
    setExporting(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({ text: `${verseText}\n— ${reference}` }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${verseText}\n— ${reference}`);
    }
  };

  const textColorClass = textColor === 'white' ? '#ffffff' : textColor === 'dark' ? '#1e293b' : '#fef9c3';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">Verse Media</h1>
          <p className="text-xs text-gray-500">Create shareable Bible verse images</p>
        </div>
        <button onClick={handleShare} className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100">
          <Share2 className="w-5 h-5 text-purple-600" />
        </button>
        <button onClick={handleExport} disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold disabled:opacity-60">
          {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Save
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Live Preview */}
        <div
          ref={previewRef}
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: selectedBg.gradient,
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Decorative top accent */}
          <div style={{
            position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
            width: 40, height: 3, borderRadius: 2,
            backgroundColor: textColor === 'white' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.2)',
          }} />

          <p style={{
            fontFamily: selectedFont.family,
            fontStyle: selectedFont.style || 'normal',
            fontSize: selectedSize.fontSize,
            lineHeight: selectedSize.lineHeight,
            color: textColorClass,
            textAlign: 'center',
            textShadow: textColor === 'white' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            marginBottom: 24,
          }}>
            "{verseText}"
          </p>
          <p style={{
            fontFamily: selectedFont.family,
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: textColor === 'white' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)',
            textAlign: 'center',
          }}>
            — {reference}
          </p>

          {/* Bottom watermark */}
          <div style={{
            position: 'absolute', bottom: 16,
            fontSize: 11, letterSpacing: '0.1em', fontWeight: 600,
            color: textColor === 'white' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
          }}>
            FAITHLIGHT
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {[['verse', 'Verse'], ['style', 'Style']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'verse' && (
          <div className="space-y-4">
            {/* Book / Chapter / Verse pickers */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Verse</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Book</label>
                  <select value={bookId} onChange={e => setBookId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50">
                    <optgroup label="Old Testament">
                      {OT_BOOKS.map(b => <option key={b.book_id} value={b.book_id}>{b.name_en}</option>)}
                    </optgroup>
                    <optgroup label="New Testament">
                      {NT_BOOKS.map(b => <option key={b.book_id} value={b.book_id}>{b.name_en}</option>)}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Chapter</label>
                  <input type="number" min={1} max={150} value={chapter}
                    onChange={e => setChapter(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Verse</label>
                  <input type="number" min={1} max={200} value={verseNum}
                    onChange={e => setVerseNum(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50" />
                </div>
              </div>
              <button onClick={fetchVerse} disabled={loadingVerse}
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {loadingVerse ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Fetch Verse
              </button>
            </div>

            {/* Manual edit */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Or Edit Manually</p>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Verse Text</label>
                <textarea value={verseText} onChange={e => setVerseText(e.target.value)} rows={4}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Reference</label>
                <input value={reference} onChange={e => setReference(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50" />
              </div>
            </div>
          </div>
        )}

        {tab === 'style' && (
          <div className="space-y-4">
            {/* Background */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" /> Background
              </p>
              <div className="grid grid-cols-4 gap-2">
                {BACKGROUNDS.map(bg => (
                  <button key={bg.id} onClick={() => setSelectedBg(bg)}
                    className={`rounded-2xl h-16 transition-all ${selectedBg.id === bg.id ? 'ring-3 ring-purple-500 scale-95' : 'hover:scale-95'}`}
                    style={{ background: bg.gradient }}>
                    {selectedBg.id === bg.id && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                <Type className="w-3.5 h-3.5" /> Typography
              </p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {FONTS.map(f => (
                  <button key={f.id} onClick={() => setSelectedFont(f)}
                    className={`py-3 rounded-xl text-sm border-2 transition-all ${selectedFont.id === f.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}
                    style={{ fontFamily: f.family, fontStyle: f.style || 'normal' }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map(s => (
                  <button key={s.id} onClick={() => setSelectedSize(s)}
                    className={`py-3 rounded-xl text-sm border-2 transition-all ${selectedSize.id === s.id ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text color */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Text Color</p>
              <div className="grid grid-cols-3 gap-2">
                {[['white', 'White', '#ffffff', '#e5e7eb'], ['dark', 'Dark', '#1e293b', '#1e293b'], ['gold', 'Gold', '#fef9c3', '#fef9c3']].map(([id, label, color, bg]) => (
                  <button key={id} onClick={() => setTextColor(id)}
                    className={`py-3 rounded-xl text-sm border-2 transition-all ${textColor === id ? 'border-purple-500' : 'border-gray-200'}`}
                    style={{ backgroundColor: bg, color: id === 'white' ? '#374151' : '#fff' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}