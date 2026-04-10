import React, { useState, useEffect } from 'react';
import { Database, Trash2, Eye, Search, Filter } from 'lucide-react';
import { sermonOfflineDB } from '@/lib/sermonOfflineDB';
import { SERMON_LANGUAGES, SERMON_TYPES } from '@/lib/sermonLanguageConfig';

export default function SavedSermons() {
  const [sermons, setSermons] = useState([]);
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [selectedSermon, setSelectedSermon] = useState(null);

  useEffect(() => {
    loadSermons();
  }, []);

  useEffect(() => {
    filterSermons();
  }, [sermons, searchTerm, languageFilter]);

  const loadSermons = async () => {
    try {
      setLoading(true);
      const data = await sermonOfflineDB.getAllSermons();
      setSermons(data || []);
    } catch (err) {
      console.error('[SavedSermons] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterSermons = () => {
    let filtered = sermons;

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.metadata.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.metadata.passage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (languageFilter !== 'all') {
      filtered = filtered.filter((s) => s.metadata.language === languageFilter);
    }

    setFilteredSermons(filtered);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this sermon?')) return;
    try {
      await sermonOfflineDB.deleteSermon(id);
      loadSermons();
      setSelectedSermon(null);
    } catch (err) {
      console.error('[SavedSermons] Delete error:', err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Delete all saved sermons? This cannot be undone.')) return;
    try {
      await sermonOfflineDB.clearAllSermons();
      setSermons([]);
      setSelectedSermon(null);
    } catch (err) {
      console.error('[SavedSermons] Clear all error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Database size={20} className="text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">My Sermons</h1>
          </div>
          <p className="text-xs text-gray-500">{sermons.length} sermon(s) saved offline</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {sermons.length === 0 && !loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Database size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No saved sermons yet</p>
            <p className="text-sm text-gray-500 mt-1">Sermons you save will appear here for offline access</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={16} className="text-gray-500" />
                <p className="text-sm font-semibold text-gray-900">Filter & Search</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search theme or passage..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                >
                  <option value="all">All Languages</option>
                  {Object.values(SERMON_LANGUAGES).map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              {(searchTerm || languageFilter !== 'all') && (
                <div className="text-xs text-gray-500">
                  Showing {filteredSermons.length} of {sermons.length} sermons
                </div>
              )}
            </div>

            {/* Sermon List / Detail View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* List */}
              <div className="lg:col-span-2 space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading sermons...</div>
                ) : filteredSermons.length === 0 ? (
                  <div className="bg-white rounded-lg p-6 text-center text-gray-500">No sermons match your filters</div>
                ) : (
                  filteredSermons.map((sermon) => (
                    <button
                      key={sermon.id}
                      onClick={() => setSelectedSermon(sermon)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedSermon?.id === sermon.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{sermon.metadata.theme}</p>
                          <p className="text-xs text-gray-600 mt-1">{sermon.metadata.passage}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {sermon.metadata.language.toUpperCase()}
                            </span>
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {SERMON_TYPES[sermon.metadata.type]?.label || 'Sermon'}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 flex-shrink-0">
                          {new Date(sermon.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Detail View */}
              {selectedSermon && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 sticky top-20">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Selected Sermon</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{selectedSermon.metadata.theme}</p>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600">
                      <p>
                        <span className="font-semibold">Passage:</span> {selectedSermon.metadata.passage}
                      </p>
                      <p>
                        <span className="font-semibold">Type:</span> {SERMON_TYPES[selectedSermon.metadata.type]?.label}
                      </p>
                      <p>
                        <span className="font-semibold">Language:</span> {selectedSermon.metadata.language.toUpperCase()}
                      </p>
                      <p>
                        <span className="font-semibold">Audience:</span> {selectedSermon.metadata.audience}
                      </p>
                      <p>
                        <span className="font-semibold">Length:</span> {selectedSermon.metadata.length} minutes
                      </p>
                      <p>
                        <span className="font-semibold">Saved:</span> {new Date(selectedSermon.savedAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                      <p className="text-xs font-semibold text-gray-900 mb-2">Preview</p>
                      <p className="text-xs text-gray-700 line-clamp-6 leading-relaxed">
                        {selectedSermon.sermon.substring(0, 300)}...
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedSermon.sermon);
                          alert('Sermon copied!');
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
                      >
                        Copy Sermon
                      </button>
                      <button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href =
                            'data:text/plain,' +
                            encodeURIComponent(
                              `${selectedSermon.metadata.theme}\n\n${selectedSermon.metadata.passage}\n\n${selectedSermon.sermon}`
                            );
                          a.download = `${selectedSermon.metadata.theme.replace(/\s+/g, '-')}.txt`;
                          a.click();
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(selectedSermon.id)}
                        className="w-full px-3 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clear All */}
            {sermons.length > 0 && (
              <button
                onClick={handleClearAll}
                className="w-full px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-sm font-medium transition-colors"
              >
                Clear All Sermons
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}