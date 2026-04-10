import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const ERAS = [
  {
    id: 'creation',
    name: 'Creation & Fall',
    years: '~4000–2200 BC',
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    emoji: '🌱',
    desc: 'The beginning of all things — creation, the fall, and the flood.',
    books: ['Genesis 1–11'],
    events: [
      { year: '~4000 BC', event: 'Creation of the world', ref: 'Gen 1–2' },
      { year: '~3900 BC', event: 'The Fall of Adam & Eve', ref: 'Gen 3' },
      { year: '~3000 BC', event: 'Cain and Abel', ref: 'Gen 4' },
      { year: '~2400 BC', event: 'Noah and the Flood', ref: 'Gen 6–9' },
      { year: '~2200 BC', event: 'Tower of Babel', ref: 'Gen 11' },
    ]
  },
  {
    id: 'patriarchs',
    name: 'Patriarchs',
    years: '~2166–1805 BC',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
    emoji: '🏕️',
    desc: 'God calls Abraham and establishes His covenant people.',
    books: ['Genesis 12–50', 'Job'],
    events: [
      { year: '~2166 BC', event: 'Abraham born in Ur', ref: 'Gen 11:27' },
      { year: '~2091 BC', event: 'God calls Abraham to Canaan', ref: 'Gen 12:1' },
      { year: '~2066 BC', event: 'Isaac born — covenant continues', ref: 'Gen 21:1' },
      { year: '~2006 BC', event: 'Jacob born; God renames him Israel', ref: 'Gen 25:26' },
      { year: '~1915 BC', event: 'Joseph sold to Egypt', ref: 'Gen 37' },
      { year: '~1805 BC', event: 'Jacob\'s family settles in Egypt', ref: 'Gen 46' },
    ]
  },
  {
    id: 'exodus',
    name: 'Exodus & Wilderness',
    years: '~1446–1406 BC',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    emoji: '🔥',
    desc: 'God delivers Israel from Egypt and gives the Law at Sinai.',
    books: ['Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'],
    events: [
      { year: '~1526 BC', event: 'Moses born in Egypt', ref: 'Exo 2:1' },
      { year: '~1446 BC', event: 'The Ten Plagues & the Exodus', ref: 'Exo 7–12' },
      { year: '~1446 BC', event: 'Crossing the Red Sea', ref: 'Exo 14' },
      { year: '~1446 BC', event: 'Ten Commandments at Sinai', ref: 'Exo 20' },
      { year: '~1406 BC', event: '40 years wilderness ends', ref: 'Num 33' },
      { year: '~1406 BC', event: 'Moses dies; Joshua leads', ref: 'Deu 34' },
    ]
  },
  {
    id: 'conquest',
    name: 'Conquest & Judges',
    years: '~1406–1050 BC',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#C4B5FD',
    emoji: '⚔️',
    desc: 'Israel enters Canaan, cycles of sin and deliverance under judges.',
    books: ['Joshua', 'Judges', 'Ruth'],
    events: [
      { year: '~1406 BC', event: 'Crossing the Jordan; Walls of Jericho fall', ref: 'Jos 3–6' },
      { year: '~1380 BC', event: 'Land divided among 12 tribes', ref: 'Jos 13–21' },
      { year: '~1350 BC', event: 'Era of the Judges begins', ref: 'Judg 1' },
      { year: '~1120 BC', event: 'Samson judges Israel', ref: 'Judg 13–16' },
      { year: '~1100 BC', event: 'Ruth and Boaz — lineage of David', ref: 'Ruth' },
    ]
  },
  {
    id: 'united_kingdom',
    name: 'United Kingdom',
    years: '~1050–930 BC',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    emoji: '👑',
    desc: 'Israel unites under Saul, David, and Solomon.',
    books: ['1 Samuel', '2 Samuel', '1 Kings 1–11', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Songs'],
    events: [
      { year: '~1050 BC', event: 'Saul anointed first king of Israel', ref: '1 Sam 10' },
      { year: '~1010 BC', event: 'David becomes king; Jerusalem capital', ref: '2 Sam 5' },
      { year: '~1003 BC', event: 'Ark brought to Jerusalem', ref: '2 Sam 6' },
      { year: '~970 BC', event: 'Solomon builds the Temple', ref: '1 Kgs 6' },
      { year: '~960 BC', event: 'Solomon\'s wisdom & writing Proverbs', ref: 'Prov 1' },
    ]
  },
  {
    id: 'divided_kingdom',
    name: 'Divided Kingdom',
    years: '~930–586 BC',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FDBA74',
    emoji: '🏚️',
    desc: 'Israel splits into Northern (Israel) and Southern (Judah) kingdoms.',
    books: ['1 Kings 12–22', '2 Kings', '1–2 Chronicles', 'Isaiah', 'Jeremiah', 'Hosea', 'Amos', 'Micah', 'Others'],
    events: [
      { year: '~930 BC', event: 'Kingdom splits — Israel & Judah', ref: '1 Kgs 12' },
      { year: '~850 BC', event: 'Elijah confronts Ahab and Jezebel', ref: '1 Kgs 18' },
      { year: '~722 BC', event: 'Assyria destroys Northern Kingdom', ref: '2 Kgs 17' },
      { year: '~627 BC', event: 'Jeremiah begins prophesying', ref: 'Jer 1' },
      { year: '~586 BC', event: 'Babylon destroys Jerusalem & Temple', ref: '2 Kgs 25' },
    ]
  },
  {
    id: 'exile',
    name: 'Exile & Return',
    years: '~605–430 BC',
    color: '#0891B2',
    bgColor: '#ECFEFF',
    borderColor: '#A5F3FC',
    emoji: '🌊',
    desc: 'Babylon captivity, return under Cyrus, rebuilding Jerusalem.',
    books: ['Ezra', 'Nehemiah', 'Esther', 'Daniel', 'Ezekiel', 'Haggai', 'Zechariah', 'Malachi'],
    events: [
      { year: '~605 BC', event: 'Daniel taken to Babylon', ref: 'Dan 1' },
      { year: '~597 BC', event: 'Ezekiel begins visions in Babylon', ref: 'Eze 1' },
      { year: '~539 BC', event: 'Cyrus decrees return to Israel', ref: 'Ezra 1' },
      { year: '~516 BC', event: 'Second Temple completed', ref: 'Ezra 6' },
      { year: '~445 BC', event: 'Nehemiah rebuilds Jerusalem walls', ref: 'Neh 2' },
      { year: '~430 BC', event: 'Malachi — last OT prophet', ref: 'Mal 1' },
    ]
  },
  {
    id: 'intertestamental',
    name: 'Intertestamental',
    years: '~430–5 BC',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    emoji: '📜',
    desc: '400 years of silence between Malachi and John the Baptist.',
    books: ['(No canonical books written)'],
    events: [
      { year: '~336 BC', event: 'Alexander the Great spreads Greek culture', ref: 'Dan 8 (prophesied)' },
      { year: '~168 BC', event: 'Antiochus IV desecrates Temple', ref: 'Dan 11:31' },
      { year: '~165 BC', event: 'Maccabean Revolt; Temple rededicated', ref: '(Hanukkah origin)' },
      { year: '~63 BC', event: 'Rome conquers Jerusalem under Pompey', ref: '' },
      { year: '~37 BC', event: 'Herod the Great becomes king', ref: 'Matt 2:1' },
    ]
  },
  {
    id: 'new_testament',
    name: 'New Testament',
    years: '~5 BC – 100 AD',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#A5B4FC',
    emoji: '✝️',
    desc: 'The life of Jesus, the early Church, and the completion of Scripture.',
    books: ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'All NT epistles', 'Revelation'],
    events: [
      { year: '~5 BC', event: 'Birth of Jesus in Bethlehem', ref: 'Luke 2:1' },
      { year: '~27 AD', event: 'Jesus baptized; public ministry begins', ref: 'Matt 3:13' },
      { year: '~30 AD', event: 'Crucifixion, Resurrection, Ascension', ref: 'John 19–20' },
      { year: '~30 AD', event: 'Pentecost — Church born', ref: 'Acts 2' },
      { year: '~45–60 AD', event: 'Paul\'s missionary journeys & epistles', ref: 'Acts 13–28' },
      { year: '~70 AD', event: 'Jerusalem and Temple destroyed by Rome', ref: 'Matt 24:1 (prophesied)' },
      { year: '~95 AD', event: 'John writes Revelation from Patmos', ref: 'Rev 1:9' },
    ]
  },
];

export default function BiblicalTimeline() {
  const [selectedEra, setSelectedEra] = useState(null);
  const [sliderVal, setSliderVal] = useState(4); // default: United Kingdom

  const currentEra = selectedEra ?? ERAS[sliderVal];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Calendar className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-extrabold text-white">Biblical Timeline</h1>
          </div>
          <p className="text-indigo-300 text-sm">Navigate 4,000 years of Scripture history</p>
        </div>

        {/* Era Chips — scrollable */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {ERAS.map((era, idx) => (
            <button key={era.id} onClick={() => { setSelectedEra(era); setSliderVal(idx); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${currentEra.id === era.id ? 'text-white border-transparent shadow-lg scale-105' : 'text-white/60 border-white/10 hover:text-white hover:border-white/30'}`}
              style={{ background: currentEra.id === era.id ? era.color : 'rgba(255,255,255,0.05)' }}>
              <span>{era.emoji}</span> {era.name}
            </button>
          ))}
        </div>

        {/* Chronological Slider */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between text-xs text-indigo-300 mb-3">
            <span>~4000 BC</span>
            <span className="text-white font-bold">{currentEra.years}</span>
            <span>~100 AD</span>
          </div>
          <input type="range" min={0} max={ERAS.length - 1} value={sliderVal}
            onChange={e => { const idx = Number(e.target.value); setSliderVal(idx); setSelectedEra(ERAS[idx]); }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, ${currentEra.color} ${(sliderVal / (ERAS.length - 1)) * 100}%, rgba(255,255,255,0.1) ${(sliderVal / (ERAS.length - 1)) * 100}%)` }}
          />
          {/* Era tick marks */}
          <div className="flex justify-between mt-2">
            {ERAS.map((e, i) => (
              <button key={e.id} onClick={() => { setSliderVal(i); setSelectedEra(e); }}
                className={`text-xs transition-all ${i === sliderVal ? 'text-amber-300 font-bold' : 'text-white/30 hover:text-white/60'}`}
                title={e.name}>
                {e.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Era Detail Card */}
        <div className="rounded-2xl overflow-hidden border mb-6" style={{ background: currentEra.bgColor, borderColor: currentEra.borderColor }}>
          <div className="px-6 py-5" style={{ background: `linear-gradient(135deg, ${currentEra.color}20, ${currentEra.color}10)` }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{currentEra.emoji}</span>
                  <h2 className="text-xl font-extrabold" style={{ color: currentEra.color }}>{currentEra.name}</h2>
                </div>
                <p className="text-sm font-bold" style={{ color: currentEra.color }}>{currentEra.years}</p>
                <p className="text-gray-700 text-sm mt-2 leading-relaxed">{currentEra.desc}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => { const i = Math.max(0, sliderVal - 1); setSliderVal(i); setSelectedEra(ERAS[i]); }}
                  disabled={sliderVal === 0} className="p-2 rounded-xl bg-white/60 text-gray-600 hover:bg-white disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => { const i = Math.min(ERAS.length - 1, sliderVal + 1); setSliderVal(i); setSelectedEra(ERAS[i]); }}
                  disabled={sliderVal === ERAS.length - 1} className="p-2 rounded-xl bg-white/60 text-gray-600 hover:bg-white disabled:opacity-30 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Books */}
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1" style={{ color: currentEra.color }}>
                <BookOpen className="w-3.5 h-3.5" /> Bible Books
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentEra.books.map(b => (
                  <span key={b} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${currentEra.color}20`, color: currentEra.color, border: `1px solid ${currentEra.color}40` }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Events list */}
          <div className="px-6 pb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3 mt-4">Key Events</p>
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-3.5 top-0 bottom-0 w-0.5" style={{ background: `${currentEra.color}40` }} />
              <div className="space-y-3 pl-8">
                {currentEra.events.map((ev, i) => (
                  <div key={i} className="relative">
                    {/* Dot */}
                    <div className="absolute -left-4.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow" style={{ background: currentEra.color, left: '-1.9rem' }} />
                    <div>
                      <span className="text-xs font-bold" style={{ color: currentEra.color }}>{ev.year}</span>
                      {ev.ref && <span className="text-xs text-gray-400 ml-2">· {ev.ref}</span>}
                      <p className="text-sm text-gray-800 font-medium leading-snug">{ev.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* All eras mini-overview */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {ERAS.map((era, idx) => (
            <button key={era.id} onClick={() => { setSliderVal(idx); setSelectedEra(era); }}
              className={`rounded-xl p-3 text-center transition-all border ${currentEra.id === era.id ? 'border-white/40 scale-105 shadow-lg' : 'border-white/10 hover:border-white/30'}`}
              style={{ background: currentEra.id === era.id ? `${era.color}30` : 'rgba(255,255,255,0.05)' }}>
              <div className="text-xl mb-1">{era.emoji}</div>
              <p className="text-xs font-bold text-white/80 leading-tight">{era.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}