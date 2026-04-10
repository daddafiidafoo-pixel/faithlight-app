import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, BookOpen, Globe, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function ScriptureStudyGroups() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    topic: 'book_study',
    book_or_topic: '',
    privacy: 'public',
    meeting_schedule: 'weekly'
  });
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

  const { data: allGroups = [] } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => base44.entities.StudyGroup.filter({ is_active: true }, '-created_date'),
    enabled: !!user
  });

  const { data: myGroups = [] } = useQuery({
    queryKey: ['my-study-groups', user?.id],
    queryFn: () => base44.entities.GroupMember.filter({ user_id: user.id }),
    enabled: !!user
  });

  const createGroupMutation = useMutation({
    mutationFn: async (formData) => {
      const group = await base44.entities.StudyGroup.create({
        ...formData,
        creator_id: user.id,
        creator_name: user.full_name,
        member_count: 1
      });

      // Add creator as admin member
      await base44.entities.GroupMember.create({
        group_id: group.id,
        user_id: user.id,
        user_name: user.full_name,
        role: 'admin'
      });

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['study-groups']);
      queryClient.invalidateQueries(['my-study-groups']);
      setShowCreateModal(false);
      setCreateFormData({
        name: '',
        description: '',
        topic: 'book_study',
        book_or_topic: '',
        privacy: 'public',
        meeting_schedule: 'weekly'
      });
    }
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      return base44.entities.GroupMember.create({
        group_id: groupId,
        user_id: user.id,
        user_name: user.full_name,
        role: 'member'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-study-groups']);
    }
  });

  const filteredGroups = allGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          group.book_or_topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = filterTopic === 'all' || group.topic === filterTopic;
    const isNotMember = !myGroups.some(m => m.group_id === group.id);
    return matchesSearch && matchesTopic && isNotMember;
  });

  const myGroupIds = myGroups.map(m => m.group_id);
  const userGroups = allGroups.filter(g => myGroupIds.includes(g.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Scripture Study Groups</h1>
          <p className="text-gray-600">Join a community, explore together, grow in faith</p>
        </div>

        {/* Create Group Button */}
        {user && (
          <div className="text-center mb-8">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Create Study Group
            </Button>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4">Create a Study Group</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Name:</label>
                    <Input
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                      placeholder="e.g., Romans Deep Dive"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                    <textarea
                      value={createFormData.description}
                      onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                      placeholder="What will you study and why?"
                      className="w-full border rounded p-2 text-sm min-h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Study Type:</label>
                      <select
                        value={createFormData.topic}
                        onChange={(e) => setCreateFormData({...createFormData, topic: e.target.value})}
                        className="w-full border rounded p-2 text-sm"
                      >
                        <option value="book_study">Book Study</option>
                        <option value="topical">Topical</option>
                        <option value="verse_by_verse">Verse-by-Verse</option>
                        <option value="character_study">Character Study</option>
                        <option value="theology">Theology</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Book or Topic:</label>
                      <Input
                        value={createFormData.book_or_topic}
                        onChange={(e) => setCreateFormData({...createFormData, book_or_topic: e.target.value})}
                        placeholder="e.g., Romans or Prayer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Privacy:</label>
                      <select
                        value={createFormData.privacy}
                        onChange={(e) => setCreateFormData({...createFormData, privacy: e.target.value})}
                        className="w-full border rounded p-2 text-sm"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private (Invite Only)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Schedule:</label>
                      <select
                        value={createFormData.meeting_schedule}
                        onChange={(e) => setCreateFormData({...createFormData, meeting_schedule: e.target.value})}
                        className="w-full border rounded p-2 text-sm"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => createGroupMutation.mutate(createFormData)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      disabled={!createFormData.name || !createFormData.book_or_topic}
                    >
                      Create Group
                    </Button>
                    <Button
                      onClick={() => setShowCreateModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-6">
            <button className="pb-3 px-1 border-b-2 border-indigo-600 font-semibold text-gray-900">
              My Groups ({userGroups.length})
            </button>
            <button className="pb-3 px-1 text-gray-600 hover:text-gray-900">
              Discover ({filteredGroups.length})
            </button>
          </div>
        </div>

        {/* My Groups */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userGroups.length === 0 ? (
              <p className="text-gray-600 col-span-3 text-center py-8">
                You haven't joined any groups yet. <button onClick={() => setFilterTopic('all')} className="text-indigo-600 hover:underline">Explore groups →</button>
              </p>
            ) : (
              userGroups.map(group => (
                <Link key={group.id} to={createPageUrl('StudyGroupDetail') + `?id=${group.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer bg-white">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{group.name}</h3>
                        {group.privacy === 'public' && <Globe className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                        <BookOpen className="w-3 h-3" />
                        {group.book_or_topic}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users className="w-3 h-3" />
                        {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Discover Groups */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Discover Groups</h2>
          
          {/* Search & Filter */}
          <div className="mb-6 space-y-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full"
              icon={<Search className="w-4 h-4" />}
            />
            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            >
              <option value="all">All Topics</option>
              <option value="book_study">Book Study</option>
              <option value="topical">Topical</option>
              <option value="verse_by_verse">Verse-by-Verse</option>
              <option value="character_study">Character Study</option>
              <option value="theology">Theology</option>
            </select>
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.length === 0 ? (
              <p className="text-gray-600 col-span-3 text-center py-8">No groups found matching your search.</p>
            ) : (
              filteredGroups.map(group => (
                <Card key={group.id} className="h-full hover:shadow-lg transition-shadow bg-white">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{group.name}</h3>
                      {group.privacy === 'public' && <Globe className="w-4 h-4 text-green-600" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <BookOpen className="w-3 h-3" />
                      {group.book_or_topic}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
                      <Users className="w-3 h-3" />
                      {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                    </div>
                    <Button
                      onClick={() => joinGroupMutation.mutate(group.id)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      size="sm"
                    >
                      Join Group
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}