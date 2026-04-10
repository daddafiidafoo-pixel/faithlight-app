import React, { useState, useRef } from 'react';
import { Download, Copy, Check, Zap } from 'lucide-react';
import html2canvas from 'html2canvas';

const BACKGROUNDS = [
  { id: 'gradient1', name: 'Violet Dream', class: 'bg-gradient-to-br from-violet-600 to-indigo-800' },
  { id: 'gradient2', name: 'Ocean Blue', class: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
  { id: 'gradient3', name: 'Sunset', class: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-700' },
  { id: 'gradient4', name: 'Forest', class: 'bg-gradient-to-br from-green-600 to-emerald-800' },
  { id: 'gradient5', name: 'Gold', class: 'bg-gradient-to-br from-amber-500 to-yellow-700' },
  { id: 'solid', name: 'Dark', class: 'bg-gray-900' },
];

export default function VerseShareImage({ verse, reference, onClose }) {
  const [selectedBg, setSelectedBg] = useState('gradient1');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  const bg = BACKGROUNDS.find(b => b.id === selectedBg);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `verse-${reference.replace(/[:\s]/g, '-')}.png`;
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      canvas.toBlob(blob => {
        navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Share This Verse</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Preview</p>
            <div
              ref={cardRef}
              className={`${bg.class} rounded-2xl p-8 text-white flex flex-col items-center justify-center min-h-96 shadow-xl`}
            >
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-6">Bible Verse</p>
              <p className="text-2xl font-bold leading-relaxed text-center mb-6">"{verse}"</p>
              <p className="text-sm font-semibold opacity-80">{reference}</p>
              <p className="text-xs opacity-60 mt-6">From FaithLight</p>
            </div>
          </div>

          {/* Background selector */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Choose Background</p>
            <div className="grid grid-cols-3 gap-2">
              {BACKGROUNDS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBg(b.id)}
                  className={`relative rounded-lg overflow-hidden h-16 border-2 transition-all ${
                    selectedBg === b.id ? 'border-violet-600 ring-2 ring-violet-300' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-full h-full ${b.class}`} />
                  {selectedBg === b.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                  <p className="absolute bottom-0 left-0 right-0 text-xs font-bold text-white bg-black/40 px-1 py-0.5 text-center">
                    {b.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              <Download size={16} /> Download
            </button>
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 border-2 font-semibold py-3 rounded-xl transition-all ${
                copied
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">Perfect for sharing on social media or messaging</p>
        </div>
      </div>
    </div>
  );
}