import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useI18n } from '@/components/I18nProvider';

const CONTENT = {
  en: {
    title: 'Welcome to FaithLight',
    subtitle: "Start your journey with God's Word today.",
    btn1: '📖 Read Today\'s Verse',
    btn2: '🤖 Ask AI a Bible Question',
    btn3: '🧠 Test Your Bible Knowledge',
    card1: '✍️ Write a Prayer or Reflection',
    card2: '📚 Explore Bible Study Plans',
    card3: '🔎 Search the Bible',
  },
  om: {
    title: 'Baga gara FaithLight dhuftan',
    subtitle: "Har'a Macaafa Qulqulluu waliin imala kee jalqabi.",
    btn1: '📖 Ayaata Har\'aa Dubbisi',
    btn2: '🤖 AI Gaaffii Macaafa Qulqulluu Gaafadhu',
    btn3: '🧠 Beekumsa Macaafa Qulqulluu Qoradhu',
    card1: '✍️ Kadhaa ykn yaada barreessi',
    card2: '📚 Sagantaa Barumsaa Qoradhu',
    card3: '🔎 Macaafa Qulqulluu Barbaadi',
  },
  am: {
    title: 'ወደ FaithLight እንኳን በደህና መጡ',
    subtitle: 'ዛሬ በመጽሐፍ ቅዱስ ጉዞዎን ይጀምሩ።',
    btn1: '📖 የዛሬውን ጥቅስ ያንብቡ',
    btn2: '🤖 AI ስለ መጽሐፍ ቅዱስ ይጠይቁ',
    btn3: '🧠 የመጽሐፍ ቅዱስ እውቀትዎን ይፈትኑ',
    card1: '✍️ ጸሎት ወይም ማሰላሰል ይጻፉ',
    card2: '📚 የጥናት እቅዶችን ያሻሹ',
    card3: '🔎 መጽሐፍ ቅዱስን ይፈልጉ',
  },
  ar: {
    title: 'مرحبًا بك في FaithLight',
    subtitle: 'ابدأ رحلتك مع كلمة الله اليوم.',
    btn1: '📖 اقرأ آية اليوم',
    btn2: '🤖 اسأل الذكاء الاصطناعي سؤالاً',
    btn3: '🧠 اختبر معرفتك بالكتاب المقدس',
    card1: '✍️ اكتب صلاة أو تأمل',
    card2: '📚 استكشف خطط الدراسة',
    card3: '🔎 ابحث في الكتاب المقدس',
  },
  sw: {
    title: 'Karibu kwenye FaithLight',
    subtitle: 'Anza safari yako na Neno la Mungu leo.',
    btn1: '📖 Soma Aya ya Leo',
    btn2: '🤖 Uliza AI Swali la Biblia',
    btn3: '🧠 Jaribu Ujuzi Wako wa Biblia',
    card1: '✍️ Andika Sala au Tafakuri',
    card2: '📚 Chunguza Mipango ya Masomo',
    card3: '🔎 Tafuta Biblia',
  },
  fr: {
    title: 'Bienvenue dans FaithLight',
    subtitle: "Commencez votre voyage avec la Parole de Dieu aujourd'hui.",
    btn1: '📖 Lire le verset du jour',
    btn2: '🤖 Poser une question à l\'IA',
    btn3: '🧠 Tester vos connaissances bibliques',
    card1: '✍️ Écrire une prière ou une réflexion',
    card2: '📚 Explorer les plans d\'étude',
    card3: '🔎 Rechercher dans la Bible',
  },
};

export default function FirstTimeWelcome({ onDismiss }) {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const c = CONTENT[lang] || CONTENT.en;

  const go = (page) => {
    localStorage.setItem('faithlight_welcome_seen', 'true');
    onDismiss();
    navigate(createPageUrl(page));
  };

  const dismiss = () => {
    localStorage.setItem('faithlight_welcome_seen', 'true');
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-6 pt-8 pb-6 text-center text-white">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-2xl font-bold leading-tight">{c.title}</h1>
          <p className="text-indigo-100 text-sm mt-2">{c.subtitle}</p>
        </div>

        {/* Primary Actions */}
        <div className="px-5 pt-5 space-y-2.5">
          <button
            onClick={() => go('BibleReader')}
            className="w-full flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl px-4 py-3.5 transition-colors text-sm"
          >
            <span className="text-lg">📖</span>
            <span>{c.btn1}</span>
          </button>
          <button
            onClick={() => go('AskAI')}
            className="w-full flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-2xl px-4 py-3.5 transition-colors text-sm"
          >
            <span className="text-lg">🤖</span>
            <span>{c.btn2}</span>
          </button>
          <button
            onClick={() => go('AIQuizzes')}
            className="w-full flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl px-4 py-3.5 transition-colors text-sm"
          >
            <span className="text-lg">🧠</span>
            <span>{c.btn3}</span>
          </button>
        </div>

        {/* Secondary feature cards */}
        <div className="px-5 pt-3 pb-2 grid grid-cols-3 gap-2">
          {[
            { label: c.card1, page: 'PrayerJournal' },
            { label: c.card2, page: 'BibleStudyPlans' },
            { label: c.card3, page: 'BibleSearch' },
          ].map(({ label, page }) => (
            <button
              key={page}
              onClick={() => go(page)}
              className="bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-xl p-2.5 text-center text-xs text-gray-600 hover:text-indigo-700 transition-all leading-tight font-medium"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Skip */}
        <div className="px-5 pb-6 pt-2 text-center">
          <button
            onClick={dismiss}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Maybe later →
          </button>
        </div>
      </motion.div>
    </div>
  );
}