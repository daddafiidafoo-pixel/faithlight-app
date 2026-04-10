import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Copy, Share2, Search, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function GroupsHub() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    group_name: '',
    group_type: 'ministry_team',
    description: '',
    join_policy: 'invite_only',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: allGroups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.Group.filter({ is_active: true }),
  });

  const { data: myGroupMemberships = [] } = useQuery({
    queryKey: ['my-group-memberships', user?.id],
    queryFn: () => base44.entities.GroupMember.filter({ user_id: user.id, status: 'active' }),
    enabled: !!user,
  });

  const { data: myOwnedGroups = [] } = useQuery({
    queryKey: ['my-owned-groups', user?.id],
    queryFn: () => base44.entities.Group.filter({ owner_user_id: user.id }),
    enabled: !!user,
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const inviteToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const group = await base44.entities.Group.create({
        owner_user_id: user.id,
        owner_name: user.full_name,
        group_name: newGroupData.group_name,
        group_type: newGroupData.group_type,
        description: newGroupData.description,
        join_policy: newGroupData.join_policy,
        invite_code: newGroupData.join_policy === 'code' ? inviteCode : null,
        invite_link_token: newGroupData.join_policy === 'link' ? inviteToken : null,
        is_active: true,
      });

      // Add owner as group member
      await base44.entities.GroupMember.create({
        group_id: group.id,
        user_id: user.id,
        user_name: user.full_name,
        member_role: 'owner',
        status: 'active',
      });

      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-owned-groups']);
      toast.success('Group created!');
      setCreateDialogOpen(false);
      setNewGroupData({
        group_name: '',
        group_type: 'ministry_team',
        description: '',
        join_policy: 'invite_only',
      });
    },
  });

  const myGroupIds = myGroupMemberships.map(m => m.group_id);
  const browseGroups = allGroups.filter(g => !myGroupIds.includes(g.id) && g.join_policy !== 'invite_only');

  const filteredBrowseGroups = browseGroups.filter(g => {
    const searchLower = searchTerm.toLowerCase();
    return g.group_name.toLowerCase().includes(searchLower) || 
           g.description?.toLowerCase().includes(searchLower);
  });

  const isVerifiedLeader = user?.role && ['pastor', 'trainer', 'ambassador'].includes(user.role);
  const isEmailVerified = user?.email_verified;

  if (!user) return <div className="p-12 text-center">Loading...</div>;

  if (!isEmailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-2xl mx-auto mt-12">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-orange-900 mb-2">Verify Your Email</h2>
                  <p className="text-orange-800">You must verify your email to access groups and training. Check your inbox for a verification link.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Groups</h1>
            <p className="text-gray-600 mt-2">Join communities, train together, and grow spiritually</p>
          </div>
          {!isVerifiedLeader && (
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Only verified leaders can create groups</p>
              <Button variant="outline">
                <Lock className="w-4 h-4 mr-2" />
                Apply for Verification
              </Button>
            </div>
          )}
          {isVerifiedLeader && (
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Group
            </Button>
          )}
        </div>

        <Tabs defaultValue="my-groups" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-groups">
              My Groups {myGroupIds.length > 0 && `(${myGroupIds.length})`}
            </TabsTrigger>
            <TabsTrigger value="owned">
              Owned Groups {myOwnedGroups.length > 0 && `(${myOwnedGroups.length})`}
            </TabsTrigger>
            <TabsTrigger value="browse">Browse Groups</TabsTrigger>
          </TabsList>

          {/* My Groups */}
          <TabsContent value="my-groups">
            <div className="space-y-4">
              {myGroupIds.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    You're not in any groups yet. Browse or join one!
                  </CardContent>
                </Card>
              ) : (
                allGroups
                  .filter(g => myGroupIds.includes(g.id))
                  .map(group => (
                    <GroupCard key={group.id} group={group} userRole={
                      myGroupMemberships.find(m => m.group_id === group.id)?.member_role
                    } />
                  ))
              )}
            </div>
          </TabsContent>

          {/* Owned Groups */}
          <TabsContent value="owned">
            <div className="space-y-4">
              {myOwnedGroups.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    You haven't created any groups yet. Create one to start leading!
                  </CardContent>
                </Card>
              ) : (
                myOwnedGroups.map(group => (
                  <GroupCard key={group.id} group={group} isOwner={true} />
                ))
              )}
            </div>
          </TabsContent>

          {/* Browse Groups */}
          <TabsContent value="browse">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {filteredBrowseGroups.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No public groups found
                  </CardContent>
                </Card>
              ) : (
                filteredBrowseGroups.map(group => (
                  <GroupCard key={group.id} group={group} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Group Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Group Name</Label>
                <Input
                  value={newGroupData.group_name}
                  onChange={(e) => setNewGroupData({ ...newGroupData, group_name: e.target.value })}
                  placeholder="e.g., Youth Ministry Training"
                />
              </div>

              <div>
                <Label>Group Type</Label>
                <Select
                  value={newGroupData.group_type}
                  onValueChange={(val) => setNewGroupData({ ...newGroupData, group_type: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="church_group">Church Group</SelectItem>
                    <SelectItem value="ministry_team">Ministry Team</SelectItem>
                    <SelectItem value="training_cohort">Training Cohort</SelectItem>
                    <SelectItem value="youth_group">Youth Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={newGroupData.description}
                  onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
                  placeholder="What's this group about?"
                />
              </div>

              <div>
                <Label>Join Policy</Label>
                <Select
                  value={newGroupData.join_policy}
                  onValueChange={(val) => setNewGroupData({ ...newGroupData, join_policy: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invite_only">Invite Only</SelectItem>
                    <SelectItem value="code">Join Code</SelectItem>
                    <SelectItem value="link">Invite Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => createGroupMutation.mutate()}
                disabled={createGroupMutation.isPending || !newGroupData.group_name}
                className="w-full"
              >
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function GroupCard({ group, isOwner, userRole }) {
  const getGroupTypeLabel = (type) => {
    const labels = {
      church_group: 'Church Group',
      ministry_team: 'Ministry Team',
      training_cohort: 'Training Cohort',
      youth_group: 'Youth Group',
    };
    return labels[type] || type;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{group.group_name}</h3>
            <Badge className="mt-2">{getGroupTypeLabel(group.group_type)}</Badge>
            {group.description && (
              <p className="text-gray-600 mt-3">{group.description}</p>
            )}
          </div>
          <Button variant="outline">Join</Button>
        </div>

        <div className="flex items-center gap-6 pt-4 border-t text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{group.member_count || 0} members</span>
          </div>
          {group.owner_name && (
            <div className="flex items-center gap-2">
              <span>Led by {group.owner_name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}