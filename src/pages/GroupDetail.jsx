import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, FileText, MessageSquare, Users, Shield, BookOpen, StickyNote, LogIn, Globe, Lock, Video, FolderOpen, PenLine, BarChart2, Hash } from 'lucide-react';
import PrayerRequestPanel from '../components/reactions/PrayerRequestPanel';
import { createPageUrl } from '../utils';
import GroupForumPanel from '../components/groups/GroupForumPanel';
import GroupSharedNotes from '../components/groups/GroupSharedNotes';
import GroupStudySession from '../components/groups/GroupStudySession';
import GroupAdminPanel from '../components/groups/GroupAdminPanel';
import GroupFileSharing from '../components/community/GroupFileSharing';
import CollaborativeNotes from '../components/groups/CollaborativeNotes';
import GroupVideoMeeting from '../components/groups/GroupVideoMeeting';
import GroupResourceLibrary from '../components/groups/GroupResourceLibrary';
import GroupTeamChallenges from '../components/groups/GroupTeamChallenges';
import SharedReadingPlans from '../components/groups/SharedReadingPlans';
import BiblePassageDiscussionForum from '../components/groups/BiblePassageDiscussionForum';
import GroupVerseAnnotations from '../components/groups/GroupVerseAnnotations';
import GroupModerationPanel from '../components/groups/GroupModerationPanel';
import GroupLeaderboard from '../components/groups/GroupLeaderboard';
import GroupNotificationSender from '../components/groups/GroupNotificationSender';
import GroupCollectivePlanTracker from '../components/groups/GroupCollectivePlanTracker';
import GroupCalendar from '../components/groups/GroupCalendar';
import GroupPolls from '../components/groups/GroupPolls';
import GroupChannels from '../components/groups/GroupChannels';
import GroupFeed from '../components/groups/GroupFeed';
import GroupChat from '../components/groups/GroupChat';
import GroupMeetings from '../components/groups/GroupMeetings';
import AIGroupSummaryPanel from '../components/groups/AIGroupSummaryPanel';

// Generate gradient color from name
const getGradient = (name = '') => {
  const colors = ['from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-green-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-red-600'];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
};

export default function GroupDetail() {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('id');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => base44.entities.Group.filter({ id: groupId }, '-created_date', 1).then(d => d[0]),
    enabled: !!groupId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.GroupMember.filter({ group_id: groupId }, '-created_date', 200).catch(() => []),
    enabled: !!groupId,
  });

  const myMembership = members.find(m => m.user_id === user?.id);
  const isMember = !!myMembership;
  const isAdmin = ['admin', 'owner'].includes(myMembership?.role) || group?.creator_user_id === user?.id || group?.owner_id === user?.id;

  const joinMutation = useMutation({
    mutationFn: async () => {
      const member = await base44.entities.GroupMember.create({
        group_id: groupId,
        user_id: user.id,
        user_name: user.full_name,
        role: 'member',
        joined_at: new Date().toISOString(),
      });
      await base44.entities.Group.update(groupId, { member_count: (group?.member_count || 0) + 1 }).catch(() => {});
      return member;
    },
    onSuccess: () => {
      toast.success('You joined the group!');
      queryClient.invalidateQueries(['group-members', groupId]);
      queryClient.invalidateQueries(['group', groupId]);
    },
    onError: () => toast.error('Failed to join group'),
  });

  const leaveMutation = useMutation({
    mutationFn: () => base44.entities.GroupMember.delete(myMembership.id),
    onSuccess: () => {
      toast.success('You left the group');
      queryClient.invalidateQueries(['group-members', groupId]);
      queryClient.invalidateQueries(['group', groupId]);
      base44.entities.Group.update(groupId, { member_count: Math.max(0, (group?.member_count || 1) - 1) }).catch(() => {});
    },
    onError: () => toast.error('Failed to leave group'),
  });

  if (groupLoading || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading group...</p>
      </div>
    );
  }

  const initials = group.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const gradient = getGradient(group.name);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('Groups')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-4 block">
            ← Back to Groups
          </Link>
          <div className="flex items-start gap-5 flex-wrap">
            {/* Group Avatar */}
            {group.group_photo_url ? (
              <img src={group.group_photo_url} alt={group.name} className="w-20 h-20 rounded-2xl object-cover shadow-md flex-shrink-0" />
            ) : (
              <div className={`bg-gradient-to-br ${gradient} w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0`}>
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      {group.privacy === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {group.privacy === 'public' ? 'Public' : 'Private'} Group
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {members.length} members
                    </span>
                    {isAdmin && (
                      <>
                        <span className="text-gray-300">·</span>
                        <Badge className="bg-amber-100 text-amber-800 border border-amber-200 text-xs">Admin</Badge>
                      </>
                    )}
                  </div>
                  {group.description && <p className="text-gray-600 text-sm mt-2">{group.description}</p>}
                </div>

                {/* Join / Leave */}
                {user && (
                  isMember ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      disabled={leaveMutation.isPending || isAdmin}
                      onClick={() => { if (confirm('Leave this group?')) leaveMutation.mutate(); }}
                      title={isAdmin ? 'Admins cannot leave — transfer ownership first' : ''}
                    >
                      {leaveMutation.isPending ? 'Leaving...' : 'Leave Group'}
                    </Button>
                  ) : (
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                      disabled={joinMutation.isPending}
                      onClick={() => joinMutation.mutate()}
                    >
                      <LogIn className="w-4 h-4" />
                      {joinMutation.isPending ? 'Joining...' : 'Join Group'}
                    </Button>
                  )
                )}
              </div>

              {/* Tags */}
              {group.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {group.interests.map(i => (
                    <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                  ))}
                  {group.custom_topics?.map(t => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {isMember ? (
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-17' : 'grid-cols-16'} overflow-x-auto`}>
              <TabsTrigger value="feed" className="gap-1 text-xs">
                <MessageSquare className="w-3 h-3" /><span className="hidden sm:inline">Feed</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-1 text-xs">
                <span className="text-sm leading-none">💬</span><span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="gap-1 text-xs">
                <Video className="w-3 h-3" /><span className="hidden sm:inline">Meetings</span>
              </TabsTrigger>
              <TabsTrigger value="reading" className="gap-1 text-xs">
                <BookOpen className="w-3 h-3" /><span className="hidden sm:inline">Reading</span>
              </TabsTrigger>
              <TabsTrigger value="forum" className="gap-1 text-xs">
                <MessageSquare className="w-3 h-3" /><span className="hidden sm:inline">Discuss</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-1 text-xs">
                <PenLine className="w-3 h-3" /><span className="hidden sm:inline">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="gap-1 text-xs">
                <span className="text-sm leading-none">⚡</span><span className="hidden sm:inline">Challenges</span>
              </TabsTrigger>
              <TabsTrigger value="meetings" className="gap-1 text-xs">
                <Video className="w-3 h-3" /><span className="hidden sm:inline">Meetings</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-1 text-xs">
                <FolderOpen className="w-3 h-3" /><span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-1 text-xs">
                <Calendar className="w-3 h-3" /><span className="hidden sm:inline">Sessions</span>
              </TabsTrigger>
              <TabsTrigger value="prayer" className="gap-1 text-xs">
                <span className="text-sm leading-none">🙏</span><span className="hidden sm:inline">Prayer</span>
              </TabsTrigger>
              <TabsTrigger value="collective" className="gap-1 text-xs">
                <span className="text-sm leading-none">📊</span><span className="hidden sm:inline">Plans</span>
              </TabsTrigger>
              <TabsTrigger value="ranking" className="gap-1 text-xs">
                <span className="text-sm leading-none">🏆</span><span className="hidden sm:inline">Ranking</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-1 text-xs">
                <Calendar className="w-3 h-3" /><span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="polls" className="gap-1 text-xs">
                <BarChart2 className="w-3 h-3" /><span className="hidden sm:inline">Polls</span>
              </TabsTrigger>
              <TabsTrigger value="channels" className="gap-1 text-xs">
                <Hash className="w-3 h-3" /><span className="hidden sm:inline">Channels</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-1 text-xs">
                <Users className="w-3 h-3" /><span className="hidden sm:inline">Members</span>
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="gap-1 text-xs">
                  <Shield className="w-3 h-3" /><span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Group Feed */}
            <TabsContent value="feed">
              <GroupFeed groupId={groupId} user={user} />
            </TabsContent>

            {/* Group Chat */}
            <TabsContent value="chat">
              <GroupChat groupId={groupId} user={user} />
            </TabsContent>

            {/* Meetings */}
            <TabsContent value="schedule">
              <GroupMeetings groupId={groupId} user={user} isAdmin={isAdmin} />
            </TabsContent>

            {/* Shared Reading Plans */}
            <TabsContent value="reading">
              <SharedReadingPlans groupId={groupId} user={user} isAdmin={isAdmin} />
            </TabsContent>

            {/* Bible Passage Discussion */}
            <TabsContent value="forum">
              <div className="space-y-4">
                <AIGroupSummaryPanel groupId={groupId} passageRef={group?.current_passage} />
                <BiblePassageDiscussionForum groupId={groupId} user={user} isAdmin={isAdmin} />
              </div>
            </TabsContent>

            {/* Group Verse Annotations */}
            <TabsContent value="notes">
              <GroupVerseAnnotations groupId={groupId} user={user} isAdmin={isAdmin} />
            </TabsContent>

            {/* Team Challenges */}
            <TabsContent value="challenges">
              <GroupTeamChallenges groupId={groupId} group={group} user={user} isAdmin={isAdmin} />
            </TabsContent>

            {/* Video Meetings */}
            <TabsContent value="meetings">
              <GroupVideoMeeting groupId={groupId} group={group} user={user} isAdmin={isAdmin} />
            </TabsContent>

            {/* Resource Library */}
            <TabsContent value="resources">
              <GroupResourceLibrary groupId={groupId} user={user} isAdmin={isAdmin} />
            </TabsContent>

            {/* Study Sessions */}
            <TabsContent value="sessions">
              <GroupStudySession groupId={groupId} group={group} user={user} isAdmin={isAdmin} />
            </TabsContent>

            {/* Prayer Requests */}
            <TabsContent value="prayer">
              <PrayerRequestPanel groupId={groupId} user={user} />
            </TabsContent>

            {/* Collective Study Plans */}
            <TabsContent value="collective">
              <GroupCollectivePlanTracker groupId={groupId} user={user} isAdmin={isAdmin} members={members} />
            </TabsContent>

            {/* Group Leaderboard */}
            <TabsContent value="ranking">
              <GroupLeaderboard groupId={groupId} currentUserId={user?.id} />
            </TabsContent>

            {/* Group Calendar */}
            <TabsContent value="calendar">
              <GroupCalendar groupId={groupId} user={user} isAdmin={isAdmin} />
            </TabsContent>

            {/* Group Polls */}
            <TabsContent value="polls">
              <GroupPolls groupId={groupId} user={user} isAdmin={isAdmin} />
            </TabsContent>

            {/* Channels / Sub-groups */}
            <TabsContent value="channels">
              <GroupChannels groupId={groupId} user={user} isAdmin={isAdmin} members={members} />
            </TabsContent>

            {/* Members */}
            <TabsContent value="members">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map(member => (
                  <Card key={member.id} className="hover:shadow-sm transition-shadow border-gray-200">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                          {(member.user_name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{member.user_name || 'Member'}</p>
                          <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                        </div>
                      </div>
                      {member.role !== 'member' && (
                        <Badge className={member.role === 'admin' || member.role === 'owner' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}>
                          {member.role}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Admin / Moderation Panel */}
            {isAdmin && (
              <TabsContent value="admin">
                <div className="space-y-6">
                  <GroupNotificationSender groupId={groupId} group={group} user={user} members={members} />
                  <GroupModerationPanel groupId={groupId} group={group} user={user} />
                </div>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          /* Non-member preview */
          <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="py-16 text-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-md`}>
                {initials}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Join {group.name}</h2>
              <p className="text-gray-600 text-sm mb-2">{group.description || 'A community of believers studying together.'}</p>
              <p className="text-gray-500 text-sm mb-6">{members.length} members · {group.privacy === 'public' ? 'Open to everyone' : 'By invitation'}</p>
              {user ? (
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2" disabled={joinMutation.isPending} onClick={() => joinMutation.mutate()}>
                  <LogIn className="w-4 h-4" />
                  {joinMutation.isPending ? 'Joining...' : 'Join this Group'}
                </Button>
              ) : (
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => base44.auth.redirectToLogin()}>
                  Sign in to Join
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}