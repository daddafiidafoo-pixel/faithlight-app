import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Calendar, Copy, Star, TrendingUp } from 'lucide-react';

export default function SharedPlans() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    fetchUser();
  }, []);

  const { data: sharedPlans = [] } = useQuery({
    queryKey: ['shared-plans'],
    queryFn: () => base44.entities.SharedStudyPlan.filter({ is_public: true }, '-created_date', 50).catch(() => []),
    enabled: !!user
  });

  const copyPlanMutation = useMutation({
    mutationFn: async (sharedPlan) => {
      // Fetch original plan details
      const originalPlan = await base44.entities.StudyPlan.filter({ id: sharedPlan.study_plan_id }).then(r => r[0]);
      
      if (!originalPlan) {
        throw new Error('Original plan not found');
      }

      // Create a copy for the current user
      const newPlan = await base44.entities.StudyPlan.create({
        user_id: user.id,
        title: `${originalPlan.title} (from ${sharedPlan.owner_name})`,
        description: originalPlan.description,
        topics: originalPlan.topics,
        duration_days: originalPlan.duration_days,
        daily_plan: originalPlan.daily_plan,
        is_active: true,
        progress_percentage: 0
      });

      // Increment share count
      await base44.entities.SharedStudyPlan.update(sharedPlan.id, {
        shares_count: (sharedPlan.shares_count || 0) + 1
      });

      return newPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['study-plans']);
      queryClient.invalidateQueries(['shared-plans']);
      alert('Study plan copied to your plans!');
    }
  });

  const filteredPlans = sharedPlans.filter(plan =>
    plan.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Study Plans</h1>
          <p className="text-gray-600">Discover and use study plans shared by other believers</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by topic, title, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Plans</p>
                  <p className="text-3xl font-bold text-indigo-600">{sharedPlans.length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Copies</p>
                  <p className="text-3xl font-bold text-green-600">
                    {sharedPlans.reduce((sum, p) => sum + (p.shares_count || 0), 0)}
                  </p>
                </div>
                <Copy className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Contributors</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {new Set(sharedPlans.map(p => p.owner_user_id)).size}
                  </p>
                </div>
                <User className="w-10 h-10 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{plan.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>by {plan.owner_name}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 line-clamp-3">{plan.description}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-indigo-100 text-indigo-800 gap-1">
                    <Calendar className="w-3 h-3" />
                    {plan.duration_days} days
                  </Badge>
                  {plan.shares_count > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Copy className="w-3 h-3" />
                      {plan.shares_count} copies
                    </Badge>
                  )}
                </div>

                {plan.topics && plan.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {plan.topics.slice(0, 3).map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {plan.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{plan.topics.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => copyPlanMutation.mutate(plan)}
                  disabled={copyPlanMutation.isPending}
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Copy className="w-4 h-4" />
                  {copyPlanMutation.isPending ? 'Copying...' : 'Copy to My Plans'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">No study plans found matching your search</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}