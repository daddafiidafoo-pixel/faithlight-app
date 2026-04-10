import React from 'react';
import { getLabel, isValidOromoContent } from '@/components/i18n/oromoGlossary';

const OM_LABELS = { bible_verse: 'Aayata Macaafa Qulqulluu' };

function Section({ labelKey, label, text, accent = 'text-indigo-700', uiLanguage }) {
  if (!text) return null;
  const displayLabel = labelKey ? getLabel(labelKey, uiLanguage, label) : label;
  return (
    <div className="mt-3">
      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${accent}`}>{displayLabel}</p>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}

function VerseBlock({ reference, text, uiLanguage }) {
  if (!reference) return null;
  const verseLabel = uiLanguage === 'om' ? OM_LABELS.bible_verse : 'Bible Verse';
  return (
    <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
      <p className="text-xs font-bold text-indigo-500 mb-0.5 uppercase tracking-wider">{verseLabel}</p>
      <p className="text-xs font-bold text-indigo-600 mb-1">{reference}</p>
      {text && <p className="text-sm text-indigo-800 italic leading-relaxed">"{text}"</p>}
    </div>
  );
}

// Bible Q&A / companion
function CompanionResponse({ content, uiLanguage }) {
  return (
    <div>
      <p className="text-sm text-gray-800 leading-relaxed">{content.explanation}</p>
      <VerseBlock reference={content.bible_verse_reference} text={content.bible_verse_text} uiLanguage={uiLanguage} />
      <Section labelKey="reflection" label="Reflection" text={content.reflection} accent="text-indigo-600" uiLanguage={uiLanguage} />
      <Section labelKey="prayer" label="Prayer" text={content.prayer} accent="text-rose-500" uiLanguage={uiLanguage} />
    </div>
  );
}

// Encouragement
function EncouragementResponse({ content, uiLanguage }) {
  return (
    <div>
      <p className="text-sm text-gray-800 leading-relaxed">{content.encouragement}</p>
      <VerseBlock reference={content.bible_verse_reference} text={content.bible_verse_text} uiLanguage={uiLanguage} />
      <Section labelKey="reflection" label="Reflection" text={content.reflection} accent="text-amber-600" uiLanguage={uiLanguage} />
      <Section labelKey="prayer" label="Prayer" text={content.prayer} accent="text-rose-500" uiLanguage={uiLanguage} />
    </div>
  );
}

// Verse Finder
function VerseFinderResponse({ content }) {
  return (
    <div>
      {content.introduction && (
        <p className="text-sm text-gray-700 mb-3">{content.introduction}</p>
      )}
      {(content.verses || []).map((v, i) => (
        <div key={i} className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          <p className="text-xs font-bold text-emerald-700 mb-1">{v.reference}</p>
          {v.text && <p className="text-sm text-emerald-800 italic mb-1">"{v.text}"</p>}
          {v.relevance && <p className="text-xs text-emerald-600">{v.relevance}</p>}
        </div>
      ))}
    </div>
  );
}

// Sermon Builder
function SermonResponse({ content }) {
  return (
    <div>
      {content.title && <h3 className="font-bold text-gray-900 text-base mb-1">{content.title}</h3>}
      {content.theme && <p className="text-xs text-slate-500 mb-2">Theme: {content.theme}</p>}
      {content.main_verse && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-3">
          <p className="text-xs font-bold text-slate-600">Main Verse</p>
          <p className="text-sm text-slate-700">{content.main_verse}</p>
        </div>
      )}
      {content.introduction && (
        <div className="mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Introduction</p>
          <p className="text-sm text-gray-700">{content.introduction}</p>
        </div>
      )}
      {(content.points || []).map((pt, i) => (
        <div key={i} className="mt-3 border-l-2 border-slate-300 pl-3">
          <p className="text-xs font-bold text-slate-700">Point {i + 1}: {pt.heading}</p>
          {pt.scripture && <p className="text-xs text-indigo-600 mt-0.5">{pt.scripture}</p>}
          {pt.content && <p className="text-sm text-gray-700 mt-1">{pt.content}</p>}
          {pt.application && <p className="text-xs text-emerald-700 mt-1 italic">Application: {pt.application}</p>}
        </div>
      ))}
      {content.conclusion && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Conclusion</p>
          <p className="text-sm text-gray-700">{content.conclusion}</p>
        </div>
      )}
      {content.call_to_action && (
        <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">
          <p className="text-xs font-bold text-indigo-600 mb-1">Call to Action</p>
          <p className="text-sm text-indigo-800">{content.call_to_action}</p>
        </div>
      )}
    </div>
  );
}

export default function AIFeatureResponse({ feature, content, uiLanguage = 'en', oromoFallback = false }) {
  if (!content) return <p className="text-sm text-gray-400">No response.</p>;

  // If Oromo quality check failed, show Oromo labels but English content
  const effectiveLang = oromoFallback ? 'en' : uiLanguage;

  return (
    <div>
      {oromoFallback && uiLanguage === 'om' && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mb-2">
          Deebiin Afaan Oromootti si'aayinaan hin argamne — Afaan Ingiliffaatiin dhiyaate.
        </p>
      )}
      {(() => {
        switch (feature) {
          case 'emotional':
            return <EncouragementResponse content={content} uiLanguage={effectiveLang} />;
          case 'verse_finder':
            return <VerseFinderResponse content={content} />;
          case 'sermon':
            return <SermonResponse content={content} />;
          case 'companion':
          default:
            return <CompanionResponse content={content} uiLanguage={effectiveLang} />;
        }
      })()}
    </div>
  );
}