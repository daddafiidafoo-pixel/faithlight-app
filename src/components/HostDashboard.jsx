import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Link, Hash, Users, BookOpen, TrendingUp, Play, Calendar, Settings, InfoIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AccessibleSelect from '@/components/ui/accessible-select';
import { toast } from 'sonner';
import { checkPermission } from '@/components/permissions';

export default function HostDashboard({ groupId }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [inviteLinkDialogOpen, setInviteLinkDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    session_title: '',
    session_type: 'training',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const groups = await base44.entities.Group.filter({ id: groupId });
      return groups[0];
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.GroupMember.filter({ group_id: groupId, status: 'active' }),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['group-sessions', groupId],
    queryFn: () => base44.entities.LiveSession.filter({ group_id: groupId }),
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const permission = checkPermission('SESSION_CREATE', user, {
        group_role: 'OWNER',
      });

      if (!permission.allowed) {
        throw new Error(permission.reason);
      }

      return await base44.entities.LiveSession.create({
        group_id: groupId,
        host_user_id: user.id,
        host_name: user.full_name,
        session_title: newSession.session_title,
        session_type: newSession.session_type,
        status: 'scheduled',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-sessions', groupId]);
      toast.success('Session created!');
      setSessionDialogOpen(false);
      setNewSession({ session_title: '', session_type: 'training' });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const userGroupRole = members.find(m => m.user_id === user?.id)?.member_role;
  const canManageGroup = user && user.id === group?.owner_user_id;

  if (!user || !group) return <div className="p-6 text-center">Loading...</div>;

  const HelpText = ({ text, note }) => (
    <div className="mt-2">
      <p className="text-sm text-gray-600">{text}</p>
      {note && <p className="text-xs text-gray-500 mt-1 italic">{note}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Host Dashboard</h2>
        <p className="text-gray-600 mt-1">Manage your group, training, and live audio sessions.</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Invite Link */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5 text-indigo-600" />
              Create Invite Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HelpText 
              text="Share this link to let members join your group."
              note="Members must verify their email before joining."
            />
            <Button 
              onClick={() => setInviteLinkDialogOpen(true)}
              className="w-full"
              variant="outline"
            >
              Generate Link
            </Button>
          </CardContent>
        </Card>

        {/* Create Invite Code */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-purple-600" />
              Create Invite Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HelpText 
              text="Use a short code for offline invitations."
              note="Codes can expire for security."
            />
            {group.invite_code && (
              <div className="flex gap-2">
                <Input value={group.invite_code} readOnly className="font-mono" />
                <Button 
                  onClick={() => copyToClipboard(group.invite_code)}
                  variant="outline"
                  size="sm"
                >
                  Copy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approve Requests */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Approve Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HelpText text="Review and approve members who request to join." />
            <Button className="w-full" variant="outline">
              View Requests
            </Button>
          </CardContent>
        </Card>

        {/* Assign Training */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Assign Training
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HelpText text="Assign courses and track progress for your members." />
            <Button className="w-full" variant="outline">
              Assign Courses
            </Button>
          </CardContent>
        </Card>

        {/* View Progress */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              View Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HelpText text="See lesson completion, quiz scores, and who needs help." />
            <Button className="w-full" variant="outline">
              View Progress
            </Button>
          </CardContent>
        </Card>

        {/* Start Live Audio */}
        <Card className="hover:shadow-lg transition-shadow border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-red-600" />
              Start Live Audio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HelpText 
              text="Start a listen-only session for up to 500 people."
              note="Members join muted. They can request to speak."
            />
            <Button 
              onClick={() => setSessionDialogOpen(true)}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Start Now
            </Button>
          </CardContent>
        </Card>

        {/* Schedule Session */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Schedule Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HelpText text="Plan a session for a future date and notify members." />
            <Button className="w-full" variant="outline">
              Schedule
            </Button>
          </CardContent>
        </Card>

        {/* Group Settings */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Group Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <HelpText text="Edit group name, join settings, and host permissions." />
            <Button className="w-full" variant="outline">
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Group Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Members</p>
            <p className="text-3xl font-bold text-indigo-600">{members.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Live Sessions</p>
            <p className="text-3xl font-bold text-red-600">{sessions.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge className="mt-2">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Start Session Dialog */}
      <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Live Audio Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Session Title</Label>
              <Input
                value={newSession.session_title}
                onChange={(e) => setNewSession({ ...newSession, session_title: e.target.value })}
                placeholder="e.g., Prayer Meeting, Leadership Training"
              />
            </div>

            <div>
              <Label>Session Type</Label>
              <AccessibleSelect
                value={newSession.session_type}
                onChange={(e) => setNewSession({ ...newSession, session_type: e.target.value })}
                options={[
                  { value: 'training', label: 'Training' },
                  { value: 'worship', label: 'Worship' },
                  { value: 'prayer', label: 'Prayer' },
                  { value: 'discussion', label: 'Discussion' }
                ]}
                placeholder="Select session type"
              />
            </div>

            <Button 
              onClick={() => createSessionMutation.mutate()}
              disabled={createSessionMutation.isPending || !newSession.session_title}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Start Live Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Link Dialog */}
      <Dialog open={inviteLinkDialogOpen} onOpenChange={setInviteLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Link</DialogTitle>
          </DialogHeader>
          {group.invite_link_token && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Share this link with anyone to let them join your group:
              </p>
              <div className="flex gap-2">
                <Input 
                  value={`${window.location.origin}/join/${group.invite_link_token}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={() => copyToClipboard(`${window.location.origin}/join/${group.invite_link_token}`)}
                  variant="outline"
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Members must verify their email before they can join using this link.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}