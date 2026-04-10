import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield, Calendar, BookOpen, Users, TrendingUp, Eye } from 'lucide-react';

export default function AdminUserProfiles() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // Check admin access
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.user_role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    checkAuth();
  }, []);

  // Fetch all users
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    enabled: !!user && user.user_role === 'admin',
  });

  // Fetch user activity metrics
  const { data: userMetrics = {} } = useQuery({
    queryKey: ['user-metrics', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return {};

      const [progress, quizzes, lessons, groups] = await Promise.all([
        base44.entities.UserProgress.filter({ user_id: selectedUser.id }),
        base44.entities.QuizAttempt.filter({ user_id: selectedUser.id }),
        selectedUser.user_role === 'teacher'
          ? base44.entities.Lesson.filter({ teacher_id: selectedUser.id })
          : Promise.resolve([]),
        base44.entities.GroupMember.filter({ user_id: selectedUser.id }),
      ]).catch(() => [[], [], [], []]);

      return {
        lessonsCompleted: progress.filter(p => p.completed).length,
        quizzesTaken: quizzes.length,
        averageScore: quizzes.length > 0
          ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
          : 0,
        lessonsCreated: lessons.length,
        groupMemberships: groups.length,
      };
    },
    enabled: !!selectedUser,
  });

  // Filter and search users
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.user_role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (!user || user.user_role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Unauthorized access</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">View and analyze user profiles and activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Role Filter */}
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="pastor">Pastor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>

                {/* User Count */}
                <p className="text-sm text-gray-600 text-center">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
                </p>

                {/* Users List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <p className="text-sm text-gray-500 text-center py-4">Loading users...</p>
                  ) : filteredUsers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No users found</p>
                  ) : (
                    filteredUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition ${
                          selectedUser?.id === u.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-900">{u.full_name}</p>
                        <p className="text-xs text-gray-600 truncate">{u.email}</p>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs">
                            {u.user_role || 'user'}
                          </Badge>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedUser ? (
              <>
                {/* Profile Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <img
                        src={selectedUser.avatar_url || 'https://via.placeholder.com/64'}
                        alt={selectedUser.full_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{selectedUser.full_name}</CardTitle>
                        <p className="text-gray-600">{selectedUser.email}</p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <Badge className="bg-indigo-100 text-indigo-800">
                            {selectedUser.user_role || 'user'}
                          </Badge>
                          {selectedUser.email_verified && (
                            <Badge className="bg-green-100 text-green-800">Verified</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="border-t pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-semibold">
                          {new Date(selectedUser.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-semibold">
                          {new Date(selectedUser.updated_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {selectedUser.bio && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Bio</p>
                        <p className="text-gray-900">{selectedUser.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Activity Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Activity & Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600">Lessons Completed</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {userMetrics.lessonsCompleted || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600">Quizzes Taken</p>
                        <p className="text-3xl font-bold text-green-600">
                          {userMetrics.quizzesTaken || 0}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-600">Average Score</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {userMetrics.averageScore || 0}%
                        </p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-gray-600">Group Memberships</p>
                        <p className="text-3xl font-bold text-orange-600">
                          {userMetrics.groupMemberships || 0}
                        </p>
                      </div>
                    </div>

                    {selectedUser.user_role === 'teacher' && (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-sm text-gray-600">Lessons Created</p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {userMetrics.lessonsCreated || 0}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Account Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">User ID:</span>
                      <p className="font-mono text-xs text-gray-900 break-all">{selectedUser.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="outline" className="ml-2">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Select a user to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}