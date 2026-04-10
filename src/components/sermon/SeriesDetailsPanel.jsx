import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen, ExternalLink } from 'lucide-react';
import { createPageUrl } from '../../utils';
import { Link } from 'react-router-dom';

export default function SeriesDetailsPanel({ sermon, allSermons, onSermonChange }) {
  const [seriesDetails, setSeriesDetails] = useState(null);
  const [seriesSermons, setSeriesSermons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sermon?.sermon_series) {
      setSeriesDetails(null);
      setSeriesSermons([]);
      return;
    }

    const loadSeriesData = async () => {
      setIsLoading(true);
      try {
        // Find series details
        const series = await base44.entities.SermonSeries.filter({
          title: sermon.sermon_series
        }, '-created_date', 1);
        
        if (series && series.length > 0) {
          setSeriesDetails(series[0]);
        }

        // Filter sermons in this series
        const sameSeriesSermons = allSermons
          .filter(s => s.sermon_series === sermon.sermon_series)
          .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        
        setSeriesSermons(sameSeriesSermons);
        
        // Find current sermon index
        const index = sameSeriesSermons.findIndex(s => s.id === sermon.id);
        setCurrentIndex(index >= 0 ? index : 0);
      } catch (error) {
        console.error('Error loading series details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSeriesData();
  }, [sermon?.id, sermon?.sermon_series, allSermons]);

  if (!sermon?.sermon_series) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 text-center">Loading series details...</p>
        </CardContent>
      </Card>
    );
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const previousSermon = seriesSermons[currentIndex - 1];
      onSermonChange(previousSermon);
    }
  };

  const handleNext = () => {
    if (currentIndex < seriesSermons.length - 1) {
      const nextSermon = seriesSermons[currentIndex + 1];
      onSermonChange(nextSermon);
    }
  };

  return (
    <div className="space-y-4">
      {/* Series Header */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Series: {sermon.sermon_series}
            </CardTitle>
            <Link 
              to={`${createPageUrl('SermonSeries')}?id=${seriesDetails?.id || ''}&name=${encodeURIComponent(sermon.sermon_series)}`}
              title="View full series"
            >
              <ExternalLink className="w-4 h-4 text-indigo-600 hover:text-indigo-800 cursor-pointer" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {seriesDetails?.description && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {seriesDetails.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-indigo-200">
            <span>
              <span className="font-semibold text-gray-900">{currentIndex + 1}</span> of <span className="font-semibold text-gray-900">{seriesSermons.length}</span> sermons
            </span>
            {seriesDetails?.created_date && (
              <span>
                Started {new Date(seriesDetails.created_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      {seriesSermons.length > 1 && (
        <div className="flex gap-2">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === seriesSermons.length - 1}
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Series Sermons List */}
      {seriesSermons.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Sermons in Series</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {seriesSermons.map((s, index) => (
                <button
                  key={s.id}
                  onClick={() => onSermonChange(s)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    s.id === sermon.id
                      ? 'bg-indigo-50 border-indigo-400'
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1 flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        s.id === sermon.id ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {s.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(s.created_date).toLocaleDateString()} • {s.length_minutes} min
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}