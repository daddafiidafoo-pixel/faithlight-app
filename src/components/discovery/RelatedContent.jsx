import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RelatedContent({ currentItem, type = 'course' }) {
  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.filter({ published: true }).catch(() => [])
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['all-lessons'],
    queryFn: () => base44.entities.Lesson.filter({ status: 'approved' }).catch(() => [])
  });

  const { data: courseTags = [] } = useQuery({
    queryKey: ['course-tags-related'],
    queryFn: () => base44.entities.CourseTag.list().catch(() => [])
  });

  // Find related content using multiple strategies
  const getRelatedItems = () => {
    if (!currentItem) return [];

    const related = [];
    const items = type === 'course' ? allCourses : allLessons;
    const currentItemId = currentItem.id;

    // Get tags for current item
    const currentTags = courseTags
      .filter(ct => type === 'course' ? ct.course_id === currentItemId : ct.lesson_id === currentItemId)
      .map(ct => ct.tag_name);

    // 1. Items with matching tags (highest priority)
    if (currentTags.length > 0) {
      const tagMatches = items.filter(item => {
        if (item.id === currentItemId) return false;
        const itemTags = courseTags
          .filter(ct => type === 'course' ? ct.course_id === item.id : ct.lesson_id === item.id)
          .map(ct => ct.tag_name);
        return itemTags.some(tag => currentTags.includes(tag));
      }).slice(0, 3);
      related.push(...tagMatches);
    }

    // 2. Same category
    const sameCategory = items.filter(item => 
      item.id !== currentItemId &&
      item.category === currentItem.category &&
      !related.find(r => r.id === item.id)
    ).slice(0, 2);
    related.push(...sameCategory);

    // 3. Same difficulty level
    const sameDifficulty = items.filter(item => 
      item.id !== currentItemId &&
      item.difficulty_level === currentItem.difficulty_level &&
      !related.find(r => r.id === item.id)
    ).slice(0, 2);
    related.push(...sameDifficulty);

    // 4. Next level difficulty (progression)
    const difficultyOrder = { beginner: 'intermediate', intermediate: 'advanced' };
    const nextLevel = difficultyOrder[currentItem.difficulty_level];
    if (nextLevel) {
      const nextLevelItems = items.filter(item => 
        item.difficulty_level === nextLevel &&
        item.category === currentItem.category &&
        !related.find(r => r.id === item.id)
      ).slice(0, 1);
      related.push(...nextLevelItems);
    }

    return related.slice(0, 6);
  };

  const relatedItems = getRelatedItems();

  if (relatedItems.length === 0) return null;

  return (
    <Card className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Sparkles className="w-5 h-5" />
          You Might Also Like
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg p-4 border border-indigo-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  {type === 'course' ? (
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Zap className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                    {item.title}
                  </h4>
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                {item.difficulty_level && (
                  <Badge className={
                    item.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                    item.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {item.difficulty_level}
                  </Badge>
                )}
                <Link to={createPageUrl(type === 'course' ? 'CourseDetail' : 'LessonView') + `?id=${item.id}`}>
                  <Button size="sm" variant="ghost" className="gap-1">
                    View <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}