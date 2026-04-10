import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const OPTIONS = [
  { key: 'fast',     label: 'Fast',     hint: 'Quick & concise',  icon: '⚡' },
  { key: 'balanced', label: 'Balanced', hint: 'Best overall',     icon: '⚖️' },
  { key: 'deep',     label: 'Deep',     hint: 'More detail',      icon: '🧠' },
];

export function getBase44ModelId(modelKey) {
  const map = { fast: 'fast', balanced: 'balanced', deep: 'deep' };
  return map[modelKey] || 'balanced';
}

export default function AIModelSelector({ me, value = 'balanced', onChange }) {
  const [modelKey, setModelKey] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!me?.id) return;
    base44.entities.UserAIPreferences.filter({ user_id: me.id }, null, 1)
      .then(rows => {
        const pref = rows?.[0]?.preferred_explain_model;
        if (pref) { setModelKey(pref); onChange?.(pref); }
      })
      .catch(() => {});
  }, [me?.id]);

  async function pick(next) {
    setModelKey(next);
    onChange?.(next);
    if (!me?.id) return;
    setSaving(true);
    try {
      const rows = await base44.entities.UserAIPreferences.filter({ user_id: me.id }, null, 1).catch(() => []);
      const now = new Date().toISOString();
      if (rows?.[0]?.id) {
        await base44.entities.UserAIPreferences.update(rows[0].id, { preferred_explain_model: next, updated_at: now });
      } else {
        await base44.entities.UserAIPreferences.create({ user_id: me.id, preferred_explain_model: next, updated_at: now });
      }
    } catch {}
    setSaving(false);
  }

  return (
    <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
      <div className="text-xs font-semibold text-gray-600 mb-2">Explanation depth</div>
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map(o => {
          const active = o.key === modelKey;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => pick(o.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                active
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <span>{o.icon}</span>
              {o.label}
              <span className={`ml-0.5 font-normal ${active ? 'text-indigo-200' : 'text-gray-400'}`}>· {o.hint}</span>
            </button>
          );
        })}
      </div>
      {saving && <p className="text-xs text-gray-400 mt-1.5">Saving preference…</p>}
    </div>
  );
}