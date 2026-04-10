import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

const ICONS = ['📁', '📖', '✝️', '🙏', '❤️', '🕊️', '🌟', '💡', '🧭', '🌿', '🏆', '🎯'];
const COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#F97316'];

export default function CreateCollectionModal({ onCreate, onClose }) {
  const [form, setForm] = useState({ name: '', description: '', icon: '📁', color: '#6366F1' });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">New Collection</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Name *</label>
            <Input placeholder="e.g. Guidance, Forgiveness..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Description</label>
            <Textarea placeholder="What's this collection about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="min-h-[80px]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-colors ${form.icon === icon ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button key={color} onClick={() => setForm(f => ({ ...f, color }))}
                  style={{ background: color }}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => form.name && onCreate(form)} disabled={!form.name} className="flex-1 bg-indigo-700 hover:bg-indigo-800">Create</Button>
        </div>
      </div>
    </div>
  );
}