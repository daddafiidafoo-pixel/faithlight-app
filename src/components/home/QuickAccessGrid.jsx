import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { BookOpen, BookMarked, Headphones, Sparkles, Heart, Users, Mic, MessageSquare } from 'lucide-react';
import GBLILogo from '@/components/gbli/GBLILogo';

const CARDS = [
  { icon: BookOpen,      label: 'Read Bible',       desc: 'Explore any book, chapter, or verse',         page: 'BibleReader',   color: '#312E81', bg: '#EEF2FF' },
  { icon: BookMarked,    label: 'Study Bible',       desc: 'Notes, highlights & commentaries',            page: 'BibleStudyHub', color: '#1E3A8A', bg: '#EFF6FF' },
  { icon: Headphones,    label: 'Audio Bible',       desc: 'Listen to Scripture anywhere',                page: 'AudioBible',    color: '#065F46', bg: '#ECFDF5' },
  { icon: Sparkles,      label: 'Ask AI',            desc: 'AI-powered Bible answers',                    page: 'BibleTutor',    color: '#6D28D9', bg: '#F5F3FF' },
  { icon: MessageSquare, label: 'Forum',             desc: 'Discuss verses, ask theology Q&A',            page: 'BibleForum',    color: '#0F766E', bg: '#F0FDFA' },
  { icon: Users,         label: 'Group Study',       desc: 'Study together with believers',               page: 'Groups',        color: '#0369A1', bg: '#F0F9FF' },
  { icon: Mic,           label: 'Sermons',           desc: 'Build & explore sermon tools',                page: 'SermonTools',   color: '#92400E', bg: '#FFFBEB' },
  { icon: Heart,         label: 'Prayer Wall',       desc: 'Share & pray for community requests',         page: 'PrayerWall',    color: '#9F1239', bg: '#FFF1F2' },
  { icon: null, label: 'Global Training',  desc: 'Start your biblical leadership journey',      page: 'GlobalBiblicalLeadershipInstitute', color: '#1E1B4B', bg: '#EEF2FF', highlight: true },
];

export default function QuickAccessGrid() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#F9FAFB' }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>Quick Access</h2>
        <p className="text-sm mb-8" style={{ color: '#6B7280' }}>Jump right into your study</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CARDS.map(({ icon: Icon, label, desc, page, color, bg, highlight }) => (
            <Link to={createPageUrl(page)} key={label}>
              <div
                className="rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden"
                style={highlight
                  ? { background: '#1E1B4B', border: '2px solid #FBBF24', boxShadow: '0 4px 14px rgba(30,27,75,0.25)' }
                  : { background: '#FFFFFF', border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                {highlight && (
                  <span className="absolute top-2 right-2 bg-amber-400 text-gray-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">FREE</span>
                )}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: highlight ? 'rgba(251,191,36,0.12)' : bg }}
                >
                  {highlight
                    ? <GBLILogo size={32} dark={true} />
                    : <Icon className="w-5 h-5" style={{ color }} />
                  }
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: highlight ? '#FFFFFF' : '#111827' }}>{label}</p>
                <p className="text-xs leading-relaxed" style={{ color: highlight ? '#A5B4FC' : '#6B7280' }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}