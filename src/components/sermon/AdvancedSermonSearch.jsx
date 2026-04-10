import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sparkles, TrendingUp, BookOpen, User } from 'lucide-react';

export default function AdvancedSermonSearch({ sermons, onSearch }) {
  const [advanced, setAdvanced] = useState({
    scripture: '',
    theme: '',
    preacher: '',
    keyword: ''
  });

  const handleSearch = () => {
    const filtered = sermons.filter(sermon => {
      const matches = [];
      
      if (advanced.scripture) {
        matches.push(sermon.passage_references?.toLowerCase().includes(advanced.scripture.toLowerCase()));
      }
      
      if (advanced.theme) {
        matches.push(
          sermon.tags?.some(t => t.toLowerCase().includes(advanced.theme.toLowerCase())) ||
          sermon.doctrine?.toLowerCase().includes(advanced.theme.toLowerCase())
        );
      }
      
      if (advanced.preacher) {
        matches.push(sermon.author_name?.toLowerCase().includes(advanced.preacher.toLowerCase()));
      }
      
      if (advanced.keyword) {
        matches.push(
          sermon.title?.toLowerCase().includes(advanced.keyword.toLowerCase()) ||
          sermon.topic?.toLowerCase().includes(advanced.keyword.toLowerCase()) ||
          sermon.summary?.toLowerCase().includes(advanced.keyword.toLowerCase())
        );
      }
      
      return matches.length === 0 || matches.every(m => m !== false);
    });

    onSearch(filtered);
  };

  const handleReset = () => {
    setAdvanced({ scripture: '', theme: '', preacher: '', keyword: '' });
    onSearch(sermons);
  };

  const activeFilters = Object.values(advanced).filter(v => v.trim()).length;

  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Advanced Sermon Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3" />
              Scripture Reference
            </label>
            <Input
              placeholder="e.g., John 3:16, Romans 6:9..."
              value={advanced.scripture}
              onChange={(e) => setAdvanced({ ...advanced, scripture: e.target.value })}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3" />
              Theological Theme
            </label>
            <Input
              placeholder="e.g., Grace, Redemption, Faith..."
              value={advanced.theme}
              onChange={(e) => setAdvanced({ ...advanced, theme: e.target.value })}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <User className="w-3 h-3" />
              Preacher/Author
            </label>
            <Input
              placeholder="e.g., John MacArthur, Charles Spurgeon..."
              value={advanced.preacher}
              onChange={(e) => setAdvanced({ ...advanced, preacher: e.target.value })}
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              Keyword
            </label>
            <Input
              placeholder="e.g., resurrection, discipleship..."
              value={advanced.keyword}
              onChange={(e) => setAdvanced({ ...advanced, keyword: e.target.value })}
              className="text-sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSearch}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              size="sm"
            >
              Search {activeFilters > 0 && `(${activeFilters})`}
            </Button>
            {activeFilters > 0 && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
              >
                Reset
              </Button>
            )}
          </div>

          {activeFilters > 0 && (
            <div className="flex gap-1 flex-wrap pt-2">
              {advanced.scripture && <Badge variant="secondary" className="text-xs">📖 {advanced.scripture}</Badge>}
              {advanced.theme && <Badge variant="secondary" className="text-xs">✨ {advanced.theme}</Badge>}
              {advanced.preacher && <Badge variant="secondary" className="text-xs">👤 {advanced.preacher}</Badge>}
              {advanced.keyword && <Badge variant="secondary" className="text-xs">🔍 {advanced.keyword}</Badge>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}