import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2, ChevronRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PersonalizedSermonSuggestions({ userId }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const { data: recommendationData, isLoading } = useQuery({
    queryKey: ['personalized-sermon-suggestions', userId],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateAdaptiveRecommendations', {
        userId
      });
      return response.data;
    },
    enabled: !!userId
  });

  const sermonSuggestions = recommendationData?.recommendations?.sermonTopics || [];
  const userProfile = recommendationData?.userProfile || {};

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <p className="text-gray-600 text-sm">Personalizing sermon suggestions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!sermonSuggestions || sermonSuggestions.length === 0) {
    return null;
  }

  const theologicalContext = userProfile.theologicalLeanings?.length > 0
    ? `Based on your ${userProfile.theologicalLeanings.join(' + ')} perspective`
    : 'Based on your learning profile';

  const styleContext = `You prefer ${userProfile.teachingStyle} style teaching`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Sermon Topics For You
        </h3>
        <p className="text-sm text-gray-600">
          {theologicalContext} • {styleContext}
        </p>
      </div>

      <div className="space-y-3">
        {sermonSuggestions.map((suggestion, idx) => (
          <Card
            key={idx}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{suggestion.topic}</h4>
                  {suggestion.theme && (
                    <p className="text-xs text-gray-600 mt-1">
                      <Lightbulb className="w-3 h-3 inline mr-1" />
                      {suggestion.theme}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {suggestion.style && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {suggestion.style.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            {expandedIdx === idx && (
              <CardContent className="pt-0 space-y-3 border-t">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Why this topic for you:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>✓ Aligned with your {userProfile.theologicalLeanings?.[0] || 'theological'} perspective</li>
                    <li>✓ Matches your {userProfile.teachingStyle} teaching preference</li>
                    <li>✓ Perfect for Level {userProfile.spiritualLevel} believers</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-700">Sermon Style Suggestions:</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {getSuggestedVariations(suggestion).map((variation, vidx) => (
                      <div key={vidx} className="bg-gray-50 p-2 rounded border">
                        <p className="text-xs font-medium text-gray-900">{variation.label}</p>
                        <p className="text-xs text-gray-600 mt-1">{variation.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Link to={createPageUrl('SermonBuilder')} className="block">
                  <Button className="w-full gap-2" variant="default">
                    <Sparkles className="w-4 h-4" />
                    Create This Sermon
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            )}

            {expandedIdx !== idx && (
              <CardContent className="pt-0">
                <Link to={createPageUrl('SermonBuilder')}>
                  <Button size="sm" className="w-full gap-2">
                    Create Sermon
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Customization Tips */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4">
          <h4 className="font-semibold text-amber-900 mb-2 text-sm">💡 Customize These Suggestions</h4>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• Change the audience level (new believers, leaders)</li>
            <li>• Adjust sermon length (10, 20, 45 minutes)</li>
            <li>• Add your denomination's theological emphasis</li>
            <li>• Choose your preferred teaching style</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function getSuggestedVariations(suggestion) {
  const baseStyle = suggestion.style || 'topical';

  const variations = {
    expository: [
      { label: 'Verse-by-Verse', description: 'Deep word study' },
      { label: 'Chapter Survey', description: 'Broader overview' },
      { label: 'Book Overview', description: 'Whole book context' }
    ],
    topical: [
      { label: 'Thematic Deep Dive', description: 'Focus on one angle' },
      { label: 'Multi-Passage', description: 'Compare related verses' },
      { label: 'Character Study', description: 'Follow a biblical figure' }
    ],
    teaching: [
      { label: 'Q&A Format', description: 'Interactive questions' },
      { label: 'Case Studies', description: 'Real-world application' },
      { label: 'Structured Outline', description: 'Clear 3-point format' }
    ]
  };

  return variations[baseStyle] || variations.topical;
}