import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PassageNoteCard from './PassageNoteCard';
import CreatePassageNoteModal from './CreatePassageNoteModal';
import { Button } from '@/components/ui/button';
import { MessageSquare, Filter } from 'lucide-react';

export default function PassageNotesPanel({ bibleBook, chapter, verse, verseText, currentUser }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, recent, mostLiked

  useEffect(() => {
    loadNotes();
  }, [bibleBook, chapter, verse, filter]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const reference = `${bibleBook} ${chapter}:${verse}`;
      let fetchedNotes = await base44.entities.PassageNote.filter(
        { reference, is_public: true },
        filter === 'mostLiked' ? '-reaction_count' : '-created_date',
        20
      );
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteCreated = (newNote) => {
    setNotes([newNote, ...notes]);
  };

  const handleNoteDeleted = (noteId) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const handleReactionAdded = (noteId) => {
    setNotes(notes.map(n => 
      n.id === noteId 
        ? { ...n, reaction_count: (n.reaction_count || 0) + 1 }
        : n
    ));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold">Community Reflections</h3>
          <span className="text-sm text-gray-500">({notes.length})</span>
        </div>
        {currentUser && (
          <Button
            onClick={() => setShowModal(true)}
            size="sm"
            variant="default"
          >
            Add Reflection
          </Button>
        )}
      </div>

      {/* Filter */}
      {notes.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Recent
          </Button>
          <Button
            variant={filter === 'mostLiked' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('mostLiked')}
          >
            Most Liked
          </Button>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading reflections...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-500">
            No reflections yet. {currentUser ? 'Be the first to share!' : 'Login to add one.'}
          </p>
        ) : (
          notes.map(note => (
            <PassageNoteCard
              key={note.id}
              note={note}
              currentUserId={currentUser?.id}
              onReactionAdded={handleReactionAdded}
              onDelete={handleNoteDeleted}
            />
          ))
        )}
      </div>

      {/* Modal */}
      {currentUser && (
        <CreatePassageNoteModal
          open={showModal}
          onClose={() => setShowModal(false)}
          currentUser={currentUser}
          bibleBook={bibleBook}
          chapter={chapter}
          verse={verse}
          verseText={verseText}
          onNoteCreated={handleNoteCreated}
        />
      )}
    </div>
  );
}