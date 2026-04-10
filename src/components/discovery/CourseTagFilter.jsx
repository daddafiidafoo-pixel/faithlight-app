import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search, Filter } from 'lucide-react';

export default function CourseTagFilter({ onFilterChange, onSearchChange }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Fetch all active tags
  const { data: allTags = [] } = useQuery({
    queryKey: ['course-tags'],
    queryFn: async () => {
      const tags = await base44.entities.CourseTag.filter(
        { is_active: true },
        'category'
      );
      return tags;
    },
  });

  // Group tags by category
  const tagsByCategory = React.useMemo(() => {
    const grouped = {};
    allTags.forEach(tag => {
      if (!grouped[tag.category]) {
        grouped[tag.category] = [];
      }
      grouped[tag.category].push(tag);
    });
    return grouped;
  }, [allTags]);

  const categoryLabels = {
    topic: '📚 Topics',
    level: '📈 Difficulty Level',
    format: '🎯 Format',
    duration: '⏱️ Duration',
  };

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.find(t => t.id === tag.id)
      ? selectedTags.filter(t => t.id !== tag.id)
      : [...selectedTags, tag];

    setSelectedTags(newTags);
    onFilterChange(newTags, searchQuery);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    onFilterChange(selectedTags, value);
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
    onFilterChange([], '');
  };

  const hasActiveFilters = selectedTags.length > 0 || searchQuery.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Courses
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-sm font-semibold text-gray-900 block mb-2">
            Search by title or keyword
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Find a course..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tags by Category */}
        <div className="space-y-4">
          {Object.entries(tagsByCategory).map(([category, tags]) => (
            <div key={category}>
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {categoryLabels[category] || category}
                <span className="text-xs text-gray-500">({tags.length})</span>
              </button>

              {expandedCategory === category && (
                <div className="mt-2 space-y-2">
                  {tags.map(tag => {
                    const isSelected = selectedTags.find(t => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          isSelected
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            {tag.icon && <span>{tag.icon}</span>}
                            {tag.name}
                          </span>
                          <span className="text-xs text-gray-500">({tag.usage_count})</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Active Filters</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Badge
                  key={tag.id}
                  className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag.name}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}

              {searchQuery && (
                <Badge
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  onClick={() => handleSearchChange('')}
                >
                  '{searchQuery}'
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}