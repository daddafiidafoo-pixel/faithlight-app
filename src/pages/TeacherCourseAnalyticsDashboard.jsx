import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, BookOpen, MessageSquare, Loader2 } from 'lucide-react';
import ProgressBar from '../components/course/ProgressBar';
import AnnouncementSender from '../components/teacher/AnnouncementSender';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function TeacherCourseAnalyticsDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!['teacher', 'admin'].includes(currentUser.user_role)) {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch teacher's courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: () => base44.entities.Course.filter({ teacher_id: user.id }),
    enabled: !!user,
  });

  // Fetch student enrollments for selected course
  const { data: courseProgressRecords = [], isLoading: progressLoading } = useQuery({
    queryKey: ['course-students', selectedCourse],
    queryFn: () =>
      base44.entities.UserCourseProgress.filter({ course_id: selectedCourse }),
    enabled: !!selectedCourse,
  });

  // Fetch announcements for selected course
  const { data: announcements = [] } = useQuery({
    queryKey: ['course-announcements', selectedCourse],
    queryFn: () =>
      base44.entities.CourseAnnouncement.filter({ course_id: selectedCourse }, '-created_date'),
    enabled: !!selectedCourse,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const currentCourse = courses.find((c) => c.id === selectedCourse);

  // Prepare analytics data
  const progressDistribution = [
    {
      name: 'Not Started',
      value: courseProgressRecords.filter((p) => p.status === 'not_started').length,
    },
    {
      name: 'In Progress',
      value: courseProgressRecords.filter((p) => p.status === 'in_progress').length,
    },
    {
      name: 'Completed',
      value: courseProgressRecords.filter((p) => p.status === 'completed').length,
    },
  ];

  const averageProgress =
    courseProgressRecords.length > 0
      ? Math.round(
          courseProgressRecords.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) /
            courseProgressRecords.length
        )
      : 0;

  const engagementData = courses.map((course) => ({
    name: course.title,
    students: courseProgressRecords.length,
    completed: courseProgressRecords.filter((p) => p.status === 'completed').length,
  }));

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Analytics</h1>
          <p className="text-gray-600">Track student progress and engagement</p>
        </div>

        {coursesLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No courses found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Course Selector */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Course
              </label>
              <Select value={selectedCourse || ''} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Students</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {courseProgressRecords.length}
                            </p>
                          </div>
                          <Users className="w-8 h-8 text-indigo-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Avg Progress</p>
                            <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {progressDistribution[2].value}
                            </p>
                          </div>
                          <MessageSquare className="w-8 h-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Progress Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Progress Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={progressDistribution}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {progressDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Course Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Course Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Title</p>
                          <p className="font-semibold text-gray-900">{currentCourse?.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Description</p>
                          <p className="text-sm text-gray-900">{currentCourse?.description}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold text-green-600">
                            {currentCourse?.published ? 'Published' : 'Draft'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Estimated Duration</p>
                          <p className="text-lg font-semibold">
                            {currentCourse?.estimated_hours || 'N/A'} hours
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students" className="space-y-6">
                  {progressLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
                    </div>
                  ) : courseProgressRecords.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No students enrolled yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {courseProgressRecords.map((progress) => (
                        <Card key={progress.id}>
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  Student ID: {progress.user_id.substring(0, 8)}...
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <span>{progress.lessons_completed}/{progress.total_lessons} lessons</span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      progress.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : progress.status === 'in_progress'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {progress.status}
                                  </span>
                                </div>
                                <div className="mt-3 space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Progress</span>
                                    <span className="font-semibold">{progress.progress_percentage}%</span>
                                  </div>
                                  <ProgressBar percentage={progress.progress_percentage} />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Announcements Tab */}
                <TabsContent value="announcements" className="space-y-6">
                  <AnnouncementSender
                    courseId={selectedCourse}
                    teacherId={user.id}
                  />

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Recent Announcements</h3>
                    {announcements.length === 0 ? (
                      <p className="text-sm text-gray-600 text-center py-6">
                        No announcements yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {announcements.map((announcement) => (
                          <Card key={announcement.id}>
                            <CardContent className="py-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900">
                                      {announcement.title}
                                    </p>
                                    {announcement.is_pinned && (
                                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
                                        Pinned
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                    <span className="px-2 py-1 bg-gray-100 rounded">
                                      {announcement.announcement_type}
                                    </span>
                                    <span>
                                      {new Date(announcement.sent_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </div>
    </div>
  );
}