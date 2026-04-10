import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Filter, BookOpen, TrendingUp, Clock, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import CourseCard from '../components/CourseCard';
import LessonCard from '../components/LessonCard';

export default function ExploreCourses() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [contentType, setContentType] = useState('courses');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['explore-courses'],
    queryFn: () => base44.entities.Course.filter({ published: true }).catch(() => [])
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['explore-lessons'],
    queryFn: () => base44.entities.Lesson.filter({ status: 'approved' }).catch(() => [])
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: () => base44.entities.UserProgress.filter({ user_id: user.id }).catch(() => []),
    enabled: !!user
  });

  const { data: courseTags = [] } = useQuery({
    queryKey: ['course-tags'],
    queryFn: () => base44.entities.CourseTag.list().catch(() => [])
  });

  // Extract unique categories
  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];

  // Get unique tags
  const allTags = [...new Set(courseTags.map(t => t.tag_name))];

  // Filter and sort content
  const getFilteredContent = () => {
    let items = contentType === 'courses' ? courses : lessons;

    // Search filter
    if (searchQuery) {
      items = items.filter(item => 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.objectives?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      items = items.filter(item => item.difficulty_level === difficultyFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      items = items.filter(item => item.category === categoryFilter);
    }

    // Duration filter (for courses)
    if (contentType === 'courses' && durationFilter !== 'all') {
      items = items.filter(item => {
        const total = item.total_lessons || item.lessons_count || 0;
        if (durationFilter === 'short') return total <= 5;
        if (durationFilter === 'medium') return total > 5 && total <= 15;
        if (durationFilter === 'long') return total > 15;
        return true;
      });
    }

    // Tags filter
    if (selectedTags.length > 0) {
      items = items.filter(item => {
        const itemTags = courseTags.filter(ct => 
          contentType === 'courses' ? ct.course_id === item.id : ct.lesson_id === item.id
        ).map(ct => ct.tag_name);
        return selectedTags.some(tag => itemTags.includes(tag));
      });
    }

    // Sort
    if (sortBy === 'newest') {
      items = [...items].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sortBy === 'title') {
      items = [...items].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'difficulty') {
      const order = { beginner: 1, intermediate: 2, advanced: 3 };
      items = [...items].sort((a, b) => (order[a.difficulty_level] || 0) - (order[b.difficulty_level] || 0));
    } else if (sortBy === 'relevant' && user) {
      // Sort by relevance based on user's interests and progress
      const userInterestTerms = progress.map(p => p.topic).filter(Boolean);
      items = [...items].sort((a, b) => {
        const aScore = userInterestTerms.filter(term => 
          a.title?.toLowerCase().includes(term.toLowerCase())
        ).length;
        const bScore = userInterestTerms.filter(term => 
          b.title?.toLowerCase().includes(term.toLowerCase())
        ).length;
        return bScore - aScore;
      });
    }

    return items;
  };

  const filteredContent = getFilteredContent();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Learning Content</h1>
          <p className="text-gray-600">Discover courses and lessons tailored to your spiritual growth</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-indigo-600">{courses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Lessons</p>
                  <p className="text-2xl font-bold text-purple-600">{lessons.length}</p>
                </div>
                <Zap className="w-8 h-8 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Your Progress</p>
                  <p className="text-2xl font-bold text-green-600">
                    {progress.filter(p => p.is_completed).length}
                  </p>
                </div>
                <Star className="w-8 h-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {progress.filter(p => !p.is_completed).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Duration Filter */}
              <Select value={durationFilter} onValueChange={setDurationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Length</SelectItem>
                  <SelectItem value="short">Short (≤5 lessons)</SelectItem>
                  <SelectItem value="medium">Medium (6–15 lessons)</SelectItem>
                  <SelectItem value="long">Long (15+ lessons)</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                  {user && <SelectItem value="relevant">Most Relevant</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="col-span-full">
                <p className="text-sm font-medium text-gray-700 mb-2">Filter by Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(difficultyFilter !== 'all' || categoryFilter !== 'all' || durationFilter !== 'all' || searchQuery || selectedTags.length > 0) && (
              <div className="flex gap-2 mt-4 flex-wrap items-center">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && <Badge variant="outline">Search: {searchQuery}</Badge>}
                {difficultyFilter !== 'all' && <Badge variant="outline">Level: {difficultyFilter}</Badge>}
                {categoryFilter !== 'all' && <Badge variant="outline">Category: {categoryFilter}</Badge>}
                {durationFilter !== 'all' && <Badge variant="outline">Duration: {durationFilter}</Badge>}
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="outline">Tag: {tag}</Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setDifficultyFilter('all');
                    setCategoryFilter('all');
                    setDurationFilter('all');
                    setSelectedTags([]);
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Type Tabs */}
        <Tabs value={contentType} onValueChange={setContentType}>
          <TabsList className="mb-6">
            <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
            <TabsTrigger value="lessons">Standalone Lessons ({lessons.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No courses found matching your criteria</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setDifficultyFilter('all');
                      setCategoryFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lessons">
            {filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map(lesson => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No lessons found matching your criteria</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setDifficultyFilter('all');
                      setCategoryFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}