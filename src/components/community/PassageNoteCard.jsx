import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function PassageNoteCard({ note, currentUserId, onReactionAdded, onDelete }) {
  const [reactions, setReactions] = useState(note.reaction_count || 0);
  const [hasReacted, setHasReacted] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleReaction = async () => {
    if (!currentUserId) {
      alert('Please login to react');
      return;
    }

    try {
      await base44.entities.PassageNoteReaction.create({
        note_id: note.id,
        user_id: currentUserId,
        reaction_type: 'like',
      });
      setReactions(reactions + 1);
      setHasReacted(true);
      onReactionAdded?.(note.id);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleDelete = async () => {
    if (currentUserId !== note.user_id) {
      alert('You can only delete your own notes');
      return;
    }

    if (!window.confirm('Delete this note?')) return;

    try {
      await base44.entities.PassageNote.delete(note.id);
      onDelete?.(note.id);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?note=${note.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Note link copied to clipboard!');
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {note.user_avatar && (
            <img 
              src={note.user_avatar} 
              alt={note.user_name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div>
            <p className="font-semibold text-sm">{note.user_name || 'Anonymous'}</p>
            <p className="text-xs text-gray-500">{note.reference}</p>
          </div>
        </div>
        {currentUserId === note.user_id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Verse Text */}
      {note.verse_text && (
        <p className="text-sm text-gray-600 italic mb-2 p-2 bg-gray-50 rounded border-l-4 border-indigo-500">
          "{note.verse_text}"
        </p>
      )}

      {/* Reflection */}
      <p className="text-sm text-gray-800 mb-3">{note.reflection}</p>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.map(tag => (
            <span key={tag} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
        <Button
          variant={hasReacted ? 'default' : 'outline'}
          size="sm"
          onClick={handleReaction}
          className="gap-1"
        >
          <Heart className={`w-4 h-4 ${hasReacted ? 'fill-current' : ''}`} />
          <span className="text-xs">{reactions}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="gap-1"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{note.comment_count || 0}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-1"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <p>Comments feature coming soon</p>
        </div>
      )}
    </div>
  );
}