import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2 } from 'lucide-react';

const templates = {
  minimalist: {
    name: 'Minimalist',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    padding: '60px 40px',
  },
  sunset: {
    name: 'Sunset',
    bg: 'linear-gradient(180deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
    textColor: '#ffffff',
    padding: '60px 40px',
  },
  ocean: {
    name: 'Ocean',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%, #0099cc 100%)',
    textColor: '#ffffff',
    padding: '60px 40px',
  },
  forest: {
    name: 'Forest',
    bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    textColor: '#ffffff',
    padding: '60px 40px',
  },
  gold: {
    name: 'Gold',
    bg: 'linear-gradient(135deg, #2c1810 0%, #d4af37 50%, #2c1810 100%)',
    textColor: '#ffffff',
    padding: '60px 40px',
  },
  pastel: {
    name: 'Pastel',
    bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    textColor: '#4a3728',
    padding: '60px 40px',
  },
  dark: {
    name: 'Dark',
    bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    textColor: '#ffffff',
    padding: '60px 40px',
  },
  marble: {
    name: 'Marble',
    bg: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 50%, #d0d0d0 100%)',
    textColor: '#333333',
    padding: '60px 40px',
  },
};

export default function VerseTemplatePreview({ verse, reference, template = 'minimalist', onDownload, onShare }) {
  const previewRef = useRef(null);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `verse-${reference.replace(/:/g, '-')}.png`;
      link.click();
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (navigator.share && navigator.canShare({ files: [new File([blob], `verse.png`, { type: 'image/png' })] })) {
          navigator.share({
            files: [new File([blob], `verse.png`, { type: 'image/png' })],
            title: `Bible Verse: ${reference}`,
          });
        } else if (onShare) {
          onShare(canvas.toDataURL('image/png'));
        }
      });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  const templateStyle = templates[template];

  return (
    <div className="flex flex-col gap-4">
      {/* Preview */}
      <div
        ref={previewRef}
        className="w-full rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center"
        style={{
          background: templateStyle.bg,
          padding: templateStyle.padding,
          color: templateStyle.textColor,
          textAlign: 'center',
        }}
      >
        <div className="max-w-md">
          <p
            className="text-2xl md:text-3xl font-serif mb-6 leading-relaxed"
            style={{ color: templateStyle.textColor }}
          >
            "{verse}"
          </p>
          <p
            className="text-lg md:text-xl font-medium"
            style={{ color: templateStyle.textColor, opacity: 0.9 }}
          >
            — {reference}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Download className="w-5 h-5" />
          Download
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>
    </div>
  );
}

export { templates };