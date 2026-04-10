import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, ChevronDown, ChevronUp, BookMarked, Flame } from 'lucide-react';

const COMMENTARY_TRADITIONS = [
  { id: 'none', label: 'No Preference', icon: '📖' },
  { id: 'evangelical', label: 'Evangelical', icon: '✝️' },
  { id: 'reformed', label: 'Reformed / Calvinist', icon: '🏰' },
  { id: 'arminian', label: 'Arminian / Wesleyan', icon: '💛' },
  { id: 'catholic', label: 'Roman Catholic', icon: '⛪' },
  { id: 'orthodox', label: 'Eastern Orthodox', icon: '🕍' },
  { id: 'pentecostal', label: 'Pentecostal / Charismatic', icon: '🔥' },
  { id: 'scholarly', label: 'Academic / Critical', icon: '🎓' },
];

export default function TutorContextPanel({ user, studyPlans = [], readingHistory = [], onContextChange }) {
  const [open, setOpen] = useState(false);
  const [selectedTradition, setSelectedTradition] = useState('none');
  const [contextNote, setContextNote] = useState('');

  const activePlan = studyPlans.find(p => p.status === 'active');
  const recentBooks = [...new Set(readingHistory.map(r => r.book_name).filter(Boolean))].slice(0, 4);

  const handleApply = () => {
    const tradition = COMMENTARY_TRADITIONS.find(t => t.id === selectedTradition);
    onContextChange({
      tradition: selectedTradition !== 'none' ? tradition.label : null,
      contextNote: contextNote.trim() || null,
      activePlanTitle: activePlan?.title || null,
      recentBooks,
    });
    setOpen(false);
  };

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          <span>Add Context to Your Question</span>
          {selectedTradition !== 'none' && (
            <Badge className="bg-indigo-200 text-indigo-800 text-xs border-0 ml-1">
              {COMMENTARY_TRADITIONS.find(t => t.id === selectedTradition)?.label}
            </Badge>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <div className="mt-2 p-4 bg-white border border-indigo-100 rounded-xl shadow-sm space-y-4">
          {/* Current Context Chips */}
          <div className="flex flex-wrap gap-2">
            {activePlan && (
              <div className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                <BookOpen className="w-3 h-3" />
                <span>Plan: {activePlan.title}</span>
              </div>
            )}
            {recentBooks.map(book => (
              <div key={book} className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                <BookMarked className="w-3 h-3" />
                <span>{book}</span>
              </div>
            ))}
            {user?.spiritual_goals && (
              <div className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full">
                <Flame className="w-3 h-3" />
                <span>Goal: {user.spiritual_goals.slice(0, 30)}…</span>
              </div>
            )}
          </div>

          {/* Theological Tradition Selector */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Reference from theological tradition:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {COMMENTARY_TRADITIONS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTradition(t.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedTradition === t.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extra Context Note */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">Additional context for AI (optional):</p>
            <textarea
              value={contextNote}
              onChange={e => setContextNote(e.target.value)}
              placeholder="e.g. I'm struggling with this after a personal loss... / I'm preparing a sermon on this passage..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button
            onClick={handleApply}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Apply Context
          </button>
        </div>
      )}
    </div>
  );
}