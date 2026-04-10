import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Sparkles } from 'lucide-react';

const THEMES = [
  'Overcoming Anxiety', 'Finding Peace', 'Growing in Faith', 'God\'s Promises',
  'Prayer & Worship', 'Forgiveness & Healing', 'Courage & Strength', 'Identity in Christ',
  'Marriage & Family', 'Purpose & Calling', 'Gratitude', 'The Life of Jesus',
];

const DURATIONS = [7, 14, 21, 30];

export default function GeneratePlanModal({ onGenerate, onClose }) {
  const [theme, setTheme] = useState('');
  const [days, setDays] = useState(7);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Create Reading Plan
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">AI will pick daily scriptures around your theme</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Your Theme / Topic *</label>
            <Input
              placeholder="e.g. Overcoming anxiety, or type your own..."
              value={theme}
              onChange={e => setTheme(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Popular Themes</label>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(t => (
                <button key={t} onClick={() => setTheme(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${theme === t ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Duration</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDays(d)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${days === d ? 'bg-amber-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-amber-50'}`}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => theme.trim() && onGenerate({ theme: theme.trim(), days })}
            disabled={!theme.trim()}
            className="flex-1 bg-amber-600 hover:bg-amber-700 gap-2"
          >
            <Sparkles className="w-4 h-4" /> Generate Plan
          </Button>
        </div>
      </div>
    </div>
  );
}