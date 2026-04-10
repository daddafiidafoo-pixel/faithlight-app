import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function StudyGroupForm({ onSubmit, onCancel, lang }) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    onSubmit({
      group_name: groupName,
      description,
      is_private: isPrivate,
    });
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle>Create Study Group</CardTitle>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="E.g., Monday Bible Study"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="private" className="text-sm font-medium cursor-pointer">
              Private (invite only)
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              Create Group
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}