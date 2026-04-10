import React, { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import BlogSearchFilters from '../components/blog/BlogSearchFilters';

const PAGE_SIZE = 12;

function normalize(str) {
  return String(str || '').toLowerCase().trim();
}

function inRange(dateStr, from, to) {
  if (!dateStr) return true;
  const d = new Date(dateStr).getTime();
  if (from && d < new Date(from).getTime()) return false;
  if (to && d > new Date(to + 'T23:59:59').getTime()) return false;
  return true;
}

export default function BlogSearch() {
  const [filters, setFilters] = useState({ q: '', author_id: '', category: '', tag: '', date_from: '', date_to: '' });
  const [page, setPage] = useState(1);
  const [allFiltered, setAllFiltered] = useState([]);
  const [busy, setBusy] = useState(false);

  const fetchAndFilter = useCallback(async (currentFilters, currentPage) => {
    setBusy(true);
    try {
      const dbFilter = { status: 'published' };
      if (currentFilters.author_id) dbFilter.author_id = currentFilters.author_id;
      if (currentFilters.category) dbFilter.category = currentFilters.category;

      const list = await base44.entities.Lesson.filter(dbFilter, '-created_date', 200).catch(() => []);

      const qn = normalize(currentFilters.q);
      const tagN = normalize(currentFilters.tag);

      const filtered = list.filter(p => {
        if (currentFilters.category && normalize(p.category) !== normalize(currentFilters.category)) return false;
        if (currentFilters.author_id && String(p.author_id || p.teacher_id || '') !== currentFilters.author_id) return false;
        if (!inRange(p.created_date, currentFilters.date_from, currentFilters.date_to)) return false;
        if (tagN) {
          const tags = (p.tags || []).map(t => normalize(t));
          if (!tags.some(t => t.includes(tagN))) return false;
        }
        if (qn) {
          const hay = normalize([p.title, p.content, p.description, (p.tags || []).join(' ')].join(' '));
          if (!hay.includes(qn)) return false;
        }
        return true;
      });

      setAllFiltered(filtered);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { fetchAndFilter(filters, 1); }, []);

  function apply() { setPage(1); fetchAndFilter(filters, 1); }
  function reset() {
    const empty = { q: '', author_id: '', category: '', tag: '', date_from: '', date_to: '' };
    setFilters(empty);
    setPage(1);
    fetchAndFilter(empty, 1);
  }

  const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE);
  const pageRows = allFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Search</h1>
          <p className="text-sm text-gray-500">Filter lessons and articles by keyword, category, tag, or date.</p>
        </div>
      </div>

      <BlogSearchFilters filters={filters} setFilters={setFilters} onApply={apply} onReset={reset} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Results
              {!busy && <span className="ml-2 text-sm font-normal text-gray-500">({allFiltered.length} found)</span>}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => fetchAndFilter(filters, page)} className="gap-1.5 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {busy ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : pageRows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No results found. Try different keywords or filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pageRows.map(p => (
                <Link key={p.id} to={createPageUrl(`LessonView?id=${p.id}`)}>
                  <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{p.title}</p>
                      {p.status && (
                        <Badge variant="secondary" className="text-xs capitalize flex-shrink-0">{p.status}</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      {p.category && <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">{p.category}</span>}
                      {p.created_date && <span>{new Date(p.created_date).toLocaleDateString()}</span>}
                    </div>
                    {p.objectives && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{p.objectives}</p>
                    )}
                    {(p.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(p.tags || []).slice(0, 6).map((tag, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <Button variant="outline" size="sm" disabled={page <= 1 || busy} onClick={() => setPage(p => p - 1)} className="gap-1.5">
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages || busy} onClick={() => setPage(p => p + 1)} className="gap-1.5">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}