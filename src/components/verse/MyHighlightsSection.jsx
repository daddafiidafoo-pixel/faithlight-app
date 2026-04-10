import React, { useState, useEffect } from 'react';
import { Highlighter, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MyHighlightsSection() {
  const [highlights, setHighlights] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    const storedHighlights = JSON.parse(localStorage.getItem('highlights') || '[]');
    setHighlights(storedHighlights);
  }, []);

  const deleteHighlight = (id) => {
    const updated = highlights.filter((h) => h.id !== id);
    setHighlights(updated);
    localStorage.setItem('highlights', JSON.stringify(updated));
  };

  const updateNote = (id, note) => {
    const updated = highlights.map((h) =>
      h.id === id ? { ...h, note } : h
    );
    setHighlights(updated);
    localStorage.setItem('highlights', JSON.stringify(updated));
    setEditingId(null);
  };

  const colorClasses = {
    yellow: 'bg-yellow-100 border-yellow-300',
    green: 'bg-green-100 border-green-300',
    blue: 'bg-blue-100 border-blue-300',
    pink: 'bg-pink-100 border-pink-300',
    purple: 'bg-purple-100 border-purple-300',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Highlighter className="w-5 h-5 text-amber-600" />
        <h2 className="text-xl font-bold text-gray-900">My Highlights</h2>
        <Badge variant="secondary">{highlights.length}</Badge>
      </div>

      {highlights.length === 0 ? (
        <Card className="p-6 text-center bg-gray-50">
          <p className="text-gray-600">No highlights yet. Start highlighting verses!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {highlights.map((highlight) => (
            <Card
              key={highlight.id}
              className={`p-4 border-2 ${colorClasses[highlight.color] || colorClasses.yellow}`}
            >
              <p className="text-sm font-semibold text-gray-900 mb-2">{highlight.reference}</p>
              <p className="text-gray-800 mb-3 italic">{highlight.verse}</p>

              {editingId === highlight.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Add a personal note..."
                    className="w-full p-2 border rounded text-sm"
                    rows="2"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateNote(highlight.id, editNote)}
                      className="text-xs"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {highlight.note && (
                    <p className="text-sm text-gray-700 bg-white/50 p-2 rounded mb-2">
                      📝 {highlight.note}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(highlight.id);
                        setEditNote(highlight.note || '');
                      }}
                      className="text-xs text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="w-3 h-3 mr-1" /> Note
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteHighlight(highlight.id)}
                      className="text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}