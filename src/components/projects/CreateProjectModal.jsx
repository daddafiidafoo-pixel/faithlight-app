import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Folder } from 'lucide-react';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];
const CATEGORIES = [
  { value: 'bible_study', label: '📖 Bible Study' },
  { value: 'reading_plan', label: '📚 Reading Plan' },
  { value: 'ministry', label: '⛪ Ministry' },
  { value: 'personal', label: '👤 Personal' },
  { value: 'group', label: '👥 Group' },
  { value: 'general', label: '📋 General' },
];

export default function CreateProjectModal({ user, onCreated, onClose }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'general', color: '#6366F1', due_date: '', is_public: false });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    const project = await base44.entities.Project.create({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      color: form.color,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      is_public: form.is_public,
      owner_id: user.id,
      owner_name: user.full_name,
      status: 'active',
      progress_percentage: 0,
      milestones: [],
      collaborator_ids: [],
    });
    setLoading(false);
    onCreated(project);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">New Project</h2>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Project Title *</label>
            <Input placeholder="e.g. 30-Day Prayer Challenge" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
            <Textarea placeholder="What is this project about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Due Date</label>
              <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))} className="rounded" />
            Make project visible to all users
          </label>
        </div>

        <div className="px-6 pb-5 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !form.title.trim()} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </div>
    </div>
  );
}