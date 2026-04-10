import { useState, useEffect } from 'react';
import { highlightStorage } from '@/lib/highlightStorage';
import { Search, Trash2, BookOpen } from 'lucide-react';

const COLOR_BADGES = {
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200'
};

export default function MyHighlights() {
  const [highlights, setHighlights] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = () => {
    const loaded = highlightStorage.loadHighlights();
    setHighlights(loaded);
  };

  const handleDelete = (verseId) => {
    highlightStorage.removeHighlight(verseId);
    loadHighlights();
  };

  const filteredAndSorted = highlights
    .filter(h => {
      const matchesColor = selectedColor === 'all' || h.color === selectedColor;
      const matchesSearch = searchQuery === '' || 
        h.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.book.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesColor && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'reference') {
        return `${a.book}${a.chapter}${a.verse}`.localeCompare(`${b.book}${b.chapter}${b.verse}`);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Highlights</h1>
          <p className="text-gray-600">{highlights.length} verses highlighted</p>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search verses, book, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full outline-none text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="px-3 py-1 border rounded-lg text-sm"
            >
              <option value="all">All Colors</option>
              <option value="yellow">Yellow</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="pink">Pink</option>
              <option value="purple">Purple</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border rounded-lg text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="reference">Bible Order</option>
            </select>
          </div>
        </div>

        {/* Highlights list */}
        {filteredAndSorted.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <p className="text-gray-500">
              {highlights.length === 0 ? 'No highlights yet. Start by highlighting verses in the Bible reader!' : 'No highlights match your search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSorted.map((highlight) => (
              <div key={highlight.id} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {highlight.book} {highlight.chapter}:{highlight.verse}
                    </div>
                    <div className={`inline-block mt-1 px-2 py-1 rounded-full text-xs border capitalize ${COLOR_BADGES[highlight.color]}`}>
                      {highlight.color}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600">
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(highlight.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-2">{highlight.text}</p>

                {highlight.note && (
                  <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 italic">
                    "{highlight.note}"
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(highlight.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}