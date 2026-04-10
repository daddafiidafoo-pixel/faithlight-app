import React from 'react';
import { FolderOpen, BookOpen } from 'lucide-react';

export default function CollectionCard({ collection, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-all hover:-translate-y-0.5 group w-full"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
        style={{ background: collection.color ? collection.color + '20' : '#6366F120' }}
      >
        {collection.icon || '📁'}
      </div>
      <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{collection.name}</h3>
      {collection.description && (
        <p className="text-gray-500 text-xs line-clamp-2 mb-2">{collection.description}</p>
      )}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <BookOpen className="w-3 h-3" />
        <span>{collection.item_count || 0} item{collection.item_count !== 1 ? 's' : ''}</span>
      </div>
    </button>
  );
}