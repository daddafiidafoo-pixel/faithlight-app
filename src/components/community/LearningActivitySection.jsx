import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle2, Clock, TrendingUp, FileText, ThumbsUp } from 'lucide-react';

function ProgressBar({ value, color = 'bg-indigo-500' }) {
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, value || 0)}%` }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Completed', cls: 'bg-green-100 text-green-700' },
    in_progress: { label: 'In Progress', cls: 'bg-indigo-100 text-indigo-700' },
    not_started: { label: 'Not Started', cls: 'bg-gray-100 text-gray-500' },
  };
  const s = map[status] || map.not_started;
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>;
}

export default function LearningActivitySection({ userId }) {
  const { data: courseProgress = [] } = useQuery({
    queryKey: ['profile-course-progress', userId],
    queryFn: () => base44.entities.UserCourseProgress.filter({ user_id: userId }, '-updated_date', 20).catch(() => []),
    enabled: !!userId,
  });

  const { data: studyPlans = [] } = useQuery({
    queryKey: ['profile-study-plans', userId],
    queryFn: () => base44.entities.StudyPlan.filter({ user_id: userId }, '-updated_date', 10).catch(() => []),
    enabled: !!userId,
  });

  const { data: communityPosts = [] } = useQuery({
    queryKey: ['profile-community-posts', userId],
    queryFn: () => base44.entities.CommunityPost.filter({ user_id: userId, status: 'published' }, '-created_date', 10).catch(() => []),
    enabled: !!userId,
  });

  const completed = courseProgress.filter(p => p.status === 'completed').length;
  const inProgress = courseProgress.filter(p => p.status === 'in_progress').length;
  const totalLikes = communityPosts.reduce((sum, p) => sum + (p.like_count || 0), 0);

  const progressColor = (pct) => {
    if (pct >= 100) return 'bg-green-500';
    if (pct >= 50) return 'bg-indigo-500';
    return 'bg-amber-400';
  };

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: CheckCircle2, label: 'Completed', value: completed, color: 'text-green-600', bg: 'bg-green-50' },
          { icon: Clock, label: 'In Progress', value: inProgress, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { icon: FileText, label: 'Posts', value: communityPosts.length, color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: ThumbsUp, label: 'Likes Received', value: totalLikes, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-2`}>
            <s.icon className={`w-4 h-4 ${s.color} flex-shrink-0`} />
            <div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Course progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" /> Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courseProgress.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No course activity yet.</p>
          ) : (
            <div className="space-y-4">
              {courseProgress.slice(0, 6).map(p => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700 truncate max-w-[60%]">{p.course_id || 'Course'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">{p.progress_percentage || 0}%</span>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                  <ProgressBar value={p.progress_percentage} color={progressColor(p.progress_percentage)} />
                </div>
              ))}
              {courseProgress.length > 6 && (
                <p className="text-xs text-gray-400 text-center">+{courseProgress.length - 6} more</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Plans */}
      {studyPlans.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" /> Study Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studyPlans.slice(0, 4).map(plan => (
                <div key={plan.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm text-gray-800 font-medium truncate">{plan.title}</p>
                    <ProgressBar value={plan.progress_percentage} color={progressColor(plan.progress_percentage)} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs text-gray-400">{plan.progress_percentage || 0}%</span>
                    <Badge variant="outline" className="text-xs capitalize">{plan.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community Posts */}
      {communityPosts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" /> Community Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {communityPosts.slice(0, 4).map(post => (
                <div key={post.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <p className="text-sm text-gray-700 truncate flex-1 mr-3">{post.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400 flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" />{post.like_count || 0}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.category === 'Teaching' ? 'bg-indigo-100 text-indigo-700' :
                      post.category === 'Devotional' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{post.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}