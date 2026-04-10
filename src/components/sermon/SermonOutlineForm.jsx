import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';

export default function SermonOutlineForm({ onGenerate, loading }) {
  const [verseRef, setVerseRef] = useState('');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('mixed');
  const [length, setLength] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!verseRef.trim() || !topic.trim()) return;
    onGenerate({ verseRef, topic, audience, length });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Bible Verse Reference
        </label>
        <Input
          placeholder="e.g., Mark 16:15"
          value={verseRef}
          onChange={(e) => setVerseRef(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Sermon Topic
        </label>
        <Input
          placeholder="e.g., Evangelism"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Target Audience
        </label>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value="youth">Youth</option>
          <option value="adults">Adults</option>
          <option value="mixed">Mixed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Sermon Length
        </label>
        <select
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value="short">Short (10-15 min)</option>
          <option value="medium">Medium (20-30 min)</option>
          <option value="long">Long (40+ min)</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={!verseRef.trim() || !topic.trim() || loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
      >
        <Sparkles className="w-4 h-4" />
        {loading ? 'Generating...' : 'Generate Outline'}
      </Button>
    </form>
  );
}