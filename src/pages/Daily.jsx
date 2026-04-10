import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sun, BookOpen, Sparkles, RefreshCw, ArrowRight, Heart, Loader2, BookMarked } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';
import { toast } from 'sonner';

// Deterministic verse of the day based on date
function getDailyVerseRef() {
  const verses = [
    { book: 'John', chapter: 3, verse: 16, text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
    { book: 'Psalm', chapter: 23, verse: 1, text: 'The Lord is my shepherd; I shall not want.' },
    { book: 'Jeremiah', chapter: 29, verse: 11, text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
    { book: 'Romans', chapter: 8, verse: 28, text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
    { book: 'Philippians', chapter: 4, verse: 13, text: 'I can do all this through him who gives me strength.' },
    { book: 'Proverbs', chapter: 3, verse: 5, text: 'Trust in the Lord with all your heart and lean not on your own understanding.' },
    { book: 'Isaiah', chapter: 40, verse: 31, text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.' },
    { book: 'Matthew', chapter: 6, verse: 33, text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.' },
    { book: 'Psalm', chapter: 119, verse: 105, text: 'Your word is a lamp for my feet, a light on my path.' },
    { book: 'Galatians', chapter: 5, verse: 22, text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.' },
    { book: '2 Timothy', chapter: 3, verse: 16, text: 'All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.' },
    { book: 'Hebrews', chapter: 11, verse: 1, text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
    { book: 'James', chapter: 1, verse: 5, text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.' },
    { book: '1 John', chapter: 4, verse: 19, text: 'We love because he first loved us.' },
    { book: 'Revelation', chapter: 21, verse: 4, text: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.' },
  ];
  const day = Math.floor(Date.now() / 86400000);
  return verses[day % verses.length];
}

function getTodayKey() {
  return new Date().toDateString();
}

export default function Daily() {
  const { lang, t } = useI18n();
  const [user, setUser] = useState(null);
  const [devotional, setDevotional] = useState(null);
  const [loadingDevotional, setLoadingDevotional] = useState(false);
  const dailyVerse = getDailyVerseRef();
  const todayKey = getTodayKey();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    // Load cached devotional
    try {
      const cached = JSON.parse(localStorage.getItem('daily_devotional') || '{}');
      if (cached.date === todayKey && cached.lang === lang) {
        setDevotional(cached);
      }
    } catch {}
  }, []);

  // Fetch plans for "Plan of the Day"
  const { data: studyPlans = [] } = useQuery({
    queryKey: ['daily-plans'],
    queryFn: () => base44.entities.StudyPlan.filter({ status: 'active' }, '-created_date', 20),
  });

  // Pick a plan of the day (deterministic by date)
  const planOfDay = studyPlans.length > 0
    ? studyPlans[Math.floor(Date.now() / 86400000) % studyPlans.length]
    : null;

  const generateDevotional = async (targetLang = lang) => {
    setLoadingDevotional(true);
    try {
      const langNames = { en: 'English', om: 'Afaan Oromoo', am: 'Amharic', ar: 'Arabic', fr: 'French', es: 'Spanish', pt: 'Portuguese', de: 'German', sw: 'Swahili' };
      const langName = langNames[targetLang] || 'English';
      const isOromo = targetLang === 'om';

      const prompt = isOromo
        ? `Ati gargaaraa FaithLight ti. Guutuu Afaan Oromootiin barreessi. Afaan Ingilizii hin fayyadamin.

Aayaata armaan gadii irratti devotional guyyaa kana (keewwata 3) barreessi:
Aayaata: ${dailyVerse.book} ${dailyVerse.chapter}:${dailyVerse.verse}
Barreeffama: "${dailyVerse.text}"

Haala armaan gadii kanaan barreessi:
1. Ibsa gabaabaa
2. Ergaa ijoo fi fayyadama jireenyaa
3. Kadhannaa gabaabaa

AFAAN OROMOO QOFAAN BARREESSI.`
        : `Write a short daily devotional (3 paragraphs) based on "${dailyVerse.book} ${dailyVerse.chapter}:${dailyVerse.verse}": "${dailyVerse.text}".
Include: (1) A brief reflection, (2) A practical application for today, (3) A closing prayer.
Write ENTIRELY in ${langName}. Do NOT use English if the target language is not English. Keep it under 250 words.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      const data = { date: todayKey, lang: targetLang, text: result, verse: dailyVerse };
      setDevotional(data);
      localStorage.setItem('daily_devotional', JSON.stringify(data));
    } catch {
      toast.error(lang === 'om' ? "Kufaatii uumameera. Mee irra deebi'ii yaali." : 'Failed to generate devotional');
    }
    setLoadingDevotional(false);
  };

  // Re-generate whenever language changes (clears cache mismatch)
  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('daily_devotional') || '{}');
      if (cached.date === todayKey && cached.lang === lang) {
        setDevotional(cached);
        return;
      }
    } catch {}
    if (!loadingDevotional) generateDevotional(lang);
  }, [lang]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Hero Date */}
        <div className="text-center pb-2">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm border border-indigo-100 mb-3">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-600">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl font-bold text-indigo-900">{lang === 'om' ? 'Guyyaa' : 'Daily'}</h1>
          <p className="text-gray-500 text-sm mt-1">{lang === 'om' ? 'Soorata guyyaa ayyaana keetii' : 'Your daily bread for the soul'}</p>
        </div>

        {/* Verse of the Day */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-white/20 text-white border-0 text-xs">✨ {lang === 'om' ? 'Ayaata Guyyaa' : 'Verse of the Day'}</Badge>
              <Link to={createPageUrl(`BibleReader?book=${encodeURIComponent(dailyVerse.book)}&chapter=${dailyVerse.chapter}`)}>
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 text-xs gap-1 h-7">
                  <BookOpen className="w-3 h-3" /> Open
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <blockquote className="text-lg font-medium leading-relaxed mb-3 italic">
              "{dailyVerse.text}"
            </blockquote>
            <p className="text-white/70 text-sm font-semibold">{dailyVerse.book} {dailyVerse.chapter}:{dailyVerse.verse}</p>
          </CardContent>
        </Card>

        {/* Daily Devotional */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4 text-purple-500" />
                {lang === 'om' ? "Devotional Har'aa" : "Today's Devotional"}
                {lang !== 'en' && <Badge variant="outline" className="text-xs ml-1">{lang.toUpperCase()}</Badge>}
              </CardTitle>
              <Button
                variant="ghost" size="sm"
                onClick={() => generateDevotional(lang)}
                disabled={loadingDevotional}
                className="text-xs gap-1 h-7 text-gray-400 hover:text-indigo-600"
              >
                {loadingDevotional ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDevotional ? (
              <div className="flex items-center gap-3 text-gray-400 py-6 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">{lang === 'om' ? 'Devotional qopheessaa jira…' : 'Preparing your devotional…'}</span>
              </div>
            ) : devotional?.text ? (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {devotional.text}
              </div>
            ) : (
              <Button onClick={() => generateDevotional(lang)} className="w-full gap-2" variant="outline">
                <Sparkles className="w-4 h-4" /> {lang === 'om' ? "Devotional Har'aa Uumi" : "Generate Today's Devotional"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Plan of the Day */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookMarked className="w-4 h-4 text-green-500" />
              Plan of the Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!planOfDay ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400 mb-3">No study plans available yet.</p>
                <Link to={createPageUrl('AIStudyPlanGenerator')}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Sparkles className="w-4 h-4" /> Generate a Study Plan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{planOfDay.title}</h3>
                      {planOfDay.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{planOfDay.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {planOfDay.duration_days && (
                          <Badge variant="outline" className="text-xs">{planOfDay.duration_days} days</Badge>
                        )}
                        {planOfDay.topics?.slice(0, 2).map(topic => (
                          <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Link to={createPageUrl('BibleStudyPlans')}>
                  <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                    Start Today's Plan <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to={createPageUrl('BibleStudyPlans')}>
                  <Button variant="ghost" className="w-full text-xs text-gray-400">Browse all plans</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link to={createPageUrl('PrayerWall')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
              <CardContent className="py-4 text-center">
                <Heart className="w-6 h-6 text-red-400 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-700">Prayer Wall</p>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('BibleReader')}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
              <CardContent className="py-4 text-center">
                <BookOpen className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-700">Read Bible</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}