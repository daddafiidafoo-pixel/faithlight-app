import { useState } from 'react';
import { Star, Edit3, Trash2, ChevronDown, ChevronUp, Tag, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MOOD_EMOJI = { grateful: '🙏', hopeful: '✨', struggling: '💙', peaceful: '🕊️', curious: '🔍', convicted: '⚡', joyful: '😊' };
const TYPE_ICON = { reflection: '💭', prayer: '🙏', note: '📝', question: '❓' };

export default function JournalEntryCard({ entry, onEdit, onDelete, onToggleFav }) {
  const [expanded, setExpanded] = useState(false);
  const preview = entry.noteContent?.slice(0, 140);
  const isLong = (entry.noteContent?.length || 0) > 140;
  const date = new Date(entry.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top color bar by mood */}
      {entry.mood && (
        <div className={`h-1 w-full ${
          entry.mood === 'joyful' ? 'bg-yellow-400' :
          entry.mood === 'peaceful' ? 'bg-blue-300' :
          entry.mood === 'grateful' ? 'bg-green-400' :
          entry.mood === 'hopeful' ? 'bg-purple-400' :
          entry.mood === 'struggling' ? 'bg-slate-400' :
          entry.mood === 'convicted' ? 'bg-orange-400' : 'bg-indigo-400'
        }`} />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs text-gray-400">{TYPE_ICON[entry.entryType] || '📝'}</span>
              <h3 className="font-bold text-indigo-700 text-sm">{entry.verseReference}</h3>
              {entry.mood && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {MOOD_EMOJI[entry.mood]} {entry.mood}
                </span>
              )}
              {entry.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{date}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onToggleFav} className={`p-1.5 rounded-lg transition-colors ${entry.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}>
              <Star className="w-4 h-4 fill-current" />
            </button>
            <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {expanded ? entry.noteContent : preview}
          {isLong && !expanded && '...'}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-indigo-500 mt-2 hover:text-indigo-700">
            {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
          </button>
        )}

        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {entry.tags.map(t => (
              <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">#{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}