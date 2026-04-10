import React, { useRef, useState } from 'react';
import { Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function SermonImageGenerator({ sermon }) {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!cardRef.current || !sermon) return;
    setLoading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
      });

      // Download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${sermon.title || 'sermon'}-share.png`;
      link.click();

      // Or share if available
      if (navigator.share) {
        const blob = await fetch(dataUrl).then((r) => r.blob());
        const file = new File([blob], `${sermon.title}.png`, { type: 'image/png' });
        navigator.share({
          title: sermon.title || 'Sermon',
          text: sermon.keyVerse || 'Check out this sermon',
          files: [file],
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Image generation error:', err);
      alert('Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview Card */}
      <div
        ref={cardRef}
        className="w-full max-w-sm mx-auto aspect-square rounded-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1f4d 0%, #2d1b69 100%)',
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12 text-white text-center">
          {/* Title */}
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            {sermon.title || 'Sermon Title'}
          </h2>

          {/* Key Verse */}
          {sermon.keyVerse && (
            <p className="text-lg font-semibold mb-8 italic opacity-90">
              "{sermon.keyVerse}"
            </p>
          )}

          {/* Short Message */}
          {sermon.shortMessage && (
            <p className="text-base mb-12 leading-relaxed opacity-85">
              {sermon.shortMessage}
            </p>
          )}

          {/* Branding */}
          <div className="mt-auto pt-8">
            <p className="text-2xl font-bold">FaithLight ✨</p>
            <p className="text-sm opacity-70">faithlight.app</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={generateImage}
        disabled={loading || !sermon}
        className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all"
        aria-label="Generate and share sermon image"
      >
        <Share2 size={18} />
        {loading ? 'Generating...' : 'Share Image'}
      </button>
    </div>
  );
}