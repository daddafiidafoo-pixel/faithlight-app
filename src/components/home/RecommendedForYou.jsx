import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, MessageSquare, Users, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function RecommendedForYou({ user }) {
  // Fetch user's quiz attempts to understand performance
  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['quiz-attempts', user?.id],
    queryFn: () => base44.entities.QuizAttempt.filter({ user_id: user.id }, '-created_date', 50).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  // Fetch user's progress
  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: () => base44.entities.UserProgress.filter({ user_id: user.id }).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  // Fetch all courses
  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.filter({ published: true }, '-created_date', 100).catch(() => []),
    retry: false,
  });

  // Fetch forum topics
  const { data: forumTopics = [] } = useQuery({
    queryKey: ['forum-topics-rec'],
    queryFn: () => base44.entities.ForumTopic.filter({ status: 'active' }, '-updated_date', 50).catch(() => []),
    retry: false,
  });

  // Fetch groups
  const { data: groups = [] } = useQuery({
    queryKey: ['groups-rec'],
    queryFn: () => base44.entities.Group.filter({ is_active: true }, '-created_date', 100).catch(() => []),
    retry: false,
  });

  // Fetch user's group memberships
  const { data: userGroups = [] } = useQuery({
    queryKey: ['user-groups-rec', user?.id],
    queryFn: () => base44.entities.GroupMember.filter({ user_id: user.id }).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  // Generate recommendations
  const recommendations = React.useMemo(() => {
    if (!user) return { courses: [], passages: [], topics: [], groups: [] };

    const userInterests = user.interests || [];
    const userGroupIds = userGroups.map(g => g.group_id);
    
    // Analyze quiz performance to identify weak areas
    const topicPerformance = {};
    quizAttempts.forEach(attempt => {
      if (attempt.answers) {
        attempt.answers.forEach(answer => {
          // Extract topics from incorrect answers (simplified)
          if (!answer.correct) {
            const topic = 'general'; // Would extract from question text in real impl
            topicPerformance[topic] = (topicPerformance[topic] || 0) + 1;
          }
        });
      }
    });

    // Recommend courses
    const recommendedCourses = allCourses
      .filter(course => {
        // Filter out completed courses
        const courseLessonsCompleted = userProgress.filter(p => 
          p.course_id === course.id && p.completed
        ).length;
        if (courseLessonsCompleted > 0) return false;

        // Match interests
        const title = course.title.toLowerCase();
        const desc = (course.description || '').toLowerCase();
        return userInterests.some(interest => 
          title.includes(interest.toLowerCase()) || 
          desc.includes(interest.toLowerCase())
        );
      })
      .slice(0, 3);

    // Recommend Bible passages based on weak quiz areas or interests
    const passages = [
      { ref: 'Romans 8:28-39', topic: 'Faith', reason: 'Based on your interests' },
      { ref: 'Psalm 23', topic: 'Comfort', reason: 'Popular passage' },
      { ref: 'John 3:16-21', topic: 'Salvation', reason: 'Foundational teaching' }
    ].slice(0, 3);

    // Recommend forum topics
    const recommendedTopics = forumTopics
      .filter(topic => {
        const content = `${topic.title} ${topic.content}`.toLowerCase();
        return userInterests.some(interest => 
          content.includes(interest.toLowerCase())
        );
      })
      .sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0))
      .slice(0, 3);

    // Recommend groups
    const recommendedGroups = groups
      .filter(group => {
        if (userGroupIds.includes(group.id)) return false;
        const matchScore = (group.interests || []).filter(gi =>
          userInterests.some(ui => ui.toLowerCase() === gi.toLowerCase())
        ).length;
        return matchScore > 0;
      })
      .sort((a, b) => (b.member_count || 0) - (a.member_count || 0))
      .slice(0, 3);

    return {
      courses: recommendedCourses,
      passages,
      topics: recommendedTopics,
      groups: recommendedGroups
    };
  }, [user, allCourses, forumTopics, groups, userProgress, quizAttempts, userGroups]);

  const hasRecommendations = 
    recommendations.courses.length > 0 || 
    recommendations.passages.length > 0 ||
    recommendations.topics.length > 0 ||
    recommendations.groups.length > 0;

  if (!user || !hasRecommendations) return null;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Recommended for You</h2>
            <p className="text-gray-600">Based on your interests and learning journey</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommended Courses */}
          {recommendations.courses.length > 0 && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Courses You Might Like
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.courses.map(course => (
                  <Link key={course.id} to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {course.language_code?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommended Bible Passages */}
          {recommendations.passages.length > 0 && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  Explore These Passages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.passages.map((passage, idx) => (
                  <Link key={idx} to={createPageUrl('BibleReader')}>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{passage.ref}</h4>
                          <p className="text-sm text-gray-600">{passage.topic}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {passage.reason}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommended Forum Topics */}
          {recommendations.topics.length > 0 && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  Discussions You'd Enjoy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.topics.map(topic => (
                  <Link key={topic.id} to={createPageUrl(`ForumTopic?id=${topic.id}`)}>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h4 className="font-semibold text-gray-900 mb-1">{topic.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1">{topic.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                        <span>{topic.replies_count || 0} replies</span>
                        <span>•</span>
                        <span>{topic.views_count || 0} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommended Groups */}
          {recommendations.groups.length > 0 && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Groups to Join
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.groups.map(group => (
                  <Link key={group.id} to={createPageUrl(`GroupDetail?id=${group.id}`)}>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h4 className="font-semibold text-gray-900 mb-1">{group.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {group.member_count || 0} members
                        </Badge>
                        {(group.interests || []).slice(0, 2).map(interest => (
                          <Badge key={interest} className="bg-blue-100 text-blue-800 text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}