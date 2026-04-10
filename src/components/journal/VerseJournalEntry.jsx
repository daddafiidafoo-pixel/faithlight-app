import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Trash2 } from 'lucide-react';

export default function VerseJournalEntry({ verse }) {
  const [notes, setNotes] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [tags, setTags] = useState('');
  const [recording, setRecording] = useState(false);
  const [voiceMemoUrl, setVoiceMemoUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSaveEntry = async () => {
    if (!notes.trim() && !thoughts.trim() && !voiceMemoUrl) {
      alert('Please add notes, thoughts, or a voice memo');
      return;
    }

    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.BibleVersesJournal.create({
        userEmail: user.email,
        reference: verse.reference,
        bookCode: verse.bookCode,
        chapter: verse.chapter,
        verse: verse.verse,
        notes,
        thoughts,
        voiceMemoUrl,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        entryDate: new Date().toISOString().split('T')[0]
      });

      setNotes('');
      setThoughts('');
      setTags('');
      setVoiceMemoUrl(null);
      alert('Journal entry saved!');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert('Error saving entry');
    } finally {
      setSaving(false);
    }
  };

  const handleVoiceRecording = async () => {
    if (!recording) {
      setRecording(true);
      // TODO: Implement WebRTC audio capture and upload
    } else {
      setRecording(false);
      // TODO: Save recording and get URL
    }
  };

  return (
    <Card className="p-6 space-y-4 bg-blue-50 border-blue-200">
      <h3 className="font-semibold text-gray-900">Journal Entry for {verse.reference}</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Personal Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What stands out about this verse?"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thoughts & Reflections</label>
          <textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder="How does this apply to your life?"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="prayer, guidance, encouragement (comma separated)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {voiceMemoUrl && (
          <div className="flex items-center gap-2 p-3 bg-white border border-green-200 rounded-lg">
            <span className="text-sm text-green-700">✓ Voice memo recorded</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setVoiceMemoUrl(null)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleVoiceRecording}
          className={recording ? 'bg-red-100 border-red-300' : ''}
        >
          <Mic className="w-4 h-4 mr-2" />
          {recording ? 'Stop Recording' : 'Add Voice Memo'}
        </Button>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSaveEntry} disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save Entry'}
        </Button>
      </div>
    </Card>
  );
}