import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, GraduationCap, MessageCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  verse: { icon: BookOpen, label: 'Verses', color: 'text-blue-600' },
  course: { icon: GraduationCap, label: 'Courses', color: 'text-purple-600' },
  forum: { icon: MessageCircle, label: 'Discussions', color: 'text-green-600' },
};

export default function GlobalSearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim() && open) {
        setLoading(true);
        try {
          const { data } = await base44.functions.invoke('globalSearch', { query });
          setResults(data.results || []);
          setGrouped(data.grouped || {});
        } catch (err) {
          console.error('Search failed:', err);
        } finally {
          setLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = (result) => {
    const routes = {
      verse: `BibleReader?verse=${result.title}`,
      course: `CourseDetail?id=${result.id}`,
      forum: `ForumTopic?id=${result.id}`,
    };
    navigate(`/${routes[result.type]}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search verses, courses, forums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="pl-10"
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <p className="text-center text-gray-500 py-8">No results found.</p>
          )}

          {!loading && query && results.length > 0 && (
            <div className="space-y-6">
              {Object.entries(grouped).map(([type, items]) => {
                const config = TYPE_CONFIG[type];
                const Icon = config?.icon;
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`w-4 h-4 ${config?.color}`} />
                      <h3 className="text-sm font-semibold text-gray-700">{config?.label}</h3>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-300"
                        >
                          <p className="font-medium text-sm text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!query && (
            <p className="text-center text-gray-400 text-sm py-8">Start typing to search...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}