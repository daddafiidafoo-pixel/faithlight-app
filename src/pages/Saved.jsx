import React, { useState, useEffect } from 'react';
import { Bookmark, Heart, Trash2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'fl_saved_items';

export function getSavedItems() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function saveItem(item) {
  const items = getSavedItems();
  if (items.find(i => i.id === item.id)) return;
  items.unshift({ ...item, savedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('fl:saved_updated'));
}

export function unsaveItem(id) {
  const items = getSavedItems().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('fl:saved_updated'));
}

export function isSaved(id) {
  return getSavedItems().some(i => i.id === id);
}

export default function SavedPage() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('all');

  const load = () => setItems(getSavedItems());

  useEffect(() => {
    load();
    window.addEventListener('fl:saved_updated', load);
    return () => window.removeEventListener('fl:saved_updated', load);
  }, []);

  const filtered = tab === 'all' ? items
    : tab === 'verses' ? items.filter(i => i.type === 'verse')
    : items.filter(i => i.type === 'prayer');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-indigo-600" />
          Saved
        </h1>

        {/* Saved Verses shortcut */}
        <Link to="/SavedVerses" className="flex items-center gap-2 mt-3 mb-1 text-sm text-indigo-600 font-semibold hover:underline">
          <BookOpen size={14} /> My Bookmarked Bible Verses →
        </Link>

        {/* Tabs */}
        <div className="flex gap-1 mt-2 bg-gray-100 rounded-lg p-1">
          {[['all', 'All'], ['verses', 'Verses'], ['prayer', 'Prayers']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${tab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Nothing saved yet</p>
            <p className="text-gray-300 text-sm mt-1">
              {tab === 'verses' ? 'Bookmark verses while reading the Bible.' :
               tab === 'prayer' ? 'Save prayer requests to revisit later.' :
               'Bookmark Bible verses and prayer requests to see them here.'}
            </p>
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'verse' ? 'bg-indigo-100' : 'bg-rose-100'}`}>
                    {item.type === 'verse'
                      ? <BookOpen className="w-4 h-4 text-indigo-600" />
                      : <Heart className="w-4 h-4 text-rose-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                      {item.type === 'verse' ? 'Bible Verse' : 'Prayer Request'}
                    </p>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    {item.body && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.body}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-2">
                      {new Date(item.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => unsaveItem(item.id)}
                  className="p-1.5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}