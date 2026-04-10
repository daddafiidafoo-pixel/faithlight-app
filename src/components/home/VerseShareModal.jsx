import React, { useRef, useState } from 'react';
import { X, Download, Share2, Copy, Check } from 'lucide-react';
import { toPng } from 'html-to-image';

const GRADIENTS = [
  'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
  'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)',
  'linear-gradient(135deg, #00b894 0%, #55efc4 100%)',
  'linear-gradient(135deg, #e17055 0%, #fab1a0 100%)',
  'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
];

export default function VerseShareModal({ verse, onClose }) {
  const cardRef = useRef(null);
  const [gradientIndex, setGradientIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!verse) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      link.download = `faithlight-${verse.reference?.replace(/\s/g, '-') || 'verse'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    const text = `📖 ${verse.reference}\n\n"${verse.verseText}"\n\n✨ Made with FaithLight`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `FaithLight: ${verse.reference}`, text });
        return;
      } catch { /* fallthrough to clipboard */ }
    }
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyText = () => {
    const text = `📖 ${verse.reference}\n\n"${verse.verseText}"\n\n✨ Made with FaithLight`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>

        {/* Close */}
        <div className="flex justify-end">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SHAREABLE CARD */}
        <div
          ref={cardRef}
          className="rounded-3xl overflow-hidden"
          style={{ background: GRADIENTS[gradientIndex] }}
        >
          <div className="px-8 pt-10 pb-8 space-y-5">
            {/* Top label */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-sm">📖</span>
              </div>
              <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Verse of the Day</span>
            </div>

            {/* Reference */}
            <h2 className="text-white text-xl font-bold">{verse.reference}</h2>

            {/* Verse text */}
            <p className="text-white text-lg italic leading-relaxed font-light" style={{ fontFamily: 'Georgia, serif' }}>
              "{verse.verseText}"
            </p>

            {/* Reflection */}
            {verse.explanation && (
              <div className="bg-white/15 rounded-2xl px-4 py-3">
                <p className="text-white/80 text-xs leading-relaxed">{verse.explanation}</p>
              </div>
            )}

            {/* Branding */}
            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                  <span className="text-[10px]">✨</span>
                </div>
                <span className="text-white/90 text-xs font-bold">Made with FaithLight</span>
              </div>
              <span className="text-white/50 text-[10px]">faithlight.app</span>
            </div>
          </div>
        </div>

        {/* Gradient pickers */}
        <div className="flex justify-center gap-2">
          {GRADIENTS.map((g, i) => (
            <button
              key={i}
              onClick={() => setGradientIndex(i)}
              className={`w-7 h-7 rounded-full transition-all ${i === gradientIndex ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : 'opacity-70'}`}
              style={{ background: g }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/90 hover:bg-white transition-colors"
          >
            <Download className="w-5 h-5 text-gray-700" />
            <span className="text-xs font-bold text-gray-700">{downloading ? '…' : 'Save Image'}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #8E7CFF 100%)' }}
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs font-bold">Share</span>
          </button>
          <button
            onClick={handleCopyText}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white/90 hover:bg-white transition-colors"
          >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-700" />}
            <span className={`text-xs font-bold ${copied ? 'text-green-600' : 'text-gray-700'}`}>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}