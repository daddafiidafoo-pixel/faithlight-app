import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, BookOpen, BookMarked, Target, GraduationCap, Users, SlidersHorizontal, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import GroupCard from '../components/community/GroupCard';
import CreateGroupModal from '../components/community/CreateGroupModal';
import BibleStudyGroupCard from '../components/community/BibleStudyGroupCard';
import CreateBibleStudyGroupModal from '../components/community/CreateBibleStudyGroupModal';
import { useI18n } from '../components/I18nProvider';

export default function Groups() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateBibleStudyModal, setShowCreateBibleStudyModal] = useState(false);
  const [groupTabType, setGroupTabType] = useState('community');

  useEffect(() => {
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

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      try {
        return await base44.entities.Group.filter({ privacy: 'public' }, '-created_date', 100);
      } catch { return []; }
    },
    retry: false,
  });

  const { data: myGroupIds = [] } = useQuery({
    queryKey: ['my-groups', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const memberships = await base44.entities.GroupMember.filter({ user_id: user.id }, '-created_date', 100);
        return memberships.map(m => m.group_id);
      } catch { return []; }
    },
    enabled: !!user?.id,
    retry: false,
  });

  const { data: bibleStudyGroups = [] } = useQuery({
    queryKey: ['bible-study-groups'],
    queryFn: async () => {
      try {
        return await base44.entities.BibleStudyGroup.filter({ is_public: true }, '-created_date', 100);
      } catch { return []; }
    },
    retry: false,
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      if (!user?.id) {
        base44.auth.redirectToLogin();
        throw new Error('Not authenticated');
      }
      // Check for existing membership to avoid duplicates
      const existing = await base44.entities.GroupMember.filter(
        { group_id: groupId, user_id: user.id },
        '-created_date',
        1
      ).catch(() => []);
      if (existing.length > 0) return existing[0]; // already a member
      return base44.entities.GroupMember.create({
        group_id: groupId,
        user_id: user.id,
        role: 'member',
      });
    },
    onSuccess: () => {
      toast.success('Joined group!');
      queryClient.invalidateQueries(['my-groups']);
    },
    onError: (error) => {
      if (error.message === 'Not authenticated') return; // already redirecting
      toast.error('Unable to join group right now. Please try again.');
    },
  });

  const filteredGroups = groups.filter(group => {
    const matchesSearch = !searchQuery ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.interests?.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || group.group_type === filterType;
    const count = group.member_count || 0;
    const matchesSize = sizeFilter === 'all'
      || (sizeFilter === 'small' && count < 20)
      || (sizeFilter === 'medium' && count >= 20 && count < 100)
      || (sizeFilter === 'large' && count >= 100);
    const daysSinceActivity = group.last_activity_at
      ? (Date.now() - new Date(group.last_activity_at)) / (1000 * 60 * 60 * 24)
      : 9999;
    const matchesActivity = activityFilter === 'all'
      || (activityFilter === 'active' && daysSinceActivity < 7)
      || (activityFilter === 'recent' && daysSinceActivity < 30)
      || (activityFilter === 'quiet' && daysSinceActivity >= 30);
    return matchesSearch && matchesType && matchesSize && matchesActivity;
  });

  const hasActiveFilters = filterType !== 'all' || activityFilter !== 'all' || sizeFilter !== 'all' || searchQuery;
  const clearFilters = () => { setSearchQuery(''); setFilterType('all'); setActivityFilter('all'); setSizeFilter('all'); };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{t('nav.groups', 'Groups')}</h1>
            <p className="text-gray-600 mt-2">{t('groups.subtitle', 'Find and join communities based on your interests')}</p>
          </div>
          {user && (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <Plus className="w-5 h-5" />
                Community Group
              </Button>
              <Button
                onClick={() => setShowCreateBibleStudyModal(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Study Group
              </Button>
            </div>
          )}
        </div>

        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t('groups.searchPlaceholder', 'Search groups by name, topic, or interest...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button variant={showFilters ? 'default' : 'outline'} onClick={() => setShowFilters(f => !f)} className="gap-2 h-10">
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-400" />}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="h-10 gap-1 text-gray-500">
                <X className="w-4 h-4" /> Clear
              </Button>
            )}
          </div>

          {/* Type filter pills */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'All Groups', icon: Users },
              { value: 'bible_book', label: 'Bible Book', icon: BookMarked },
              { value: 'topic', label: 'Topic', icon: Target },
              { value: 'course', label: 'Course', icon: GraduationCap },
              { value: 'general', label: 'General', icon: BookOpen },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterType === value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Activity Level</label>
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Any activity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any activity</SelectItem>
                    <SelectItem value="active">Very active (last 7 days)</SelectItem>
                    <SelectItem value="recent">Recently active (last 30 days)</SelectItem>
                    <SelectItem value="quiet">Quiet (30+ days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Group Size</label>
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Any size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any size</SelectItem>
                    <SelectItem value="small">Small (&lt;20 members)</SelectItem>
                    <SelectItem value="medium">Medium (20–100)</SelectItem>
                    <SelectItem value="large">Large (100+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={groupTabType} onValueChange={setGroupTabType} className="space-y-6">
          <TabsList className="grid w-full sm:w-full grid-cols-4">
            <TabsTrigger value="community">Community Groups</TabsTrigger>
            <TabsTrigger value="study">Bible Study Groups</TabsTrigger>
            <TabsTrigger value="my-community">My Community</TabsTrigger>
            <TabsTrigger value="my-study">My Study Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="space-y-6">
            {filteredGroups.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No groups found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    memberCount={group.member_count || 0}
                    isJoined={myGroupIds.includes(group.id)}
                    onJoin={(g) => joinGroupMutation.mutate(g.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bible Study Groups Tab */}
          <TabsContent value="study" className="space-y-6">
            {bibleStudyGroups.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No Bible study groups yet</p>
                    {user && (
                      <Button
                        onClick={() => setShowCreateBibleStudyModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Create a Study Group
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bibleStudyGroups.map((group) => (
                  <BibleStudyGroupCard
                    key={group.id}
                    group={group}
                    currentUserId={user?.id}
                    isMember={myGroupIds.includes(group.id)}
                    onJoin={() => queryClient.invalidateQueries(['my-groups'])}
                    onViewDetails={() => {}} // TODO: Implement detail view
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-community" className="space-y-6">
            {groups.filter(g => myGroupIds.includes(g.id)).length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">You haven't joined any community groups yet</p>
                    <Button
                      onClick={() => { setGroupTabType('community'); setSearchQuery(''); }}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Explore Groups
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups
                  .filter(g => myGroupIds.includes(g.id))
                  .map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      memberCount={group.member_count || 0}
                      isJoined={true}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-study" className="space-y-6">
            {bibleStudyGroups.filter(g => myGroupIds.includes(g.id)).length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">You haven't joined any Bible study groups yet</p>
                    <Button
                      onClick={() => { setGroupTabType('study'); setSearchQuery(''); }}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Explore Study Groups
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bibleStudyGroups
                  .filter(g => myGroupIds.includes(g.id))
                  .map((group) => (
                    <BibleStudyGroupCard
                      key={group.id}
                      group={group}
                      currentUserId={user?.id}
                      isMember={true}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateGroupModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onGroupCreated={() => {
          queryClient.invalidateQueries(['groups']);
          queryClient.invalidateQueries(['my-groups']);
        }}
      />

      {user && (
        <CreateBibleStudyGroupModal
          open={showCreateBibleStudyModal}
          onClose={() => setShowCreateBibleStudyModal(false)}
          currentUser={user}
          onGroupCreated={() => {
            queryClient.invalidateQueries(['bible-study-groups']);
            queryClient.invalidateQueries(['my-groups']);
            setShowCreateBibleStudyModal(false);
          }}
        />
      )}
    </div>
  );
}