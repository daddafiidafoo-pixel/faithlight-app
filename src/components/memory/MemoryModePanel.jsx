import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, CheckCircle2, XCircle, RefreshCw, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/**
 * MemoryModePanel
 * Props:
 *   verses: [{verse, text, reference?}]
 *   book: string
 *   chapter: string | number
 */

const HIDE_MODES = [
  { id: 'every_other', label: 'Every other word', desc: 'Hides alternating words' },
  { id: 'random_half', label: 'Random 50%', desc: 'Randomly hides half the words' },
  { id: 'last_half', label: 'Second half only', desc: 'Hides the last half of each verse' },
  { id: 'blanks', label: 'Key blanks', desc: 'Blanks out longer words' },
];

function hideWords(text, mode) {
  const words = text.split(' ');
  return words.map((word, i) => {
    let hidden = false;
    if (mode === 'every_other') hidden = i % 2 === 1;
    else if (mode === 'random_half') hidden = Math.random() > 0.5;
    else if (mode === 'last_half') hidden = i >= Math.floor(words.length / 2);
    else if (mode === 'blanks') hidden = word.replace(/[^a-zA-Z]/g, '').length > 4;
    return { word, hidden };
  });
}

function VerseMemoryCard({ verse, book, chapter, mode, onQuizPass }) {
  const [revealed, setRevealed] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [quizResult, setQuizResult] = useState(null); // 'pass' | 'fail'
  const [tokens] = useState(() => hideWords(verse.text, mode));

  const handleReveal = () => setRevealed(true);
  const handleHide = () => { setRevealed(false); setQuizResult(null); };

  const handleQuizCheck = () => {
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const inputNorm = normalize(userInput);
    const textNorm = normalize(verse.text);

    // Allow 85% similarity (word overlap)
    const inputWords = new Set(inputNorm.split(/\s+/).filter(Boolean));
    const textWords = textNorm.split(/\s+/).filter(Boolean);
    const matches = textWords.filter(w => inputWords.has(w)).length;
    const score = matches / textWords.length;

    if (score >= 0.75) {
      setQuizResult('pass');
      toast.success('Great memory! 🎉');
      onQuizPass?.(verse.verse);
    } else {
      setQuizResult('fail');
      toast.error(`${Math.round(score * 100)}% match — keep practicing!`);
    }
  };

  const ref = `${book} ${chapter}:${verse.verse}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{ref}</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => { setQuizMode(!quizMode); setQuizResult(null); setUserInput(''); }}
            className="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1"
          >
            <Brain size={11} /> Quiz
          </button>
          <button
            onClick={revealed ? handleHide : handleReveal}
            className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
            {revealed ? 'Hide' : 'Reveal'}
          </button>
        </div>
      </div>

      {/* Verse with blanked words */}
      {!quizMode && (
        <p className="text-sm text-gray-800 leading-relaxed">
          {tokens.map(({ word, hidden }, i) => (
            <span key={i}>
              {hidden && !revealed ? (
                <span className="inline-block bg-gray-900 text-gray-900 rounded px-1 mx-0.5 select-none min-w-[2rem] text-center cursor-pointer hover:bg-gray-700 transition-colors" onClick={handleReveal}>
                  {'_'.repeat(Math.max(2, word.replace(/[^a-zA-Z]/g, '').length))}
                </span>
              ) : (
                <span className={hidden && revealed ? 'text-indigo-600 font-semibold underline decoration-dotted' : ''}>
                  {word}
                </span>
              )}{' '}
            </span>
          ))}
        </p>
      )}

      {/* Quiz input */}
      <AnimatePresence>
        {quizMode && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <p className="text-xs text-gray-500 mb-2 italic">Type the verse from memory:</p>
            <textarea
              value={userInput}
              onChange={e => { setUserInput(e.target.value); setQuizResult(null); }}
              placeholder={`Type ${ref} here...`}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleQuizCheck} className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1">
                Check Answer
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setQuizMode(false); setQuizResult(null); setUserInput(''); }}>
                Cancel
              </Button>
            </div>

            {quizResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-3 rounded-xl p-3 text-sm ${quizResult === 'pass' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {quizResult === 'pass' ? <CheckCircle2 size={15} className="text-green-600" /> : <XCircle size={15} className="text-red-500" />}
                  <span className={`font-semibold ${quizResult === 'pass' ? 'text-green-700' : 'text-red-600'}`}>
                    {quizResult === 'pass' ? 'Correct!' : 'Not quite — here is the verse:'}
                  </span>
                </div>
                {quizResult === 'fail' && (
                  <p className="text-xs text-gray-700 italic leading-relaxed mt-1">"{verse.text}"</p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MemoryModePanel({ verses = [], book, chapter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hideMode, setHideMode] = useState('every_other');
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [passedVerses, setPassedVerses] = useState([]);
  const [key, setKey] = useState(0); // force re-render to reshuffle tokens

  const toggleVerse = (verseNum) => {
    setSelectedVerses(prev =>
      prev.includes(verseNum) ? prev.filter(v => v !== verseNum) : [...prev, verseNum]
    );
  };

  const selectAll = () => setSelectedVerses(verses.map(v => v.verse));
  const clearAll = () => { setSelectedVerses([]); setPassedVerses([]); };

  const filteredVerses = verses.filter(v => selectedVerses.includes(v.verse));
  const progress = filteredVerses.length > 0 ? Math.round((passedVerses.length / filteredVerses.length) * 100) : 0;

  if (!verses.length) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl hover:from-violet-100 hover:to-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-violet-600" />
          <span className="font-semibold text-violet-800 text-sm">Memory Mode</span>
          {passedVerses.length > 0 && (
            <Badge className="bg-green-100 text-green-700 text-xs">{passedVerses.length} mastered</Badge>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} className="text-violet-600" /> : <ChevronDown size={16} className="text-violet-600" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-violet-100 border-t-0 rounded-b-2xl p-4">
              {/* Mode selector */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Hide Mode</p>
                <div className="grid grid-cols-2 gap-2">
                  {HIDE_MODES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setHideMode(m.id); setKey(k => k + 1); }}
                      className={`p-2.5 rounded-xl text-left border transition-all ${hideMode === m.id ? 'border-violet-400 bg-violet-50' : 'border-gray-100 hover:border-violet-200'}`}
                    >
                      <p className="text-xs font-semibold text-gray-800">{m.label}</p>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verse selector */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Verses</p>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs text-indigo-600 font-semibold hover:underline">All</button>
                    <button onClick={clearAll} className="text-xs text-gray-400 hover:underline">Clear</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {verses.map(v => (
                    <button
                      key={v.verse}
                      onClick={() => toggleVerse(v.verse)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-all ${
                        passedVerses.includes(v.verse) ? 'bg-green-500 border-green-500 text-white' :
                        selectedVerses.includes(v.verse) ? 'bg-indigo-600 border-indigo-600 text-white' :
                        'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {v.verse}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              {filteredVerses.length > 0 && (
                <div className="mb-4 p-3 bg-violet-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-violet-700">Memory Progress</span>
                    <span className="text-xs font-bold text-violet-800">{progress}%</span>
                  </div>
                  <div className="w-full bg-violet-200 rounded-full h-2">
                    <motion.div animate={{ width: `${progress}%` }} className="h-2 rounded-full bg-violet-600" />
                  </div>
                  <p className="text-xs text-violet-500 mt-1">{passedVerses.length} of {filteredVerses.length} mastered</p>
                </div>
              )}

              {/* Re-shuffle + Cards */}
              {filteredVerses.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Practice Cards</p>
                    <button
                      onClick={() => setKey(k => k + 1)}
                      className="text-xs flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      <RefreshCw size={11} /> Reshuffle
                    </button>
                  </div>
                  <div key={key}>
                    {filteredVerses.map(v => (
                      <VerseMemoryCard
                        key={v.verse}
                        verse={v}
                        book={book}
                        chapter={chapter}
                        mode={hideMode}
                        onQuizPass={(verseNum) => setPassedVerses(prev => prev.includes(verseNum) ? prev : [...prev, verseNum])}
                      />
                    ))}
                  </div>
                </>
              )}

              {selectedVerses.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Select verses above to start practising</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}