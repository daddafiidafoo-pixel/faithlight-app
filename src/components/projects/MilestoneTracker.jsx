import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Circle, Plus, Trash2, Flag, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function MilestoneTracker({ project, canEdit, onUpdated }) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');

  const milestones = project.milestones || [];
  const completed = milestones.filter(m => m.completed).length;

  const addMilestone = async () => {
    if (!newTitle.trim()) return;
    const newMs = [
      ...milestones,
      { id: crypto.randomUUID(), title: newTitle.trim(), due_date: newDate || null, completed: false, completed_at: null }
    ];
    await base44.entities.Project.update(project.id, { milestones: newMs });
    setNewTitle('');
    setNewDate('');
    setAdding(false);
    onUpdated();
  };

  const toggleMilestone = async (id) => {
    const newMs = milestones.map(m =>
      m.id === id ? { ...m, completed: !m.completed, completed_at: !m.completed ? new Date().toISOString() : null } : m
    );
    await base44.entities.Project.update(project.id, { milestones: newMs });
    onUpdated();
  };

  const deleteMilestone = async (id) => {
    const newMs = milestones.filter(m => m.id !== id);
    await base44.entities.Project.update(project.id, { milestones: newMs });
    onUpdated();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-800">Milestones</h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{completed}/{milestones.length}</span>
        </div>
        {canEdit && (
          <Button size="sm" variant="outline" onClick={() => setAdding(v => !v)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        )}
      </div>

      {adding && (
        <div className="flex gap-2 mb-3">
          <Input placeholder="Milestone title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className="flex-1 h-8 text-sm" />
          <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-36 h-8 text-sm" />
          <Button size="sm" onClick={addMilestone}>Add</Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
        </div>
      )}

      {milestones.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No milestones yet</p>
      ) : (
        <div className="space-y-2">
          {milestones.map((m, i) => (
            <div key={m.id} className={`flex items-center gap-3 p-2 rounded-lg group transition-colors ${m.completed ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
              <button
                onClick={() => canEdit && toggleMilestone(m.id)}
                className={canEdit ? 'cursor-pointer' : 'cursor-default'}
              >
                {m.completed
                  ? <CheckCircle className="w-5 h-5 text-green-500" />
                  : <Circle className="w-5 h-5 text-gray-300" />}
              </button>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${m.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{m.title}</span>
                {m.due_date && (
                  <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> {format(new Date(m.due_date), 'MMM d, yyyy')}
                    {m.completed && m.completed_at && ` · Done ${format(new Date(m.completed_at), 'MMM d')}`}
                  </span>
                )}
              </div>
              {m.completed && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Done</span>}
              {canEdit && (
                <button onClick={() => deleteMilestone(m.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}