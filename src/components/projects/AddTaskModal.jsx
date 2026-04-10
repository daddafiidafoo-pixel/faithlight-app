import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, CheckSquare } from 'lucide-react';

export default function AddTaskModal({ projectId, user, collaborators = [], milestones = [], defaultStatus = 'todo', onCreated, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: defaultStatus, assignee_id: '', due_date: '', bible_reference: '', milestone_id: '' });
  const [loading, setLoading] = useState(false);

  const allMembers = [{ user_id: user?.id, user_name: user?.full_name }, ...collaborators];

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    const assignee = allMembers.find(m => m.user_id === form.assignee_id);
    await base44.entities.ProjectTask.create({
      project_id: projectId,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      assignee_id: form.assignee_id || null,
      assignee_name: assignee?.user_name || null,
      creator_id: user.id,
      creator_name: user.full_name,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      bible_reference: form.bible_reference || null,
      milestone_id: form.milestone_id || null,
    });
    setLoading(false);
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">New Task</h2>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <Input placeholder="Task title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['low','medium','high','urgent'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['todo','in_progress','review','completed','blocked'].map(s => <SelectItem key={s} value={s}>{s.replace('_',' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Assign To</label>
              <Select value={form.assignee_id} onValueChange={v => setForm(f => ({ ...f, assignee_id: v }))}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Unassigned</SelectItem>
                  {allMembers.map(m => <SelectItem key={m.user_id} value={m.user_id}>{m.user_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
              <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="h-8" />
            </div>
          </div>

          {milestones.length > 0 && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Milestone</label>
              <Select value={form.milestone_id} onValueChange={v => setForm(f => ({ ...f, milestone_id: v }))}>
                <SelectTrigger className="h-8"><SelectValue placeholder="No milestone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No milestone</SelectItem>
                  {milestones.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Bible Reference (optional)</label>
            <Input placeholder="e.g. Philippians 4:13" value={form.bible_reference} onChange={e => setForm(f => ({ ...f, bible_reference: e.target.value }))} className="h-8" />
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !form.title.trim()} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Adding...' : 'Add Task'}
          </Button>
        </div>
      </div>
    </div>
  );
}