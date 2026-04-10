import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy, Plus, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const PRESET_MILESTONES = [
  { label: 'Read first 7 days', chapters: 7 },
  { label: 'Complete a Gospel', chapters: 28 },
  { label: 'Read 100 chapters', chapters: 100 },
  { label: 'Complete New Testament', chapters: 260 },
  { label: 'Read entire Bible', chapters: 1189 },
];

export default function MilestoneTracker({ user, totalChaptersRead = 0 }) {
  const [milestones, setMilestones] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`milestones_${user?.id}`) || 'null') || PRESET_MILESTONES.map(m => ({ ...m, achieved: totalChaptersRead >= m.chapters })); }
    catch { return PRESET_MILESTONES.map(m => ({ ...m, achieved: false })); }
  });
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newChapters, setNewChapters] = useState('');

  const save = (updated) => {
    setMilestones(updated);
    if (user?.id) localStorage.setItem(`milestones_${user.id}`, JSON.stringify(updated));
  };

  // Sync achievement state with actual progress
  const synced = milestones.map(m => ({ ...m, achieved: totalChaptersRead >= m.chapters }));

  const addMilestone = () => {
    if (!newLabel.trim() || !newChapters) return;
    const updated = [...milestones, { label: newLabel.trim(), chapters: Number(newChapters), achieved: totalChaptersRead >= Number(newChapters) }];
    save(updated);
    setNewLabel(''); setNewChapters(''); setAdding(false);
  };

  const removeMilestone = (i) => {
    save(milestones.filter((_, idx) => idx !== i));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" /> Custom Milestones
        </h3>
        <button onClick={() => setAdding(v => !v)} className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-0.5">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {adding && (
        <div className="flex gap-2 mb-3 items-center">
          <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Milestone name" className="flex-1 text-xs h-8" />
          <Input value={newChapters} onChange={e => setNewChapters(e.target.value)} type="number" min="1" placeholder="Chapters" className="w-20 text-xs h-8" />
          <button onClick={addMilestone} className="p-1.5 bg-indigo-600 text-white rounded-lg"><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => setAdding(false)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="space-y-2">
        {synced.map((m, i) => {
          const pct = Math.min(100, Math.round((totalChaptersRead / m.chapters) * 100));
          return (
            <div key={i} className={`rounded-xl p-3 border transition-all ${m.achieved ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {m.achieved ? <Trophy className="w-3.5 h-3.5 text-amber-500" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />}
                  <span className={`text-xs font-bold ${m.achieved ? 'text-amber-800' : 'text-gray-700'}`}>{m.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{totalChaptersRead}/{m.chapters} ch</span>
                  <button onClick={() => removeMilestone(i)} className="text-gray-300 hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${m.achieved ? 'bg-amber-400' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}