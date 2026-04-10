import React from 'react';
import { FileText, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TOOLS = [
  {
    icon: FileText,
    label: 'Study Notes',
    desc: 'Your annotated verses & reflections',
    href: '/StudyNotes',
    bg: '#F5F3FF',
    color: '#7C3AED',
  },
  {
    icon: TrendingUp,
    label: 'Reading Progress',
    desc: 'Track your Bible completion',
    href: '/BibleReadingProgress',
    bg: '#EFF6FF',
    color: '#2563EB',
  },
];

export default function StudyToolsSection() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-3">
      {TOOLS.map(({ icon: Icon, label, desc, href, bg, color }) => (
        <button key={href} onClick={() => navigate(href)}
          className="flex flex-col items-start gap-2 rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition text-left"
          style={{ backgroundColor: bg }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'white' }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <p className="text-sm font-bold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500 leading-snug">{desc}</p>
        </button>
      ))}
    </div>
  );
}