import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

export default function BlogSearchFilters({ filters, setFilters, onApply, onReset }) {
  const handleKey = (e) => { if (e.key === 'Enter') onApply(); };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Keyword</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <Input
              value={filters.q}
              onChange={e => setFilters({ ...filters, q: e.target.value })}
              onKeyDown={handleKey}
              placeholder="Title, body, tags…"
              className="pl-8"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
          <Input value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} onKeyDown={handleKey} placeholder="e.g. evangelism" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Tag</label>
          <Input value={filters.tag} onChange={e => setFilters({ ...filters, tag: e.target.value })} onKeyDown={handleKey} placeholder="e.g. discipleship" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Author ID</label>
          <Input value={filters.author_id} onChange={e => setFilters({ ...filters, author_id: e.target.value })} onKeyDown={handleKey} placeholder="Optional" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Date from (YYYY-MM-DD)</label>
          <Input type="date" value={filters.date_from} onChange={e => setFilters({ ...filters, date_from: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Date to (YYYY-MM-DD)</label>
          <Input type="date" value={filters.date_to} onChange={e => setFilters({ ...filters, date_to: e.target.value })} />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onReset} type="button" className="gap-1.5 text-xs">
          <X className="w-3.5 h-3.5" /> Reset
        </Button>
        <Button onClick={onApply} type="button" className="bg-indigo-600 hover:bg-indigo-700 gap-1.5 text-xs">
          <Search className="w-3.5 h-3.5" /> Apply Filters
        </Button>
      </div>
    </div>
  );
}