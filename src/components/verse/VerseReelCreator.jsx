import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Download, Share2, Video, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CW = 540, CH = 960, FPS = 30;

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawFrame(ctx, t, verse) {
  t = Math.max(0, Math.min(t, 14.99));
  const cx = CW / 2, cy = CH / 2;

  // Background gradient per scene
  const grad = ctx.createLinearGradient(0, 0, 0, CH);
  if (t < 3) {
    grad.addColorStop(0, '#3D2A9E'); grad.addColorStop(1, '#6C5CE7');
  } else if (t < 10) {
    grad.addColorStop(0, '#5040C0'); grad.addColorStop(1, '#9E7CFF');
  } else if (t < 13) {
    grad.addColorStop(0, '#2A1A7A'); grad.addColorStop(1, '#5B45D4');
  } else {
    grad.addColorStop(0, '#0D0A2A'); grad.addColorStop(1, '#2D1F7A');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CW, CH);

  // Star particles
  for (let i = 0; i < 40; i++) {
    const sx = (i * 173.7 + t * 8) % CW;
    const sy = (i * 97.3) % CH;
    ctx.fillStyle = `rgba(255,255,255,${0.04 + (i % 4) * 0.03})`;
    ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Scene fade-in alpha
  let alpha = 1;
  if (t < 3) alpha = Math.min(1, t * 2);
  else if (t < 10) alpha = Math.min(1, (t - 3) * 2);
  else if (t < 13) alpha = Math.min(1, (t - 10) * 2);
  else alpha = Math.min(1, (t - 13) * 2);
  ctx.globalAlpha = alpha;

  if (t < 3) {
    // Scene 1 — Intro: Reference
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '500 34px system-ui, -apple-system, sans-serif';
    ctx.fillText("Today's Verse", cx, cy - 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
    ctx.fillText(verse?.reference || 'Philippians 4:13', cx, cy + 10);

  } else if (t < 10) {
    // Scene 2 — Verse text
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '500 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(verse?.reference || '', cx, 180);

    const vt = `"${verse?.verseText || 'I can do all things through Christ who strengthens me.'}"`;
    ctx.font = 'italic 38px Georgia, serif';
    const lines = wrapText(ctx, vt, CW - 80);
    const lh = 58;
    const sy = cy - (lines.length * lh) / 2;
    ctx.fillStyle = '#FFFFFF';
    lines.forEach((l, i) => ctx.fillText(l, cx, sy + i * lh));

  } else if (t < 13) {
    // Scene 3 — Reflection
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('R E F L E C T I O N', cx, cy - 160);

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 90, cy - 120);
    ctx.lineTo(cx + 90, cy - 120);
    ctx.stroke();

    const ref = verse?.explanation || 'God gives strength when we feel weak.';
    ctx.font = '400 32px system-ui, -apple-system, sans-serif';
    const rLines = wrapText(ctx, ref, CW - 100);
    const lh = 50;
    const sy = cy - (rLines.length * lh) / 2 + 20;
    ctx.fillStyle = '#FFFFFF';
    rLines.forEach((l, i) => ctx.fillText(l, cx, sy + i * lh));

  } else {
    // Scene 4 — Outro
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '500 30px system-ui, -apple-system, sans-serif';
    ctx.fillText('Study the Bible daily', cx, cy - 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 68px system-ui, -apple-system, sans-serif';
    ctx.fillText('FaithLight', cx, cy + 30);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '400 26px system-ui, -apple-system, sans-serif';
    ctx.fillText('faithlight.app', cx, cy + 100);
  }

  // Watermark
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = 'white';
  ctx.font = '400 18px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Made with FaithLight', CW - 20, CH - 24);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

export default function VerseReelCreator({ verse, onClose }) {
  const [status, setStatus] = useState('preview'); // preview | recording | done
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Preview animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const animStart = performance.now();

    const loop = (now) => {
      if (isRecordingRef.current) return;
      const t = ((now - animStart) / 1000) % 15;
      drawFrame(ctx, t, verse);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [verse]);

  const generateVideo = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!window.MediaRecorder) {
      setError('Video recording requires Chrome or Edge browser.');
      return;
    }

    const mimeType =
      MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' :
      MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' :
      MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : null;

    if (!mimeType) {
      setError('Video format not supported. Please use Chrome.');
      return;
    }

    isRecordingRef.current = true;
    cancelAnimationFrame(rafRef.current);
    setStatus('recording');
    setProgress(0);

    const stream = canvas.captureStream(FPS);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      setVideoUrl(URL.createObjectURL(blob));
      setStatus('done');
      isRecordingRef.current = false;
    };

    recorder.start(200);

    const ctx = canvas.getContext('2d');
    const recStart = performance.now();

    const animate = (now) => {
      const elapsed = (now - recStart) / 1000;
      drawFrame(ctx, Math.min(elapsed, 14.99), verse);
      setProgress(Math.min(elapsed / 15, 1));
      if (elapsed < 15) {
        requestAnimationFrame(animate);
      } else {
        recorder.stop();
      }
    };
    requestAnimationFrame(animate);
  }, [verse]);

  const handleDownload = () => {
    if (!videoUrl) return;
    const ext = videoUrl.includes('mp4') ? 'mp4' : 'webm';
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `faithlight-verse-reel.${ext}`;
    a.click();
  };

  const handleShare = async () => {
    if (!videoUrl) return;
    try {
      const resp = await fetch(videoUrl);
      const blob = await resp.blob();
      const file = new File([blob], 'faithlight-verse.webm', { type: blob.type });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Daily Bible Verse',
          text: `${verse?.reference} — Study with FaithLight`,
        });
        return;
      }
    } catch { /* fall through to download */ }
    handleDownload();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {/* Header */}
      <div style={{
        width: '100%', maxWidth: 430,
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 18, margin: 0 }}>🎬 Verse Reel</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: '2px 0 0' }}>
            15-second video · 9:16 · Ready for Reels
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Canvas Preview */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          style={{
            height: 'min(60vh, 390px)',
            width: 'auto',
            borderRadius: 16,
            boxShadow: '0 0 48px rgba(108,92,231,0.45)',
          }}
        />
      </div>

      {/* Scene labels */}
      {status === 'preview' && (
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {['Intro', 'Verse', 'Reflection', 'Outro'].map((label, i) => (
            <span key={label} style={{
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(108,92,231,0.3)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 11, fontWeight: 500,
            }}>{label}</span>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ width: '100%', maxWidth: 430, padding: '16px 20px 40px' }}>
        {error && (
          <p style={{ color: '#EF4444', textAlign: 'center', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        {status === 'preview' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={generateVideo}
            style={{
              width: '100%', height: 52, borderRadius: 14, border: 'none',
              background: 'linear-gradient(90deg, #6C5CE7, #9E7CFF)',
              color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Video size={20} /> Generate Video
          </motion.button>
        )}

        {status === 'recording' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', fontSize: 14 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Loader2 size={16} />
                </motion.div>
                Generating reel...
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                {Math.round(progress * 15)}s / 15s
              </span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                style={{
                  height: '100%', borderRadius: 4,
                  background: 'linear-gradient(90deg, #6C5CE7, #9E7CFF)',
                }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleShare}
              style={{
                flex: 1, height: 52, borderRadius: 14, border: 'none',
                background: 'linear-gradient(90deg, #6C5CE7, #9E7CFF)',
                color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Share2 size={18} /> Share to Reels
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDownload}
              style={{
                width: 52, height: 52, borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.08)',
                color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Download size={18} />
            </motion.button>
          </div>
        )}

        {status !== 'recording' && (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
            TikTok · Instagram Reels · YouTube Shorts · WhatsApp
          </p>
        )}
      </div>
    </div>
  );
}