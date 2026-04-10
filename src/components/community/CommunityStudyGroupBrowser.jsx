import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, BookOpen, Target, LogIn, Plus } from 'lucide-react';
import { toast } from 'sonner';
import CreateStudyGroupModal from './CreateStudyGroupModal';

export default function CommunityStudyGroupBrowser({ user, isDarkMode = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFocus, setFilterFocus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: groups = [], refetch } = useQuery({
    queryKey: ['public-study-groups'],
    queryFn: () => base44.entities.StudyGroup.filter({ is_public: true }, '-last_activity_date', 50),
    enabled: !!user
  });

  const handleJoinGroup = async (group) => {
    try {
      // Add user as member
      await base44.entities.GroupMember.create({
        group_id: group.id,
        user_id: user.id,
        user_name: user.full_name,
        role: 'member',
        member_progress_percentage: 0
      });

      // Update group member count
      await base44.entities.StudyGroup.update(group.id, {
        member_count: (group.member_count || 1) + 1
      });

      toast.success(`Joined ${group.group_name}!`);
      refetch();
    } catch (error) {
      toast.error('Failed to join group');
      console.error(error);
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.study_focus.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterFocus === 'all' || group.study_focus.toLowerCase().includes(filterFocus.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  return (
    <div className="space-y-6" style={{ backgroundColor: bgColor }}>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 style={{ color: textColor }} className="text-2xl font-bold mb-4">
            Study Groups
          </h2>
          <div className="flex gap-3 flex-wrap">
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-64"
              style={{ borderColor, color: textColor, backgroundColor: cardColor }}
            />
            <Select value={filterFocus} onValueChange={setFilterFocus}>
              <SelectTrigger className="w-40" style={{ borderColor, color: textColor, backgroundColor: cardColor }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                <SelectItem value="gospel">Gospels</SelectItem>
                <SelectItem value="theology">Theology</SelectItem>
                <SelectItem value="prayer">Prayer</SelectItem>
                <SelectItem value="living">Christian Living</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2 h-fit"
          style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
        >
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.length === 0 ? (
          <Card className="col-span-full" style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: borderColor }} />
              <p style={{ color: textColor }}>No study groups found</p>
            </CardContent>
          </Card>
        ) : (
          filteredGroups.map(group => (
            <Card
              key={group.id}
              style={{
                backgroundColor: cardColor,
                borderColor,
                border: `1px solid ${borderColor}`,
                cursor: 'pointer'
              }}
              className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
            >
              {group.cover_image_url && (
                <div
                  className="h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url(${group.cover_image_url})` }}
                />
              )}
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle style={{ color: textColor }} className="line-clamp-2">
                    {group.group_name}
                  </CardTitle>
                  <Badge variant="outline" className="w-fit">
                    {group.study_focus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {group.description && (
                  <p style={{ color: borderColor }} className="text-sm line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2" style={{ color: borderColor }}>
                    <Users className="w-4 h-4" />
                    {group.member_count} members
                  </div>
                  <div className="flex items-center gap-2" style={{ color: borderColor }}>
                    <Target className="w-4 h-4" />
                    {group.group_progress_percentage || 0}% complete
                  </div>
                </div>

                {group.group_goal && (
                  <div
                    className="p-2 rounded text-xs"
                    style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}
                  >
                    <p style={{ color: primaryColor }} className="font-medium mb-1">Goal:</p>
                    <p style={{ color: textColor }}>{group.group_goal}</p>
                  </div>
                )}

                <Button
                  onClick={() => handleJoinGroup(group)}
                  className="w-full gap-2 mt-4"
                  style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                >
                  <LogIn className="w-4 h-4" />
                  Join Group
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      <CreateStudyGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        user={user}
        onGroupCreated={() => {
          refetch();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}