import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Award, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function LearningPaths() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: paths = [] } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: () => base44.entities.LearningPath.list('order'),
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['training-tracks'],
    queryFn: () => base44.entities.TrainingTrack.list('order'),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['training-courses'],
    queryFn: () => base44.entities.TrainingCourse.list(),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['training-lessons'],
    queryFn: () => base44.entities.TrainingLesson.list(),
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: () => base44.entities.UserTrainingProgress.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const { data: userPaths = [] } = useQuery({
    queryKey: ['user-paths', user?.id],
    queryFn: () => base44.entities.UserLearningPath.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const startPathMutation = useMutation({
    mutationFn: async (pathId) => {
      return await base44.entities.UserLearningPath.create({
        user_id: user.id,
        path_id: pathId,
        started_at: new Date().toISOString(),
        status: 'in_progress',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-paths']);
      toast.success('Learning path started!');
    },
  });

  const getPathProgress = (path) => {
    const pathTracks = tracks.filter(t => path.track_ids.includes(t.id));
    const pathCourses = courses.filter(c => pathTracks.some(t => t.id === c.track_id));
    const pathLessons = lessons.filter(l => pathCourses.some(c => c.id === l.course_id));
    
    const completedLessons = pathLessons.filter(l => 
      userProgress.some(p => p.lesson_id === l.id && p.completed)
    ).length;
    
    return pathLessons.length > 0 ? (completedLessons / pathLessons.length) * 100 : 0;
  };

  const isPathStarted = (pathId) => {
    return userPaths.some(up => up.path_id === pathId);
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  if (!user) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Learning Paths</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Structured journeys to grow in faith and leadership. Choose a path and track your progress.
          </p>
        </div>

        {/* My Active Paths */}
        {userPaths.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Active Paths</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {userPaths.map(userPath => {
                const path = paths.find(p => p.id === userPath.path_id);
                if (!path) return null;
                
                const progress = getPathProgress(path);
                const pathTracks = tracks.filter(t => path.track_ids.includes(t.id));
                
                return (
                  <Card key={userPath.id} className="bg-white border-2 border-indigo-200">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-4xl">{path.icon}</div>
                        <Badge className={difficultyColors[path.difficulty]}>
                          {path.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">{path.name}</CardTitle>
                      <CardDescription>{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Overall Progress</span>
                          <span className="font-semibold text-indigo-600">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{pathTracks.length} tracks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{path.estimated_months} months</span>
                        </div>
                      </div>

                      <Link to="/TrainingHome">
                        <Button className="w-full">
                          Continue Learning
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Learning Paths */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Learning Paths</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map(path => {
              const started = isPathStarted(path.id);
              const progress = getPathProgress(path);
              const pathTracks = tracks.filter(t => path.track_ids.includes(t.id));
              const pathCourses = courses.filter(c => pathTracks.some(t => t.id === c.track_id));
              
              return (
                <Card 
                  key={path.id} 
                  className={`bg-white hover:shadow-xl transition-all ${started ? 'border-2 border-indigo-300' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-4xl">{path.icon}</div>
                      <Badge className={difficultyColors[path.difficulty]}>
                        {path.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{path.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{path.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{pathCourses.length} courses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{path.estimated_months} months</span>
                      </div>
                    </div>

                    {started ? (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-indigo-600">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 mb-3" />
                        <Link to="/TrainingHome">
                          <Button variant="outline" className="w-full">
                            View Progress
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => startPathMutation.mutate(path.id)}
                        disabled={startPathMutation.isPending}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        Start Path
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {paths.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No learning paths available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}