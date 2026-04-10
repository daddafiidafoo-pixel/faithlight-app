import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Star, X, Calendar, Search } from 'lucide-react';

export default function PrayerFiltersPanel({ onFilterChange, onClose }) {
  const [keyword, setKeyword] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleApply = () => {
    onFilterChange({
      keyword: keyword.trim(),
      favoritesOnly,
      dateRange: dateRange.start || dateRange.end ? dateRange : null,
    });
  };

  return (
    <Card className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2 rounded"
          aria-label="Close filters"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Keyword Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Search className="w-4 h-4 inline mr-2" />
            Search Prayer Content
          </label>
          <Input
            type="text"
            placeholder="Search keywords, tags, categories..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>

        {/* Favorites Filter */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="favorites-only"
            checked={favoritesOnly}
            onChange={(e) => setFavoritesOnly(e.target.checked)}
            className="w-4 h-4 border border-gray-300 rounded cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
          />
          <label htmlFor="favorites-only" className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            Favorites Only
          </label>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date Range
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              placeholder="From"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              placeholder="To"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApply}
            className="flex-1 bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white"
          >
            Apply Filters
          </Button>
          <Button
            onClick={() => {
              setKeyword('');
              setFavoritesOnly(false);
              setDateRange({ start: '', end: '' });
              onFilterChange({ keyword: '', favoritesOnly: false, dateRange: null });
            }}
            variant="outline"
            className="flex-1"
          >
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
}