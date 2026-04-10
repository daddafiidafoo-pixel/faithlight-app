import React from 'react';
import { Card } from '@/components/ui/card';
import { Music } from 'lucide-react';

export default function PlaylistCard({ playlist, onClick }) {
  return (
    <Card 
      onClick={onClick}
      className="p-6 cursor-pointer hover:shadow-lg transition group"
    >
      <div className="flex items-start gap-4 mb-4">
        <Music className="w-8 h-8 text-amber-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-slate-900 truncate">{playlist.name}</h3>
          {playlist.description && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{playlist.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{playlist.verses?.length || 0} verses</span>
        {playlist.is_favorite && <span className="text-amber-500">★ Favorite</span>}
      </div>

      {playlist.verses?.slice(0, 2).map((verse, idx) => (
        <p key={idx} className="text-xs text-slate-500 mt-3 truncate">{verse.reference}</p>
      ))}
      
      {(playlist.verses?.length || 0) > 2 && (
        <p className="text-xs text-slate-500 mt-1">+{(playlist.verses?.length || 0) - 2} more</p>
      )}
    </Card>
  );
}