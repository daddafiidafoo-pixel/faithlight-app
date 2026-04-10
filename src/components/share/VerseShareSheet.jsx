/**
 * VerseShareSheet
 * 
 * Bottom-sheet share flow with:
 * - Live card preview with theme picker
 * - Platform deep links: WhatsApp, Instagram, TikTok, Facebook, X
 * - One-tap native share (Web Share API)
 * - Download as PNG
 * - Copy text
 * 
 * Usage:
 *   <VerseShareSheet verse={verse} open={open} onClose={() => setOpen(false)} />
 */
import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES = [
  { id: 'royal',   bg: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',   label: 'Royal' },
  { id: 'sunrise', bg: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',   label: 'Sunrise' },
  { id: 'forest',  bg: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',   label: 'Forest' },
  { id: 'ocean',   bg: 'linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 100%)',   label: 'Ocean' },
  { id: 'night',   bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',   label: 'Night' },
  { id: 'rose',    bg: 'linear-gradient(135deg, #881337 0%, #f43f5e 100%)',   label: 'Rose' },
];

const PLATFORMS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    emoji: '💬',
    color: '#25D366',
    action: (text) => {
      const encoded = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    },
  },
  {
    id: 'instagram',
    label: 'Instagram',
    emoji: '📸',
    color: '#E1306C',
    action: async (text, getImage) => {
      // Instagram doesn't have a web share URL — download image first
      await getImage();
    },
    hint: 'Image saved — open Instagram and paste',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    emoji: '🎵',
    color: '#000000',
    action: (text) => {
      navigator.clipboard?.writeText(text);
    },
    hint: 'Text copied — paste in TikTok caption',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    emoji: '👍',
    color: '#1877F2',
    action: (text) => {
      const encoded = encodeURIComponent(text);
      window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encoded}&u=https://faithlight.app`, '_blank');
    },
  },
  {
    id: 'x',
    label: 'X / Twitter',
    emoji: '𝕏',
    color: '#000000',
    action: (text) => {
      const encoded = encodeURIComponent(text.slice(0, 260) + ' #FaithLight #Bible');
      window.open(`https://x.com/intent/tweet?text=${encoded}`, '_blank');
    },
  },
];

export default function VerseShareSheet({ verse, open, onClose }) {
  const cardRef = useRef(null);
  const [theme, setTheme] = useState(THEMES[0]);
  const [exporting, setExporting] = useState(false);
  const [hint, setHint] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) setHint('');
  }, [open]);

  if (!verse) return null;

  const shareText = `📖 ${verse.reference}\n\n"${verse.verseText}"\n\n✨ Shared from FaithLight · faithlight.app`;

  const getImage = async () => {
    if (!cardRef.current) return null;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      return dataUrl;
    } finally {
      setExporting(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await getImage();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `faithlight-${(verse.reference || 'verse').replace(/\s+/g, '-')}.png`;
    a.click();
    setHint('Image saved to your device!');
    setTimeout(() => setHint(''), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const dataUrl = await getImage();
        if (dataUrl) {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'faithlight-verse.png', { type: 'image/png' });
          await navigator.share({ files: [file], text: shareText });
          return;
        }
      } catch { /* fallthrough */ }
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard?.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePlatform = async (platform) => {
    if (platform.id === 'instagram') {
      await handleDownload();
      setHint(platform.hint);
    } else if (platform.id === 'tiktok') {
      platform.action(shareText);
      setHint(platform.hint);
      setTimeout(() => setHint(''), 3000);
    } else {
      platform.action(shareText, getImage);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, backdropFilter: 'blur(4px)' }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 51,
              background: '#F7F8FC', borderRadius: '24px 24px 0 0',
              maxHeight: '92vh', overflowY: 'auto',
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
            }}
          >
            {/* Handle + header */}
            <div style={{ position: 'sticky', top: 0, background: '#F7F8FC', padding: '12px 20px 0', zIndex: 1 }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: '#E5E7EB', margin: '0 auto 14px' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Share this Verse</p>
                <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: '#F3F4F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} color="#6B7280" />
                </button>
              </div>
            </div>

            <div style={{ padding: '0 20px' }}>
              {/* Card preview */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <div
                  ref={cardRef}
                  style={{
                    width: 300, borderRadius: 20, overflow: 'hidden',
                    background: theme.bg, padding: '28px 24px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
                  }}
                >
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px' }}>
                    Verse of the Day
                  </p>
                  <p style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>{verse.reference}</p>
                  <p style={{ color: 'white', fontSize: 15, fontStyle: 'italic', lineHeight: '24px', margin: '0 0 18px', fontFamily: 'Georgia, serif' }}>
                    "{verse.verseText}"
                  </p>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: 700 }}>✨ Made with FaithLight</span>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9 }}>faithlight.app</span>
                  </div>
                </div>
              </div>

              {/* Theme picker */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    style={{
                      width: 26, height: 26, borderRadius: '50%', background: t.bg, border: 'none', cursor: 'pointer',
                      outline: theme.id === t.id ? '2.5px solid #6C5CE7' : 'none',
                      outlineOffset: 2,
                      transform: theme.id === t.id ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>

              {/* Hint message */}
              <AnimatePresence>
                {hint && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: '#D1FAE5', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#065F46', fontWeight: 500, marginBottom: 12, textAlign: 'center' }}>
                    ✓ {hint}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Platform buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 14 }}>
                {PLATFORMS.map(p => (
                  <motion.button
                    key={p.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handlePlatform(p)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                      background: 'white', border: '1px solid #F3F4F6', borderRadius: 14,
                      padding: '10px 4px', cursor: 'pointer',
                      boxShadow: '0px 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{p.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280' }}>{p.label.split('/')[0].trim()}</span>
                  </motion.button>
                ))}
              </div>

              {/* Action row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleNativeShare}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '12px 6px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #6C5CE7, #8E7CFF)', cursor: 'pointer' }}>
                  <Share2 size={18} color="white" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>Share</span>
                </motion.button>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleDownload} disabled={exporting}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '12px 6px', borderRadius: 14, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer' }}>
                  <Download size={18} color="#374151" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{exporting ? '…' : 'Save'}</span>
                </motion.button>

                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCopyText}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '12px 6px', borderRadius: 14, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer' }}>
                  {copied ? <Check size={18} color="#059669" /> : <Copy size={18} color="#374151" />}
                  <span style={{ fontSize: 11, fontWeight: 700, color: copied ? '#059669' : '#374151' }}>{copied ? 'Copied!' : 'Copy'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}