import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Sparkles, RefreshCw, Search, BookMarked, Heart, Lightbulb, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '../components/I18nProvider';

// Localized UI strings (not translation-key based since we need them inline)
const UI = {
  en: {
    title: 'AI Bible Guide',
    subtitle: 'Ask questions about the Bible and receive guidance.',
    placeholder: 'Ask a Bible question...',
    guideMe: 'Ask AI',
    topicsTab: 'Topics',
    verseTab: 'Verse',
    topicsCreateTitle: 'Create Teaching',
    topicsInputHint: 'Enter a biblical topic',
    topicsPlaceholder: 'E.g., Faith, Prayer, Christian Life...',
    loading: 'Searching the Bible...',
    warning: 'AI responses are based on Biblical texts and may not replace guidance from pastors or church leaders.',
    tryVerse: 'Example Questions',
    emptyState: 'Enter a Bible verse above to receive your AI-powered guide',
    tryAnother: '← Try another verse',
    meaning: 'Meaning',
    context: 'Historical Context',
    relatedVerses: 'Related Verses',
    reflection: 'Practical Reflection',
    prayer: 'Prayer',
    basedOn: 'Based on Scripture',
    errorMsg: 'Something went wrong. Please try again.',
    errorRetry: 'Try Again',
    exQ1: 'What does the Bible say about fear?',
    exQ2: 'What did Jesus teach about forgiveness?',
    exQ3: 'Show Bible verses about faith.',
  },
  am: {
    title: 'የAI መጽሐፍ ቅዱስ መመሪያ',
    topicsTab: 'ርእሶች',
    verseTab: 'ቁጥር',
    topicsCreateTitle: 'የትምህርት ርእስ',
    topicsInputHint: 'የሚጠኑ ርዕስ ያስገቡ',
    topicsPlaceholder: 'ምሳሌ: እምነት, ጸሎት, ክርስትናዊ ሕይወት...',
    subtitle: 'ስለ መጽሐፍ ቅዱስ ጥያቄዎችን ይጠይቁ እና መመሪያ ያግኙ።',
    placeholder: 'የመጽሐፍ ቅዱስ ጥያቄ ይጠይቁ...',
    guideMe: 'AI ጠይቅ',
    loading: 'መጽሐፍ ቅዱስን በመፈለግ ላይ...',
    warning: 'የAI መልሶች በመጽሐፍ ቅዱስ ጽሑፎች ላይ የተመሰረቱ ናቸው፣ ነገር ግን የካህናት ወይም የቤተክርስቲያን መሪዎችን ምክር አይተኩም።',
    tryVerse: 'የምሳሌ ጥያቄዎች',
    emptyState: 'የAI መመሪያዎን ለመቀበል ከላይ የመጽሐፍ ቅዱስ ጥቅስ ያስገቡ',
    tryAnother: '← ሌላ ጥቅስ ይሞክሩ',
    meaning: 'ትርጉም',
    context: 'ታሪካዊ አውድ',
    relatedVerses: 'ተዛማጅ ጥቅሶች',
    reflection: 'ተግባራዊ ነጸብራቅ',
    prayer: 'ጸሎት',
    basedOn: 'ከቅዱሳት መጻሕፍት',
    errorMsg: 'ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።',
    errorRetry: 'እንደገና ሞክር',
    exQ1: 'መጽሐፍ ቅዱስ ስለ ፍርሃት ምን ይላል?',
    exQ2: 'ኢየሱስ ስለ ይቅርታ ምን አስተማረ?',
    exQ3: 'ስለ እምነት ያሉ የመጽሐፍ ቅዱስ ጥቅሶችን አሳየኝ።',
  },
  om: {
    title: 'Qajeelcha Macaafa Qulqulluu AI',
    subtitle: "Waa'ee Macaafa Qulqulluu gaafadhu; qajeelfama argadhu.",
    topicsTab: 'Mata-duree',
    verseTab: 'Lakkoofsa',
    topicsCreateTitle: 'Barumsa Uumuu',
    topicsInputHint: 'Mata-duree Macaafa Qulqulluu galchi',
    topicsPlaceholder: 'Fkn: Amantii, Kadhannaa, Jireenya Kiristaanaa...',
    relatedVerses: 'Luqqisoota Walqabatan',
    prayer: 'Kadhannaa',
    tryAnother: '← Biraa yaali',
    placeholder: 'Gaaffii Macaafa Qulqulluu gaafadhu...',
    guideMe: 'AI gaafadhu',
    subtitle: 'Filannoo barumsaa, gabaasee, fi ibsa waaqeffannaa',
    placeholder: 'Mata-duree gaaffii barreessi...',
    guideMe: 'Barumsa Barbaadi',
    loading: 'Barbaachaa jira...',
    warning: "Deebiin AI irratti hundaa'a Macaafa Qulqulluu irratti. Qajeelfama lallabdootaa ykn hoggantoota kiristaanaa bakka hin bu'u.",
    tryVerse: 'Fakkeenyaaf: Amantii, Kadhannaa, Jireenya Kiristaanaa...',
    emptyState: "Qajeelfama AI kee argachuuf, caqasa Kitaaba Qulqulluu as olitti galchi",
    tryAnother: '← Caqasa biraa yaali',
    meaning: 'Ibsa',
    context: 'Seenaa Duubee',
    relatedVerses: 'Luqqisoota Wal Fakkeessan',
    reflection: 'Yaada Hojii Jireenyaa',
    prayer: 'Kadhannaa',
    basedOn: 'Kitaaba Qulqulluu irraa',
    errorMsg: "Rakkoon uumameera. Mee irra deebi'ii yaali.",
    errorRetry: "Irra Deebi'i",
    exQ1: 'Macaafni Qulqulluun soda ilaalchisee maal jedhu?',
    exQ2: 'Yesuus dhiifama ilaalchisee maal barsiise?',
    exQ3: 'Amantii irratti caqasa Macaafa Qulqulluu naaf agarsiisi.',
  },
  ar: {
    title: 'مرشد الكتاب المقدس بالذكاء الاصطناعي',
    topicsTab: 'المواضيع',
    verseTab: 'آية',
    topicsCreateTitle: 'إنشاء تعليم',
    topicsInputHint: 'أدخل موضوعًا كتابيًا',
    topicsPlaceholder: 'مثال: الإيمان، الصلاة، الحياة المسيحية...',
    subtitle: 'اطرح أسئلة حول الكتاب المقدس واحصل على الإرشاد.',
    placeholder: 'اطرح سؤالاً عن الكتاب المقدس...',
    guideMe: 'اسأل الذكاء الاصطناعي',
    loading: 'جاري البحث في الكتاب المقدس...',
    warning: 'تعتمد إجابات الذكاء الاصطناعي على نصوص الكتاب المقدس ولا تغني عن إرشاد القساوسة أو قادة الكنيسة.',
    tryVerse: 'أمثلة على الأسئلة',
    emptyState: 'أدخل آية كتابية أعلاه للحصول على مرشدك القائم على الذكاء الاصطناعي',
    tryAnother: '← جرب آية أخرى',
    meaning: 'المعنى',
    context: 'السياق التاريخي',
    relatedVerses: 'آيات ذات صلة',
    reflection: 'التأمل العملي',
    prayer: 'الدعاء',
    basedOn: 'بناءً على الكتاب المقدس',
    errorMsg: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    errorRetry: 'حاول مجدداً',
    exQ1: 'ماذا يقول الكتاب المقدس عن الخوف؟',
    exQ2: 'ماذا علّم يسوع عن الغفران؟',
    exQ3: 'أرني آيات من الكتاب المقدس عن الإيمان.',
  },
  sw: {
    title: 'Mwongozo wa Biblia wa AI',
    topicsTab: 'Mada',
    verseTab: 'Ayat',
    topicsCreateTitle: 'Tengeneza Mafundisho',
    topicsInputHint: 'Ingiza mada ya kibiblia',
    topicsPlaceholder: 'Mfano: Imani, Sala, Maisha ya Kikristo...',
    subtitle: 'Uliza maswali kuhusu Biblia na upate mwongozo.',
    placeholder: 'Uliza swali kuhusu Biblia...',
    guideMe: 'Uliza AI',
    loading: 'Inatafuta katika Biblia...',
    warning: 'Majibu ya AI yanategemea maandiko ya Biblia na hayachukui nafasi ya ushauri wa wachungaji au viongozi wa kanisa.',
    tryVerse: 'Mifano ya Maswali',
    emptyState: 'Ingiza ayat ya Biblia hapo juu kupokea mwongozo wako unaoendeshwa na AI',
    tryAnother: '← Jaribu ayat nyingine',
    meaning: 'Maana',
    context: 'Muktadha wa Kihistoria',
    relatedVerses: 'Ayat Zinazohusiana',
    reflection: 'Tafakari ya Vitendo',
    prayer: 'Sala',
    basedOn: 'Kulingana na Kitabu Takatifu',
    errorMsg: 'Hitilafu imetokea. Tafadhali jaribu tena.',
    errorRetry: 'Jaribu Tena',
    exQ1: 'Biblia inasema nini kuhusu hofu?',
    exQ2: 'Yesu alifundisha nini kuhusu msamaha?',
    exQ3: 'Nionyeshe mistari ya Biblia kuhusu imani.',
  },
  fr: {
    title: 'Guide Biblique IA',
    topicsTab: 'Sujets',
    verseTab: 'Verset',
    topicsCreateTitle: 'Créer un Enseignement',
    topicsInputHint: 'Entrez un thème biblique',
    topicsPlaceholder: 'Ex: Foi, Prière, Vie Chrétienne...',
    subtitle: 'Posez des questions sur la Bible et recevez des conseils.',
    placeholder: 'Posez une question biblique...',
    guideMe: 'Demander à l\'IA',
    loading: 'Recherche dans la Bible...',
    warning: 'Les réponses de l\'IA sont basées sur les textes bibliques et ne remplacent pas les conseils des pasteurs ou des dirigeants d\'église.',
    tryVerse: 'Exemples de questions',
    emptyState: 'Entrez un verset biblique ci-dessus pour recevoir votre guide alimenté par l\'IA',
    tryAnother: '← Essayez un autre verset',
    meaning: 'Sens',
    context: 'Contexte Historique',
    relatedVerses: 'Versets Connexes',
    reflection: 'Réflexion Pratique',
    prayer: 'Prière',
    basedOn: 'Basé sur l\'Écriture',
    errorMsg: 'Une erreur s\'est produite. Veuillez réessayer.',
    errorRetry: 'Réessayer',
    exQ1: 'Que dit la Bible à propos de la peur ?',
    exQ2: 'Qu\'est-ce que Jésus a enseigné sur le pardon ?',
    exQ3: 'Montrez-moi des versets bibliques sur la foi.',
  },
};

// Example questions are now pulled from ui.exQ1/2/3 per language

// Language name for AI prompt
const LANG_NAME = { en: 'English', am: 'Amharic', om: 'Afaan Oromoo' };

export default function AIBibleGuide() {
  const { lang } = useI18n();
  const activeLang = ['en', 'am', 'om', 'ar', 'sw', 'fr'].includes(lang) ? lang : 'en';
  const ui = UI[activeLang] || UI.en;
  const examples = [ui.exQ1, ui.exQ2, ui.exQ3];

  const [activeTab, setActiveTab] = useState('topics');
  const [topicInput, setTopicInput] = useState('');
  const [topicResult, setTopicResult] = useState(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState('');

  const [verseRef, setVerseRef] = useState('');
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Topic search handler
  const handleTopicSearch = async () => {
    if (!topicInput.trim()) {
      setTopicError(activeLang === 'om' ? 'Maaloo mata-duree barreessi' : 
                   activeLang === 'am' ? 'እባክዎ ርእስ ያስገቡ' :
                   activeLang === 'ar' ? 'يرجى إدخال موضوع' :
                   activeLang === 'sw' ? 'Tafadhali ingiza mada' :
                   activeLang === 'fr' ? 'Veuillez entrer un sujet' :
                   'Please enter a topic');
      return;
    }

    // Clear previous error when starting new search
    setTopicError('');

    setTopicLoading(true);
    setTopicError('');
    setTopicResult(null);

    try {
      const response = await base44.functions.invoke('generateTopicTeaching', {
        topic: topicInput.trim(),
        language: activeLang,
        tab: 'topics'
      });

      if (response?.data) {
        setTopicResult(response.data);
      } else {
        setTopicError(activeLang === 'om' ? "Bu'aan hin argamne" :
                     activeLang === 'am' ? 'ውጤት አልተገኘም' :
                     'No result found');
      }
    } catch (err) {
      console.error('Topic search error:', err);
      setTopicError(ui.errorMsg);
    }
    setTopicLoading(false);
  };

  const handleTopicKeyDown = (e) => {
    if (e.key === 'Enter') handleTopicSearch();
  };

  const handleGenerate = async (ref) => {
    const target = (ref || verseRef).trim();
    if (!target) return;
    setVerseRef(target);
    setLoading(true);
    setError('');
    setGuide(null);

    const langName = LANG_NAME[activeLang] || 'English';

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a careful, Scripture-grounded Bible study assistant for FaithLight.

CRITICAL LANGUAGE RULE: You MUST respond entirely in ${langName}. Every word of your response — including all section content — must be written in ${langName} only. Do not mix languages.

Explain the Bible verse: ${target}

Rules:
- Use humble language: "This verse is often understood as…"
- NEVER say "This verse definitely means…"
- On disputed topics: "Christians understand this passage in different ways."
- Keep tone warm, respectful, denomination-neutral
- ALL output must be in ${langName}

Provide these exact sections in ${langName}:
1. Simple Explanation (2–3 sentences)
2. Historical Context (2–3 sentences)
3. Related Verses (exactly 3, with one-sentence connection each)
4. Practical Reflection (2–3 sentences, reflective style)
5. Prayer (2–4 sentences, personal prayer)

Return JSON only.`,
        response_json_schema: {
          type: 'object',
          properties: {
            verse_text: { type: 'string' },
            explanation: { type: 'string' },
            context: { type: 'string' },
            related_verses: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  reference: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            },
            application: { type: 'string' },
            prayer: { type: 'string' }
          }
        }
      });
      setGuide({ ...result, reference: target });
    } catch {
      setError(ui.errorMsg);
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleGenerate(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-4 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{ui.title}</h1>
          <p className="text-indigo-200 text-sm max-w-md mx-auto">{ui.subtitle}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('topics'); setTopicResult(null); setTopicError(''); }}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'topics'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {ui.topicsTab || 'Topics'}
          </button>
          <button
            onClick={() => { setActiveTab('verse'); setGuide(null); setError(''); }}
            className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'verse'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {ui.verseTab || 'Verse'}
          </button>
        </div>

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">
                {ui.topicsCreateTitle || 'Create Teaching'}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {ui.topicsInputHint || 'Enter a biblical topic'}
              </p>
            </div>

            <div className="space-y-3">
              <Input
              placeholder={ui.topicsPlaceholder || 'E.g., Faith, Prayer, Christian Life...'}
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                onKeyDown={handleTopicKeyDown}
                className="h-11"
              />
              <Button
                onClick={handleTopicSearch}
                disabled={topicLoading || !topicInput.trim()}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
              >
                {topicLoading ? (
                  <><RefreshCw className="w-4 h-4 animate-spin mr-2" />{ui.loading}</>
                ) : (
                  ui.topicsCreateTitle || 'Create Teaching'
                )}
              </Button>
            </div>

            {topicError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {topicError}
              </div>
            )}

            {topicResult && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
                  <h2 className="text-2xl font-bold">{topicResult.title}</h2>
                </div>

                <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
                  <p className="text-gray-700 text-sm leading-relaxed">{topicResult.explanation}</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="font-bold text-gray-900 mb-3">
                    {ui.relatedVerses}
                  </p>
                  <div className="space-y-2">
                    {(topicResult.verses || []).map((verse, i) => (
                      <div key={i} className="text-sm text-indigo-700 font-medium">
                        📖 {verse}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-rose-50 rounded-2xl border border-rose-100 p-5">
                  <p className="font-bold text-gray-900 mb-2">
                    {ui.prayer}
                  </p>
                  <p className="text-gray-700 text-sm italic leading-relaxed">"{topicResult.prayer}"</p>
                </div>

                <button
                  onClick={() => { setTopicResult(null); setTopicInput(''); }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {ui.tryAnother}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Verse Tab */}
        {activeTab === 'verse' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 space-y-4">
            <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={ui.placeholder}
                value={verseRef}
                onChange={e => setVerseRef(e.target.value)}
                onKeyDown={handleKey}
                className="pl-9 h-12 text-base"
                autoFocus
              />
            </div>
            <Button
              onClick={() => handleGenerate()}
              disabled={loading || !verseRef.trim()}
              className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
            >
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" />{ui.loading}</> : ui.guideMe}
            </Button>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">{ui.warning}</p>
          </div>

          {/* Example chips */}
          <div>
            <p className="text-xs text-gray-400 mb-2">{ui.tryVerse}</p>
            <div className="flex flex-wrap gap-2">
              {examples.map(ex => (
                <button
                  key={ex}
                  onClick={() => handleGenerate(ex)}
                  className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-full px-3 py-1 font-medium transition-colors min-h-[44px]"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm text-red-600">{error}</p>
              <Button
                onClick={() => handleGenerate(verseRef)}
                disabled={loading}
                size="sm"
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                {ui.errorRetry || 'Try Again'}
              </Button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4 animate-pulse">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
          )}

          {/* Guide Result */}
          {guide && !loading && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-indigo-200" />
                <span className="text-indigo-200 text-sm font-semibold">{guide.reference}</span>
              </div>
              {guide.verse_text && (
                <p className="text-lg font-medium leading-relaxed italic">"{guide.verse_text}"</p>
              )}
            </div>

            <GuideSection
              icon={<Lightbulb className="w-5 h-5 text-amber-600" />}
              iconBg="bg-amber-100"
              label={ui.meaning}
              content={guide.explanation}
            />
            <GuideSection
              icon={<Clock className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-100"
              label={ui.context}
              content={guide.context}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <BookMarked className="w-5 h-5 text-green-600" />
                </div>
                <p className="font-bold text-gray-900">{ui.relatedVerses}</p>
              </div>
              <div className="space-y-3">
                {(guide.related_verses || []).map((rv, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <ChevronRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-green-800">{rv.reference}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{rv.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <GuideSection
              icon={<Sparkles className="w-5 h-5 text-purple-600" />}
              iconBg="bg-purple-100"
              label={ui.reflection}
              content={guide.application}
              bgColor="bg-purple-50"
              borderColor="border-purple-100"
            />

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-rose-600" />
                </div>
                <p className="font-bold text-gray-900">{ui.prayer}</p>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed italic">"{guide.prayer}"</p>
            </div>

            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{ui.basedOn}</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full">📖 {guide.reference}</span>
                {(guide.related_verses || []).map((rv, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{rv.reference}</span>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => { setGuide(null); setVerseRef(''); }}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {ui.tryAnother}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!guide && !loading && !error && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{ui.emptyState}</p>
          </div>
        )}
        </div>
        )}
      </div>
    </div>
  );
}

function GuideSection({ icon, iconBg, label, content, bgColor = 'bg-white', borderColor = 'border-gray-100' }) {
  return (
    <div className={`${bgColor} rounded-2xl shadow-sm border ${borderColor} p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <p className="font-bold text-gray-900">{label}</p>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
    </div>
  );
}