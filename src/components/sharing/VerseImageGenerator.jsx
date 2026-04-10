import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share2, Check } from 'lucide-react';

const BACKGROUNDS = [
  {
    id: 'dawn',
    label: 'Dawn',
    style: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
    textColor: '#FFFFFF',
    refColor: '#FCD34D',
    subColor: '#C7D2FE',
    watermark: '#818CF8',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    style: 'linear-gradient(135deg, #7C2D12 0%, #B45309 50%, #D97706 100%)',
    textColor: '#FFF7ED',
    refColor: '#FDE68A',
    subColor: '#FED7AA',
    watermark: '#F97316',
  },
  {
    id: 'forest',
    label: 'Forest',
    style: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
    textColor: '#F0FDF4',
    refColor: '#6EE7B7',
    subColor: '#A7F3D0',
    watermark: '#34D399',
  },
  {
    id: 'sky',
    label: 'Sky',
    style: 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 50%, #0284C7 100%)',
    textColor: '#F0F9FF',
    refColor: '#7DD3FC',
    subColor: '#BAE6FD',
    watermark: '#38BDF8',
  },
  {
    id: 'rose',
    label: 'Rose',
    style: 'linear-gradient(135deg, #881337 0%, #BE123C 50%, #E11D48 100%)',
    textColor: '#FFF1F2',
    refColor: '#FDA4AF',
    subColor: '#FECDD3',
    watermark: '#FB7185',
  },
  {
    id: 'stone',
    label: 'Stone',
    style: 'linear-gradient(135deg, #1C1917 0%, #292524 50%, #44403C 100%)',
    textColor: '#FAFAF9',
    refColor: '#D6D3D1',
    subColor: '#A8A29E',
    watermark: '#78716C',
  },
];

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length;
}

export default function VerseImageGenerator({ verse, onClose }) {
  const canvasRef = useRef(null);
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    drawCard();
  }, [selectedBg, verse]);

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    // Parse gradient stops from CSS string
    const stops = selectedBg.style.match(/#[0-9A-Fa-f]{6}/g) || ['#1E1B4B', '#312E81', '#4338CA'];
    grad.addColorStop(0, stops[0]);
    grad.addColorStop(0.5, stops[1] || stops[0]);
    grad.addColorStop(1, stops[2] || stops[1] || stops[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative top-left arc
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(-80, -80, 380, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();

    // Decorative bottom-right arc
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.beginPath();
    ctx.arc(W + 80, H + 80, 340, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();

    // Top accent bar
    ctx.fillStyle = selectedBg.refColor;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(90, 100, 8, 60);
    ctx.globalAlpha = 1;

    // "VERSE OF THE DAY" label
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = selectedBg.refColor;
    ctx.letterSpacing = '4px';
    ctx.fillText('VERSE OF THE DAY', 120, 141);

    // Opening quote mark
    ctx.font = 'bold 180px Georgia';
    ctx.fillStyle = selectedBg.textColor;
    ctx.globalAlpha = 0.12;
    ctx.fillText('\u201C', 60, 340);
    ctx.globalAlpha = 1;

    // Verse text
    ctx.font = '500 54px Georgia';
    ctx.fillStyle = selectedBg.textColor;
    ctx.globalAlpha = 0.96;
    const padding = 90;
    const maxW = W - padding * 2;
    const lineH = 76;
    const lines = wrapText(ctx, `\u201C${verse.text}\u201D`, padding, 290, maxW, lineH);
    ctx.globalAlpha = 1;

    // Reference
    const refY = 290 + lines * lineH + 60;
    ctx.font = 'bold 44px Arial';
    ctx.fillStyle = selectedBg.refColor;
    ctx.fillText(`\u2014 ${verse.ref}`, padding, refY);

    // Divider line
    const divY = refY + 60;
    ctx.strokeStyle = selectedBg.subColor;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, divY);
    ctx.lineTo(W - padding, divY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Watermark
    ctx.font = '500 30px Arial';
    ctx.fillStyle = selectedBg.watermark;
    ctx.globalAlpha = 0.65;
    ctx.fillText('FaithLight', padding, divY + 50);
    ctx.globalAlpha = 1;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `faithlight-${verse.ref.replace(/[\s:]/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `faithlight-${verse.ref}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${verse.ref} — FaithLight`,
          text: `"${verse.text}" — ${verse.ref}\n\nShared via FaithLight`,
          files: [file],
        });
      } else {
        // Fallback: copy text to clipboard
        await navigator.clipboard.writeText(`"${verse.text}" — ${verse.ref}\n\nFaithLight`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-gray-900">Share Verse</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Canvas preview — displayed at 100% width, internally 1080×1080 */}
          <div className="rounded-xl overflow-hidden shadow-md border border-gray-100">
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* Background selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Style</p>
            <div className="grid grid-cols-6 gap-2">
              {BACKGROUNDS.map(bg => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg)}
                  title={bg.label}
                  style={{ background: bg.style }}
                  className={`h-9 rounded-lg border-2 transition-all ${
                    selectedBg.id === bg.id ? 'border-gray-800 scale-105 shadow-md' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleDownload} className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button onClick={handleNativeShare} variant="outline" className="flex-1 gap-2">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share'}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-400">
            Download and share to Instagram, WhatsApp, Facebook, or anywhere
          </p>
        </div>
      </div>
    </div>
  );
}