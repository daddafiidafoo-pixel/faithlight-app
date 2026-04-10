import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Layout, Download } from 'lucide-react';

function buildSlides(outline) {
  if (!outline) return [];
  const slides = [];

  // Title slide
  slides.push({ type: 'title', title: outline.title || 'Sermon', subtitle: outline.big_idea || '' });

  // Section slides
  (outline.outline_sections || []).forEach((section, i) => {
    slides.push({
      type: 'section',
      num: i + 1,
      title: section.title || section.heading || `Point ${i + 1}`,
      points: section.key_points || section.points || [],
      verse: section.scripture || section.verse || '',
    });
  });

  // Key verses slide
  if ((outline.supporting_verses || []).length > 0) {
    slides.push({ type: 'verses', verses: outline.supporting_verses.slice(0, 4) });
  }

  // Application slide
  if (outline.application) {
    slides.push({ type: 'application', content: outline.application });
  }

  // Closing
  slides.push({ type: 'closing', prayer: outline.closing_prayer || '' });

  return slides;
}

function Slide({ slide, index, total }) {
  const base = "w-full aspect-video rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-md";

  if (slide.type === 'title') return (
    <div className={`${base} bg-gradient-to-br from-indigo-700 to-purple-700`}>
      <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-3">✝ Sermon</p>
      <h2 className="text-white text-2xl font-extrabold leading-tight mb-3">{slide.title}</h2>
      {slide.subtitle && <p className="text-indigo-200 text-sm italic max-w-sm">{slide.subtitle}</p>}
    </div>
  );

  if (slide.type === 'section') return (
    <div className={`${base} bg-white border-2 border-indigo-100 items-start text-left`}>
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm flex-shrink-0">{slide.num}</span>
          <h3 className="text-gray-900 font-extrabold text-lg leading-tight">{slide.title}</h3>
        </div>
        {slide.verse && <p className="text-indigo-600 text-xs italic mb-2 bg-indigo-50 px-3 py-1.5 rounded-lg">📖 {slide.verse}</p>}
        <ul className="space-y-1">
          {(slide.points || []).slice(0, 4).map((pt, i) => (
            <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
              <span className="text-indigo-400 font-bold mt-0.5">•</span> {pt}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  if (slide.type === 'verses') return (
    <div className={`${base} bg-amber-50 border-2 border-amber-100`}>
      <p className="text-amber-700 font-extrabold text-xs uppercase tracking-widest mb-4">Key Scripture</p>
      <div className="space-y-3 w-full text-left">
        {(slide.verses || []).map((v, i) => (
          <p key={i} className="text-gray-700 text-sm italic">📖 {v}</p>
        ))}
      </div>
    </div>
  );

  if (slide.type === 'application') return (
    <div className={`${base} bg-green-50 border-2 border-green-100`}>
      <p className="text-green-700 font-extrabold text-xs uppercase tracking-widest mb-3">Application</p>
      <p className="text-gray-700 text-sm leading-relaxed">{slide.content}</p>
    </div>
  );

  if (slide.type === 'closing') return (
    <div className={`${base} bg-gradient-to-br from-purple-700 to-indigo-700`}>
      <p className="text-purple-200 text-xs uppercase tracking-widest mb-3">Closing Prayer</p>
      <p className="text-white text-sm italic leading-relaxed max-w-sm">{slide.prayer || 'Amen'}</p>
    </div>
  );

  return null;
}

export default function SermonSlidePreview({ outline }) {
  const slides = buildSlides(outline);
  const [current, setCurrent] = useState(0);

  if (!outline || slides.length === 0) return null;

  return (
    <div className="mt-4 bg-gray-50 rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
          <Layout className="w-4 h-4 text-indigo-500" /> Slide Deck Preview
          <span className="text-xs font-normal text-gray-400 ml-1">({slides.length} slides)</span>
        </h4>
      </div>

      <Slide slide={slides[current]} index={current} total={slides.length} />

      {/* Navigation */}
      <div className="flex items-center justify-between mt-3">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:bg-gray-100">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-indigo-600 w-4' : 'bg-gray-300'}`} />
          ))}
        </div>
        <button onClick={() => setCurrent(c => Math.min(slides.length - 1, c + 1))} disabled={current === slides.length - 1}
          className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:bg-gray-100">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">{current + 1} / {slides.length}</p>
    </div>
  );
}