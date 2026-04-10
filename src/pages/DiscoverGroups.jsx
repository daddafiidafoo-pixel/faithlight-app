import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, TrendingUp, Clock, Search, Zap, Sparkles } from 'lucide-react';
import GroupCard from '../components/community/GroupCard';
import { motion } from 'framer-motion';

const INTEREST_OPTIONS = [
  'bible-study', 'prayer', 'theology', 'worship', 'youth',
  'women', 'men', 'marriage', 'parenting', 'discipleship', 'missions'
];

export default function DiscoverGroups() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [privacyFilter, setPrivacyFilter] = useState('all');

  React.useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  const { data: allGroups = [] } = useQuery({
    queryKey: ['discover-groups'],
    queryFn: async () => {
      const groups = await base44.entities.Group.filter(
        { is_active: true },
        '-created_date',
        200
      );
      return groups;
    },
  });

  const { data: myGroupIds = [] } = useQuery({
    queryKey: ['my-groups', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const memberships = await base44.entities.GroupMember.filter(
        { user_id: user.id },
        '-joined_date',
        100
      );
      return memberships.map(m => m.group_id);
    },
    enabled: !!user?.id,
  });

  // Get trending groups (based on recent membership growth)
  const trendingGroups = useMemo(() => {
    const sorted = [...allGroups].sort((a, b) => {
      const daysSinceCreatedA = (Date.now() - new Date(a.created_date)) / (1000 * 60 * 60 * 24);
      const daysSinceCreatedB = (Date.now() - new Date(b.created_date)) / (1000 * 60 * 60 * 24);
      
      // Calculate growth rate (members per day)
      const growthRateA = (a.member_count || 0) / Math.max(daysSinceCreatedA, 1);
      const growthRateB = (b.member_count || 0) / Math.max(daysSinceCreatedB, 1);
      
      return growthRateB - growthRateA;
    });

    return sorted.filter(group => !myGroupIds.includes(group.id)).slice(0, 6);
  }, [allGroups, myGroupIds]);

  // Get suggested groups based on user interests and learning goals
  const suggestedGroups = useMemo(() => {
    if (!user?.interests?.length && !user?.learning_goals?.length) {
      return [];
    }

    const scored = allGroups.map(group => {
      let score = 0;

      // Match against user interests
      if (user?.interests?.length) {
        const matchedInterests = group.interests?.filter(gi =>
          user.interests.some(ui => 
            ui.toLowerCase() === gi.toLowerCase() || 
            gi.toLowerCase().includes(ui.toLowerCase())
          )
        ) || [];
        score += matchedInterests.length * 10;
      }

      // Match against user learning goals
      if (user?.learning_goals?.length) {
        const groupDescription = `${group.name} ${group.description}`.toLowerCase();
        user.learning_goals.forEach(goal => {
          if (groupDescription.includes(goal.toLowerCase())) {
            score += 15;
          }
        });
      }

      return { group, score };
    });

    return scored
      .filter(item => item.score > 0 && !myGroupIds.includes(item.group.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.group);
  }, [allGroups, user?.interests, user?.learning_goals, myGroupIds]);

  const filteredGroups = useMemo(() => {
    let result = allGroups.filter(group => {
      // Filter out groups user is already a member of
      if (myGroupIds.includes(group.id)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!group.name.toLowerCase().includes(query) &&
            !group.description?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Privacy filter
      if (privacyFilter !== 'all' && group.privacy !== privacyFilter) {
        return false;
      }

      // Interest filter
      if (selectedInterests.length > 0) {
        const hasMatchingInterest = selectedInterests.some(interest =>
          group.interests?.includes(interest)
        );
        if (!hasMatchingInterest) return false;
      }

      return true;
    });

    // Sort
    if (sortBy === 'popular') {
      result.sort((a, b) => (b.member_count || 0) - (a.member_count || 0));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    return result;
  }, [allGroups, searchQuery, sortBy, selectedInterests, privacyFilter, myGroupIds]);

  const handleJoinGroup = (groupId) => {
    if (!user?.id) {
      base44.auth.redirectToLogin();
      return;
    }
    // Handle join in GroupCard component
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Groups</h1>
          <p className="text-lg text-gray-600">Find communities aligned with your faith and interests</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6 space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search groups by name or description..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
                <Select value={privacyFilter} onValueChange={setPrivacyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="public">Public Only</SelectItem>
                    <SelectItem value="invite_only">Invite Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Interest Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filter by Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      if (selectedInterests.includes(interest)) {
                        setSelectedInterests(selectedInterests.filter(i => i !== interest));
                      } else {
                        setSelectedInterests([...selectedInterests, interest]);
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedInterests.includes(interest)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedInterests.length > 0 || privacyFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedInterests([]);
                  setPrivacyFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Trending Groups Section */}
        {trendingGroups.length > 0 && !searchQuery && selectedInterests.length === 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🔥</span>
                <h2 className="text-2xl font-bold text-gray-900">Trending Groups</h2>
              </div>
              <p className="text-gray-600 text-sm">Growing fast right now</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingGroups.map((group, idx) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="relative">
                    <div className="absolute -top-3 -right-3 bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-orange-500/30">
                      🔥 Trending
                    </div>
                    <GroupCard
                      group={group}
                      memberCount={group.member_count || 0}
                      isJoined={false}
                      onJoin={handleJoinGroup}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Groups Section - Only show if user has interests */}
        {suggestedGroups.length > 0 && !searchQuery && selectedInterests.length === 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">✨</span>
                <h2 className="text-2xl font-bold text-gray-900">Suggested for You</h2>
              </div>
              <p className="text-gray-600 text-sm">Based on your interests</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedGroups.map((group, idx) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="relative">
                    <div className="absolute -top-3 -right-3 bg-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-purple-500/30">
                      ✨ For You
                    </div>
                    <GroupCard
                      group={group}
                      memberCount={group.member_count || 0}
                      isJoined={false}
                      onJoin={handleJoinGroup}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Browse All Groups Divider */}
        {(trendingGroups.length > 0 || suggestedGroups.length > 0) && !searchQuery && selectedInterests.length === 0 && (
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse All Groups</h2>
          </div>
        )}

        {/* Results Summary */}
        {filteredGroups.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{filteredGroups.length}</span> group{filteredGroups.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Groups Grid */}
        {filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                memberCount={group.member_count || 0}
                isJoined={false}
                onJoin={handleJoinGroup}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-400 mb-4">
                {searchQuery || selectedInterests.length > 0 || privacyFilter !== 'all' ? (
                  <>
                    <p className="text-lg font-semibold text-gray-600 mb-2">No groups found</p>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </>
                ) : !user?.interests?.length && !user?.learning_goals?.length ? (
                  <>
                    <p className="text-lg font-semibold text-gray-600 mb-2">Join groups to personalize your recommendations</p>
                    <p className="text-sm text-gray-600">Set your interests in your profile to get better suggestions</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-gray-600 mb-2">No groups available</p>
                    <p className="text-gray-600">Check back soon!</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}