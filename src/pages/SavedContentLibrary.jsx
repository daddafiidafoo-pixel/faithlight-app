import React, { useEffect, useState } from 'react';
import { Trash2, Heart, FileText, BookOpen, Music, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const contentTypeLabels = {
  study_plan: { label: 'Study Plan', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  passage: { label: 'Passage', icon: FileText, color: 'bg-green-100 text-green-700' },
  sermon: { label: 'Sermon', icon: Music, color: 'bg-purple-100 text-purple-700' },
  prayer: { label: 'Prayer', icon: Wand2, color: 'bg-pink-100 text-pink-700' },
};

export default function SavedContentLibrary() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) return;
        
        setUser(currentUser);
        const items = await base44.entities.Bookmark.filter(
          { user_email: currentUser.email },
          '-created_date',
          100
        );
        setBookmarks(items);
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bookmark?')) return;

    try {
      await base44.entities.Bookmark.delete(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete bookmark');
    }
  };

  const handleToggleFavorite = async (bookmark) => {
    try {
      await base44.entities.Bookmark.update(bookmark.id, {
        is_favorite: !bookmark.is_favorite,
      });
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === bookmark.id ? { ...b, is_favorite: !b.is_favorite } : b
        )
      );
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const filteredBookmarks =
    filter === 'all'
      ? bookmarks
      : bookmarks.filter((b) => b.content_type === filter);

  const favoriteCount = bookmarks.filter((b) => b.is_favorite).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Saved Content</h1>
          <p className="mt-2 text-slate-600">
            {bookmarks.length} saved item{bookmarks.length !== 1 ? 's' : ''} •{' '}
            {favoriteCount} favorite{favoriteCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'study_plan', 'passage', 'sermon', 'prayer'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === type
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {type === 'all' ? 'All' : contentTypeLabels[type]?.label || type}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        {filteredBookmarks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">No saved content yet</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookmarks.map((bookmark) => {
              const typeConfig = contentTypeLabels[bookmark.content_type];
              const Icon = typeConfig.icon;

              return (
                <div
                  key={bookmark.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeConfig.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(bookmark)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            bookmark.is_favorite ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(bookmark.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                    {bookmark.title}
                  </h3>

                  <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                    {bookmark.summary || 'No preview available'}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      {new Date(bookmark.created_date).toLocaleDateString()}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}