import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';

export default function PrayerEntryCard({ prayer, onUpdate }) {
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState(prayer.answered_reflection || '');
  const [saving, setSaving] = useState(false);

  const handleMarkAnswered = async () => {
    setSaving(true);
    try {
      await base44.entities.PrayerEntry.update(prayer.id, {
        is_answered: !prayer.is_answered,
        answered_date: !prayer.is_answered ? new Date().toISOString().split('T')[0] : null
      });
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReflection = async () => {
    setSaving(true);
    try {
      await base44.entities.PrayerEntry.update(prayer.id, {
        answered_reflection: reflection
      });
      setShowReflection(false);
      onUpdate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={`p-6 ${prayer.is_answered ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">{prayer.title}</h3>
          <p className="text-sm text-slate-500 mt-1">{new Date(prayer.prayer_date).toLocaleDateString()}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-slate-200 text-slate-700 text-xs rounded-full font-semibold">
            {prayer.category}
          </span>
        </div>
        <button
          onClick={handleMarkAnswered}
          disabled={saving}
          className="flex-shrink-0"
        >
          {prayer.is_answered ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <Circle className="w-6 h-6 text-slate-400 hover:text-slate-600" />
          )}
        </button>
      </div>

      <p className="text-slate-700 mb-4">{prayer.content}</p>

      {prayer.is_answered && (
        <div className="mt-4 pt-4 border-t border-green-200">
          {showReflection ? (
            <div className="space-y-3">
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Reflect on how this prayer was answered..."
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveReflection} disabled={saving}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => setShowReflection(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              {reflection ? (
                <>
                  <p className="text-sm font-semibold text-green-700 mb-2">How God answered:</p>
                  <p className="text-sm text-slate-700 italic">{reflection}</p>
                  <button onClick={() => setShowReflection(true)} className="text-xs text-green-600 mt-2 hover:underline">
                    Edit
                  </button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setShowReflection(true)}>
                  Add reflection
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}