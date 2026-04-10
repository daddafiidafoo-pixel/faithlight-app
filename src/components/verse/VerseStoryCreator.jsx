import React, { useState, useRef } from 'react';
import { Download, Share2, MessageCircle, X, ChevronLeft, ChevronRight, Video } from 'lucide-react';

const THEMES = [
  {
    id: 'royal',
    label: 'Royal Night',
    bg: 'linear-gradient(160deg, #1a0533 0%, #3d1278 50%, #6C5CE7 100%)',
    textColor: '#FFFFFF',
    refColor: 'rgba(255,255,255,0.65)',
    accent: '#d4b8ff',
    brandColor: 'rgba(255,255,255,0.4)',
    stars: true,
  },
  {
    id: 'golden',
    label: 'Golden Dawn',
    bg: 'linear-gradient(160deg, #1a0a00 0%, #7a3a00 50%, #f4b400 100%)',
    textColor: '#FFFFFF',
    refColor: 'rgba(255,255,255,0.7)',
    accent: '#ffe08a',
    brandColor: 'rgba(255,255,255,0.4)',
    stars: false,
  },
  {
    id: 'ocean',
    label: 'Deep Ocean',
    bg: 'linear-gradient(160deg, #001a2e 0%, #003d5c 50%, #0284C7 100%)',
    textColor: '#FFFFFF',
    refColor: 'rgba(255,255,255,0.65)',
    accent: '#7dd3fc',
    brandColor: 'rgba(255,255,255,0.4)',
    stars: true,
  },
  {
    id: 'forest',
    label: 'Sacred Forest',
    bg: 'linear-gradient(160deg, #0a1f0a 0%, #1a4d1a 50%, #22c55e 100%)',
    textColor: '#FFFFFF',
    refColor: 'rgba(255,255,255,0.65)',
    accent: '#86efac',
    brandColor: 'rgba(255,255,255,0.4)',
    stars: false,
  },
  {
    id: 'rose',
    label: 'Sunrise Rose',
    bg: 'linear-gradient(160deg, #2d0014 0%, #7a0035 50%, #ec4899 100%)',
    textColor: '#FFFFFF',
    refColor: 'rgba(255,255,255,0.65)',
    accent: '#fbcfe8',
    brandColor: 'rgba(255,255,255,0.4)',
    stars: false,
  },
];

const QUICK_VERSES = [
  { ref: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.' },
  { ref: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me.' },
  { ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd; I shall not want.' },
  { ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { ref: 'Matthew 6:34', text: 'Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
];

const CATEGORIES = ['Hope', 'Strength', 'Peace', 'Faith', 'Prayer', 'Encouragement'];

function StoryCard({ verse, reference, theme, cardRef }) {
  const t = theme;
  return (
    <div
      ref={cardRef}
      style={{
        width: 360,
        height: 640,
        background: t.bg,
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 36px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Star dots for certain themes */}
      {t.stars && [
        [30, 60], [80, 140], [310, 90], [280, 200], [60, 300], [320, 380], [90, 500], [260, 520],
      ].map(([x, y], i) => (
        <div key={i} style={{
          position: 'absolute', left: x, top: y,
          width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
          borderRadius: '50%', background: 'rgba(255,255,255,0.5)',
        }} />
      ))}

      {/* Top cross/brand mark */}
      <div style={{
        position: 'absolute', top: 28, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 22, opacity: 0.7 }}>✝</span>
      </div>

      {/* Decorative line top */}
      <div style={{
        width: 48, height: 2,
        background: t.accent,
        borderRadius: 2,
        marginBottom: 32,
        opacity: 0.8,
      }} />

      {/* Verse text */}
      <p style={{
        color: t.textColor,
        fontSize: verse.length > 160 ? 18 : verse.length > 100 ? 20 : 22,
        fontStyle: 'italic',
        fontFamily: 'Georgia, serif',
        lineHeight: 1.65,
        textAlign: 'center',
        margin: 0,
        letterSpacing: 0.2,
      }}>
        "{verse}"
      </p>

      {/* Decorative line bottom */}
      <div style={{
        width: 48, height: 2,
        background: t.accent,
        borderRadius: 2,
        marginTop: 28,
        marginBottom: 16,
        opacity: 0.8,
      }} />

      {/* Reference */}
      <p style={{
        color: t.refColor,
        fontSize: 15,
        fontWeight: 600,
        fontFamily: 'system-ui, sans-serif',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        margin: 0,
        textAlign: 'center',
      }}>
        {reference}
      </p>

      {/* Brand watermark */}
      <div style={{
        position: 'absolute', bottom: 20, right: 0, left: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}>
        <p style={{ color: t.brandColor, fontSize: 11, fontWeight: 700, margin: 0, letterSpacing: 1 }}>
          FAITHLIGHT
        </p>
        <p style={{ color: t.brandColor, fontSize: 10, margin: 0, opacity: 0.7 }}>
          faithlight.app
        </p>
      </div>
    </div>
  );
}

export default function VerseStoryCreator({ initialVerse, initialRef, onClose }) {
  const [themeIdx, setThemeIdx] = useState(0);
  const [verse, setVerse] = useState(initialVerse || QUICK_VERSES[0].text);
  const [reference, setReference] = useState(initialRef || QUICK_VERSES[0].ref);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef(null);
  const theme = THEMES[themeIdx];

  const captureCard = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    return canvas;
  };

  const handleDownload = async () => {
    setSharing(true);
    try {
      const canvas = await captureCard();
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'faithlight-verse-story.png';
      a.click();
    } catch {}
    setSharing(false);
  };

  const handleShare = async (platform) => {
    setSharing(true);
    try {
      const canvas = await captureCard();
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'faithlight-verse.png', { type: 'image/png' });
        const shareText = `"${verse}"\n— ${reference}\n\nStudy the Bible daily with FaithLight 📖\nfaithlight.app`;

        if (platform === 'whatsapp') {
          // Download + open WhatsApp
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'faithlight-verse.png';
          a.click();
          setTimeout(() => {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
          }, 500);
        } else if (platform === 'native') {
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Bible Verse', text: shareText });
          } else if (navigator.share) {
            await navigator.share({ title: 'Bible Verse', text: shareText });
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'faithlight-verse.png';
            a.click();
          }
        }
      }, 'image/png');
    } catch {}
    setSharing(false);
  };

  const pickQuickVerse = (v) => {
    setVerse(v.text);
    setReference(v.ref);
  };

  return (
    <div className="space-y-5">
      {/* Theme picker */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {THEMES.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setThemeIdx(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              themeIdx === i
                ? 'border-[#6C5CE7] bg-[#6C5CE7] text-white'
                : 'border-[#E0E4E9] bg-white text-gray-600 hover:border-[#6C5CE7]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Card preview */}
      <div className="flex justify-center overflow-hidden rounded-2xl" style={{ maxHeight: 420 }}>
        <div style={{ transform: 'scale(0.65)', transformOrigin: 'top center', marginBottom: -225 }}>
          <StoryCard verse={verse} reference={reference} theme={theme} cardRef={cardRef} />
        </div>
      </div>

      {/* Quick verses */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Pick a Verse</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_VERSES.map((v) => (
            <button
              key={v.ref}
              onClick={() => pickQuickVerse(v)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                reference === v.ref
                  ? 'bg-[#6C5CE7] text-white border-[#6C5CE7]'
                  : 'bg-white text-gray-700 border-[#E0E4E9] hover:border-[#6C5CE7]'
              }`}
            >
              {v.ref}
            </button>
          ))}
        </div>
      </div>

      {/* Custom verse input */}
      <div className="space-y-2">
        <input
          value={reference}
          onChange={e => setReference(e.target.value)}
          placeholder="Reference (e.g. John 3:16)"
          className="w-full px-3 py-2.5 rounded-xl border border-[#E0E4E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] bg-white"
        />
        <textarea
          value={verse}
          onChange={e => setVerse(e.target.value)}
          rows={3}
          placeholder="Verse text..."
          className="w-full px-3 py-2.5 rounded-xl border border-[#E0E4E9] text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] bg-white resize-none"
        />
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleShare('whatsapp')}
          disabled={sharing}
          className="flex flex-col items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-2xl py-3.5 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="text-white text-xs font-bold">WhatsApp</span>
        </button>
        <button
          onClick={() => handleShare('native')}
          disabled={sharing}
          className="flex flex-col items-center gap-1.5 bg-[#6C5CE7] hover:bg-[#5B4BD6] disabled:opacity-50 rounded-2xl py-3.5 transition-colors"
        >
          <Share2 className="w-5 h-5 text-white" />
          <span className="text-white text-xs font-bold">Share</span>
        </button>
        <button
          onClick={handleDownload}
          disabled={sharing}
          className="flex flex-col items-center gap-1.5 bg-gray-700 hover:bg-gray-800 disabled:opacity-50 rounded-2xl py-3.5 transition-colors"
        >
          <Download className="w-5 h-5 text-white" />
          <span className="text-white text-xs font-bold">Save</span>
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        Perfect for Instagram Stories · WhatsApp Status · Facebook
      </p>
    </div>
  );
}