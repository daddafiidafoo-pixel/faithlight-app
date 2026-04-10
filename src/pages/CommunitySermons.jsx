import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Upload, TrendingUp, Filter, FolderOpen, Sparkles, List } from 'lucide-react';
import SermonSearchFilter from '../components/sermon/SermonSearchFilter';
import AdvancedSermonSearch from '../components/sermon/AdvancedSermonSearch';
import SermonSortOptions from '../components/sermon/SermonSortOptions';
import AISermonRecommendation from '../components/sermon/AISermonRecommendation';
import SermonCard from '../components/sermon/SermonCard';
import SermonCollectionManager from '../components/sermon/SermonCollectionManager';
import QuickSermonGenerator from '../components/sermon/QuickSermonGenerator';
import SeriesCreator from '../components/sermon/SeriesCreator';
import AISermonSummaryGenerator from '../components/sermon/AISermonSummaryGenerator';
import SocialMediaClipGenerator from '../components/sermon/SocialMediaClipGenerator';
import SermonTranscription from '../components/sermon/SermonTranscription';
import SeriesDetailsPanel from '../components/sermon/SeriesDetailsPanel';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function CommunitySermons() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [speakerFilter, setSpeakerFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [theologicalFilter, setTheologicalFilter] = useState('all');
  const [depthFilter, setDepthFilter] = useState('all');
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [showCollections, setShowCollections] = useState(false);
  const [showQuickGenerator, setShowQuickGenerator] = useState(false);
  const [showSeriesCreator, setShowSeriesCreator] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'series'

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Not authenticated');
      }
    };
    fetchUser();
  }, []);

  const queryClient = useQueryClient();

  const { data: allSeries = [] } = useQuery({
    queryKey: ['sermon-series-list'],
    queryFn: () => base44.entities.SermonSeries.list('-created_date', 100)
  });

  const { data: sermons = [] } = useQuery({
    queryKey: ['community-sermons'],
    queryFn: async () => {
      try {
        const allSermons = await base44.entities.SharedSermon.list('-created_date', 200);
        
        // Return sermons without fetching ratings individually (too many queries)
        // Ratings are already in the entity from previous updates
        return allSermons.map(sermon => ({
          ...sermon,
          average_rating: sermon.average_rating || 0,
          rating_count: sermon.ratings_count || 0
        }));
      } catch (error) {
        console.error('Error fetching sermons:', error);
        return [];
      }
    }
  });

  const { data: userInterests = [] } = useQuery({
    queryKey: ['user-interests', user?.id],
    queryFn: () => base44.entities.UserInterest.filter({ user_id: user.id }),
    enabled: !!user
  });

  // Extract unique values for filters
  const allTopics = [...new Set(sermons.flatMap(s => s.tags || []))].sort();
  const allSpeakers = [...new Set(sermons.map(s => s.author_name).filter(Boolean))].sort();
  const sermonSeriesNames = [...new Set(sermons.map(s => s.sermon_series).filter(Boolean))].sort();

  // Filter sermons
  const [searchType, setSearchType] = useState('all');

  const filteredSermons = sermons.filter(sermon => {
    // Multi-type search filtering
    let matchesSearch = !searchQuery;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (searchType === 'all') {
        matchesSearch = 
          sermon.title?.toLowerCase().includes(query) ||
          sermon.topic?.toLowerCase().includes(query) ||
          sermon.passage_references?.toLowerCase().includes(query) ||
          sermon.summary?.toLowerCase().includes(query) ||
          sermon.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          sermon.author_name?.toLowerCase().includes(query);
      } else if (searchType === 'scripture') {
        matchesSearch = sermon.passage_references?.toLowerCase().includes(query);
      } else if (searchType === 'theme') {
        matchesSearch = 
          sermon.tags?.some(tag => tag.toLowerCase().includes(query)) ||
          sermon.topic?.toLowerCase().includes(query) ||
          sermon.doctrine?.toLowerCase().includes(query);
      } else if (searchType === 'preacher') {
        matchesSearch = sermon.author_name?.toLowerCase().includes(query);
      }
    }

    const matchesStyle = styleFilter === 'all' || sermon.style === styleFilter;
    const matchesAudience = audienceFilter === 'all' || sermon.audience === audienceFilter;
    const matchesTopic = topicFilter === 'all' || sermon.tags?.includes(topicFilter);
    const matchesSpeaker = !speakerFilter || sermon.author_name === speakerFilter;
    const matchesSeries = seriesFilter === 'all' || sermon.sermon_series === seriesFilter;
    const matchesTheological = theologicalFilter === 'all' || sermon.doctrine === theologicalFilter;
    const matchesDepth = depthFilter === 'all' || sermon.reading_level === depthFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const sermonDate = new Date(sermon.created_date);
      const now = new Date();
      const diffDays = (now - sermonDate) / (1000 * 60 * 60 * 24);
      
      if (dateFilter === 'week' && diffDays > 7) matchesDate = false;
      if (dateFilter === 'month' && diffDays > 30) matchesDate = false;
      if (dateFilter === '3months' && diffDays > 90) matchesDate = false;
      if (dateFilter === 'year' && diffDays > 365) matchesDate = false;
    }

    return matchesSearch && matchesStyle && matchesAudience && matchesTopic && matchesSpeaker && matchesDate && matchesSeries && matchesTheological && matchesDepth;
  });

  // Sort sermons
  const sortedSermons = [...filteredSermons].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_date) - new Date(a.created_date);
    } else if (sortBy === 'rating') {
      return (b.average_rating || 0) - (a.average_rating || 0);
    } else if (sortBy === 'popular') {
      return (b.rating_count || 0) - (a.rating_count || 0);
    } else if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  const userContext = user ? {
    currentStudy: userInterests[0]?.interest_value,
    interests: userInterests.slice(0, 5).map(i => i.interest_value),
    role: user.user_role
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-10 h-10 text-indigo-600" />
                Community Sermon Library
              </h1>
              <p className="text-gray-600 mt-2">
                Share, discover, and be inspired by sermons from teachers worldwide
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {user && (
                <>
                  <Button onClick={() => setShowQuickGenerator(true)} variant="outline" className="gap-2 bg-purple-50 border-purple-200 hover:bg-purple-100">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Quick Generate
                  </Button>
                  <Button onClick={() => setShowSeriesCreator(true)} variant="outline" className="gap-2">
                    <List className="w-4 h-4" />
                    Create Series
                  </Button>
                  <Button onClick={() => setShowCollections(true)} variant="outline" className="gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Collections
                  </Button>
                </>
              )}
              <Link to={createPageUrl('SermonBuilder')}>
                <Button className="gap-2 bg-indigo-600">
                  <Upload className="w-4 h-4" />
                  Share Sermon
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">{sermons.length}</p>
                  <p className="text-sm text-gray-600">Sermons</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">{allTopics.length}</p>
                  <p className="text-sm text-gray-600">Topics</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {sermons.reduce((sum, s) => sum + (s.rating_count || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Ratings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Advanced Search */}
            <AdvancedSermonSearch 
              sermons={sermons}
              onSearch={(results) => {
                // Advanced search would require additional state management
                // For now, users can use the main search filters
              }}
            />

            {/* AI Recommendations */}
            {user && (
              <AISermonRecommendation
                sermons={sermons}
                onSermonSelect={setSelectedSermon}
                userContext={userContext}
              />
            )}

            {/* Sort Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="w-5 h-5" />
                  Sorting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SermonSortOptions sortBy={sortBy} setSortBy={setSortBy} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Search & Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setViewMode('all')}
              variant={viewMode === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All Sermons
            </Button>
            <Button
              onClick={() => setViewMode('series')}
              variant={viewMode === 'series' ? 'default' : 'outline'}
              size="sm"
            >
              Browse Series
            </Button>
          </div>

          <SermonSearchFilter
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchType={searchType}
                  setSearchType={setSearchType}
                  styleFilter={styleFilter}
                  setStyleFilter={setStyleFilter}
                  audienceFilter={audienceFilter}
                  setAudienceFilter={setAudienceFilter}
                  topicFilter={topicFilter}
                  setTopicFilter={setTopicFilter}
                  speakerFilter={speakerFilter}
                  setSpeakerFilter={setSpeakerFilter}
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  seriesFilter={seriesFilter}
                  setSeriesFilter={setSeriesFilter}
                  theologicalFilter={theologicalFilter}
                  setTheologicalFilter={setTheologicalFilter}
                  depthFilter={depthFilter}
                  setDepthFilter={setDepthFilter}
                  availableTopics={allTopics}
                  availableSpeakers={allSpeakers}
                  availableSeries={sermonSeriesNames}
                />
              </CardContent>
            </Card>

            {/* Sermons Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {sortedSermons.length} of {sermons.length} sermons
                </p>
              </div>

              {sortedSermons.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">No sermons found matching your criteria</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {sortedSermons.map(sermon => (
                    <SermonCard
                      key={sermon.id}
                      sermon={sermon}
                      currentUser={user}
                      onView={setSelectedSermon}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sermon Detail Modal */}
      {selectedSermon && (
        <Dialog open={!!selectedSermon} onOpenChange={() => setSelectedSermon(null)}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedSermon.title}</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Series Panel (Sidebar) */}
              <div className="md:col-span-1">
                <SeriesDetailsPanel 
                  sermon={selectedSermon}
                  allSermons={sermons}
                  onSermonChange={setSelectedSermon}
                />
              </div>

              {/* Main Content */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>By {selectedSermon.author_name}</span>
                  <span>•</span>
                  <span>{selectedSermon.length_minutes} minutes</span>
                  <span>•</span>
                  <span>{selectedSermon.style}</span>
                </div>

                 {selectedSermon.passage_references && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900">
                      📖 {selectedSermon.passage_references}
                    </p>
                  </div>
                )}

                {/* AI Tools Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    AI Tools
                  </h3>
                  <AISermonSummaryGenerator 
                    sermon={selectedSermon}
                    onSummaryGenerated={(summary) => {
                      setSelectedSermon(prev => ({ ...prev, summary }));
                      queryClient.invalidateQueries(['community-sermons']);
                    }}
                  />
                  <SocialMediaClipGenerator sermon={selectedSermon} />
                  <SermonTranscription 
                    sermon={selectedSermon}
                    onTranscriptionComplete={(content) => {
                      setSelectedSermon(prev => ({ ...prev, content }));
                      queryClient.invalidateQueries(['community-sermons']);
                    }}
                  />
                </div>

                {selectedSermon.summary && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Summary</h4>
                    <p className="text-sm text-green-800">{selectedSermon.summary}</p>
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <h4 className="font-semibold text-gray-900 mb-2">Full Sermon</h4>
                  <ReactMarkdown>{selectedSermon.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Collections Manager Modal */}
      {showCollections && user && (
        <Dialog open={showCollections} onOpenChange={setShowCollections}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>My Sermon Collections</DialogTitle>
            </DialogHeader>
            <SermonCollectionManager user={user} />
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Sermon Generator Modal */}
      {user && (
        <>
          <QuickSermonGenerator
            user={user}
            isOpen={showQuickGenerator}
            onClose={() => setShowQuickGenerator(false)}
            onSermonCreated={() => {
              queryClient.invalidateQueries(['community-sermons']);
            }}
          />
          <SeriesCreator
            user={user}
            isOpen={showSeriesCreator}
            onClose={() => setShowSeriesCreator(false)}
            onSeriesCreated={() => {
              queryClient.invalidateQueries(['sermon-series-list']);
            }}
          />
        </>
      )}
    </div>
  );
}