import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function SermonSearchFilter({ 
  searchQuery, 
  setSearchQuery,
  styleFilter,
  setStyleFilter,
  audienceFilter,
  setAudienceFilter,
  topicFilter,
  setTopicFilter,
  speakerFilter = '',
  setSpeakerFilter,
  dateFilter = 'all',
  setDateFilter,
  seriesFilter = 'all',
  setSeriesFilter,
  theologicalFilter = 'all',
  setTheologicalFilter,
  availableTopics = [],
  availableSpeakers = [],
  availableSeries = [],
  availableThemes = []
}) {
  const [searchType, setSearchType] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(true);

  const clearFilters = () => {
    setSearchQuery('');
    setSearchType('all');
    setStyleFilter('all');
    setAudienceFilter('all');
    setTopicFilter('all');
    if (setSpeakerFilter) setSpeakerFilter('');
    if (setDateFilter) setDateFilter('all');
    if (setSeriesFilter) setSeriesFilter('all');
    if (setTheologicalFilter) setTheologicalFilter('all');
  };

  const hasActiveFilters = searchQuery || searchType !== 'all' || styleFilter !== 'all' || audienceFilter !== 'all' || topicFilter !== 'all' || speakerFilter || dateFilter !== 'all' || seriesFilter !== 'all' || theologicalFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Enhanced Search Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={
                searchType === 'scripture' ? 'Search by scripture reference (e.g., John 3:16)...' :
                searchType === 'theme' ? 'Search by theme (e.g., Grace, Redemption)...' :
                searchType === 'preacher' ? 'Search by preacher name...' :
                'Search sermons by title, passage, topic, or keywords...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Search in..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              <SelectItem value="scripture">Scripture Ref</SelectItem>
              <SelectItem value="theme">Themes</SelectItem>
              <SelectItem value="preacher">Preacher</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Collapsible Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="border rounded-lg p-3 bg-white">
       <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 hover:bg-gray-50 p-2 -m-2 rounded">
         <div className="flex items-center gap-2">
           <Filter className="w-4 h-4 text-gray-600" />
           <span className="text-sm font-medium text-gray-700">Advanced Filters</span>
         </div>
         {filtersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
       </CollapsibleTrigger>
       <CollapsibleContent className="pt-3 border-t mt-2">
         <div className="flex items-center gap-3 flex-wrap">

        <Select value={styleFilter} onValueChange={setStyleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Styles</SelectItem>
            <SelectItem value="expository">Expository</SelectItem>
            <SelectItem value="topical">Topical</SelectItem>
            <SelectItem value="teaching">Teaching</SelectItem>
            <SelectItem value="evangelistic">Evangelistic</SelectItem>
          </SelectContent>
        </Select>

        <Select value={audienceFilter} onValueChange={setAudienceFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Audience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Audiences</SelectItem>
            <SelectItem value="youth">Youth</SelectItem>
            <SelectItem value="adults">Adults</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>

        {availableTopics.length > 0 && (
          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {availableTopics.slice(0, 20).map(topic => (
                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {setSpeakerFilter && availableSpeakers.length > 0 && (
          <Select value={speakerFilter} onValueChange={setSpeakerFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Speaker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Speakers</SelectItem>
              {availableSpeakers.map(speaker => (
                <SelectItem key={speaker} value={speaker}>{speaker}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {setDateFilter && (
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
              <SelectItem value="month">Past Month</SelectItem>
              <SelectItem value="3months">Past 3 Months</SelectItem>
              <SelectItem value="year">Past Year</SelectItem>
            </SelectContent>
          </Select>
        )}

        {setSeriesFilter && availableSeries.length > 0 && (
          <Select value={seriesFilter} onValueChange={setSeriesFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Series" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Series</SelectItem>
              {availableSeries.map(series => (
                <SelectItem key={series} value={series}>{series}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {setTheologicalFilter && (
          <Select value={theologicalFilter} onValueChange={setTheologicalFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Themes</SelectItem>
              <SelectItem value="redemption">Redemption</SelectItem>
              <SelectItem value="grace">Grace</SelectItem>
              <SelectItem value="salvation">Salvation</SelectItem>
              <SelectItem value="discipleship">Discipleship</SelectItem>
              <SelectItem value="faith">Faith</SelectItem>
              <SelectItem value="love">Love</SelectItem>
              <SelectItem value="worship">Worship</SelectItem>
              <SelectItem value="holy_spirit">Holy Spirit</SelectItem>
              <SelectItem value="justice">Justice</SelectItem>
              <SelectItem value="prayer">Prayer</SelectItem>
            </SelectContent>
          </Select>
        )}

          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="ghost" size="sm" className="gap-2 ml-2">
              <X className="w-4 h-4" />
              Clear All
            </Button>
          )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {hasActiveFilters && (
        <div className="flex gap-2 flex-wrap">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              {searchType !== 'all' ? `${searchType.toUpperCase()}: ` : ''}{searchQuery}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
            </Badge>
          )}
          {searchType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {searchType === 'scripture' && 'Scripture Search'}
              {searchType === 'theme' && 'Theme Search'}
              {searchType === 'preacher' && 'Preacher Search'}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchType('all')} />
            </Badge>
          )}
          {styleFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Style: {styleFilter}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setStyleFilter('all')} />
            </Badge>
          )}
          {audienceFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Audience: {audienceFilter}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setAudienceFilter('all')} />
            </Badge>
          )}
          {topicFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Topic: {topicFilter}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setTopicFilter('all')} />
            </Badge>
          )}
          {speakerFilter && (
            <Badge variant="secondary" className="gap-1">
              Speaker: {speakerFilter}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSpeakerFilter('')} />
            </Badge>
          )}
          {dateFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Date: {dateFilter}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setDateFilter('all')} />
            </Badge>
          )}
          {seriesFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Series: {seriesFilter}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setSeriesFilter('all')} />
            </Badge>
          )}
          {theologicalFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Theme: {theologicalFilter}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setTheologicalFilter('all')} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}