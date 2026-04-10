/**
 * CardCanvas — renders a shareable card and handles download + share.
 * Wrap any card design inside this component.
 */
import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CardCanvas({ children, filename = 'faithlight-card' }) {
  const ref = useRef(null);
  const [exporting, setExporting] = useState(false);

  const capture = async () => {
    if (!ref.current) return null;
    return toPng(ref.current, { cacheBust: true, pixelRatio: 2 });
  };

  const handleDownload = async () => {
    setExporting(true);
    try {
      const dataUrl = await capture();
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Card downloaded!');
    } catch { toast.error('Export failed'); }
    setExporting(false);
  };

  const handleShare = async () => {
    setExporting(true);
    try {
      const dataUrl = await capture();
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${filename}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'FaithLight Card' });
        toast.success('Shared!');
      } else {
        // Fallback: download
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('Downloaded (share not supported on this device)');
      }
    } catch (e) { if (e.name !== 'AbortError') toast.error('Share failed'); }
    setExporting(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Card */}
      <div ref={ref} className="w-full max-w-sm">
        {children}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
            onClick={handleDownload}
            disabled={exporting}
            aria-label="Download card as PNG image"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6C5CE7] text-white text-sm font-semibold shadow hover:bg-[#5B4BD6] disabled:opacity-60 transition-colors"
          >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download
        </button>
        <button
          onClick={handleShare}
          disabled={exporting}
          aria-label="Share card to device or save"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E0E4E9] text-[#1F2937] text-sm font-semibold shadow hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
          Share
        </button>
      </div>
    </div>
  );
}