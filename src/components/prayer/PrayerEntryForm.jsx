import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function PrayerEntryForm({ onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'other',
    linked_verses: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setLoading(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.PrayerEntry.create({
        user_email: user.email,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        prayer_date: new Date().toISOString().split('T')[0],
        linked_verses: formData.linked_verses
      });
      onSubmit();
    } catch (error) {
      console.error('Error creating prayer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-6 border-2 border-purple-200 bg-purple-50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Prayer Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What are you praying about?"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Prayer Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your prayer..."
            className="w-full px-4 py-2 border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="other">Other</option>
            <option value="health">Health</option>
            <option value="family">Family</option>
            <option value="faith">Faith</option>
            <option value="work">Work</option>
            <option value="relationships">Relationships</option>
            <option value="gratitude">Gratitude</option>
          </select>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? 'Saving...' : 'Save Prayer'}
          </Button>
        </div>
      </form>
    </Card>
  );
}