import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useI18n } from '@/components/I18nProvider';
import { Button } from '@/components/ui/button';
import { ChevronRight, Volume2, Share2, BookOpen, Sparkles, Heart, CheckCircle2 } from 'lucide-react';

const DAILY_CONTENT = {
  verse_ref: 'Romans 8:28',
  verse_text: 'And we know that in all things God works for the good of those who love him.',
  reflection_q: 'What does this verse teach about trusting God during difficult situations?',
  quiz: {
    question: 'Which book contains today\'s verse?',
    options: ['Romans', 'Psalms', 'Matthew', 'Isaiah'],
    correct: 0,
  },
};

const TRANSLATIONS = {
  en: {
    title: 'Daily Faith Journey',
    subtitle: 'Your 5-minute spiritual guide',
    step1_title: 'Verse of the Day',
    step2_title: 'Reflection',
    step2_prompt: 'What does this verse teach about trusting God during difficult situations?',
    step2_options: ['Think quietly', 'Write reflection', 'Skip'],
    step3_title: 'AI Insight',
    step3_text: 'This verse reminds believers that God is working even when life feels uncertain.',
    step3_more: 'Explain More',
    step3_ask: 'Ask AI a Question',
    step4_title: 'Write a Prayer',
    step4_prompt: 'Write a short prayer based on today\'s verse.',
    step4_save: 'Save to Faith Journal',
    step5_title: 'Daily Quiz',
    step5_correct: '✓ Correct!',
    step5_incorrect: 'Think about it more...',
    done_title: '✨ Daily Faith Journey Complete',
    done_msg: 'You spent time with Scripture today.',
    done_tomorrow: 'Come back tomorrow for another journey.',
    btn_read: 'Read More',
    btn_listen: 'Listen',
    btn_share: 'Share',
    btn_next: 'Next Step',
    btn_start: 'Start Journey',
  },
  om: {
    title: 'Imala Aaraaraa Jidhadhii',
    subtitle: 'Imaala spiirituaalaa dhiqdhaqtaa keessan',
    step1_title: 'Ayaata Har\'aa',
    step2_title: 'Yaadituu',
    step2_prompt: 'Ayaataan kun akka maali Waaqa dhibaatti jalqabuu barbaachisuu barsiisa?',
    step2_options: ['Kadhaa harkaa yaadi', 'Yaadituu barreessi', 'Kaas dhiisi'],
    step3_title: 'Hubannaa AI',
    step3_text: 'Ayaataan kun godaantota akka Waaqa haata\'u oboleessa itti fakkaata.',
    step3_more: 'Daandii Caalaatti Ibsi',
    step3_ask: 'AI\'f Gaaffii Gaafadhu',
    step4_title: 'Kadhaa Barreessi',
    step4_prompt: 'Kadhaa gabaabaa ayaata har\'aa irratti hundaa\'e barreessi.',
    step4_save: 'Jurnaalii Jidhadhii keessatti kuusaa',
    step5_title: 'Gaaffii Har\'aa',
    step5_correct: '✓ Sirrii!',
    step5_incorrect: 'Isaa caalaatti hubadhaa...',
    done_title: '✨ Imala Aaraaraa Jidhadhii Xummame',
    done_msg: 'Har\'a waqtii Macaaba Qulqulluutti qabadte.',
    done_tomorrow: 'Imala biraa argachuuf gara fuula duraa deebi\'i.',
    btn_read: 'Caalaatti Dubbisi',
    btn_listen: 'Walaagaa',
    btn_share: 'Qorataa',
    btn_next: 'Tarkaanfii Itti Aanu',
    btn_start: 'Imala Jalqabi',
  },
  am: {
    title: 'ዕለታዊ ምሕረት ጉዞ',
    subtitle: 'የእርስዎ 5-ደቂቃ መንፈስ መምሪያ',
    step1_title: 'የዛሬ ጥቅስ',
    step2_title: 'ማሰላሰል',
    step2_prompt: 'ይህ ጥቅስ ለማንያዋል ስለ አምነት ምን ይማራል?',
    step2_options: ['በ조용히ሙላ', 'ማሰላሰል ይጻፉ', 'ዝለል'],
    step3_title: 'AI ግንዛቤ',
    step3_text: 'ይህ ጥቅስ አምናቶችን ንስሐ ያልተጠበቀ ጊዜ አምነትን ያስታውሳል።',
    step3_more: 'ተጨማሪ ማብራሪያ',
    step3_ask: 'ለAI ጥያቄ ጠይቅ',
    step4_title: 'ጸሎት ይጻፉ',
    step4_prompt: 'በዛሬ ጥቅስ ላይ በመስተንደድ አጭር ጸሎት ይጻፉ።',
    step4_save: 'በእምነት ማስታወሻ ውስጥ ያስቀምጡ',
    step5_title: 'ዕለታዊ ምርመራ',
    step5_correct: '✓ ትክክል!',
    step5_incorrect: 'ብዙ ያስቡበት...',
    done_title: '✨ ዕለታዊ ምሕረት ጉዞ ተጠናቀቀ',
    done_msg: 'ዛሬ ከመጽሐፍ ቅዱስ ጋር ጊዜ አሳልፈዋል።',
    done_tomorrow: 'ለሌላ ጉዞ 내일 ተመለሱ።',
    btn_read: 'ተጨማሪ ያንብቡ',
    btn_listen: 'ያዳምጡ',
    btn_share: 'ያጋሩ',
    btn_next: 'ቀጣይ ደረጃ',
    btn_start: 'ጉዞ ይጀምሩ',
  },
  ar: {
    title: 'رحلة الإيمان اليومية',
    subtitle: 'دليلك الروحي لمدة 5 دقائق',
    step1_title: 'آية اليوم',
    step2_title: 'التأمل',
    step2_prompt: 'ماذا تعلمك هذه الآية عن الثقة بالله في الأوقات الصعبة؟',
    step2_options: ['التأمل بهدوء', 'كتابة التأمل', 'تخطي'],
    step3_title: 'رؤية الذكاء الاصطناعي',
    step3_text: 'تذكر هذه الآية المؤمنين بأن الله يعمل حتى عندما تشعر الحياة بعدم اليقين.',
    step3_more: 'شرح المزيد',
    step3_ask: 'اسأل الذكاء الاصطناعي',
    step4_title: 'اكتب صلاة',
    step4_prompt: 'اكتب صلاة قصيرة بناءً على آية اليوم.',
    step4_save: 'حفظ في دفتر الإيمان',
    step5_title: 'اختبار يومي',
    step5_correct: '✓ صحيح!',
    step5_incorrect: 'فكر فيها أكثر...',
    done_title: '✨ رحلة الإيمان اليومية مكتملة',
    done_msg: 'قضيت وقتًا مع الكتاب المقدس اليوم.',
    done_tomorrow: 'عد غدًا للحصول على رحلة أخرى.',
    btn_read: 'اقرأ المزيد',
    btn_listen: 'استمع',
    btn_share: 'شارك',
    btn_next: 'الخطوة التالية',
    btn_start: 'ابدأ الرحلة',
  },
  sw: {
    title: 'Safari ya Imani ya Kila Siku',
    subtitle: 'Mwongozo wako wa roho kwa dakika 5',
    step1_title: 'Ayat ya Leo',
    step2_title: 'Kulinganizia',
    step2_prompt: 'Ayat hii inatuambia nini kuhusu kutegemea Mungu katika matatizo?',
    step2_options: ['Kulinganizia kimya', 'Kuandika kulinganizia', 'Ruka'],
    step3_title: 'Mwelekeo wa AI',
    step3_text: 'Ayat hii inakumbusha waumini kwamba Mungu anafanya kazi hata wakati maisha yanajisikia kwa ujinga.',
    step3_more: 'Eleza Zaidi',
    step3_ask: 'Muulize AI Swali',
    step4_title: 'Andika Dua',
    step4_prompt: 'Andika dua fupi kwa misingi ya ayat ya leo.',
    step4_save: 'Hifadhi katika Kitabu cha Imani',
    step5_title: 'Mtihani wa Kila Siku',
    step5_correct: '✓ Sahihi!',
    step5_incorrect: 'Fikiria zaidi...',
    done_title: '✨ Safari ya Imani ya Kila Siku Imemaliza',
    done_msg: 'Ulitumia wakati na Kitabu Takatifu leo.',
    done_tomorrow: 'Rudi kesho kwa safari nyingine.',
    btn_read: 'Soma Zaidi',
    btn_listen: 'Sikia',
    btn_share: 'Shiriki',
    btn_next: 'Hatua Inayofuata',
    btn_start: 'Anza Safari',
  },
  fr: {
    title: 'Voyage de Foi Quotidien',
    subtitle: 'Votre guide spirituel de 5 minutes',
    step1_title: 'Verset du Jour',
    step2_title: 'Réflexion',
    step2_prompt: 'Que vous enseigne ce verset sur la confiance en Dieu dans les moments difficiles?',
    step2_options: ['Réfléchir tranquillement', 'Écrire une réflexion', 'Ignorer'],
    step3_title: 'Aperçu de l\'IA',
    step3_text: 'Ce verset rappelle aux croyants que Dieu œuvre même quand la vie semble incertaine.',
    step3_more: 'Expliquer Plus',
    step3_ask: 'Poser une Question à l\'IA',
    step4_title: 'Écrire une Prière',
    step4_prompt: 'Écrivez une courte prière basée sur le verset d\'aujourd\'hui.',
    step4_save: 'Enregistrer dans le Journal de Foi',
    step5_title: 'Quiz Quotidien',
    step5_correct: '✓ Correct!',
    step5_incorrect: 'Réfléchissez-y davantage...',
    done_title: '✨ Voyage de Foi Quotidien Terminé',
    done_msg: 'Vous avez passé du temps avec l\'Écriture sainte aujourd\'hui.',
    done_tomorrow: 'Revenez demain pour un autre voyage.',
    btn_read: 'Lire Plus',
    btn_listen: 'Écouter',
    btn_share: 'Partager',
    btn_next: 'Étape Suivante',
    btn_start: 'Commencer le Voyage',
  },
};

function StepCard({ step, onNext, t }) {
  const [input, setInput] = useState('');
  const [quizAnswer, setQuizAnswer] = useState(null);

  if (step === 1) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 text-center mb-6">
          <div className="text-4xl mb-4">📖</div>
          <h3 className="text-sm font-semibold text-indigo-600 mb-2">{t.step1_title}</h3>
          <p className="text-3xl font-bold text-indigo-900 mb-4">{DAILY_CONTENT.verse_ref}</p>
          <p className="text-lg leading-relaxed text-indigo-800 italic mb-6">{DAILY_CONTENT.verse_text}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            <Button size="sm" variant="outline">{t.btn_read}</Button>
            <Button size="sm" variant="outline" className="gap-1"><Volume2 className="w-3 h-3" /> {t.btn_listen}</Button>
            <Button size="sm" variant="outline" className="gap-1"><Share2 className="w-3 h-3" /> {t.btn_share}</Button>
          </div>
        </div>
        <Button onClick={onNext} className="w-full">{t.btn_next}</Button>
      </motion.div>
    );
  }

  if (step === 2) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-blue-50 rounded-2xl p-8 mb-6">
          <h3 className="text-sm font-semibold text-blue-600 mb-4">{t.step2_title}</h3>
          <p className="text-lg font-medium text-blue-900 mb-6">{t.step2_prompt}</p>
          <div className="space-y-2">
            {t.step2_options.map((opt, i) => (
              <Button key={i} variant={input === opt ? 'default' : 'outline'} className="w-full justify-start" onClick={() => setInput(opt)}>
                {opt}
              </Button>
            ))}
          </div>
        </div>
        <Button onClick={onNext} className="w-full">{t.btn_next}</Button>
      </motion.div>
    );
  }

  if (step === 3) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-purple-50 rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
            <h3 className="text-sm font-semibold text-purple-600">{t.step3_title}</h3>
          </div>
          <p className="text-lg text-purple-900 mb-6 leading-relaxed">{t.step3_text}</p>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline">{t.step3_more}</Button>
            <Button size="sm" variant="outline">{t.step3_ask}</Button>
          </div>
        </div>
        <Button onClick={onNext} className="w-full">{t.btn_next}</Button>
      </motion.div>
    );
  }

  if (step === 4) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{t.step4_title}</h3>
          <p className="text-sm text-gray-600 mb-3">{t.step4_prompt}</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your prayer..."
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
          />
          <Button size="sm" className="mt-3">{t.step4_save}</Button>
        </div>
        <Button onClick={onNext} className="w-full">{t.btn_next}</Button>
      </motion.div>
    );
  }

  if (step === 5) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-amber-50 rounded-2xl p-8 mb-6">
          <h3 className="text-sm font-semibold text-amber-600 mb-4">{t.step5_title}</h3>
          <p className="text-lg font-medium text-amber-900 mb-6">{DAILY_CONTENT.quiz.question}</p>
          <div className="space-y-2">
            {DAILY_CONTENT.quiz.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setQuizAnswer(i)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  quizAnswer === i
                    ? i === DAILY_CONTENT.quiz.correct
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-amber-300'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {opt}
                {quizAnswer === i && (i === DAILY_CONTENT.quiz.correct ? <span className="text-green-600 ml-2">✓</span> : <span className="text-red-600 ml-2">✗</span>)}
              </button>
            ))}
          </div>
          {quizAnswer !== null && (
            <p className="text-sm mt-4 text-amber-700">
              {quizAnswer === DAILY_CONTENT.quiz.correct ? t.step5_correct : t.step5_incorrect}
            </p>
          )}
        </div>
        <Button onClick={onNext} className="w-full" disabled={quizAnswer === null}>
          {t.btn_next}
        </Button>
      </motion.div>
    );
  }

  return null;
}

export default function DailyFaithJourney() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [step, setStep] = useState(1);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = localStorage.getItem('faithlight_journey_date');
    if (lastCompleted === today) {
      localStorage.setItem('faithlight_journey_in_progress', 'false');
    }
  }, []);

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('faithlight_journey_date', today);
      localStorage.setItem('faithlight_journey_in_progress', 'true');
      navigate(createPageUrl('Home'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 text-sm mt-1">{t.subtitle}</p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <div key={step}>
            {step === 5 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <StepCard step={5} onNext={handleNext} t={t} />
              </motion.div>
            ) : (
              <StepCard step={step} onNext={handleNext} t={t} />
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}