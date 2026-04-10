import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/components/I18nProvider';
import { useLanguageSettings } from '@/components/context/LanguageSettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Volume2,
  Share2,
  ChevronRight,
  Sparkles,
  Zap,
  Heart,
  Clock,
  Search,
  Loader,
  BookMarked,
  Check,
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import SpiritualVerseReflection from '@/components/home/SpiritualVerseReflection';

export default function FaithLightHome() {
  const { t, lang } = useI18n();
  const { bibleLanguage } = useLanguageSettings();
  const [user, setUser] = useState(null);
  const [verseOfDay, setVerseOfDay] = useState(null);
  const [verseError, setVerseError] = useState(false);
  const [continueReading, setContinueReading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedToJournal, setSavedToJournal] = useState(false);
  const [spiritualFocus] = useState(() => {
    try { return JSON.parse(localStorage.getItem('spiritual_focus') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const init = async () => {
      try {
        // Check auth
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }

        // Fetch verse of the day (John 3:16 from our sample data)
        const response = await base44.functions.invoke('bibleReaderService', {
          action: 'getVerse',
          reference: 'JHN 3:16',
        });

        if (response.data?.success) {
          setVerseOfDay(response.data.data);
        }

        // Fetch continue reading from reading progress
        if (isAuth) {
          const me = await base44.auth.me();
          const progress = await base44.entities.ReadingProgress.filter({
            user_id: me.id,
          });

          if (progress && progress.length > 0) {
            const p = progress[0];
            // Get the chapter they were reading
            const chaptersResp = await base44.functions.invoke('bibleReaderService', {
              action: 'getChapters',
              bookId: p.last_book_id,
            });

            if (chaptersResp.data?.success) {
              const chapters = chaptersResp.data.data;
              const lastChapter = chapters.find(
                (c) => c.chapter_number === p.last_chapter
              );

              if (lastChapter) {
                setContinueReading({
                  bookId: p.last_book_id,
                  chapterNumber: p.last_chapter,
                  lastVerse: p.last_verse,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Home init error:', err);
        setVerseError(true);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const saveVerseToJournal = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    if (!verseOfDay) return;
    try {
      await base44.entities.JournalEntry.create({
        user_id: user.id,
        entry_date: new Date().toISOString().split('T')[0],
        content: `Verse of the Day: "${bibleLanguage === 'om' ? verseOfDay.text_om : verseOfDay.text_en}" — ${verseOfDay.reference}`,
        related_verse: verseOfDay.reference,
        mood: 'grateful',
        is_private: true,
      });
      setSavedToJournal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const aiTools = [
    {
      icon: Sparkles,
      title: t('home.explainVerse', 'Explain Verse'),
      desc: t('home.explainVerseDesc', 'AI insight on scripture'),
      color: 'from-blue-500 to-blue-600',
      link: '/AskAI',
    },
    {
      icon: BookOpen,
      title: t('home.sermonGenerator', 'Sermon Generator'),
      desc: t('home.sermonGeneratorDesc', 'Build sermon outlines'),
      color: 'from-purple-500 to-purple-600',
      link: '/SermonBuilder',
    },
    {
      icon: Heart,
      title: t('home.devotional', 'Devotional'),
      desc: t('home.devotionalDesc', 'AI-generated devotional'),
      color: 'from-red-500 to-red-600',
      link: '/DailyDevotionals',
    },
    {
      icon: Zap,
      title: t('home.prayerGenerator', 'Prayer'),
      desc: t('home.prayerGeneratorDesc', 'Generate prayer'),
      color: 'from-amber-500 to-amber-600',
      link: '/PrayerJournal',
    },
  ];

  const topics = [
    { key: 'home.topics.hope', label: t('home.topics.hope', 'Hope') },
    { key: 'home.topics.faith', label: t('home.topics.faith', 'Faith') },
    { key: 'home.topics.prayer', label: t('home.topics.prayer', 'Prayer') },
    { key: 'home.topics.love', label: t('home.topics.love', 'Love') },
    { key: 'home.topics.forgiveness', label: t('home.topics.forgiveness', 'Forgiveness') },
    { key: 'home.topics.grace', label: t('home.topics.grace', 'Grace') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-6">
        <h1 className="text-2xl font-bold">FaithLight</h1>
        <p className="text-indigo-100 text-sm mt-1">
          {user ? `${t('home.welcome', 'Welcome')}, ${user.full_name?.split(' ')[0]}` : t('home.welcomeGuest', 'Welcome to FaithLight')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {/* 1️⃣ Verse of the Day */}
            {verseError ? (
              <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900 border-red-200 dark:border-red-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300">
                    {t('home.verseOfDay', 'Verse of the Day')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {t('home.verseLoadError', 'We could not load the verse right now. Please try again later.')}
                  </p>
                </CardContent>
              </Card>
            ) : verseOfDay && (
              <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900 dark:to-blue-900 border-indigo-200 dark:border-indigo-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                    {t('home.verseOfDay', 'Verse of the Day')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {verseOfDay.reference}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed text-sm">
                      "{verseOfDay[`text_${bibleLanguage}`] || verseOfDay.text_en || verseOfDay.verseText}"
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link to={createPageUrl('BibleReader')}>
                      <Button size="sm" variant="default" className="gap-2">
                        <BookOpen className="w-4 h-4" />
                        {t('home.readChapter', 'Read')}
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Volume2 className="w-4 h-4" />
                      {t('home.listen', 'Listen')}
                    </Button>
                    <Button
                      size="sm"
                      variant={savedToJournal ? 'default' : 'outline'}
                      className={`gap-2 ${savedToJournal ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                      onClick={saveVerseToJournal}
                      disabled={savedToJournal}
                    >
                      {savedToJournal ? <><Check className="w-4 h-4" /> Saved!</> : <><BookMarked className="w-4 h-4" /> Save to Journal</>}
                    </Button>
                  </div>
                  <SpiritualVerseReflection verse={verseOfDay} focusAreas={spiritualFocus} />
                </CardContent>
              </Card>
            )}

            {/* 2️⃣ Continue Reading */}
            {user && continueReading && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    {t('home.continueReading', 'Continue Reading')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {t('home.chapter', 'Chapter')} {continueReading.chapterNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('home.lastReadVerse', 'Last read: verse')} {continueReading.lastVerse}
                      </p>
                    </div>
                    <Link to={createPageUrl('BibleReader')}>
                      <Button className="w-full gap-2">
                        <BookOpen className="w-4 h-4" />
                        {t('home.continueReading', 'Continue Reading')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3️⃣ Read or Listen Section */}
            <div className="grid grid-cols-2 gap-4">
              <Link to={createPageUrl('BibleReader')}>
                <Card className="h-24 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {t('home.readBible', 'Read the Bible')}
                  </p>
                </Card>
              </Link>

              <Link to={createPageUrl('AudioBibleV2')}>
                <Card className="h-24 flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <Volume2 className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {t('home.listenBible', 'Listen')}
                  </p>
                </Card>
              </Link>
            </div>

            {/* 4️⃣ AI Study Tools */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                {t('home.aiTools', 'AI Study Tools')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aiTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.title} to={createPageUrl('AskAI')}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                            <div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                {tool.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                {tool.desc}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 5️⃣ Study Plans */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  {t('home.studyPlans', 'Study Plans')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-800 dark:to-blue-800 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {t('home.faithBuilderPlan', '7-Day Faith Builder')}
                  </p>
                  <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '14%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                    {t('home.dayProgress', 'Day 1 of 7')}
                  </p>
                </div>
                <Link to={createPageUrl('BibleStudyPlans')}>
                  <Button variant="outline" className="w-full gap-2">
                    <ChevronRight className="w-4 h-4" />
                    {t('home.continuePlan', 'Continue Plan')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 6️⃣ Popular Topics */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {t('home.popularTopics', 'Popular Topics')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {topics.map((topic) => (
                  <Link key={topic.key} to={createPageUrl('BibleSearch')}>
                    <Button
                      variant="outline"
                      className="w-full gap-2 justify-center"
                    >
                      <Search className="w-4 h-4" />
                      {topic.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA: Login / Premium */}
            {!user && (
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 border-indigo-200 dark:border-indigo-700">
                <CardContent className="p-4 text-center">
                  <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                    {t('home.loginForProgress', 'Sign in to save your reading progress')}
                  </p>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                    {t('nav.login', 'Login')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}