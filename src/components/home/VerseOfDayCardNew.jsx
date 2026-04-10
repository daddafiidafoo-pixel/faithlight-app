import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getDailyVerseWithReflection } from '@/utils/dailyVerse';

export default function VerseOfDayCardNew({ selectedLanguage }) {
  const [verseData, setVerseData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load verse whenever language changes
    const data = getDailyVerseWithReflection(selectedLanguage);
    setVerseData(data);
  }, [selectedLanguage, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!verseData) return null;

  const { verse, reflection } = verseData;
  const isRTL = verse.isRTL;

  return (
    <div className={`rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h2 className="text-lg font-bold text-amber-900">
            {selectedLanguage === 'fr' ? 'Verset du jour' : 
             selectedLanguage === 'sw' ? 'Ayat ya Siku' : 
             selectedLanguage === 'ar' ? 'آية اليوم' :
             selectedLanguage === 'ti' ? 'ምዕራ ዘወደእ' :
             selectedLanguage === 'om' ? 'Aayata Guyyaa' :
             selectedLanguage === 'am' ? 'የዕለቱ ጥቅስ' :
             'Verse of the Day'}
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          className="rounded-lg p-2 hover:bg-amber-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Same verse each day. New verse tomorrow."
          aria-label="Refresh verse"
        >
          <RefreshCw className="w-4 h-4 text-amber-600" />
        </button>
      </div>

      {/* Verse Text */}
      <div className={`rounded-xl bg-white p-4 space-y-3 mb-4 border border-amber-200`}>
        <p className={`text-lg italic leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
          "{verse.text}"
        </p>
        <p className={`font-semibold text-amber-700 ${isRTL ? 'text-right' : 'text-left'}`}>
          — {verse.reference}
        </p>
      </div>

      {/* Reflection */}
      <div className="rounded-xl bg-purple-50 p-4">
        <h3 className="font-semibold text-purple-900 mb-2">
          {selectedLanguage === 'fr' ? 'Réflexion' : 
           selectedLanguage === 'sw' ? 'Tafakari' : 
           selectedLanguage === 'ar' ? 'التأمل' :
           selectedLanguage === 'ti' ? 'ምስጋና' :
           selectedLanguage === 'om' ? 'Yaadannoo' :
           selectedLanguage === 'am' ? 'ነጸብራቅ' :
           'Reflection'}
        </h3>
        <p className={`text-sm text-purple-800 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
          {reflection.text}
        </p>
      </div>

      {/* Language & Date Info */}
      <div className="text-xs text-gray-500 mt-4 text-center">
        {selectedLanguage.toUpperCase()} • {verse.dateKey}
      </div>
    </div>
  );
}