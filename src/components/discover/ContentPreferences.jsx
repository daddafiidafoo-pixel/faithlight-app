import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, MessageSquare, Users, Heart, Settings, Check, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const CONTENT_TYPES = [
  { id: 'devotional', label: 'Devotionals', icon: Heart, color: 'bg-rose-100 text-rose-700' },
  { id: 'forum', label: 'Discussions', icon: MessageSquare, color: 'bg-blue-100 text-blue-700' },
  { id: 'study_plan', label: 'Study Plans', icon: BookOpen, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'group', label: 'Groups', icon: Users, color: 'bg-purple-100 text-purple-700' },
];

const TOPICS = ['Prayer', 'Grace', 'Wisdom', 'Psalms', 'John', 'Romans', 'Faith', 'Healing', 'Prophecy', 'Salvation', 'Discipleship', 'Worship', 'Family', 'Leadership', 'Evangelism'];

export default function ContentPreferences({ user, onPrefsChange }) {
  const PREF_KEY = `discover_prefs_${user?.id}`;
  const HIDDEN_KEY = `discover_hidden_${user?.id}`;

  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(PREF_KEY);
      return saved ? JSON.parse(saved) : { type_order: ['devotional', 'forum', 'study_plan', 'group'], topics: [], disabled_types: [] };
    } catch { return { type_order: ['devotional', 'forum', 'study_plan', 'group'], topics: [], disabled_types: [] }; }
  });

  const save = (updated) => {
    setPrefs(updated);
    localStorage.setItem(PREF_KEY, JSON.stringify(updated));
    onPrefsChange?.(updated);
    toast.success('Preferences saved');
    setOpen(false);
  };

  const toggleType = (id) => {
    setPrefs(p => {
      const disabled = p.disabled_types.includes(id) ? p.disabled_types.filter(t => t !== id) : [...p.disabled_types, id];
      return { ...p, disabled_types: disabled };
    });
  };

  const toggleTopic = (topic) => {
    setPrefs(p => {
      const topics = p.topics.includes(topic) ? p.topics.filter(t => t !== topic) : [...p.topics, topic];
      return { ...p, topics };
    });
  };

  const moveType = (id, dir) => {
    setPrefs(p => {
      const order = [...p.type_order];
      const idx = order.indexOf(id);
      if (dir === 'up' && idx > 0) [order[idx], order[idx - 1]] = [order[idx - 1], order[idx]];
      if (dir === 'down' && idx < order.length - 1) [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
      return { ...p, type_order: order };
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1">
          <Settings className="w-3 h-3" /> My Preferences
        </p>
        <button onClick={() => setOpen(p => !p)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
          {open ? 'Done' : 'Customize'}
        </button>
      </div>

      {!open ? (
        <div className="space-y-2">
          {/* Summary of active prefs */}
          <div className="flex flex-wrap gap-1.5">
            {prefs.type_order.filter(t => !prefs.disabled_types.includes(t)).map((t, i) => {
              const cfg = CONTENT_TYPES.find(c => c.id === t);
              if (!cfg) return null;
              const Icon = cfg.icon;
              return (
                <span key={t} className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${cfg.color}`}>
                  {i === 0 && <span className="text-[9px] font-bold opacity-60">TOP</span>}
                  <Icon className="w-2.5 h-2.5" /> {cfg.label}
                </span>
              );
            })}
          </div>
          {prefs.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prefs.topics.slice(0, 4).map(t => (
                <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-200 text-indigo-600">{t}</Badge>
              ))}
              {prefs.topics.length > 4 && <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{prefs.topics.length - 4}</Badge>}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Content type priority */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Content Priority (drag to reorder)</p>
            <div className="space-y-1.5">
              {prefs.type_order.map((typeId, idx) => {
                const cfg = CONTENT_TYPES.find(c => c.id === typeId);
                if (!cfg) return null;
                const Icon = cfg.icon;
                const enabled = !prefs.disabled_types.includes(typeId);
                return (
                  <div key={typeId} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                    <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-gray-800 flex-1">{cfg.label}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveType(typeId, 'up')} disabled={idx === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 text-xs">↑</button>
                      <button onClick={() => moveType(typeId, 'down')} disabled={idx === prefs.type_order.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20 text-xs">↓</button>
                      <button onClick={() => toggleType(typeId)} className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                        {enabled ? <Check className="w-2.5 h-2.5 text-white" /> : <X className="w-2.5 h-2.5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic interests */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Favorite Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map(topic => (
                <button key={topic} onClick={() => toggleTopic(topic)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${prefs.topics.includes(topic) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => save(prefs)}>
            Save Preferences
          </Button>
        </div>
      )}
    </div>
  );
}

// Hook to get hidden items for the current user
export function useHiddenItems(userId) {
  const HIDDEN_KEY = `discover_hidden_${userId}`;
  const [hidden, setHidden] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]')); } catch { return new Set(); }
  });

  const hide = (itemId) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.add(itemId);
      localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next]));
      return next;
    });
    toast.success('Item hidden from your feed', { action: { label: 'Undo', onClick: () => unhide(itemId) } });
  };

  const unhide = (itemId) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  return { hidden, hide, unhide };
}