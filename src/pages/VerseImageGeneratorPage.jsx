import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Share2, Heart, Copy } from 'lucide-react';
import html2canvas from 'html2canvas';

const FONTS = {
  elegant: 'font-serif text-4xl italic',
  bold: 'font-bold text-5xl',
  modern: 'font-sans text-4xl font-light tracking-wide',
  serif: 'font-serif text-3xl'
};

const BACKGROUNDS = {
  gradient_purple: 'bg-gradient-to-br from-purple-600 to-purple-900',
  gradient_blue: 'bg-gradient-to-br from-blue-400 to-blue-900',
  solid_navy: 'bg-slate-900',
  texture_wood: 'bg-yellow-900',
  nature_sunset: 'bg-gradient-to-br from-orange-400 via-red-500 to-purple-600'
};

export default function VerseImageGeneratorPage() {
  const [user, setUser] = useState(null);
  const [verses, setVerses] = useState([]);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [fontStyle, setFontStyle] = useState('elegant');
  const [background, setBackground] = useState('gradient_purple');
  const [filter, setFilter] = useState('none');
  const previewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    base44.auth.me()
      .then(u => {
        if (!isMounted) return;
        setUser(u);
        return base44.entities.VerseImage.filter({ user_email: u.email }, '-created_date', 20);
      })
      .then(verses => {
        if (isMounted) setVerses(verses);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputVerse = () => {
    const ref = prompt('Enter verse reference (e.g., John 3:16):');
    const text = prompt('Enter verse text:');
    if (ref && text) {
      setSelectedVerse({ verse_reference: ref, verse_text: text });
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `verse-${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error('Error downloading:', err);
    }
  };

  const handleSave = async () => {
    if (!user || !selectedVerse) return;
    try {
      const canvas = await html2canvas(previewRef.current);
      const imageUrl = canvas.toDataURL('image/png');
      await base44.entities.VerseImage.create({
        user_email: user.email,
        verse_reference: selectedVerse.verse_reference,
        verse_text: selectedVerse.verse_text,
        font_style: fontStyle,
        background_option: background,
        overlay_filter: filter,
        image_url: imageUrl,
        is_favorite: false
      });
      alert('Image saved!');
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Create Verse Images</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview */}
          <div>
            <div
              ref={previewRef}
              className={`${BACKGROUNDS[background]} ${
                filter === 'subtle_glow' ? 'shadow-2xl' : filter === 'soft_blur' ? 'blur-sm' : ''
              } rounded-lg p-12 h-80 flex flex-col items-center justify-center text-white`}
            >
              {selectedVerse ? (
                <>
                  <p className={`${FONTS[fontStyle]} text-center mb-6`}>{selectedVerse.verse_text}</p>
                  <p className="text-lg opacity-80">{selectedVerse.verse_reference}</p>
                </>
              ) : (
                <p className="text-center text-white/60">Select or enter a verse to preview</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <button
              onClick={handleInputVerse}
              className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Enter Verse
            </button>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Font Style</label>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {Object.keys(FONTS).map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Background</label>
              <select
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {Object.keys(BACKGROUNDS).map(b => (
                  <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Overlay Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {['none', 'subtle_glow', 'soft_blur', 'high_contrast'].map(f => (
                  <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                <Download className="w-5 h-5" /> Download
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-slate-700 hover:bg-slate-50"
              >
                <Heart className="w-5 h-5" /> Save
              </button>
            </div>
          </div>
        </div>

        {/* Saved Verses */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Saved Images</h2>
          {verses.length === 0 ? (
            <p className="text-slate-500">No saved images yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {verses.map(v => (
                <div key={v.id} className="rounded-lg overflow-hidden shadow hover:shadow-lg cursor-pointer">
                  <img src={v.image_url} alt={v.verse_reference} className="w-full h-40 object-cover" />
                  <p className="text-xs p-2 text-slate-600">{v.verse_reference}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}