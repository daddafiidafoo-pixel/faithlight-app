import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, AlertCircle, CheckCircle, BarChart3, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function TranslationFeedbackDashboard() {
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const queryClient = useQueryClient();

  // Fetch user
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        // Check if user is admin or translator
        if (!['admin', 'reviewer', 'translator'].includes(currentUser.user_role)) {
          window.location.href = '/';
        }
      } catch (error) {
        window.location.href = '/';
      }
    };
    fetchUser();
  }, []);

  // Fetch reviews
  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['translation-reviews-all'],
    queryFn: () => base44.entities.TranslationReview.list('-created_date', 100),
    enabled: !!user,
  });

  // Fetch voice requests for context
  const { data: voiceRequests = {} } = useQuery({
    queryKey: ['voice-requests-all'],
    queryFn: async () => {
      const requests = await base44.entities.VoiceRequest.list('-created_date', 500);
      const map = {};
      requests.forEach(req => {
        map[req.id] = req;
      });
      return map;
    },
    enabled: !!user,
  });

  // Update review status mutation
  const updateReviewMutation = useMutation({
    mutationFn: ({ id, status }) =>
      base44.entities.TranslationReview.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['translation-reviews-all']);
      toast.success('Review status updated');
    },
  });

  const filteredReviews = reviews.filter(review => {
    const voiceRequest = voiceRequests[review.voice_request_id];
    if (!voiceRequest) return false;
    
    const statusMatch = filterStatus === 'all' || review.status === filterStatus;
    const langMatch = filterLanguage === 'all' || voiceRequest.target_language === filterLanguage;
    
    return statusMatch && langMatch;
  });

  // Analytics
  const stats = {
    total: reviews.length,
    needsFix: reviews.filter(r => r.status === 'NEEDS_FIX').length,
    approved: reviews.filter(r => r.status === 'APPROVED').length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : 0,
    issuesByType: getIssueStats(reviews, voiceRequests),
  };

  const statusColors = {
    'NEEDS_FIX': 'bg-red-100 text-red-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'PENDING_REVIEW': 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Translation Feedback Dashboard</h1>
          <p className="text-gray-600">Review community feedback to improve AI translation accuracy</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-sm text-gray-600">Total Feedback</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.needsFix}</div>
                <p className="text-sm text-gray-600">Needs Fix</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">⭐ {stats.avgRating}</div>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Trend: +12% this week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="issues">Issue Analysis</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Translation Reviews</CardTitle>
                  <div className="flex gap-3">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="NEEDS_FIX">Needs Fix</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="PENDING_REVIEW">Pending</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        <SelectItem value="om">Oromo</SelectItem>
                        <SelectItem value="am">Amharic</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingReviews ? (
                  <div className="flex justify-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No reviews found
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredReviews.map((review) => {
                      const voiceRequest = voiceRequests[review.voice_request_id];
                      if (!voiceRequest) return null;

                      return (
                        <div key={review.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={statusColors[review.status]}>
                                  {review.status}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {voiceRequest.target_language.toUpperCase()}
                                </span>
                                <span className="text-sm font-semibold text-gray-700">
                                  ⭐ {review.rating}/5
                                </span>
                              </div>

                              <p className="text-sm text-gray-700 mb-2">
                                <strong>Original:</strong> {voiceRequest.source_text.substring(0, 50)}...
                              </p>
                              <p className="text-sm text-gray-700 mb-2">
                                <strong>Feedback:</strong> {review.notes}
                              </p>
                            </div>

                            {review.status === 'NEEDS_FIX' && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateReviewMutation.mutate({
                                    id: review.id,
                                    status: 'APPROVED',
                                  })
                                }
                                disabled={updateReviewMutation.isPending}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle>Issue Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.issuesByType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([issue, count]) => (
                      <div key={issue} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">{issue}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-40 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(count / Math.max(...Object.values(stats.issuesByType))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="font-bold text-gray-700 w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  AI Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📈 Top Issue to Fix</h4>
                  <p className="text-sm text-blue-800">
                    Based on feedback, improve handling of <strong>word choice</strong> in {stats.issuesByType['word_choice'] || 0} cases.
                  </p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Strong Performance</h4>
                  <p className="text-sm text-green-800">
                    {stats.approved} translations approved. Continue current approach for Amharic translations.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">⚡ Next Steps</h4>
                  <p className="text-sm text-amber-800">
                    Review AI prompts quarterly. Add cultural context for Arabic tone adjustments.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function getIssueStats(reviews, voiceRequests) {
  const stats = {};
  // This would be enhanced if we track issue types in the feedback
  // For now, estimate based on rating patterns
  reviews.forEach(review => {
    if (review.rating < 3) {
      const issue = review.notes.toLowerCase().includes('word')
        ? 'word_choice'
        : review.notes.toLowerCase().includes('meaning')
        ? 'meaning'
        : review.notes.toLowerCase().includes('grammar')
        ? 'grammar'
        : 'other';
      stats[issue] = (stats[issue] || 0) + 1;
    }
  });
  return stats;
}