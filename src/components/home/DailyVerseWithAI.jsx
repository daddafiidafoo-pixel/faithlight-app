import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { makeRefKey, isVerseSaved, saveVerse, unsaveVerse } from '../bibleVerseCache';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Volume2, Sparkles, Share2, ChevronDown, ChevronUp, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const DAILY_VERSES = [
  { text: "Your word is a lamp to my feet and a light to my path.", reference: "Psalm 119:105", book: "Psalms", chapter: 119, verse: 105 },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5", book: "Proverbs", chapter: 3, verse: 5 },
  { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13", book: "Philippians", chapter: 4, verse: 13 },
  { text: "For God so loved the world that he gave his one and only Son.", reference: "John 3:16", book: "John", chapter: 3, verse: 16 },
  { text: "Be still, and know that I am God.", reference: "Psalm 46:10", book: "Psalms", chapter: 46, verse: 10 },
  { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1", book: "Psalms", chapter: 23, verse: 1 },
  { text: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28", book: "Matthew", chapter: 11, verse: 28 },
];

function getTodayVerse() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

export default function DailyVerseWithAI({ user }) {
  const verse = getTodayVerse();
  const [showAI, setShowAI] = useState(false);
  const [aiContent, setAiContent] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Lazy-check saved status on mount — filter user_id + book (2 fields, safe), match ref_key client-side
  // Does NOT block the page render.
  useEffect(() => {
    if (!user?.id) return;
    isVerseSaved(user.id, verse.book, verse.chapter, verse.verse)
      .then(({ isSaved: saved }) => setIsSaved(saved))
      .catch(() => {});
  }, [user?.id]);

  // AI only fires after explicit user click
  const loadAIExplanation = async () => {
    if (aiContent) { setShowAI(p => !p); return; }
    setShowAI(true);
    setIsLoadingAI(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a brief but rich devotional explanation for this verse: "${verse.text}" (${verse.reference})

Return JSON with:
- explanation: 2-3 sentence historical/theological context
- application: 2 practical ways to apply this verse today  
- reflection: one deep reflection question
- theme: one-word theme (e.g., "Trust", "Peace", "Grace")`,
        response_json_schema: {
          type: 'object',
          properties: {
            explanation: { type: 'string' },
            application: { type: 'array', items: { type: 'string' } },
            reflection: { type: 'string' },
            theme: { type: 'string' },
          }
        }
      });
      setAiContent(result);
    } catch {
      toast.error('Could not load explanation');
      setShowAI(false);
    }
    setIsLoadingAI(false);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      if (isSaved) {
        await unsaveVerse(user.id, verse.book, verse.chapter, verse.verse);
        setIsSaved(false);
        toast.success('Verse removed');
      } else {
        await saveVerse({
          userId: user.id,
          translationId: localStorage.getItem('preferred_translation') || 'WEB',
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          reference: verse.reference,
        });
        setIsSaved(true);
        toast.success('Verse saved! 🙌');
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const handlePlay = () => {
    if (isPlaying) { speechSynthesis.cancel(); setIsPlaying(false); return; }
    const utterance = new SpeechSynthesisUtterance(`${verse.text} — ${verse.reference}`);
    utterance.rate = 0.85;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    speechSynthesis.speak(utterance);
  };

  const handleShare = () => {
    const text = `"${verse.text}" — ${verse.reference}\n\nShared from FaithLight`;
    if (navigator.share) {
      navigator.share({ title: 'Verse of the Day', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 opacity-5 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 opacity-10 rounded-full blur-3xl -ml-16 -mb-16" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm tracking-wide uppercase">Verse of the Day</span>
          </div>
          <span className="text-xs text-indigo-300">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Verse — rendered from static config, zero network cost */}
        <blockquote className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-3 italic">
          "{verse.text}"
        </blockquote>
        <p className="text-amber-300 font-semibold text-base mb-5">— {verse.reference}</p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={handleSave} variant="ghost" size="sm"
            className={`gap-1.5 text-xs border border-white/20 hover:bg-white/10 ${isSaved ? 'text-red-300' : 'text-white/80'}`}>
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          <Button onClick={handlePlay} variant="ghost" size="sm"
            className="gap-1.5 text-xs border border-white/20 text-white/80 hover:bg-white/10">
            {isPlaying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isPlaying ? 'Playing...' : 'Listen'}
          </Button>
          <Button onClick={handleShare} variant="ghost" size="sm"
            className="gap-1.5 text-xs border border-white/20 text-white/80 hover:bg-white/10">
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>
          {/* AI only fires on click — never on load */}
          <Button onClick={loadAIExplanation} variant="ghost" size="sm"
            className="gap-1.5 text-xs border border-amber-400/40 text-amber-300 hover:bg-amber-400/10 ml-auto">
            <Sparkles className="w-3.5 h-3.5" />
            AI Explanation
            {showAI ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>

        {/* AI Explanation Panel — only rendered after user opens it */}
        {showAI && (
          <div className="border-t border-white/10 pt-4 mt-2">
            {isLoadingAI ? (
              <div className="flex items-center gap-2 text-indigo-300 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Getting AI explanation...
              </div>
            ) : aiContent ? (
              <div className="space-y-3">
                {aiContent.theme && (
                  <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs">
                    Theme: {aiContent.theme}
                  </Badge>
                )}
                {aiContent.explanation && (
                  <div>
                    <p className="text-xs font-semibold text-indigo-300 mb-1 uppercase tracking-wide">Context</p>
                    <p className="text-sm text-white/85 leading-relaxed">{aiContent.explanation}</p>
                  </div>
                )}
                {aiContent.application?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-indigo-300 mb-1 uppercase tracking-wide">Apply Today</p>
                    <ul className="space-y-1">
                      {aiContent.application.map((a, i) => (
                        <li key={i} className="text-sm text-white/80 flex gap-2">
                          <span className="text-amber-400 flex-shrink-0">•</span>{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiContent.reflection && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs font-semibold text-indigo-300 mb-1 uppercase tracking-wide">Reflect</p>
                    <p className="text-sm text-white/80 italic">{aiContent.reflection}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}