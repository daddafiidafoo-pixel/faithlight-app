import React, { useState, useEffect } from 'react';
import { Download, Trash2, CheckCircle2, BookOpen, HardDrive, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STORAGE_KEY = 'faithlight_my_library';

const BIBLE_BOOKS = [
  { id: 'GEN', name: 'Genesis', testament: 'OT' },
  { id: 'EXO', name: 'Exodus', testament: 'OT' },
  { id: 'PSA', name: 'Psalms', testament: 'OT' },
  { id: 'PRO', name: 'Proverbs', testament: 'OT' },
  { id: 'ISA', name: 'Isaiah', testament: 'OT' },
  { id: 'MAT', name: 'Matthew', testament: 'NT' },
  { id: 'MRK', name: 'Mark', testament: 'NT' },
  { id: 'LUK', name: 'Luke', testament: 'NT' },
  { id: 'JHN', name: 'John', testament: 'NT' },
  { id: 'ACT', name: 'Acts', testament: 'NT' },
  { id: 'ROM', name: 'Romans', testament: 'NT' },
  { id: '1CO', name: '1 Corinthians', testament: 'NT' },
  { id: 'GAL', name: 'Galatians', testament: 'NT' },
  { id: 'EPH', name: 'Ephesians', testament: 'NT' },
  { id: 'PHP', name: 'Philippians', testament: 'NT' },
  { id: 'REV', name: 'Revelation', testament: 'NT' },
];

const READING_PLANS = [
  { id: 'plan_30days', name: '30-Day New Testament', desc: 'Read through the NT in a month' },
  { id: 'plan_psalms', name: 'Psalms & Proverbs', desc: '31-day wisdom journey' },
  { id: 'plan_gospels', name: 'The Four Gospels', desc: 'Life of Jesus in 40 days' },
  { id: 'plan_beginner', name: 'Beginner Bible Plan', desc: 'Key passages for new readers' },
];

function loadLibrary() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"books":[],"plans":[]}'); } catch { return { books: [], plans: [] }; }
}

function saveLibrary(lib) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lib));
}

export default function MyLibraryManager() {
  const [library, setLibrary] = useState(loadLibrary);
  const [downloading, setDownloading] = useState({});
  const [tab, setTab] = useState('books'); // 'books' | 'plans'

  const isDownloaded = (type, id) => library[type]?.includes(id);

  const fakeDownload = async (type, id) => {
    setDownloading(d => ({ ...d, [id]: true }));
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const updated = { ...library, [type]: [...(library[type] || []), id] };
    setLibrary(updated);
    saveLibrary(updated);
    setDownloading(d => ({ ...d, [id]: false }));
    toast.success(`Downloaded for offline access`);
  };

  const remove = (type, id) => {
    const updated = { ...library, [type]: (library[type] || []).filter(x => x !== id) };
    setLibrary(updated);
    saveLibrary(updated);
    toast.success('Removed from library');
  };

  const otBooks = BIBLE_BOOKS.filter(b => b.testament === 'OT');
  const ntBooks = BIBLE_BOOKS.filter(b => b.testament === 'NT');
  const totalMB = ((library.books?.length || 0) * 1.2 + (library.plans?.length || 0) * 0.8).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Storage indicator */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
        <HardDrive className="w-5 h-5 text-indigo-500" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-indigo-900">My Offline Library</p>
          <p className="text-xs text-indigo-600">
            {library.books?.length || 0} books · {library.plans?.length || 0} reading plans · ~{totalMB} MB estimated
          </p>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-xl border overflow-hidden">
        {[['books', 'Bible Books'], ['plans', 'Reading Plans']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === key ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'books' && (
        <div className="space-y-4">
          {[['OT', 'Old Testament', otBooks], ['NT', 'New Testament', ntBooks]].map(([key, label, books]) => (
            <div key={key}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
              <div className="grid grid-cols-1 gap-2">
                {books.map(book => {
                  const dl = isDownloaded('books', book.id);
                  const loading = downloading[book.id];
                  return (
                    <div key={book.id} className="flex items-center justify-between p-3 rounded-xl border bg-white hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">{book.name}</span>
                        {dl && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Saved</span>}
                      </div>
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      ) : dl ? (
                        <button onClick={() => remove('books', book.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => fakeDownload('books', book.id)} className="text-indigo-500 hover:text-indigo-700">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'plans' && (
        <div className="space-y-2">
          {READING_PLANS.map(plan => {
            const dl = isDownloaded('plans', plan.id);
            const loading = downloading[plan.id];
            return (
              <div key={plan.id} className="flex items-center justify-between p-4 rounded-xl border bg-white hover:bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{plan.name}</p>
                  <p className="text-xs text-gray-500">{plan.desc}</p>
                  {dl && <span className="text-xs text-green-600">✓ Saved offline</span>}
                </div>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                ) : dl ? (
                  <button onClick={() => remove('plans', plan.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => fakeDownload('plans', plan.id)} className="gap-1.5 text-xs h-8">
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {(library.books?.length > 0 || library.plans?.length > 0) && (
        <button
          onClick={() => { setLibrary({ books: [], plans: [] }); saveLibrary({ books: [], plans: [] }); toast.success('Library cleared'); }}
          className="w-full text-xs text-red-500 hover:text-red-700 py-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          Clear All Downloads
        </button>
      )}
    </div>
  );
}