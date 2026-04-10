import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import { visionValuesTranslations } from '@/i18n/visionValues';
import { useTranslation } from '@/hooks/useTranslation';

export default function About() {
  const [language, setLanguage] = useState('en');
  const translations = useTranslation(visionValuesTranslations, language);

  return (
    <div className="min-h-screen" id="main-content">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-700 to-purple-600 px-6 py-20 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-4 text-5xl font-bold">{t(language, 'about.title')}</h1>
           <p className="text-xl">{t(language, 'about.subtitle')}</p>
        </div>
      </section>

      {/* Language Selector */}
      <section className="mx-auto max-w-6xl px-6 py-6 flex justify-end">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="en">🇬🇧 English</option>
            <option value="om">🇪🇹 Afaan Oromo</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="es">🇪🇸 Español</option>
            <option value="am">🇪🇹 አማርኛ</option>
            <option value="sw">🇰🇪 Kiswahili</option>
            <option value="ar">🇸🇦 العربية</option>
          </select>
        </div>
      </section>

      {/* Vision Section */}
      <section className="mx-auto max-w-6xl gap-6 px-6 py-12" aria-label="Vision">
        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 shadow-sm mb-8">
          <h2 className="mb-4 text-3xl font-bold text-indigo-700">✨ {translations.visionTitle}</h2>
          <p className="leading-8 text-slate-700 text-lg">{translations.visionText}</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mx-auto max-w-6xl gap-6 px-6 py-12" aria-label="Mission">
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-sm">
          <h2 className="mb-4 text-3xl font-bold text-blue-700">🎯 {translations.missionTitle}</h2>
          <p className="text-lg font-semibold text-slate-700 mb-6">{translations.missionIntro}</p>
          <ul className="space-y-3">
            {(translations.missionPoints || []).map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700">
                <span className="text-blue-600 text-2xl flex-shrink-0 mt-1">✓</span>
                <span className="text-lg leading-6">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Mission and Features Section */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-12 md:grid-cols-2" aria-label="Mission and features">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
            {t(language, 'about.missionTitle')}
          </h2>
          <p className="leading-8 text-slate-700">
            {t(language, 'about.missionBody')}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
            {t(language, 'about.featuresTitle')}
          </h2>
          <p className="leading-8 text-slate-700">
            {t(language, 'about.featuresBody')}
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-indigo-700">
            {t(language, 'about.aiPromiseTitle')}
          </h2>
          <p className="leading-8 text-slate-700">
            {t(language, 'about.aiPromiseBody')}
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-12 sm:py-16 px-4 bg-slate-50" aria-label="Core values">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-indigo-700">💎 {translations.coreValuesTitle}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(translations.coreValues || []).map((value, i) => (
              <div key={i} className="rounded-lg border border-indigo-100 bg-white p-6">
                <h3 className="font-bold text-indigo-700 mb-2 text-lg">{value.title}</h3>
                <p className="text-slate-700">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-12 sm:py-16 px-4" aria-label="Call to action">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg mb-8">{t(language, 'about.subtitle')}</p>
           <button className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg hover:bg-slate-100 transition min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600">
             {t(language, 'common.continue')}
          </button>
        </div>
      </section>
    </div>
  );
}