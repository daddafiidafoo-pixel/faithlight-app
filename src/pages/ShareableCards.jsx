import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Download, Share2, ChevronLeft, ChevronRight, RefreshCw, BookMarked, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const TEMPLATES = [
  {
    id: 'sunrise',
    name: 'Sunrise',
    bg: 'linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #fde68a 100%)',
    textColor: '#7c2d12',
    subColor: '#92400e',
    font: '"Georgia", serif',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
    textColor: '#e0e7ff',
    subColor: '#a5b4fc',
    font: '"Georgia", serif',
  },
  {
    id: 'meadow',
    name: 'Meadow',
    bg: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 50%, #34d399 100%)',
    textColor: '#064e3b',
    subColor: '#065f46',
    font: '"Arial", sans-serif',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    bg: 'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 50%, #8b5cf6 100%)',
    textColor: '#3b0764',
    subColor: '#4c1d95',
    font: '"Georgia", serif',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    bg: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0c4a6e 100%)',
    textColor: '#e0f2fe',
    subColor: '#bae6fd',
    font: '"Arial", sans-serif',
  },
  {
    id: 'rose',
    name: 'Rose Gold',
    bg: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 40%, #f9a8d4 100%)',
    textColor: '#831843',
    subColor: '#9d174d',
    font: '"Georgia", serif',
  },
  {
    id: 'parchment',
    name: 'Parchment',
    bg: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 50%, #fde047 100%)',
    textColor: '#713f12',
    subColor: '#92400e',
    font: '"Georgia", serif',
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
    textColor: '#dcfce7',
    subColor: '#86efac',
    font: '"Arial", sans-serif',
  },
];

function CardCanvas({ template, text, reference, type }) {
  const canvasRef = useRef(null);

  const wrapText = (ctx, str, x, y, maxWidth, lineHeight) => {
    const words = str.split(' ');
    let line = '';
    const lines = [];
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxWidth && line !== '') {
        lines.push(line.trim());
        line = word + ' ';
      } else {
        line = test;
      }
    }
    if (line.trim()) lines.push(line.trim());
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
    return lines.length;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    const stops = template.bg.match(/#[a-f0-9]{6}/gi) || ['#6366f1', '#8b5cf6'];
    stops.forEach((s, i) => grad.addColorStop(i / Math.max(stops.length - 1, 1), s));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(W * 0.85, H * 0.15, 220, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.1, H * 0.85, 160, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // FaithLight brand
    ctx.font = `bold 32px ${template.font}`;
    ctx.fillStyle = template.subColor;
    ctx.globalAlpha = 0.7;
    ctx.textAlign = 'center';
    ctx.fillText('✦ FaithLight ✦', W / 2, 80);
    ctx.globalAlpha = 1;

    // Type label
    if (type === 'journal') {
      ctx.font = `italic 28px ${template.font}`;
      ctx.fillStyle = template.subColor;
      ctx.textAlign = 'center';
      ctx.fillText('~ Prayer Journal ~', W / 2, 130);
    }

    // Decorative top line
    ctx.strokeStyle = template.subColor;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, type === 'journal' ? 155 : 105);
    ctx.lineTo(W - 120, type === 'journal' ? 155 : 105);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Opening quote mark
    ctx.font = `bold 160px ${template.font}`;
    ctx.fillStyle = template.subColor;
    ctx.globalAlpha = 0.15;
    ctx.textAlign = 'left';
    ctx.fillText('"', 80, 340);
    ctx.globalAlpha = 1;

    // Main text
    const startY = type === 'journal' ? 230 : 200;
    ctx.font = `italic ${text.length > 200 ? '36' : text.length > 120 ? '42' : '50'}px ${template.font}`;
    ctx.fillStyle = template.textColor;
    ctx.textAlign = 'center';
    wrapText(ctx, `"${text}"`, W / 2, startY, W - 200, text.length > 120 ? 58 : 68);

    // Bottom divider
    ctx.strokeStyle = template.subColor;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, H - 180);
    ctx.lineTo(W - 120, H - 180);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Reference
    if (reference) {
      ctx.font = `bold 38px ${template.font}`;
      ctx.fillStyle = template.subColor;
      ctx.textAlign = 'center';
      ctx.fillText(`— ${reference}`, W / 2, H - 130);
    }

    // Bottom tag
    ctx.font = `24px ${template.font}`;
    ctx.fillStyle = template.textColor;
    ctx.globalAlpha = 0.5;
    ctx.textAlign = 'center';
    ctx.fillText('#FaithLight #ScriptureCards', W / 2, H - 60);
    ctx.globalAlpha = 1;
  }, [template, text, reference]);

  return <canvas ref={canvasRef} className="w-full rounded-2xl shadow-2xl" style={{ maxHeight: 400, objectFit: 'contain' }} />;
}

export default function ShareableCards() {
  const [tab, setTab] = useState('verse');
  const [user, setUser] = useState(null);
  const [verses, setVerses] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [templateIdx, setTemplateIdx] = useState(0);
  const [customText, setCustomText] = useState('');
  const [customRef, setCustomRef] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
          const [v, j] = await Promise.all([
            base44.entities.SavedVerse.filter({ user_id: u.id }, '-created_date', 20).catch(() => []),
            base44.entities.JournalEntry.filter({ user_id: u.id }, '-created_date', 20).catch(() => []),
          ]);
          setVerses(v || []);
          setJournals(j || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const currentTemplate = TEMPLATES[templateIdx];

  const getCardContent = () => {
    if (tab === 'custom') return { text: customText, reference: customRef, type: 'verse' };
    if (tab === 'verse') {
      const item = verses[selectedIdx];
      return item ? { text: item.verse_text || item.text || item.content || '', reference: item.verse_reference || item.reference || '', type: 'verse' } : null;
    }
    if (tab === 'journal') {
      const item = journals[selectedIdx];
      return item ? { text: item.content || '', reference: item.related_verse || item.entry_date || '', type: 'journal' } : null;
    }
    return null;
  };

  const cardContent = getCardContent();

  const downloadCard = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `faithlight-card-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Card downloaded!');
  };

  const shareCard = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (navigator.share) {
          const file = new File([blob], 'faithlight-card.png', { type: 'image/png' });
          await navigator.share({ title: 'FaithLight — Scripture Card', files: [file] });
        } else {
          downloadCard();
          toast.info('Sharing not supported — card downloaded instead.');
        }
      });
    } catch (e) { downloadCard(); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-5">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Share2 className="w-6 h-6" /> Shareable Faith Cards
        </h1>
        <p className="text-purple-100 text-sm mt-1">Turn your verses & journal entries into beautiful shareable cards</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Source Tabs */}
        <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelectedIdx(0); }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verse">Saved Verses</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="verse" className="mt-3">
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-purple-500" /></div>
            ) : !user ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <BookMarked className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                Sign in to use your saved verses
              </div>
            ) : verses.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <BookMarked className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                No saved verses yet. Save verses from the Bible reader first.
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedIdx(i => Math.max(0, i - 1))} disabled={selectedIdx === 0} className="p-2 rounded-full bg-white shadow disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 bg-white rounded-xl shadow px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">{selectedIdx + 1} / {verses.length}</p>
                  <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-3">
                    {verses[selectedIdx]?.verse_text || verses[selectedIdx]?.text || verses[selectedIdx]?.content}
                  </p>
                  <p className="text-xs text-purple-600 mt-1 font-semibold">
                    {verses[selectedIdx]?.verse_reference || verses[selectedIdx]?.reference}
                  </p>
                </div>
                <button onClick={() => setSelectedIdx(i => Math.min(verses.length - 1, i + 1))} disabled={selectedIdx === verses.length - 1} className="p-2 rounded-full bg-white shadow disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="journal" className="mt-3">
            {loading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-purple-500" /></div>
            ) : !user ? (
              <div className="text-center py-6 text-gray-500 text-sm">Sign in to use your journal entries</div>
            ) : journals.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">No journal entries yet.</div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedIdx(i => Math.max(0, i - 1))} disabled={selectedIdx === 0} className="p-2 rounded-full bg-white shadow disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 bg-white rounded-xl shadow px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">{selectedIdx + 1} / {journals.length} • {journals[selectedIdx]?.entry_date}</p>
                  <p className="text-sm text-gray-800 leading-snug line-clamp-3">{journals[selectedIdx]?.content}</p>
                  {journals[selectedIdx]?.related_verse && (
                    <p className="text-xs text-purple-600 mt-1 font-semibold">{journals[selectedIdx].related_verse}</p>
                  )}
                </div>
                <button onClick={() => setSelectedIdx(i => Math.min(journals.length - 1, i + 1))} disabled={selectedIdx === journals.length - 1} className="p-2 rounded-full bg-white shadow disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="mt-3 space-y-3">
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Type your verse, quote, or reflection here…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-300"
              maxLength={300}
            />
            <input
              value={customRef}
              onChange={e => setCustomRef(e.target.value)}
              placeholder="Reference (e.g. John 3:16) — optional"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </TabsContent>
        </Tabs>

        {/* Template Picker */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Choose a Template</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {TEMPLATES.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setTemplateIdx(i)}
                title={t.name}
                className={`h-12 rounded-xl transition-all ${templateIdx === i ? 'ring-4 ring-purple-500 scale-110' : 'hover:scale-105'}`}
                style={{ background: t.bg }}
              >
                <span className="text-xs text-white font-semibold drop-shadow" style={{ fontSize: 9, display: 'block', paddingTop: 4 }}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Card Preview */}
        {cardContent?.text ? (
          <>
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <CardCanvas
                template={currentTemplate}
                text={cardContent.text.slice(0, 280)}
                reference={cardContent.reference}
                type={cardContent.type}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={downloadCard} className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                <Download className="w-4 h-4" /> Download PNG
              </Button>
              <Button onClick={shareCard} variant="outline" className="flex-1 gap-2">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Select or type content above to preview your card</p>
          </div>
        )}
      </div>
    </div>
  );
}