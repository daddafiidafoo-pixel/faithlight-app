import React, { useRef, useState } from 'react';
import { X, Download, Share2, Copy, Check } from 'lucide-react';

const BACKGROUNDS = [
  { id: 'purple', style: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' },
  { id: 'sunset',  style: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' },
  { id: 'ocean',   style: 'linear-gradient(135deg, #0284C7 0%, #0F172A 100%)' },
  { id: 'forest',  style: 'linear-gradient(135deg, #16A34A 0%, #065F46 100%)' },
  { id: 'rose',    style: 'linear-gradient(135deg, #EC4899 0%, #7C3AED 100%)' },
  { id: 'night',   style: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' },
];

export default function VerseShareOverlay({ verse, reference, onClose }) {
  const cardRef = useRef(null);
  const [bg, setBg] = useState(BACKGROUNDS[0]);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareText = `"${verse}"\n— ${reference}\n\nShared from FaithLight`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) { handleCopy(); return; }
    setSharing(true);
    try {
      await navigator.share({ text: shareText });
    } catch {}
    setSharing(false);
  };

  const handleDownloadImage = async () => {
    // Use html-to-image if available, else fallback to text share
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${reference.replace(/\s/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      handleCopy();
    }
  };

  const handleShareImage = async () => {
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'verse.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
        return;
      }
    } catch {}
    handleNativeShare();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      {/* Close */}
      <button onClick={onClose} className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white">
        <X className="w-5 h-5" />
      </button>

      <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">Verse Card Preview</p>

      {/* Card */}
      <div ref={cardRef}
        className="w-80 aspect-square rounded-3xl flex flex-col items-center justify-center px-8 py-10 text-center shadow-2xl"
        style={{ background: bg.style }}>
        <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-5">FaithLight</p>
        <p className="text-white text-lg font-medium leading-7 mb-6" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          "{verse}"
        </p>
        <div className="w-12 h-px bg-white/40 mb-4" />
        <p className="text-white font-bold text-sm tracking-wide">{reference}</p>
      </div>

      {/* Background picker */}
      <div className="flex gap-3 mt-5">
        {BACKGROUNDS.map(b => (
          <button key={b.id} onClick={() => setBg(b)}
            className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shrink-0"
            style={{ background: b.style, borderColor: bg.id === b.id ? 'white' : 'transparent' }} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5 w-80">
        <button onClick={handleDownloadImage}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition">
          <Download className="w-4 h-4" /> Save
        </button>
        <button onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition">
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button onClick={handleShareImage} disabled={sharing}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-sm font-semibold transition"
          style={{ backgroundColor: '#7C3AED' }}>
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      {/* Social quick-share links */}
      <div className="flex gap-4 mt-4">
        {[
          { label: 'WhatsApp', color: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(shareText)}` },
          { label: 'Twitter/X', color: '#000', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}` },
          { label: 'Telegram', color: '#0088cc', href: `https://t.me/share/url?url=https://faithlight.app&text=${encodeURIComponent(shareText)}` },
        ].map(s => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 rounded-2xl text-white text-xs font-semibold"
            style={{ backgroundColor: s.color }}>
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}