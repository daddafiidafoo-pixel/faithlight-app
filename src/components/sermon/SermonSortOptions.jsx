import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

export default function SermonSortOptions({ sortBy, setSortBy }) {
  const sortOptions = [
    { value: 'recent', label: 'Most Recent', icon: '📅' },
    { value: 'rating', label: 'Highest Rated', icon: '⭐' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'title', label: 'A to Z', icon: '🔤' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <ArrowUpDown className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-700">Sort by:</span>
      </div>
      <div className="grid gap-2">
        {sortOptions.map(option => (
          <Button
            key={option.value}
            variant={sortBy === option.value ? 'default' : 'outline'}
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => setSortBy(option.value)}
          >
            <span>{option.icon}</span>
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}