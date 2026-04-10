import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const THEOLOGICAL_PERSPECTIVES = [
  { id: 'general',       label: 'General Christian',    color: 'indigo',  description: 'Broadly orthodox Christian interpretation' },
  { id: 'evangelical',   label: 'Evangelical',          color: 'blue',    description: 'Scripture alone, born-again faith emphasis' },
  { id: 'catholic',      label: 'Catholic',             color: 'yellow',  description: 'Tradition, magisterium, sacramental lens' },
  { id: 'reformed',      label: 'Reformed / Calvinist',  color: 'green',   description: 'Sovereignty of God, covenant theology' },
  { id: 'arminian',      label: 'Arminian / Wesleyan',   color: 'orange',  description: 'Free will, prevenient grace, sanctification' },
  { id: 'pentecostal',   label: 'Pentecostal / Charismatic', color: 'red', description: 'Holy Spirit gifts, experiential faith' },
  { id: 'orthodox',      label: 'Eastern Orthodox',     color: 'purple',  description: 'Theosis, patristic tradition, mystery' },
  { id: 'liberation',    label: 'Liberation Theology',  color: 'teal',    description: 'Justice, the poor, social gospel' },
];

const COLOR_MAP = {
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  blue:   'bg-blue-100 text-blue-700 border-blue-300',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  green:  'bg-green-100 text-green-700 border-green-300',
  orange: 'bg-orange-100 text-orange-700 border-orange-300',
  red:    'bg-red-100 text-red-700 border-red-300',
  purple: 'bg-purple-100 text-purple-700 border-purple-300',
  teal:   'bg-teal-100 text-teal-700 border-teal-300',
};

export default function TheologicalPerspectivePicker({ selected, onChange, className = '' }) {
  const [open, setOpen] = React.useState(false);
  const current = THEOLOGICAL_PERSPECTIVES.find(p => p.id === selected) || THEOLOGICAL_PERSPECTIVES[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-full border text-xs font-semibold transition-all min-h-[44px] ${COLOR_MAP[current.color]}`}
        aria-label="Select theological perspective"
      >
        {current.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-64 py-1 max-h-72 overflow-y-auto">
            {THEOLOGICAL_PERSPECTIVES.map(p => (
              <button
                key={p.id}
                onClick={() => { onChange(p.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${selected === p.id ? 'bg-gray-50' : ''}`}
              >
                <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border mb-0.5 ${COLOR_MAP[p.color]}`}>
                  {p.label}
                </div>
                <p className="text-xs text-gray-500 leading-snug">{p.description}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}