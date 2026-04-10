import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, BookOpen, Plus, X, Save, Share2, Download, Loader2, Star, PenLine, ChevronRight, Check, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useI18n } from '../components/I18nProvider';

const BIBLE_BOOKS = [
  'Genesis','Exodus','Psalms','Proverbs','Isaiah','Matthew','Mark','Luke','John',
  'Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians',
  'Philippians','Colossians','1 Thessalonians','Hebrews','James','1 Peter','Revelation'
];
const CHAPTERS = Array.from({ length: 50 }, (_, i) => i + 1);

// ── PDF export via jsPDF ──────────────────────────────────────────
async function exportToPDF(sermon) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const lw = 170; let y = 20;

  const addLine = (text, size = 12, bold = false, color = [30, 30, 30]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text || ''), lw);
    if (y + lines.length * (size * 0.4 + 1) > 280) { doc.addPage(); y = 20; }
    doc.text(lines, 20, y);
    y += lines.length * (size * 0.4 + 1) + 2;
  };
  const gap = (n = 4) => { y += n; };

  addLine(sermon.title || 'Sermon', 18, true, [49, 46, 129]);
  if (sermon.book_chapter) addLine(`${sermon.book_chapter}`, 12, false, [99, 102, 241]);
  gap();
  if (sermon.big_idea) { addLine('Big Idea', 13, true); addLine(sermon.big_idea); gap(); }
  if (sermon.introduction) { addLine('Introduction', 13, true); addLine(sermon.introduction); gap(); }
  (sermon.main_points || []).forEach((pt, i) => {
    addLine(`Point ${i + 1}: ${pt.title || ''}`, 13, true);
    if (pt.content) addLine(pt.content);
    if (pt.verses?.length) addLine(`Verses: ${pt.verses.join(', ')}`, 10, false, [79, 70, 229]);
    if (pt.note) addLine(`📝 ${pt.note}`, 10, false, [107, 114, 128]);
    gap(3);
  });
  if (sermon.conclusion) { addLine('Conclusion', 13, true); addLine(sermon.conclusion); gap(); }
  if (sermon.closing_prayer) { addLine('Closing Prayer', 13, true); addLine(sermon.closing_prayer); gap(); }

  doc.save(`${(sermon.title || 'sermon').replace(/\s+/g, '_')}.pdf`);
}

// ── Point Editor ──────────────────────────────────────────────────
function PointEditor({ point, idx, allVerses, onChange, onRemove }) {
  return (
    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{idx + 1}</span>
        <Input value={point.title} onChange={e => onChange('title', e.target.value)}
          placeholder={`Point ${idx + 1} title…`} className="text-sm bg-white" />
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 flex-shrink-0"><X className="w-4 h-4" /></button>
      </div>
      <Textarea value={point.content} onChange={e => onChange('content', e.target.value)}
        placeholder="Develop this point…" className="text-sm bg-white min-h-20 resize-none" />
      {allVerses.length > 0 && (
        <div>
          <p className="text-xs font-bold text-indigo-600 mb-1.5">Emphasize verses:</p>
          <div className="flex flex-wrap gap-1.5">
            {allVerses.map(v => (
              <button key={v} onClick={() => {
                const vs = point.verses || [];
                onChange('verses', vs.includes(v) ? vs.filter(x => x !== v) : [...vs, v]);
              }}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${(point.verses || []).includes(v) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
      <Textarea value={point.note || ''} onChange={e => onChange('note', e.target.value)}
        placeholder="…"
        className="text-sm bg-white min-h-14 resize-none border-dashed" />
    </div>
  );
}

// ── Sermon Card ───────────────────────────────────────────────────
function SermonCard({ sermon, onLoad, onDelete, onExport }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-indigo-200 transition-all">
      <h3 className="font-extrabold text-gray-900 text-sm mb-1 truncate">{sermon.title}</h3>
      <p className="text-xs text-gray-500 mb-2">{sermon.book_chapter}</p>
      <div className="flex gap-1.5 mb-3">
        {(sermon.key_verses || []).slice(0, 3).map(v => (
          <Badge key={v} className="text-xs bg-indigo-50 text-indigo-700 border-0">{v}</Badge>
        ))}
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <Button size="sm" variant="outline" onClick={() => onLoad(sermon)} className="flex-1 text-xs gap-1"><Eye className="w-3.5 h-3.5" /> Open</Button>
        <Button size="sm" variant="outline" onClick={() => onExport(sermon)} className="text-xs gap-1"><Download className="w-3.5 h-3.5" /></Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(sermon.id)} className="text-red-400 hover:bg-red-50 text-xs"><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function SermonBuilderPage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState('build'); // build | saved

  // Form
  const [book, setBook] = useState('John');
  const [chapterNum, setChapterNum] = useState(3);
  const [title, setTitle] = useState('');
  const [bigIdea, setBigIdea] = useState('');
  const [keyVerses, setKeyVerses] = useState([]);
  const [verseInput, setVerseInput] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [mainPoints, setMainPoints] = useState([
    { title: '', content: '', verses: [], note: '' },
    { title: '', content: '', verses: [], note: '' },
    { title: '', content: '', verses: [], note: '' },
  ]);
  const [conclusion, setConclusion] = useState('');
  const [closingPrayer, setClosingPrayer] = useState('');

  const { t, lang } = useI18n();
  const [generating, setGenerating] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {}).finally(() => setAuthChecked(true));
  }, []);

  const { data: savedSermons = [], isLoading: loadingSaved } = useQuery({
    queryKey: ['sermon-builder-saved', user?.id],
    enabled: !!user && tab === 'saved',
    queryFn: () => base44.entities.SermonOutline.filter({ user_id: user.id }, '-updated_date', 20).catch(() => []),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => savedId
      ? base44.entities.SermonOutline.update(savedId, data)
      : base44.entities.SermonOutline.create(data),
    onSuccess: (r) => { setSavedId(r.id); toast.success('Sermon saved!'); queryClient.invalidateQueries({ queryKey: ['sermon-builder-saved'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SermonOutline.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sermon-builder-saved'] }),
  });

  const generateOutline = async () => {
    setGenerating(true);
    const passage = `${book} ${chapterNum}`;
    const langNames = { en: 'English', om: 'Afaan Oromoo', am: 'Amharic', ar: 'Arabic', fr: 'French', sw: 'Swahili' };
    const langName = langNames[lang] || 'English';
    const prompt = `You are a homiletics expert. Generate a complete sermon outline for "${passage}" in ${langName}.
IMPORTANT: ALL content (big_idea, introduction, main_points titles and content, conclusion, closing_prayer) MUST be written entirely in ${langName}. Do not use English unless ${langName} IS English.
${title ? `Sermon title: "${title}"` : ''}
${keyVerses.length ? `Key verses to emphasize: ${keyVerses.join(', ')}` : ''}

Provide:
1. A powerful one-sentence Big Idea
2. A compelling 3-paragraph Introduction that opens with a relatable story or question
3. Exactly 3 main points, each with: title (short, memorable), content (2-3 paragraphs of biblical exposition + application), and key verse from the passage
4. A strong Conclusion that calls to action
5. A short closing prayer

Format as JSON with keys: big_idea, introduction, main_points (array of {title, content, verse}), conclusion, closing_prayer`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            big_idea: { type: 'string' },
            introduction: { type: 'string' },
            main_points: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' }, verse: { type: 'string' } } } },
            conclusion: { type: 'string' },
            closing_prayer: { type: 'string' },
          }
        }
      });

      if (!title) setTitle(result.big_idea?.split('.')[0]?.substring(0, 60) || `${passage} Sermon`);
      setBigIdea(result.big_idea || '');
      setIntroduction(result.introduction || '');
      setConclusion(result.conclusion || '');
      setClosingPrayer(result.closing_prayer || '');
      setMainPoints((result.main_points || []).slice(0, 3).map(pt => ({
        title: pt.title || '',
        content: pt.content || '',
        verses: pt.verse ? [pt.verse] : [],
        note: '',
      })));
      toast.success('Sermon outline generated!');
    } catch {
      toast.error('Generation failed. Please try again.');
    }
    setGenerating(false);
  };

  const handleSave = () => {
    if (!user) { toast.error('Sign in to save'); return; }
    const data = {
      user_id: user.id,
      title: title || `${book} ${chapterNum}`,
      book_chapter: `${book} ${chapterNum}`,
      big_idea: bigIdea,
      key_verses: keyVerses,
      introduction,
      main_points: mainPoints,
      conclusion,
      closing_prayer: closingPrayer,
      is_shared: false,
    };
    saveMutation.mutate(data);
  };

  const handleShare = async () => {
    if (!user) return;
    setSharing(true);
    try {
      const post = `📖 **${title || `${book} ${chapterNum}`}**\n\n${bigIdea}\n\n${mainPoints.map((p, i) => `${i + 1}. ${p.title}`).join('\n')}\n\n*Shared via FaithLight Sermon Builder*`;
      await base44.entities.HomeCommunityPost.create({
        user_id: user.id,
        content: post,
        post_type: 'sermon',
        title: title,
      }).catch(() => {});
      setShareSuccess(true);
      toast.success('Shared to community!');
      setTimeout(() => setShareSuccess(false), 2500);
    } catch { toast.error('Share failed'); }
    setSharing(false);
  };

  const handleExport = (sermon) => exportToPDF(sermon || {
    title, book_chapter: `${book} ${chapterNum}`, big_idea: bigIdea, key_verses: keyVerses,
    introduction, main_points: mainPoints, conclusion, closing_prayer: closingPrayer,
  });

  const loadSaved = (s) => {
    setTitle(s.title || ''); setBigIdea(s.big_idea || '');
    setKeyVerses(s.key_verses || []); setIntroduction(s.introduction || '');
    setMainPoints(s.main_points?.length ? s.main_points : mainPoints);
    setConclusion(s.conclusion || ''); setClosingPrayer(s.closing_prayer || '');
    const [b, ...cParts] = (s.book_chapter || 'John 3').split(' ');
    setBook(b); setChapterNum(parseInt(cParts.join(' ')) || 1);
    setSavedId(s.id); setTab('build');
  };

  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl"><Sparkles className="w-4 h-4 text-white" /></div>
            <h1 className="text-base font-extrabold text-gray-900">{t('sermon.builder', 'Sermon Builder')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {tab === 'build' && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleExport(null)} className="gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" /> PDF
                </Button>
                <Button size="sm" variant="outline" onClick={handleShare} disabled={sharing} className="gap-1.5 text-xs">
                  {shareSuccess ? <><Check className="w-3.5 h-3.5 text-green-500" /> Shared!</> : <><Share2 className="w-3.5 h-3.5" /> Post</>}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-700 gap-1.5 text-xs">
                  {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {savedId ? 'Update' : 'Save'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 shadow-sm mb-5 w-fit">
          {[{ id: 'build', label: '✏️ Build' }, { id: 'saved', label: '📚 Saved' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-indigo-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'build' && (
          <div className="space-y-4">
            {/* Book + Chapter + AI generate */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-extrabold text-gray-900 mb-3">{t('sermon.selectPassage', '1. Select Passage')}</h2>
              <div className="flex gap-3 flex-wrap mb-3">
                <select value={book} onChange={e => setBook(e.target.value)}
                  className="flex-1 min-w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                  {BIBLE_BOOKS.map(b => <option key={b}>{b}</option>)}
                </select>
                <select value={chapterNum} onChange={e => setChapterNum(Number(e.target.value))}
                  className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400">
                  {CHAPTERS.map(c => <option key={c} value={c}>Ch. {c}</option>)}
                </select>
              </div>
              <Input value={title} onChange={e => setTitle(e.target.value)}
                placeholder={`Sermon title (optional, AI can suggest)`} className="mb-3 text-sm" />
              <Button onClick={generateOutline} disabled={generating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 gap-2 py-5 font-extrabold">
                {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</> : <><Sparkles className="w-5 h-5" /> Generate AI Outline</>}
              </Button>
            </div>

            {/* Key verses */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-extrabold text-gray-900 mb-3">{t('sermon.keyVerses', '2. Key Verses to Emphasize')}</h2>
              <div className="flex gap-2 mb-2">
                <Input value={verseInput} onChange={e => setVerseInput(e.target.value)}
                  placeholder={`${book} ${chapterNum}:1`}
                  onKeyDown={e => { if (e.key === 'Enter' && verseInput.trim()) { setKeyVerses(v => [...v, verseInput.trim()]); setVerseInput(''); } }}
                  className="flex-1 text-sm" />
                <Button size="sm" onClick={() => { if (verseInput.trim()) { setKeyVerses(v => [...v, verseInput.trim()]); setVerseInput(''); } }} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {keyVerses.map(v => (
                  <span key={v} className="flex items-center gap-1 bg-amber-100 text-amber-800 rounded-full px-2.5 py-1 text-xs font-medium">
                    <Star className="w-3 h-3" /> {v}
                    <button onClick={() => setKeyVerses(vs => vs.filter(x => x !== v))}><X className="w-3 h-3 ml-0.5" /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Big Idea + Introduction */}
            {(bigIdea || introduction) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">{t('sermon.bigIdea', 'Big Idea')}</label>
                  <Textarea value={bigIdea} onChange={e => setBigIdea(e.target.value)}
                    className="text-sm min-h-16 resize-none border-indigo-200 bg-indigo-50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">{t('sermon.introduction', 'Introduction')}</label>
                  <Textarea value={introduction} onChange={e => setIntroduction(e.target.value)}
                    className="text-sm min-h-24 resize-none" />
                </div>
              </div>
            )}

            {/* 3 Main Points */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-extrabold text-gray-900">{t('sermon.mainPoints', '3. Main Points')}</h2>
                {mainPoints.length < 5 && (
                  <Button size="sm" variant="outline" onClick={() => setMainPoints(p => [...p, { title: '', content: '', verses: [], note: '' }])} className="gap-1.5 text-xs">
                    <Plus className="w-3.5 h-3.5" /> {t('sermon.addPoint', 'Add Point')}
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {mainPoints.map((pt, idx) => (
                  <PointEditor key={idx} point={pt} idx={idx} allVerses={keyVerses}
                    onChange={(field, val) => setMainPoints(pts => pts.map((p, i) => i === idx ? { ...p, [field]: val } : p))}
                    onRemove={() => setMainPoints(pts => pts.filter((_, i) => i !== idx))} />
                ))}
              </div>
            </div>

            {/* Conclusion + Prayer */}
            {(conclusion || closingPrayer) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">{t('sermon.conclusion', 'Conclusion')}</label>
                  <Textarea value={conclusion} onChange={e => setConclusion(e.target.value)} className="text-sm min-h-20 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">{t('sermon.closingPrayer', 'Closing Prayer')}</label>
                  <Textarea value={closingPrayer} onChange={e => setClosingPrayer(e.target.value)} className="text-sm min-h-16 resize-none" />
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'saved' && (
          <div>
            {!user ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">Sign in to view saved sermons</p>
                <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-700">Sign In</Button>
              </div>
            ) : loadingSaved ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
            ) : savedSermons.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">No saved sermons yet</p>
                <Button onClick={() => setTab('build')} className="bg-indigo-700 gap-1.5"><PenLine className="w-4 h-4" /> Build One</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSermons.map(s => (
                  <SermonCard key={s.id} sermon={s} onLoad={loadSaved}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onExport={(s) => exportToPDF(s)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}