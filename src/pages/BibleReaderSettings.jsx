import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../components/I18nProvider';
import { useLanguageSettings } from '../components/context/LanguageSettingsContext';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BibleReaderSettings() {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const {
    uiLanguage,
    setUiLanguage,
    bibleLanguage,
    setBibleLanguage,
    audioLanguage,
    setAudioLanguage,
  } = useLanguageSettings();

  const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  };

  const SETTINGS_TEXTS = {
    en: {
      title: 'Settings',
      subtitle: 'Manage your language and reading preferences.',
      uiLanguage: 'UI Language',
      bibleLanguage: 'Bible Language',
      audioLanguage: 'Audio Language',
      noteTitle: 'Note',
      noteBody: 'UI language changes buttons and labels. Bible language changes verse text. Audio language changes spoken content when available.',
      english: 'English',
      oromo: 'Afaan Oromoo',
      amharic: 'አማርኛ',
    },
    om: {
      title: 'Sajoo',
      subtitle: 'Filannoo afaanii fi dubbisuu kee qindeessi.',
      uiLanguage: 'Afaan Appii',
      bibleLanguage: 'Afaan Macaaba Qulqulluu',
      audioLanguage: 'Afaan Sagalee',
      noteTitle: 'Hubachiisa',
      noteBody: 'Afaan appii mallattoolee fi button jijjiira. Afaan Macaaba Qulqulluu immoo barruu kutaa jijjiira. Afaan sagalee ammoo sagalee jiru irratti hojjeta.',
      english: 'English',
      oromo: 'Afaan Oromoo',
      amharic: 'አማርኛ',
    },
  };

  const t = SETTINGS_TEXTS[lang] || SETTINGS_TEXTS.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px' }}>
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium text-sm py-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-sm text-gray-600">{t.subtitle}</p>
          </div>
        </motion.div>

        {/* Settings Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          style={{
            borderRadius: 16,
            border: '1px solid #F3F4F6',
            padding: 20,
            background: 'white',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
            display: 'grid',
            gap: 16,
          }}
        >
          {/* UI Language */}
          <label>
            <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#111827' }}>
              {t.uiLanguage}
            </div>
            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <option value="en">{t.english}</option>
              <option value="om">{t.oromo}</option>
              <option value="am">{t.amharic}</option>
            </select>
          </label>

          {/* Bible Language */}
          <label>
            <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#111827' }}>
              {t.bibleLanguage}
            </div>
            <select
              value={bibleLanguage}
              onChange={(e) => setBibleLanguage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <option value="en">{t.english}</option>
              <option value="om">{t.oromo}</option>
              <option value="am">{t.amharic}</option>
            </select>
          </label>

          {/* Audio Language */}
          <label>
            <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 14, color: '#111827' }}>
              {t.audioLanguage}
            </div>
            <select
              value={audioLanguage}
              onChange={(e) => setAudioLanguage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #E5E7EB',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <option value="en">{t.english}</option>
              <option value="om">{t.oromo}</option>
              <option value="am">{t.amharic}</option>
            </select>
          </label>

          {/* Note */}
          <div
            style={{
              background: '#F9FAFB',
              borderRadius: 12,
              padding: 14,
              lineHeight: 1.6,
              color: '#4B5563',
              fontSize: 13,
              borderLeft: '3px solid #6C5CE7',
            }}
          >
            <strong style={{ color: '#111827' }}>{t.noteTitle}:</strong> {t.noteBody}
          </div>
        </motion.div>
      </div>
    </div>
  );
}