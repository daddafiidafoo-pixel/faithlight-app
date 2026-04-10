import React, { useState, useRef } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

const THEMES = [
  { id: 'purple', bg: 'from-purple-600 to-indigo-600', name: 'Purple' },
  { id: 'blue', bg: 'from-blue-600 to-cyan-600', name: 'Blue' },
  { id: 'green', bg: 'from-green-600 to-emerald-600', name: 'Green' },
  { id: 'rose', bg: 'from-rose-600 to-pink-600', name: 'Rose' },
  { id: 'orange', bg: 'from-orange-500 to-red-600', name: 'Orange' },
];

export default function VerseCardGenerator({ verseReference, verseText, onClose }) {
  const [theme, setTheme] = useState('purple');
  const cardRef = useRef(null);

  const currentTheme = THEMES.find(t => t.id === theme);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${verseReference.replace(/ /g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold">Verse Card</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Preview */}
          <div className="mb-6 flex justify-center">
            <div
              ref={cardRef}
              className={`bg-gradient-to-br ${currentTheme.bg} text-white p-12 rounded-lg w-full max-w-md aspect-square flex flex-col justify-center items-center text-center`}
            >
              <div className="mb-6">
                <p className="text-4xl mb-4">✨</p>
                <p className="text-sm font-semibold opacity-90 mb-6">{verseReference}</p>
                <p className="text-lg leading-relaxed mb-8 font-light">"{verseText}"</p>
                <p className="text-xs opacity-80">FaithLight</p>
              </div>
            </div>
          </div>

          {/* Theme selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">Theme</label>
            <div className="grid grid-cols-5 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    theme === t.id
                      ? 'border-indigo-600'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                  title={t.name}
                >
                  <div className={`h-12 w-full rounded bg-gradient-to-br ${t.bg}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              <Download className="w-4 h-4" />
              Download Image
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}