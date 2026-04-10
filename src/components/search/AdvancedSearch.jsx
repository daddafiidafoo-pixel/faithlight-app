import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, MessageCircle, Users, Loader2, BookMarked } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdvancedSearch({ user }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState({ sermons: [], topics: [], groups: [], books: [] });
  const [activeTab, setActiveTab] = useState('all');
  
  // Advanced filters
  const [theologicalStance, setTheologicalStance] = useState('all');
  const [ministryFocus, setMinistryFocus] = useState('all');
  const [contentDepth, setContentDepth] = useState('all');

  const performSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setSearching(true);
    try {
      const searchQuery = query.toLowerCase();

      // Search Bible books
      const allBooks = await base44.entities.BibleBook.list('canonical_order', 70).catch(() => []);
      const matchingBooks = allBooks.filter(b =>
        b.name?.toLowerCase().includes(searchQuery) ||
        b.abbreviation?.toLowerCase().includes(searchQuery) ||
        b.category?.toLowerCase().includes(searchQuery) ||
        b.author?.toLowerCase().includes(searchQuery) ||
        (b.testament === 'OT' && 'old testament'.includes(searchQuery)) ||
        (b.testament === 'NT' && 'new testament'.includes(searchQuery))
      );

      // Search sermons with full-text matching
      const allSermons = await base44.entities.SharedSermon.list('-created_date', 500);
      const matchingSermons = allSermons.filter(sermon => {
        const textMatch = 
          sermon.title?.toLowerCase().includes(searchQuery) ||
          sermon.topic?.toLowerCase().includes(searchQuery) ||
          sermon.content?.toLowerCase().includes(searchQuery) ||
          sermon.summary?.toLowerCase().includes(searchQuery) ||
          sermon.passage_references?.toLowerCase().includes(searchQuery) ||
          sermon.tags?.some(tag => tag.toLowerCase().includes(searchQuery));

        const stanceMatch = theologicalStance === 'all' || sermon.doctrine === theologicalStance;
        const depthMatch = contentDepth === 'all' || sermon.reading_level === contentDepth;

        return textMatch && stanceMatch && depthMatch;
      });

      // Search forum topics
      const allTopics = await base44.entities.ForumTopic.list('-created_date', 500);
      const matchingTopics = allTopics.filter(topic => {
        const textMatch = 
          topic.title?.toLowerCase().includes(searchQuery) ||
          topic.description?.toLowerCase().includes(searchQuery) ||
          topic.tags?.some(tag => tag.toLowerCase().includes(searchQuery));

        const focusMatch = ministryFocus === 'all' || topic.category === ministryFocus;

        return textMatch && focusMatch;
      });

      // Search groups
      const allGroups = await base44.entities.Group.list('-created_date', 200);
      const matchingGroups = allGroups.filter(group => 
        group.name?.toLowerCase().includes(searchQuery) ||
        group.description?.toLowerCase().includes(searchQuery) ||
        group.interests?.some(i => i.toLowerCase().includes(searchQuery))
      );

      setResults({
        sermons: matchingSermons.slice(0, 20),
        topics: matchingTopics.slice(0, 20),
        groups: matchingGroups.slice(0, 20),
        books: matchingBooks.slice(0, 20),
      });

      toast.success(`Found ${matchingSermons.length + matchingTopics.length + matchingGroups.length + matchingBooks.length} results`);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const totalResults = results.sermons.length + results.topics.length + results.groups.length + results.books.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Advanced Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search sermons, discussions, groups..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              className="flex-1"
            />
            <Button onClick={performSearch} disabled={searching}>
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium mb-2 block">Theological Stance</label>
              <Select value={theologicalStance} onValueChange={setTheologicalStance}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stances</SelectItem>
                  <SelectItem value="reformed">Reformed</SelectItem>
                  <SelectItem value="arminian">Arminian</SelectItem>
                  <SelectItem value="pentecostal">Pentecostal</SelectItem>
                  <SelectItem value="baptist">Baptist</SelectItem>
                  <SelectItem value="lutheran">Lutheran</SelectItem>
                  <SelectItem value="catholic">Catholic</SelectItem>
                  <SelectItem value="evangelical">Evangelical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ministry Focus</label>
              <Select value={ministryFocus} onValueChange={setMinistryFocus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  <SelectItem value="sermon">Sermons</SelectItem>
                  <SelectItem value="study_plan">Study Plans</SelectItem>
                  <SelectItem value="theological">Theological</SelectItem>
                  <SelectItem value="practical">Practical Living</SelectItem>
                  <SelectItem value="biblical">Biblical Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Content Depth</label>
              <Select value={contentDepth} onValueChange={setContentDepth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="simple">Beginner</SelectItem>
                  <SelectItem value="medium">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {totalResults > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
            <TabsTrigger value="books">Books ({results.books.length})</TabsTrigger>
            <TabsTrigger value="sermons">Sermons ({results.sermons.length})</TabsTrigger>
            <TabsTrigger value="topics">Discussions ({results.topics.length})</TabsTrigger>
            <TabsTrigger value="groups">Groups ({results.groups.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {results.books.slice(0, 4).map(book => (
              <BookResult key={book.id} book={book} query={query} />
            ))}
            {results.sermons.slice(0, 3).map(sermon => (
              <SermonResult key={sermon.id} sermon={sermon} query={query} />
            ))}
            {results.topics.slice(0, 3).map(topic => (
              <TopicResult key={topic.id} topic={topic} query={query} />
            ))}
            {results.groups.slice(0, 3).map(group => (
              <GroupResult key={group.id} group={group} query={query} />
            ))}
          </TabsContent>

          <TabsContent value="books" className="space-y-4 mt-4">
            {results.books.map(book => (
              <BookResult key={book.id} book={book} query={query} />
            ))}
          </TabsContent>

          <TabsContent value="sermons" className="space-y-4 mt-4">
            {results.sermons.map(sermon => (
              <SermonResult key={sermon.id} sermon={sermon} query={query} />
            ))}
          </TabsContent>

          <TabsContent value="topics" className="space-y-4 mt-4">
            {results.topics.map(topic => (
              <TopicResult key={topic.id} topic={topic} query={query} />
            ))}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4 mt-4">
            {results.groups.map(group => (
              <GroupResult key={group.id} group={group} query={query} />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function BookResult({ book, query }) {
  const highlightText = (text, query) => {
    if (!text) return '';
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ?
        <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };
  return (
    <Link to={createPageUrl('BibleCanon')}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${book.testament === 'OT' ? 'bg-amber-100' : 'bg-blue-100'}`}>
              <BookMarked className={`w-5 h-5 ${book.testament === 'OT' ? 'text-amber-600' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{highlightText(book.name, query)}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {book.author && `Author: ${highlightText(book.author, query)} · `}
                {book.chapter_count && `${book.chapter_count} chapters`}
                {book.period && ` · ${book.period}`}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge className={`text-xs ${book.testament === 'OT' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                  {book.testament === 'OT' ? 'Old Testament' : 'New Testament'}
                </Badge>
                <Badge variant="outline" className="text-xs">{book.category}</Badge>
                <Badge variant="secondary" className="text-xs">#{book.canonical_order}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SermonResult({ sermon, query }) {
  const highlightText = (text, query) => {
    if (!text) return '';
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              {highlightText(sermon.title, query)}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {highlightText(sermon.summary || sermon.topic, query)}
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{sermon.style}</Badge>
              <Badge variant="outline">{sermon.audience}</Badge>
              {sermon.sermon_series && (
                <Badge className="bg-purple-100 text-purple-800">{sermon.sermon_series}</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopicResult({ topic, query }) {
  const highlightText = (text, query) => {
    if (!text) return '';
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              {highlightText(topic.title, query)}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {highlightText(topic.description, query)}
            </p>
            <div className="flex gap-2 items-center text-sm text-gray-500">
              <Badge variant="outline">{topic.category}</Badge>
              <span>•</span>
              <span>{topic.reply_count || 0} replies</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupResult({ group, query }) {
  const highlightText = (text, query) => {
    if (!text) return '';
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              {highlightText(group.name, query)}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {highlightText(group.description, query)}
            </p>
            <div className="flex gap-2 items-center text-sm text-gray-500">
              <Badge variant="outline">{group.privacy}</Badge>
              <span>•</span>
              <span>{group.member_count || 0} members</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}