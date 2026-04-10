import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen, Calendar, User } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function SermonSeries() {
  const [user, setUser] = useState(null);
  const [selectedSermonIndex, setSelectedSermonIndex] = useState(0);
  const [showSermonDetail, setShowSermonDetail] = useState(false);

  // Get series ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const seriesId = urlParams.get('id');
  const seriesName = urlParams.get('name');

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

  // Fetch series details
  const { data: series } = useQuery({
    queryKey: ['sermon-series', seriesId],
    queryFn: async () => {
      if (seriesId) {
        const result = await base44.entities.SermonSeries.filter(
          { id: seriesId },
          '-created_date',
          1
        );
        return result[0] || null;
      }
      return null;
    },
    enabled: !!seriesId
  });

  // Fetch all sermons in this series
  const { data: sermons = [] } = useQuery({
    queryKey: ['series-sermons', seriesName],
    queryFn: async () => {
      try {
        const allSermons = await base44.entities.SharedSermon.filter(
          { sermon_series: seriesName },
          'created_date',
          200
        );
        return allSermons || [];
      } catch (error) {
        console.error('Error fetching series sermons:', error);
        return [];
      }
    },
    enabled: !!seriesName
  });

  const selectedSermon = sermons[selectedSermonIndex];

  const handlePrevious = () => {
    if (selectedSermonIndex > 0) {
      setSelectedSermonIndex(selectedSermonIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedSermonIndex < sermons.length - 1) {
      setSelectedSermonIndex(selectedSermonIndex + 1);
    }
  };

  if (!seriesName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">Series not found. Please select a series from the library.</p>
              <Link to={createPageUrl('CommunitySermons')}>
                <Button className="mt-4">Back to Sermon Library</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('CommunitySermons')}>
            <Button variant="outline" className="mb-4 gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Library
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{seriesName}</CardTitle>
                  {series?.description && (
                    <CardDescription className="text-base mt-2">
                      {series.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Sermons</p>
                    <p className="text-2xl font-bold text-gray-900">{sermons.length}</p>
                  </div>
                </div>
                {series && (
                  <>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Started</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(series.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {series.creator_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Created by</p>
                          <p className="text-sm font-semibold text-gray-900">{series.creator_name}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sermon List (Sidebar) */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sermons ({sermons.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {sermons.map((sermon, index) => (
                    <button
                      key={sermon.id}
                      onClick={() => {
                        setSelectedSermonIndex(index);
                        setShowSermonDetail(true);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSermonIndex === index
                          ? 'bg-indigo-100 border-2 border-indigo-600'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex gap-2">
                        <span className="text-xs font-semibold text-gray-500 min-w-[1.5rem]">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {sermon.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(sermon.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Sermon Display */}
          <div className="md:col-span-2 space-y-6">
            {selectedSermon ? (
              <>
                {/* Sermon Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="mb-2">Sermon {selectedSermonIndex + 1} of {sermons.length}</Badge>
                        <CardTitle className="text-2xl">{selectedSermon.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>By {selectedSermon.author_name}</span>
                      <span>•</span>
                      <span>{selectedSermon.length_minutes} minutes</span>
                      <span>•</span>
                      <span>{selectedSermon.style}</span>
                      <span>•</span>
                      <span>{new Date(selectedSermon.created_date).toLocaleDateString()}</span>
                    </div>

                    {selectedSermon.passage_references && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">
                          📖 {selectedSermon.passage_references}
                        </p>
                      </div>
                    )}

                    {selectedSermon.topic && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Topic</p>
                        <p className="text-sm text-gray-600">{selectedSermon.topic}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Full Sermon Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Full Sermon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{selectedSermon.content}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex gap-4 justify-between items-center">
                  <Button
                    onClick={handlePrevious}
                    disabled={selectedSermonIndex === 0}
                    variant="outline"
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous Sermon
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    Sermon {selectedSermonIndex + 1} of {sermons.length}
                  </div>

                  <Button
                    onClick={handleNext}
                    disabled={selectedSermonIndex === sermons.length - 1}
                    className="gap-2 bg-indigo-600"
                  >
                    Next Sermon
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No sermons found in this series</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Detail Modal */}
      {showSermonDetail && selectedSermon && (
        <Dialog open={showSermonDetail} onOpenChange={setShowSermonDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedSermon.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>By {selectedSermon.author_name}</span>
                <span>•</span>
                <span>{selectedSermon.length_minutes} minutes</span>
                <span>•</span>
                <span>{new Date(selectedSermon.created_date).toLocaleDateString()}</span>
              </div>

              {selectedSermon.passage_references && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    📖 {selectedSermon.passage_references}
                  </p>
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{selectedSermon.content}</ReactMarkdown>
              </div>

              <div className="flex gap-2 justify-between">
                <Button
                  onClick={() => {
                    handlePrevious();
                    if (selectedSermonIndex > 0) {
                      setSelectedSermonIndex(selectedSermonIndex - 1);
                    }
                  }}
                  disabled={selectedSermonIndex === 0}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600 flex items-center">
                  {selectedSermonIndex + 1} / {sermons.length}
                </span>
                <Button
                  onClick={handleNext}
                  disabled={selectedSermonIndex === sermons.length - 1}
                  size="sm"
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}