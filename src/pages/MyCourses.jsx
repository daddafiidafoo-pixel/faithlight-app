import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff, Loader2, FileText, Sparkles } from 'lucide-react';

export default function MyCourses() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

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

  const { data: myCourses = [], isLoading } = useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: () => base44.entities.Course.filter({ teacher_id: user.id }),
    enabled: !!user
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['all-lessons', user?.id],
    queryFn: () => base44.entities.Lesson.filter({ teacher_id: user.id }),
    enabled: !!user
  });

  const deleteMutation = useMutation({
    mutationFn: (courseId) => base44.entities.Course.delete(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-courses']);
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ courseId, published }) => 
      base44.entities.Course.update(courseId, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-courses']);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const getLessonCount = (courseId) => {
    return allLessons.filter(l => l.course_id === courseId).length;
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courses & Lessons</h1>
            <p className="text-gray-600">Create and manage your teaching content</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('AILessonAssistant')}>
              <Button variant="outline" className="gap-2">
                <Sparkles className="w-5 h-5" />
                AI Assistant
              </Button>
            </Link>
            <Link to={createPageUrl('CreateLesson')}>
              <Button variant="outline" className="gap-2">
                <FileText className="w-5 h-5" />
                Create Lesson
              </Button>
            </Link>
            <Link to={createPageUrl('CourseBuilder')}>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Courses ({myCourses.length})</TabsTrigger>
            <TabsTrigger value="lessons">Lessons ({allLessons.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="m-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{myCourses.length}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Courses</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {myCourses.filter(c => c.published).length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Published</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
              </div>
            ) : myCourses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">You haven't created any courses yet</p>
                  <Link to={createPageUrl('CourseBuilder')}>
                    <Button>Create Your First Course</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map(course => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={course.published ? 'default' : 'outline'}>
                              {course.published ? (
                                <><Eye className="w-3 h-3 mr-1" />Published</>
                              ) : (
                                <><EyeOff className="w-3 h-3 mr-1" />Draft</>
                              )}
                            </Badge>
                            <Badge variant="outline">{course.difficulty}</Badge>
                          </div>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {course.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                            <span>{getLessonCount(course.id)} lessons</span>
                            {course.estimated_hours && <span>{course.estimated_hours}h</span>}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Link to={createPageUrl(`CourseBuilder?id=${course.id}`)} className="flex-1">
                        <Button variant="outline" className="w-full gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => togglePublishMutation.mutate({ 
                          courseId: course.id, 
                          published: !course.published 
                        })}
                      >
                        {course.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this course? This will not delete the lessons.')) {
                            deleteMutation.mutate(course.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="lessons" className="m-0">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
                  </div>
                ) : allLessons.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">You haven't created any lessons yet</p>
                    <Link to={createPageUrl('CreateLesson')}>
                      <Button>Create Your First Lesson</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allLessons.map(lesson => (
                      <div key={lesson.id} className="flex items-start justify-between gap-3 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{lesson.description || 'No description'}</p>
                          <div className="flex gap-2 flex-wrap mt-2">
                            <Badge variant="outline" className="text-xs">{lesson.content_type}</Badge>
                            {lesson.duration_minutes && (
                              <Badge variant="outline" className="text-xs">{lesson.duration_minutes}m</Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${lesson.status === 'draft' ? 'bg-yellow-50' : 'bg-green-50'}`}
                            >
                              {lesson.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}