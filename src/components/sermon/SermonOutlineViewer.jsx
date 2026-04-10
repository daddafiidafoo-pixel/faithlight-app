import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, BookOpen, Lightbulb, Quote } from 'lucide-react';
import SermonVoiceNotes from './SermonVoiceNotes';

function SectionCard({ section, index, voiceNotes, onAddVoiceNote, onDeleteVoiceNote }) {
  const [expanded, setExpanded] = useState(true);

  const isIntro = index === 0;
  const isConclusion = section.title?.toLowerCase().includes('conclusion') || section.title?.toLowerCase().includes('closing');

  const accentColor = isIntro
    ? 'border-l-indigo-400 bg-indigo-50'
    : isConclusion
    ? 'border-l-purple-400 bg-purple-50'
    : 'border-l-amber-400 bg-amber-50';

  const badgeColor = isIntro
    ? 'bg-indigo-100 text-indigo-700'
    : isConclusion
    ? 'bg-purple-100 text-purple-700'
    : 'bg-amber-100 text-amber-700';

  return (
    <div className={`border-l-4 rounded-r-xl p-4 ${accentColor}`}>
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {isIntro ? 'INTRO' : isConclusion ? 'CLOSE' : `PT ${index}`}
          </span>
          <h3 className="font-bold text-gray-900 text-base">{section.title}</h3>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {section.content && (
            <p className="text-gray-700 text-sm leading-relaxed">{section.content}</p>
          )}

          {section.scriptures?.length > 0 && (
            <div className="flex items-start gap-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {section.scriptures.map((s, i) => (
                  <span key={i} className="text-xs bg-white border border-indigo-200 text-indigo-700 rounded px-2 py-0.5 font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {section.illustration && (
            <div className="flex items-start gap-2 bg-white/70 rounded-lg p-3 border border-gray-200">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 italic">{section.illustration}</p>
            </div>
          )}

          {/* Voice Notes */}
          {onAddVoiceNote && (
            <SermonVoiceNotes
              sectionId={`section-${index}`}
              notes={voiceNotes || []}
              onAdd={onAddVoiceNote}
              onDelete={onDeleteVoiceNote}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function SermonOutlineViewer({ outline, voiceNotes = [], onAddVoiceNote, onDeleteVoiceNote }) {
  if (!outline) return null;

  return (
    <div className="space-y-4">
      {/* Big Idea */}
      {outline.big_idea && (
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-2">
              <Quote className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-80" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Big Idea</p>
                <p className="font-semibold text-base leading-snug">{outline.big_idea}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outline Sections */}
      {outline.outline_sections?.length > 0 && (
        <div className="space-y-3">
          {outline.outline_sections.map((section, i) => (
            <SectionCard key={i} section={section} index={i}
              voiceNotes={voiceNotes} onAddVoiceNote={onAddVoiceNote} onDeleteVoiceNote={onDeleteVoiceNote} />
          ))}
        </div>
      )}

      {/* Supporting Verses */}
      {outline.supporting_verses?.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-800">Supporting Scriptures</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {outline.supporting_verses.map((v, i) => (
              <span key={i} className="text-xs bg-white border border-blue-200 text-blue-700 rounded-full px-3 py-1 font-medium">{v}</span>
            ))}
          </div>
        </div>
      )}

      {/* Application */}
      {outline.application && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-800">Practical Application</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{outline.application}</p>
        </div>
      )}

      {/* Illustrations */}
      {outline.illustrations?.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Illustration Ideas</span>
          </div>
          <ul className="space-y-1.5">
            {outline.illustrations.map((ill, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-amber-400 font-bold flex-shrink-0">{i + 1}.</span>
                {ill}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Closing Prayer */}
      {outline.closing_prayer && (
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">🙏</span>
            <span className="text-sm font-bold text-purple-800">Closing Prayer</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed italic">"{outline.closing_prayer}"</p>
        </div>
      )}

      {/* Small Group Questions */}
      {outline.small_group_questions?.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">💬</span>
            <span className="text-sm font-bold text-slate-800">Small Group Discussion Questions</span>
          </div>
          <ol className="space-y-2">
            {outline.small_group_questions.map((q, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-slate-400 font-bold flex-shrink-0 w-4">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}