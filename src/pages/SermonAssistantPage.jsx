import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Copy,
  Search,
  Sparkles,
  Users,
  Wand2,
} from 'lucide-react';

const translations = {
  en: {
    pageTitle: 'Sermon Assistant',
    subtitle:
      'Create sermon outlines, teaching points, and prayer guidance for church and Bible study.',
    back: 'Back',
    form: {
      topicOrVerse: 'Topic or Verse',
      topicOrVersePlaceholder: 'Enter a sermon topic or Bible verse...',
      audience: 'Audience',
      tone: 'Tone',
      duration: 'Duration',
      language: 'Language',
      notes: 'Extra Notes',
      notesPlaceholder:
        'Add sermon goal, church context, occasion, or message focus...',
    },
    options: {
      audience: {
        church: 'Church',
        youth: 'Youth',
        adults: 'Adults',
        children: 'Children',
      },
      tone: {
        pastoral: 'Pastoral',
        powerful: 'Powerful',
        teaching: 'Teaching',
        encouraging: 'Encouraging',
      },
      duration: {
        short: '10–15 min',
        medium: '20–30 min',
        long: '35–45 min',
      },
    },
    actions: {
      generate: 'Generate Sermon',
      clear: 'Clear',
      copy: 'Copy',
      copied: 'Copied',
    },
    preview: {
      title: 'Sermon Outline',
      empty:
        'Enter a topic or verse, choose your options, and generate a sermon outline.',
      titleLabel: 'Title',
      themeLabel: 'Theme',
      keyVerseLabel: 'Key Verse',
      introduction: 'Introduction',
      mainPoints: 'Main Points',
      conclusion: 'Conclusion',
      closingPrayer: 'Closing Prayer',
      point: 'Point',
      application: 'Application',
      supportingVerse: 'Supporting Verse',
    },
    badges: {
      aiPowered: 'AI Assisted',
      readyToPreach: 'Ready to Teach',
    },
  },

  om: {
    pageTitle: 'Gargaaraa Lallabaa',
    subtitle:
      'Mana kiristaanaa fi qo\'annoo Macaafa Qulqulluu keessatti karoora lallabaa, qabxiilee barsiisaa, fi qajeelfama kadhannaa uumi.',
    back: 'Duubatti',
    form: {
      topicOrVerse: 'Mata Duree ykn Aayata',
      topicOrVersePlaceholder: 'Mata duree lallabaa ykn aayata Macaaba Qulqulluu galchi...',
      audience: 'Dhaggeeffattoota',
      tone: 'Akkaataa Dubbii',
      duration: 'Yeroo',
      language: 'Afaan',
      notes: 'Yaada Dabalataa',
      notesPlaceholder:
        'Kaayyoo lallabaa, haala waldaa, yeroo tajaajilaa, ykn xiyyeeffannoo ergaa galchi...',
    },
    options: {
      audience: {
        church: 'Mana Kiristaanaa',
        youth: 'Dargaggoota',
        adults: 'Gurguddoo',
        children: 'Ijoollee',
      },
      tone: {
        pastoral: 'Tiksummaa',
        powerful: 'Humna-qabeessa',
        teaching: 'Barsiisaa',
        encouraging: 'Jajjabeessaa',
      },
      duration: {
        short: 'Daqiiqaa 10–15',
        medium: 'Daqiiqaa 20–30',
        long: 'Daqiiqaa 35–45',
      },
    },
    actions: {
      generate: 'Lallaba Uumi',
      clear: 'Haqi',
      copy: 'Waraabi',
      copied: 'Waraabameera',
    },
    preview: {
      title: 'Karoora Lallabaa',
      empty:
        'Mata duree ykn aayata galchi, filannoowwan kee murteessi, sana booda karoora lallabaa uumi.',
      titleLabel: 'Mata Duree',
      themeLabel: 'Ergaa Ijoo',
      keyVerseLabel: 'Aayata Ijoo',
      introduction: 'Seensa',
      mainPoints: 'Qabxiilee Ijoo',
      conclusion: 'Xumura',
      closingPrayer: 'Kadhannaa Xumuraa',
      point: 'Qabxii',
      application: 'Hojii Irra Oolmaa',
      supportingVerse: 'Aayata Deeggaraa',
    },
    badges: {
      aiPowered: 'AI Gargaarsaan',
      readyToPreach: 'Barsiisuuf Qophaa\'e',
    },
  },

  am: {
    pageTitle: 'የስብከት ረዳት',
    subtitle:
      'ለቤተ ክርስቲያንና ለመጽሐፍ ቅዱስ ጥናት የስብከት እቅዶችን፣ የትምህርት ነጥቦችን እና የጸሎት መመሪያ ይፍጠሩ።',
    back: 'ተመለስ',
    form: {
      topicOrVerse: 'ርዕስ ወይም ጥቅስ',
      topicOrVersePlaceholder: 'የስብከት ርዕስ ወይም የመጽሐፍ ቅዱስ ጥቅስ ያስገቡ...',
      audience: 'አድማጮች',
      tone: 'የንግግር ቅርጽ',
      duration: 'ቆይታ',
      language: 'ቋንቋ',
      notes: 'ተጨማሪ ማስታወሻ',
      notesPlaceholder: 'የስብከት ግብ፣ የቤተ ክርስቲያን ሁኔታ፣ አጋጣሚ ወይም የመልእክት ትኩረት ያስገቡ...',
    },
    options: {
      audience: {
        church: 'ቤተ ክርስቲያን',
        youth: 'ወጣቶች',
        adults: 'አዋቂዎች',
        children: 'ልጆች',
      },
      tone: {
        pastoral: 'እረኝነት',
        powerful: 'ኃይለኛ',
        teaching: 'አስተማሪ',
        encouraging: 'አበረታች',
      },
      duration: {
        short: '10–15 ደቂቃ',
        medium: '20–30 ደቂቃ',
        long: '35–45 ደቂቃ',
      },
    },
    actions: {
      generate: 'ስብከት ፍጠር',
      clear: 'አጥፋ',
      copy: 'ቅዳ',
      copied: 'ተቀድቷል',
    },
    preview: {
      title: 'የስብከት እቅድ',
      empty:
        'ርዕስ ወይም ጥቅስ ያስገቡ፣ አማራጮችን ይምረጡ፣ ከዚያ የስብከት እቅድ ይፍጠሩ።',
      titleLabel: 'ርዕስ',
      themeLabel: 'ዋና ሐሳብ',
      keyVerseLabel: 'ቁልፍ ጥቅስ',
      introduction: 'መግቢያ',
      mainPoints: 'ዋና ነጥቦች',
      conclusion: 'መደምደሚያ',
      closingPrayer: 'የመዝጊያ ጸሎት',
      point: 'ነጥብ',
      application: 'ተግባራዊ አተገባበር',
      supportingVerse: 'ደጋፊ ጥቅስ',
    },
    badges: {
      aiPowered: 'በAI የተገዛ',
      readyToPreach: 'ለማስተማር ዝግጁ',
    },
  },

  fr: {
    pageTitle: 'Assistant de Sermon',
    subtitle:
      'Créez des plans de sermon, des points d\'enseignement et des orientations de prière pour l\'église et l\'étude biblique.',
    back: 'Retour',
    form: {
      topicOrVerse: 'Sujet ou Verset',
      topicOrVersePlaceholder: 'Entrez un sujet de sermon ou un verset biblique...',
      audience: 'Public',
      tone: 'Ton',
      duration: 'Durée',
      language: 'Langue',
      notes: 'Notes supplémentaires',
      notesPlaceholder:
        'Ajoutez l\'objectif du sermon, le contexte de l\'église, l\'occasion ou l\'axe du message...',
    },
    options: {
      audience: {
        church: 'Église',
        youth: 'Jeunes',
        adults: 'Adultes',
        children: 'Enfants',
      },
      tone: {
        pastoral: 'Pastoral',
        powerful: 'Puissant',
        teaching: 'Enseignement',
        encouraging: 'Encourageant',
      },
      duration: {
        short: '10–15 min',
        medium: '20–30 min',
        long: '35–45 min',
      },
    },
    actions: {
      generate: 'Générer le sermon',
      clear: 'Effacer',
      copy: 'Copier',
      copied: 'Copié',
    },
    preview: {
      title: 'Plan de Sermon',
      empty:
        'Entrez un sujet ou un verset, choisissez vos options, puis générez un plan de sermon.',
      titleLabel: 'Titre',
      themeLabel: 'Thème',
      keyVerseLabel: 'Verset clé',
      introduction: 'Introduction',
      mainPoints: 'Points principaux',
      conclusion: 'Conclusion',
      closingPrayer: 'Prière finale',
      point: 'Point',
      application: 'Application',
      supportingVerse: 'Verset d\'appui',
    },
    badges: {
      aiPowered: 'Assisté par IA',
      readyToPreach: 'Prêt à enseigner',
    },
  },

  sw: {
    pageTitle: 'Msaidizi wa Mahubiri',
    subtitle:
      'Tengeneza mipango ya mahubiri, pointi za mafundisho, na mwongozo wa maombi kwa kanisa na kujifunza Biblia.',
    back: 'Rudi',
    form: {
      topicOrVerse: 'Mada au Aya',
      topicOrVersePlaceholder: 'Weka mada ya mahubiri au aya ya Biblia...',
      audience: 'Wasikilizaji',
      tone: 'Mtindo',
      duration: 'Muda',
      language: 'Lugha',
      notes: 'Maelezo ya Ziada',
      notesPlaceholder:
        'Ongeza lengo la mahubiri, mazingira ya kanisa, tukio, au mwelekeo wa ujumbe...',
    },
    options: {
      audience: {
        church: 'Kanisa',
        youth: 'Vijana',
        adults: 'Watu wazima',
        children: 'Watoto',
      },
      tone: {
        pastoral: 'Kichungaji',
        powerful: 'Yenye nguvu',
        teaching: 'Kufundisha',
        encouraging: 'Ya kutia moyo',
      },
      duration: {
        short: 'Dakika 10–15',
        medium: 'Dakika 20–30',
        long: 'Dakika 35–45',
      },
    },
    actions: {
      generate: 'Tengeneza Mahubiri',
      clear: 'Futa',
      copy: 'Nakili',
      copied: 'Imenakiliwa',
    },
    preview: {
      title: 'Muhtasari wa Mahubiri',
      empty:
        'Weka mada au aya, chagua chaguo zako, kisha tengeneza muhtasari wa mahubiri.',
      titleLabel: 'Kichwa',
      themeLabel: 'Mada Kuu',
      keyVerseLabel: 'Aya Kuu',
      introduction: 'Utangulizi',
      mainPoints: 'Pointi Kuu',
      conclusion: 'Hitimisho',
      closingPrayer: 'Sala ya Kufunga',
      point: 'Pointi',
      application: 'Matumizi',
      supportingVerse: 'Aya ya Msaada',
    },
    badges: {
      aiPowered: 'Kwa Msaada wa AI',
      readyToPreach: 'Tayari Kufundisha',
    },
  },

  ar: {
    pageTitle: 'مساعد العظة',
    subtitle:
      'أنشئ مخططات عظات، ونقاط تعليمية، وإرشادات صلاة للكنيسة ودراسة الكتاب المقدس.',
    back: 'رجوع',
    form: {
      topicOrVerse: 'الموضوع أو الآية',
      topicOrVersePlaceholder: 'أدخل موضوع العظة أو آية من الكتاب المقدس...',
      audience: 'الجمهور',
      tone: 'الأسلوب',
      duration: 'المدة',
      language: 'اللغة',
      notes: 'ملاحظات إضافية',
      notesPlaceholder:
        'أضف هدف العظة، أو سياق الكنيسة، أو المناسبة، أو تركيز الرسالة...',
    },
    options: {
      audience: {
        church: 'الكنيسة',
        youth: 'الشباب',
        adults: 'البالغون',
        children: 'الأطفال',
      },
      tone: {
        pastoral: 'راعوي',
        powerful: 'قوي',
        teaching: 'تعليمي',
        encouraging: 'مشجّع',
      },
      duration: {
        short: '10–15 دقيقة',
        medium: '20–30 دقيقة',
        long: '35–45 دقيقة',
      },
    },
    actions: {
      generate: 'أنشئ العظة',
      clear: 'مسح',
      copy: 'نسخ',
      copied: 'تم النسخ',
    },
    preview: {
      title: 'مخطط العظة',
      empty:
        'أدخل موضوعًا أو آية، واختر الإعدادات، ثم أنشئ مخطط العظة.',
      titleLabel: 'العنوان',
      themeLabel: 'الفكرة الرئيسية',
      keyVerseLabel: 'الآية الرئيسية',
      introduction: 'المقدمة',
      mainPoints: 'النقاط الرئيسية',
      conclusion: 'الخاتمة',
      closingPrayer: 'صلاة الختام',
      point: 'النقطة',
      application: 'التطبيق',
      supportingVerse: 'الآية الداعمة',
    },
    badges: {
      aiPowered: 'بمساعدة الذكاء الاصطناعي',
      readyToPreach: 'جاهز للتعليم',
    },
  },
};

const sermonTemplates = {
  en: {
    title: 'Walking by Faith in Difficult Times',
    theme: 'God calls His people to trust Him even when the way is unclear.',
    keyVerse: '2 Corinthians 5:7',
    introduction:
      'Many believers love God deeply but struggle when life becomes uncertain. This message reminds the church that faith is not based on what we see, but on who God is.',
    mainPoints: [
      {
        title: 'Faith begins with trusting God\'s character',
        explanation:
          'Biblical faith is not blind optimism. It rests on the goodness, wisdom, and faithfulness of God.',
        supportingVerse: 'Hebrews 11:1',
        application:
          'When circumstances are confusing, remind yourself of who God has proven Himself to be.',
      },
      {
        title: 'Faith continues when feelings are weak',
        explanation:
          'Believers do not always feel strong, but God still sustains them. Faith often grows most deeply in hardship.',
        supportingVerse: 'Isaiah 40:31',
        application:
          'Do not wait to feel powerful before obeying God. Take the next faithful step today.',
      },
      {
        title: 'Faith points us toward God\'s promises',
        explanation:
          'The Word of God gives direction, comfort, and courage. His promises stabilize the heart.',
        supportingVerse: 'Romans 10:17',
        application:
          'Build your daily life around Scripture so your confidence is anchored in truth.',
      },
    ],
    conclusion:
      'Faith is not the absence of struggle. It is steady confidence that God remains true. The church is called to walk forward with obedience, prayer, and hope.',
    closingPrayer:
      'Lord, strengthen our faith. Help us trust You in uncertainty, obey Your Word, and rest in Your promises. In Jesus\' name, amen.',
  },
};

function buildSermonResult(language, topicOrVerse, notes, audience, tone, duration) {
  const base = sermonTemplates[language] ?? sermonTemplates.en;
  const customTopic = topicOrVerse.trim();

  if (!customTopic) return base;

  return {
    ...base,
    title: `Sermon on ${customTopic}`,
    theme: `This message focuses on ${customTopic} and how it can be applied in church life.`,
    introduction:
      notes.trim()
        ? `${base.introduction} ${notes.trim()}`
        : base.introduction,
    mainPoints: base.mainPoints.map((point) => ({
      ...point,
      explanation: `${point.explanation} This can be presented to ${audience} in a ${tone} style.`,
    })),
    conclusion: `${base.conclusion} Suggested duration: ${duration}.`,
  };
}

function FieldLabel({ children }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}
    </label>
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
    >
      {options.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

export default function SermonAssistantPage({ language = 'en', onBack }) {
  const t = translations[language] ?? translations.en;
  const isRTL = language === 'ar';

  const audienceOptions = Object.values(t.options.audience);
  const toneOptions = Object.values(t.options.tone);
  const durationOptions = Object.values(t.options.duration);

  const [topicOrVerse, setTopicOrVerse] = useState('');
  const [audience, setAudience] = useState(audienceOptions[0]);
  const [tone, setTone] = useState(toneOptions[0]);
  const [duration, setDuration] = useState(durationOptions[1]);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const canGenerate = useMemo(() => topicOrVerse.trim().length > 0, [topicOrVerse]);

  const handleGenerate = () => {
    if (!canGenerate) return;

    const generated = buildSermonResult(
      language,
      topicOrVerse,
      notes,
      audience,
      tone,
      duration
    );
    setResult(generated);
  };

  const handleClear = () => {
    setTopicOrVerse('');
    setAudience(audienceOptions[0]);
    setTone(toneOptions[0]);
    setDuration(durationOptions[1]);
    setNotes('');
    setResult(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result) return;

    const text = [
      `${t.preview.titleLabel}: ${result.title}`,
      `${t.preview.themeLabel}: ${result.theme}`,
      `${t.preview.keyVerseLabel}: ${result.keyVerse}`,
      '',
      `${t.preview.introduction}:`,
      result.introduction,
      '',
      `${t.preview.mainPoints}:`,
      ...result.mainPoints.flatMap((point, index) => [
        `${t.preview.point} ${index + 1}: ${point.title}`,
        point.explanation,
        `${t.preview.supportingVerse}: ${point.supportingVerse}`,
        `${t.preview.application}: ${point.application}`,
        '',
      ]),
      `${t.preview.conclusion}:`,
      result.conclusion,
      '',
      `${t.preview.closingPrayer}:`,
      result.closingPrayer,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-slate-50 ${isRTL ? 'text-right' : 'text-left'}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label={t.back}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              {t.pageTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-600 md:text-base">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Hero */}
        <div className="mt-6 rounded-[32px] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
              <Sparkles className="h-4 w-4" />
              {t.badges.aiPowered}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
              <BookOpen className="h-4 w-4" />
              {t.badges.readyToPreach}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Users className="h-4 w-4" />
                <span>{t.form.audience}</span>
              </div>
              <p className="mt-2 text-lg font-semibold">{audience}</p>
            </div>

            <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Wand2 className="h-4 w-4" />
                <span>{t.form.tone}</span>
              </div>
              <p className="mt-2 text-lg font-semibold">{tone}</p>
            </div>

            <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Clock3 className="h-4 w-4" />
                <span>{t.form.duration}</span>
              </div>
              <p className="mt-2 text-lg font-semibold">{duration}</p>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,1.15fr]">
          {/* Form */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div>
              <FieldLabel>{t.form.topicOrVerse}</FieldLabel>
              <div className="relative">
                <Search
                  className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 ${
                    isRTL ? 'right-4' : 'left-4'
                  }`}
                />
                <input
                  type="text"
                  value={topicOrVerse}
                  onChange={(e) => setTopicOrVerse(e.target.value)}
                  placeholder={t.form.topicOrVersePlaceholder}
                  className={`h-12 w-full rounded-2xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 ${
                    isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'
                  }`}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <FieldLabel>{t.form.audience}</FieldLabel>
                <SelectField
                  value={audience}
                  onChange={setAudience}
                  options={audienceOptions}
                />
              </div>

              <div>
                <FieldLabel>{t.form.tone}</FieldLabel>
                <SelectField
                  value={tone}
                  onChange={setTone}
                  options={toneOptions}
                />
              </div>

              <div>
                <FieldLabel>{t.form.duration}</FieldLabel>
                <SelectField
                  value={duration}
                  onChange={setDuration}
                  options={durationOptions}
                />
              </div>

              <div>
                <FieldLabel>{t.form.language}</FieldLabel>
                <div className="flex h-12 items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 text-slate-700">
                  {language === 'om'
                    ? 'Afaan Oromoo'
                    : language === 'am'
                    ? 'አማርኛ'
                    : language === 'fr'
                    ? 'Français'
                    : language === 'sw'
                    ? 'Kiswahili'
                    : language === 'ar'
                    ? 'العربية'
                    : 'English'}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <FieldLabel>{t.form.notes}</FieldLabel>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.form.notesPlaceholder}
                className="min-h-[130px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-violet-600 px-5 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t.actions.generate}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {t.actions.clear}
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                {t.preview.title}
              </h2>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!result}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy className="h-4 w-4" />
                {copied ? t.actions.copied : t.actions.copy}
              </button>
            </div>

            {!result ? (
              <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                {t.preview.empty}
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
                  <p className="text-sm font-medium text-white/80">
                    {t.preview.titleLabel}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{result.title}</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-white/80">{t.preview.themeLabel}</p>
                      <p className="mt-1">{result.theme}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/80">{t.preview.keyVerseLabel}</p>
                      <p className="mt-1 font-semibold">{result.keyVerse}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {t.preview.introduction}
                  </h4>
                  <p className="mt-3 leading-7 text-slate-700">
                    {result.introduction}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {t.preview.mainPoints}
                  </h4>

                  <div className="mt-4 space-y-4">
                    {result.mainPoints.map((point, index) => (
                      <div
                        key={`${point.title}-${index}`}
                        className="rounded-2xl bg-slate-50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h5 className="text-base font-bold text-slate-900">
                              {point.title}
                            </h5>
                            <p className="mt-2 leading-7 text-slate-700">
                              {point.explanation}
                            </p>

                            <div className="mt-3 rounded-xl bg-white p-3">
                              <p className="text-sm font-semibold text-slate-800">
                                {t.preview.supportingVerse}
                              </p>
                              <p className="mt-1 text-slate-700">
                                {point.supportingVerse}
                              </p>
                            </div>

                            <div className="mt-3 rounded-xl bg-violet-50 p-3">
                              <p className="text-sm font-semibold text-violet-800">
                                {t.preview.application}
                              </p>
                              <p className="mt-1 text-violet-900">
                                {point.application}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {t.preview.conclusion}
                  </h4>
                  <p className="mt-3 leading-7 text-slate-700">
                    {result.conclusion}
                  </p>
                </div>

                <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
                  <h4 className="text-lg font-semibold text-violet-900">
                    {t.preview.closingPrayer}
                  </h4>
                  <p className="mt-3 leading-7 text-violet-950">
                    {result.closingPrayer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}