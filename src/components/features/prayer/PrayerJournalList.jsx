/**
 * PrayerJournalList — accordion list of saved prayer journal entries.
 */
import React, { useState } from 'react';
import { BookHeart, Globe, Lock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrayerJournalList({ entries, loading, onDelete }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return (
    <div className="text-center py-8 text-gray-400 text-sm">Loading your prayer journal…</div>
  );

  if (!entries.length) return (
    <div className="text-center py-10 text-gray-400">
      <BookHeart className="w-10 h-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">Your prayer journal is empty.<br />Generate your first prayer above.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {entries.map(entry => (
        <motion.div key={entry.id} layout
          className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

          <button onClick={() => toggle(entry.id)}
            className="w-full flex items-start justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              {entry.is_public
                ? <Globe className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                : <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {entry.source_verse || entry.topic || 'Prayer'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(entry.created_date || entry.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {onDelete && (
                <span onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
                  className="p-1 text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
              )}
              {expanded[entry.id] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </button>

          <AnimatePresence>
            {expanded[entry.id] && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="px-4 pb-4 pt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-line border-t border-gray-50">
                  {entry.prayer_text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}