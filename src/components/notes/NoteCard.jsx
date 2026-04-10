import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Share2, Pencil, Trash2, Pin, Globe, Lock, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import NoteOfflineSave from './NoteOfflineSave';
import { formatDistanceToNow } from 'date-fns';

const COLOR_MAP = {
  yellow: { bg: 'bg-yellow-50',  border: 'border-yellow-300',  accent: 'bg-yellow-400' },
  blue:   { bg: 'bg-blue-50',    border: 'border-blue-300',    accent: 'bg-blue-400' },
  green:  { bg: 'bg-green-50',   border: 'border-green-300',   accent: 'bg-green-400' },
  purple: { bg: 'bg-purple-50',  border: 'border-purple-300',  accent: 'bg-purple-400' },
  pink:   { bg: 'bg-pink-50',    border: 'border-pink-300',    accent: 'bg-pink-400' },
  gray:   { bg: 'bg-gray-50',    border: 'border-gray-300',    accent: 'bg-gray-400' },
};

export default function NoteCard({ note, onEdit, onDelete, onShare, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const colors = COLOR_MAP[note.color] || COLOR_MAP.yellow;
  const isLong = (note.content || '').length > 200;
  const displayContent = isLong && !expanded ? note.content.slice(0, 200) + '…' : note.content;

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden transition-shadow hover:shadow-md`}>
      {/* Color accent bar */}
      <div className={`h-1 w-full ${colors.accent}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {note.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
              <h3 className="font-bold text-gray-900 text-sm leading-snug truncate">{note.title}</h3>
            </div>
            {note.passage_ref && (
              <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                <BookOpen className="w-3 h-3" />
                {note.passage_ref}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {note.is_public
              ? <Globe className="w-3.5 h-3.5 text-green-500" title="Public" />
              : <Lock className="w-3.5 h-3.5 text-gray-400" title="Private" />
            }
          </div>
        </div>

        {/* Content */}
        {note.content && (
          <div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{displayContent}</p>
            {isLong && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-xs text-indigo-600 hover:text-indigo-700 mt-1 flex items-center gap-0.5"
              >
                {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show more</>}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {note.tags.map(tag => (
              <span key={tag} className="text-xs bg-white/80 border border-gray-200 text-gray-600 rounded-full px-2 py-0.5">{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/5">
          <span className="text-[11px] text-gray-400">
            {note.updated_date ? formatDistanceToNow(new Date(note.updated_date), { addSuffix: true }) : ''}
          </span>
          <div className="flex items-center gap-1">
            <NoteOfflineSave note={note} size="sm" />
            {onShare && (
              <Button size="sm" variant="ghost" onClick={() => onShare(note)} className="h-7 px-2 text-gray-500 hover:text-indigo-600">
                <Share2 className="w-3.5 h-3.5" />
              </Button>
            )}
            {onEdit && (
              <Button size="sm" variant="ghost" onClick={() => onEdit(note)} className="h-7 px-2 text-gray-500 hover:text-indigo-600">
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="ghost" onClick={() => onDelete(note)} className="h-7 px-2 text-gray-500 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}