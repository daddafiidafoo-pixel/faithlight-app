import React, { forwardRef } from 'react';

const sizeClasses = {
  square: 'w-80 h-80',
  story: 'w-80 h-[568px]',
  portrait: 'w-80 h-[400px]'
};

function getStyleClasses(styleKey) {
  switch (styleKey) {
    case 'cleanLight':
      return 'bg-white text-slate-900 border border-slate-200';
    case 'faithlightBlue':
      return 'bg-gradient-to-b from-blue-50 to-white text-slate-900 border border-blue-100';
    case 'softScripture':
      return 'bg-gradient-to-b from-purple-50 to-white text-slate-900 border border-purple-100';
    default:
      return 'bg-white text-slate-900 border border-slate-200';
  }
}

const titleByLanguage = {
  en: 'Verse of the Day',
  om: 'Ayaata Guyyaa',
  am: 'የቀኑ ጥቅስ',
  ar: 'آية اليوم',
  sw: 'Aya ya Siku',
  fr: 'Verset du jour'
};

const VerseSharePreview = forwardRef(
  ({ language, reference, verseText, format, styleKey }, ref) => {
    return (
      <div
        ref={ref}
        className={`${sizeClasses[format]} ${getStyleClasses(
          styleKey
        )} rounded-3xl p-8 shadow-sm flex flex-col justify-between overflow-hidden`}
      >
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-500 mb-6">
            {titleByLanguage[language]}
          </p>

          <p className="text-xl leading-relaxed font-medium whitespace-pre-wrap break-words italic">
            "{verseText}"
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-indigo-700 mb-3">{reference}</p>
          <p className="text-sm text-slate-500">🙏 FaithLight</p>
        </div>
      </div>
    );
  }
);

VerseSharePreview.displayName = 'VerseSharePreview';

export default VerseSharePreview;