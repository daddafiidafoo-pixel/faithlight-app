import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { X, Send } from 'lucide-react';

export default function SendToSessionModal({ outline, userEmail, onClose }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includePoints, setIncludePoints] = useState(true);
  const [includeApplication, setIncludeApplication] = useState(true);

  // Get pastor's active sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ['activeSessions', userEmail],
    queryFn: () => base44.entities.SermonSession.filter(
      { createdByUserId: userEmail, status: 'live' },
      '-created_date'
    )
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSession) return;

      const options = {
        includeTitle,
        includePoints,
        includeApplication
      };

      // Track the share
      await base44.entities.SermonOutlineShare.create({
        outlineId: outline.id || 'new',
        sessionId: selectedSession.id,
        pastorId: userEmail,
        options
      });

      // Store in session notes for live visibility
      const outlineToSend = {};
      if (includeTitle) outlineToSend.title = outline.title;
      if (includePoints) outlineToSend.mainPoints = outline.mainPoints;
      if (includeApplication) outlineToSend.application = outline.application;

      await base44.entities.SessionNote.create({
        sessionId: selectedSession.id,
        userId: userEmail,
        noteText: JSON.stringify(outlineToSend)
      });

      alert('Outline sent to session!');
      onClose();
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Send to Live Session</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Session Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Select Session
            </label>
            <select
              value={selectedSession?.id || ''}
              onChange={(e) => setSelectedSession(sessions.find(s => s.id === e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Choose a session...</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* What to Send */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              What to Send
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTitle}
                onChange={(e) => setIncludeTitle(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">Title</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePoints}
                onChange={(e) => setIncludePoints(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">Main Points</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeApplication}
                onChange={(e) => setIncludeApplication(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">Application Ideas</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={sendMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={!selectedSession || sendMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Send className="w-4 h-4" /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}