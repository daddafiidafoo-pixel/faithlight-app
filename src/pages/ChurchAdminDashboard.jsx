import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, BookOpen, TrendingUp, Settings, Plus, Download, Eye, BarChart3, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ChurchAdminDashboard() {
  const [user, setUser] = useState(null);
  const [church, setChurch] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Check if user is a church admin
        if (currentUser.user_role !== 'church_admin' && currentUser.user_role !== 'admin') {
          alert('Access denied. Church admin role required.');
          window.location.href = '/';
        }
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: churches = [] } = useQuery({
    queryKey: ['churches', user?.id],
    queryFn: () => base44.entities.Church.filter({ admin_user_id: user?.id }),
    enabled: !!user,
  });

  useEffect(() => {
    if (churches.length > 0) {
      setChurch(churches[0]);
    }
  }, [churches]);

  const { data: groups = [] } = useQuery({
    queryKey: ['church-groups', church?.id],
    queryFn: () => base44.entities.ChurchGroup.filter({ church_id: church?.id }),
    enabled: !!church,
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress'],
    queryFn: () => base44.entities.UserProgress.filter({}),
    enabled: !!church,
  });

  const { data: courseEnrollments = [] } = useQuery({
    queryKey: ['course-enrollments'],
    queryFn: () => base44.entities.CourseEnrollment.filter({}),
    enabled: !!church,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => base44.entities.Lesson.filter({ status: 'approved' }),
    enabled: !!church,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ published: true }),
    enabled: !!church,
  });

  const { data: teachingPrograms = [] } = useQuery({
    queryKey: ['teaching-programs', user?.id],
    queryFn: () => base44.entities.TeachingProgram.filter({ teacher_id: user?.id }),
    enabled: !!user,
  });

  // Calculate metrics
  const completedLessons = userProgress.filter(p => p.completed).length;
  const engagementRate = userProgress.length > 0 
    ? Math.round((completedLessons / userProgress.length) * 100) 
    : 0;
  const averageQuizScore = 78; // Placeholder - would calculate from quiz attempts

  const handleExportReport = () => {
    const reportData = {
      church: church.name,
      country: church.country,
      date: new Date().toLocaleDateString(),
      metrics: {
        activeMembers: church.active_learners,
        activeGroups: groups.length,
        lessonsCompleted: completedLessons,
        engagementRate: engagementRate,
        averageQuizScore: averageQuizScore
      },
      groups: groups.map(g => ({
        name: g.name,
        members: g.members_count,
        lessonsAssigned: g.assigned_lesson_ids?.length || 0
      })),
      teachingActivity: teachingPrograms.map(tp => ({
        title: tp.title,
        status: tp.status,
        createdDate: new Date(tp.created_date).toLocaleDateString()
      }))
    };

    const csvContent = [
      ['Church Report - ' + church.name],
      ['Generated: ' + new Date().toLocaleDateString()],
      [],
      ['METRICS'],
      ['Active Members', church.active_learners],
      ['Active Groups', groups.length],
      ['Lessons Completed', completedLessons],
      ['Engagement Rate', engagementRate + '%'],
      ['Average Quiz Score', averageQuizScore + '%'],
      [],
      ['GROUPS'],
      ['Group Name', 'Members', 'Lessons Assigned'],
      ...groups.map(g => [g.name, g.members_count, g.assigned_lesson_ids?.length || 0]),
      [],
      ['TEACHING ACTIVITY'],
      ['Program', 'Status', 'Created'],
      ...teachingPrograms.map(tp => [tp.title, tp.status, new Date(tp.created_date).toLocaleDateString()])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${church.name}-report-${new Date().getTime()}.csv`;
    a.click();
  };

  if (!user || !church) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{church.name} Admin Dashboard</h1>
          <p className="text-gray-600">Manage groups, assignments, and track learner progress</p>
        </div>

        {/* Overview Cards */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Members</p>
                    <p className="text-3xl font-bold text-gray-900">{church.active_learners || 0}</p>
                  </div>
                  <Users className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Groups</p>
                    <p className="text-3xl font-bold text-gray-900">{groups.length}</p>
                  </div>
                  <Users className="w-10 h-10 text-indigo-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Lessons Completed</p>
                    <p className="text-3xl font-bold text-gray-900">{completedLessons}</p>
                  </div>
                  <BookOpen className="w-10 h-10 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Engagement Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{engagementRate}%</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            {user.user_role === 'admin' && <TabsTrigger value="billing">Billing</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Church Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Church Name</label>
                    <p className="text-gray-900 font-medium mt-1">{church.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <p className="text-gray-900 font-medium mt-1">{church.country}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Person</label>
                    <p className="text-gray-900 font-medium mt-1">{church.contact_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Badge className="mt-1">{church.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Groups & Classes</h2>
              <CreateGroupDialog church={church} onGroupCreated={() => queryClient.invalidateQueries(['church-groups'])} />
            </div>

            {groups.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No groups yet. Create your first group!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {groups.map(group => (
                  <Card key={group.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>{group.members_count} members</span>
                            <span>•</span>
                            <span>{group.assigned_lesson_ids?.length || 0} lessons assigned</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Assign
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <CardTitle>Teachers & Leaders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Teacher management and activity tracking (coming soon)</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-3 opacity-50" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">{engagementRate}%</p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-3 opacity-50" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">{averageQuizScore}%</p>
                  <p className="text-sm text-gray-600">Average Quiz Score</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-3 opacity-50" />
                  <p className="text-2xl font-bold text-gray-900 mb-1">{completedLessons}</p>
                  <p className="text-sm text-gray-600">Lessons Completed</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Monthly Report
                  </CardTitle>
                  <Button size="sm" onClick={handleExportReport} className="gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Groups Performance</h3>
                  <div className="space-y-2">
                    {groups.slice(0, 5).map(group => (
                      <div key={group.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{group.name}</p>
                          <p className="text-sm text-gray-600">{group.members_count} members</p>
                        </div>
                        <Badge>{group.assigned_lesson_ids?.length || 0} lessons</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab (Admin Only) */}
          {user.user_role === 'admin' && (
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Plan</label>
                      <p className="text-gray-900 font-medium mt-1">Church Partnership</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Active Seats</label>
                      <p className="text-gray-900 font-medium mt-1">{church.active_learners || 0} / Unlimited</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function CreateGroupDialog({ church, onGroupCreated }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'custom'
  });
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.ChurchGroup.create({
        ...data,
        church_id: church.id,
        leader_id: '', // Would be set to current user in real implementation
        members_count: 0
      }),
    onSuccess: () => {
      setOpen(false);
      setFormData({ name: '', description: '', group_type: 'custom' });
      queryClient.invalidateQueries(['church-groups']);
      onGroupCreated();
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Group Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="E.g., Youth Bible Study"
              className="mt-2"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this group for?"
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Group Type</Label>
            <Select value={formData.group_type} onValueChange={(val) => setFormData({ ...formData, group_type: val })}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youth">Youth</SelectItem>
                <SelectItem value="bible_study">Bible Study</SelectItem>
                <SelectItem value="leaders">Leaders</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createGroupMutation.mutate(formData)}>
              Create Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}