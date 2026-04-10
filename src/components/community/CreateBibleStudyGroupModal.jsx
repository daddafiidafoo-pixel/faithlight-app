import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  'Matthew', 'Mark', 'Luke', 'John',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians'
];

const FOCUS_AREAS = [
  { value: 'old_testament', label: 'Old Testament' },
  { value: 'new_testament', label: 'New Testament' },
  { value: 'gospels', label: 'Gospels' },
  { value: 'prophecy', label: 'Prophecy' },
  { value: 'theology', label: 'Theology' },
  { value: 'discipleship', label: 'Discipleship' },
  { value: 'prayer', label: 'Prayer' },
  { value: 'other', label: 'General' },
];

export default function CreateBibleStudyGroupModal({ open, onClose, currentUser, onGroupCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    focusArea: 'other',
    bibleBooks: [],
    meetingSchedule: '',
    isPublic: true,
    requiresApproval: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleBook = (book) => {
    setFormData(prev => ({
      ...prev,
      bibleBooks: prev.bibleBooks.includes(book)
        ? prev.bibleBooks.filter(b => b !== book)
        : [...prev.bibleBooks, book]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      const group = await base44.entities.BibleStudyGroup.create({
        name: formData.name,
        description: formData.description,
        creator_id: currentUser.id,
        creator_name: currentUser.full_name,
        focus_area: formData.focusArea,
        bible_books: formData.bibleBooks,
        meeting_schedule: formData.meetingSchedule,
        is_public: formData.isPublic,
        requires_approval: formData.requiresApproval,
        member_count: 1,
      });

      // Add creator as member
      await base44.entities.GroupMember.create({
        group_id: group.id,
        user_id: currentUser.id,
        role: 'admin',
      });

      onGroupCreated?.(group);
      setFormData({
        name: '',
        description: '',
        focusArea: 'other',
        bibleBooks: [],
        meetingSchedule: '',
        isPublic: true,
        requiresApproval: false,
      });
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Bible Study Group</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium">Group Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Gospels Deep Dive, Romans Study Circle"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What will this group focus on? Who should join?"
              className="mt-1 min-h-20"
            />
          </div>

          {/* Focus Area */}
          <div>
            <label className="text-sm font-medium">Focus Area</label>
            <select
              name="focusArea"
              value={formData.focusArea}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              {FOCUS_AREAS.map(area => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bible Books */}
          <div>
            <label className="text-sm font-medium">Bible Books to Study (optional)</label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
              {BIBLE_BOOKS.map(book => (
                <label key={book} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.bibleBooks.includes(book)}
                    onChange={() => toggleBook(book)}
                    className="rounded"
                  />
                  {book}
                </label>
              ))}
            </div>
          </div>

          {/* Meeting Schedule */}
          <div>
            <label className="text-sm font-medium">Meeting Schedule (optional)</label>
            <Input
              name="meetingSchedule"
              value={formData.meetingSchedule}
              onChange={handleChange}
              placeholder="e.g., Weekly on Sundays 7 PM EST"
              className="mt-1"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                className="rounded"
              />
              Make this group discoverable
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.requiresApproval}
                onChange={() => setFormData(prev => ({ ...prev, requiresApproval: !prev.requiresApproval }))}
                className="rounded"
              />
              Require approval for new members
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}