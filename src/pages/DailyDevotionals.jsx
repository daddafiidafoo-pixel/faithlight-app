import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader, Heart, Share2, BookMarked, Sun } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';

export default function DailyDevotionals() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState(null);
  const [devotional, setDevotional] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userInterests, setUserInterests] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [saved, setSaved] = useState([]);
  const [liked, setLiked] = useState(false);

  const INTEREST_OPTIONS = [
    { label: lang === 'om' ? 'Amantaa' : 'Faith' },
    { label: lang === 'om' ? 'Jabaatamiinsa' : 'Strength' },
    { label: lang === 'om' ? 'Abjuubaa' : 'Hope' },
    { label: lang === 'om' ? 'Wariin' : 'Love' },
    { label: lang === 'om' ? 'Lafti' : 'Healing' },
    { label: lang === 'om' ? 'Karaa' : 'Guidance' },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch {
        // User not authenticated
      }
    };

    fetchUser();
  }, []);

  const generateDevotional = async () => {
    setLoading(true);
    try {
      const topic = customTopic || userInterests || 'Faith and Trust in God';

      const systemPrompt = lang === 'om'
        ? `Ati barsiisaa waaqa waaqeffannaa keessatti hojjuu danda'a. Waaggaddi kan jirtuu akka armaan gaditti haa qabu:
1. Mata gaaffii guyyaa (1-2 dubbii)
2. Kitaaba Waaqaa maallimmaa (1-2 yeroo)
3. Ibsa (2-3 dubbii)
4. Gaaffii jidhaadhu (2)
5. Karoora guyyaa (1-2 dubbii)
6. Karoora raajii
Mata gaaffii: "${topic}"
Ofirra seena keessaa hiikuu.`
        : `Create a brief daily devotional in English following this structure:
1. Title & Theme: "${topic}"
2. Key Scripture (1-2 verses)
3. Reflection (2-3 sentences)
4. Reflection Questions (2)
5. Today's Prayer (1-2 sentences)
6. Verse for Meditation
Make it inspirational and practical for daily life.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a personalized daily devotional for someone interested in "${topic}". Include a scripture passage, reflection, questions, and a prayer.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            theme: { type: 'string' },
            passage: { type: 'string' },
            scripture: { type: 'string' },
            reflection: { type: 'string' },
            questions: { type: 'array', items: { type: 'string' } },
            prayer: { type: 'string' },
            meditationVerse: { type: 'string' },
          },
        },
      });

      setDevotional(response.data);
      setLiked(false);
    } catch (error) {
      console.error('Error generating devotional:', error);
      alert(lang === 'om' ? 'Dogoggora uumuu' : 'Error generating devotional');
    } finally {
      setLoading(false);
    }
  };

  const saveDevotional = async () => {
    if (!devotional || !user) return;

    try {
      await base44.entities.PersonalizedDevotional?.create({
        user_id: user.id,
        title: devotional.title,
        theme: devotional.theme,
        passage: devotional.passage,
        reflection: devotional.reflection,
        prayer: devotional.prayer,
        liked: true,
        content: JSON.stringify(devotional),
      });

      setLiked(true);
      alert(lang === 'om' ? 'Ogummaawwan kuusaa' : 'Devotional saved!');
    } catch (error) {
      console.error('Error saving devotional:', error);
      alert(lang === 'om' ? 'Dogoggora kuusuu' : 'Error saving devotional');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[var(--faith-light-primary-dark)] mb-2 flex items-center gap-3">
          <Sun className="w-8 h-8 text-[var(--faith-light-accent)]" />
          {lang === 'om' ? 'Waaggaddi Guyyaa' : 'Daily Devotionals'}
        </h1>
        <p className="text-gray-600">
          {lang === 'om'
            ? 'Waaggaddi guyyaa keessanuu argii qabu'
            : 'Get personalized daily devotionals based on your interests'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>{lang === 'om' ? 'Mata Gaaffii' : 'Generate Devotional'}</CardTitle>
            <CardDescription>
              {lang === 'om' ? 'Mata gaaffii filadhu' : 'Choose a theme or topic'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'om' ? 'Mata Gaaffii Imaammata' : 'Popular Themes'}
              </label>
              <div className="space-y-2">
                {INTEREST_OPTIONS.map((interest, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUserInterests(interest.label);
                      setCustomTopic('');
                    }}
                    className={`w-full p-2 text-left rounded-lg transition-all ${
                      userInterests === interest.label
                        ? 'bg-[var(--faith-light-primary)] text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {interest.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'om' ? 'Mata Gaaffii Addaa' : 'Custom Topic'}
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => {
                  setCustomTopic(e.target.value);
                  setUserInterests('');
                }}
                placeholder={lang === 'om' ? 'Mata gaaffii barreessi' : 'Enter a topic'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--faith-light-primary)]"
              />
            </div>

            <Button
              onClick={generateDevotional}
              disabled={loading || (!customTopic && !userInterests)}
              className="w-full bg-[var(--faith-light-primary)] hover:bg-[var(--faith-light-primary-light)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {lang === 'om' ? 'Uumaa...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {lang === 'om' ? 'Uumuu' : 'Generate'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Devotional Display */}
        {devotional ? (
          <Card className="lg:col-span-2 border-2 border-[var(--faith-light-primary)]">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>{devotional.title}</CardTitle>
                  <CardDescription>{devotional.theme}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`p-2 rounded-lg transition-all ${
                      liked
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
              {devotional.passage && (
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-[var(--faith-light-primary)]">
                  <div className="font-mono text-sm text-gray-900 font-semibold mb-2">
                    {devotional.passage}
                  </div>
                  <p className="text-gray-700 text-sm italic">
                    {devotional.scripture}
                  </p>
                </div>
              )}

              {devotional.reflection && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {lang === 'om' ? 'Ibsa' : 'Reflection'}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {devotional.reflection}
                  </p>
                </div>
              )}

              {devotional.questions && devotional.questions.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {lang === 'om' ? 'Gaaffii Jidhaadhu' : 'Reflection Questions'}
                  </h3>
                  <ul className="space-y-2">
                    {devotional.questions.map((q, idx) => (
                      <li key={idx} className="text-gray-700">
                        {idx + 1}. {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {devotional.prayer && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {lang === 'om' ? 'Karoora Guyyaa' : "Today's Prayer"}
                  </h3>
                  <p className="text-gray-700 italic">
                    {devotional.prayer}
                  </p>
                </div>
              )}

              {devotional.meditationVerse && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {lang === 'om' ? 'Yeroo Jidhaadhu' : 'Verse for Meditation'}
                  </h3>
                  <p className="text-gray-700 font-semibold">
                    {devotional.meditationVerse}
                  </p>
                </div>
              )}

              {user && (
                <Button
                  onClick={saveDevotional}
                  className="w-full gap-2 bg-[var(--faith-light-accent)] hover:bg-[var(--faith-light-accent-dark)] text-gray-900"
                >
                  <BookMarked className="w-4 h-4" />
                  {liked ? (lang === 'om' ? 'Kuusaamee' : 'Saved') : (lang === 'om' ? 'Kuusuu' : 'Save')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2">
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-gray-500">
                <Sun className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{lang === 'om' ? 'Waaggaddi keessanuu argii' : 'Your daily devotional will appear here'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}