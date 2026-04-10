import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, Zap } from 'lucide-react';
import LearningPathCard from '../components/learning/LearningPathCard';

export default function LearningPathsBrowser() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        console.log('Not logged in');
      }
    };
    fetchUser();
  }, []);

  const { data: allPaths = [], isLoading: pathsLoading } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: async () => {
      try {
        const paths = await base44.entities.LearningPath.filter({ is_published: true });
        return paths || [];
      } catch (err) {
        console.warn('Failed to load learning paths:', err);
        return [];
      }
    },
  });

  const { data: userEnrollments = [] } = useQuery({
    queryKey: ['user-path-enrollments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const enrollments = await base44.entities.UserLearningPath.filter({ user_id: user.id });
        return enrollments || [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const { data: pathCourseMaps = [] } = useQuery({
    queryKey: ['path-courses'],
    queryFn: async () => {
      try {
        const maps = await base44.entities.PathCourse.list();
        return maps || [];
      } catch (err) {
        return [];
      }
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async (pathId) => {
      const path = allPaths.find(p => p.id === pathId);
      const courseCount = pathCourseMaps.filter(m => m.path_id === pathId).length;

      await base44.entities.UserLearningPath.create({
        user_id: user.id,
        path_id: pathId,
        status: 'not_started',
        progress_percentage: 0,
        total_courses: courseCount,
        courses_completed: 0,
        enrolled_at: new Date().toISOString(),
      });

      queryClient.invalidateQueries({ queryKey: ['user-path-enrollments', user.id] });
    },
  });

  const filteredPaths = allPaths.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || path.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const enrolledPaths = filteredPaths.filter(p => 
    userEnrollments.some(e => e.path_id === p.id && e.status !== 'completed')
  );

  const availablePaths = filteredPaths.filter(p =>
    !userEnrollments.some(e => e.path_id === p.id)
  );

  if (pathsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading learning paths...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Learning Paths</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Structured learning journeys designed to build your skills progressively through curated courses.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search paths..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
                  <Button
                    key={level}
                    variant={selectedDifficulty === level ? 'default' : 'outline'}
                    onClick={() => setSelectedDifficulty(level)}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {user && userEnrollments.length > 0 && (
          <Tabs defaultValue="enrolled" className="space-y-8">
            <TabsList className="grid w-full sm:w-96 grid-cols-2">
              <TabsTrigger value="enrolled">
                My Paths ({enrolledPaths.length})
              </TabsTrigger>
              <TabsTrigger value="discover">
                Discover ({availablePaths.length})
              </TabsTrigger>
            </TabsList>

            {/* Enrolled Paths */}
            <TabsContent value="enrolled" className="space-y-8">
              {enrolledPaths.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600 mb-4">No active learning paths yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledPaths.map(path => {
                    const enrollment = userEnrollments.find(e => e.path_id === path.id);
                    const courseCount = pathCourseMaps.filter(m => m.path_id === path.id).length;
                    return (
                      <LearningPathCard
                        key={path.id}
                        path={path}
                        userProgress={enrollment}
                        courseCount={courseCount}
                        isEnrolled={true}
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Available Paths */}
            <TabsContent value="discover" className="space-y-8">
              {availablePaths.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">No paths matching your search.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availablePaths.map(path => {
                    const courseCount = pathCourseMaps.filter(m => m.path_id === path.id).length;
                    return (
                      <LearningPathCard
                        key={path.id}
                        path={path}
                        courseCount={courseCount}
                        onEnroll={(pathId) => enrollMutation.mutate(pathId)}
                        isEnrolled={false}
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!user && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Sign in to enroll in learning paths</p>
            <Button onClick={() => base44.auth.redirectToLogin()}>
              Sign In
            </Button>
          </div>
        )}

        {user && userEnrollments.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPaths.map(path => {
              const courseCount = pathCourseMaps.filter(m => m.path_id === path.id).length;
              return (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  courseCount={courseCount}
                  onEnroll={(pathId) => enrollMutation.mutate(pathId)}
                  isEnrolled={false}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}