import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const NOTE_TYPES = [
  { value: 'personal_reflection', label: 'Personal Reflection' },
  { value: 'key_insight', label: 'Key Insight' },
  { value: 'question', label: 'Question' },
  { value: 'prayer_point', label: 'Prayer Point' },
  { value: 'application', label: 'Application' },
];

export default function StudyDayNotepad({ studyPlanId, dayIndex, userId }) {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState('personal_reflection');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [studyPlanId, dayIndex]);

  const fetchNotes = async () => {
    try {
      const dayNotes = await base44.entities.StudyDayNote.filter({
        study_plan_id: studyPlanId,
        day_index: dayIndex,
        user_id: userId,
      }, '-created_date');
      setNotes(dayNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async () => {
    if (!newNoteText.trim()) return;

    setIsSaving(true);
    try {
      const createdNote = await base44.entities.StudyDayNote.create({
        user_id: userId,
        study_plan_id: studyPlanId,
        day_index: dayIndex,
        note_content: newNoteText,
        note_type: newNoteType,
      });
      setNotes([createdNote, ...notes]);
      setNewNoteText('');
      setNewNoteType('personal_reflection');
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleHighlight = async (noteId, highlighted) => {
    try {
      await base44.entities.StudyDayNote.update(noteId, {
        highlighted: !highlighted,
      });
      setNotes(notes.map(n => n.id === noteId ? { ...n, highlighted: !highlighted } : n));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await base44.entities.StudyDayNote.delete(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notes List */}
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading notes...</p>
          ) : notes.length > 0 ? (
            notes.map(note => (
              <div
                key={note.id}
                className={`p-3 rounded-lg border-l-4 transition-colors ${
                  note.highlighted
                    ? 'bg-amber-50 border-amber-400'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                      {NOTE_TYPES.find(t => t.value === note.note_type)?.label}
                    </p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.note_content}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => toggleHighlight(note.id, note.highlighted)}
                      variant="ghost"
                      size="sm"
                      className={note.highlighted ? 'text-amber-600' : 'text-gray-400'}
                    >
                      <Star className="w-4 h-4" fill={note.highlighted ? 'currentColor' : 'none'} />
                    </Button>
                    <Button
                      onClick={() => deleteNote(note.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
          )}
        </div>

        {/* Add New Note */}
        <div className="space-y-2 pt-3 border-t">
          <Select value={newNoteType} onValueChange={setNewNoteType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTE_TYPES.map(nt => (
                <SelectItem key={nt.value} value={nt.value}>
                  {nt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Write your note here..."
            className="min-h-20"
          />
          <Button
            onClick={saveNote}
            disabled={isSaving || !newNoteText.trim()}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}