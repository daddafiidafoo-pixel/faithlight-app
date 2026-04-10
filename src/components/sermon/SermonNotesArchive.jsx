import React, { useState } from 'react';
import { Heart, Tag, Edit, Trash2, Copy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SermonNotesArchive({ notes, onEdit, onDelete, onToggleFavorite }) {
  const [filterTag, setFilterTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const allTags = [...new Set(notes.flatMap(n => n.tags))];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || note.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-semibold text-slate-600">No sermon notes yet</p>
        <p className="text-sm text-slate-500">Start taking notes during sermons to build your archive</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !filterTag ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Tags
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterTag === tag ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.map(note => (
          <div key={note.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">{note.title}</h3>
                  <button
                    onClick={() => onToggleFavorite(note.id)}
                    className={note.is_favorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <p className="text-xs text-slate-500">{new Date(note.created_date).toLocaleDateString()}</p>
              </div>
              {note.sermon_title && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{note.sermon_title}</span>
              )}
            </div>

            {/* Content Preview */}
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{note.content}</p>

            {/* Verses */}
            {note.verse_references && note.verse_references.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {note.verse_references.map((verse, idx) => (
                  <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {verse}
                  </span>
                ))}
              </div>
            )}

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {note.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <Button onClick={() => onEdit(note)} variant="ghost" size="sm" className="flex-1">
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
              <Button onClick={() => onDelete(note.id)} variant="ghost" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}