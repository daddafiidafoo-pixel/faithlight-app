import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

const MOODS = ['grateful', 'hopeful', 'challenged', 'peaceful', 'questioning', 'joyful'];

export default function JournalForm({ onSubmit, onCancel, lang }) {
  const [content, setContent] = useState('');
  const [verse, setVerse] = useState('');
  const [mood, setMood] = useState('peaceful');
  const [tags, setTags] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('Please enter reflection content');
      return;
    }
    onSubmit({
      content,
      related_verse: verse || null,
      mood,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      entry_date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle>New Journal Entry</CardTitle>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Reflection</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your spiritual reflection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bible Verse (optional)</label>
            <input
              type="text"
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              placeholder="E.g., John 3:16"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mood</label>
            <div className="grid grid-cols-3 gap-2">
              {MOODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    mood === m
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated, optional)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="E.g., faith, prayer, hope"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Entry
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}