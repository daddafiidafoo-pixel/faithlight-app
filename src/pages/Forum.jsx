import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Search, Plus, Pin, Lock, Eye, MessageCircle, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import CreateTopicModal from '../components/forum/CreateTopicModal';
import AIDiscussionPrompts from '../components/community/AIDiscussionPrompts';

const CATEGORIES = [
  { value: 'general', label: '💬 General Discussion' },
  { value: 'bible-study', label: '📖 Bible Study' },
  { value: 'prayer', label: '🙏 Prayer Requests' },
  { value: 'theology', label: '🧠 Theology' },
  { value: 'worship', label: '🎵 Worship' },
  { value: 'youth', label: '👦 Youth' },
  { value: 'women', label: '👩 Women' },
  { value: 'men', label: '👨 Men' },
  { value: 'marriage', label: '💍 Marriage' },
  { value: 'parenting', label: '👨‍👩‍👧 Parenting' },
  { value: 'discipleship', label: '🤝 Discipleship' },
  { value: 'missions', label: '🌍 Missions' }
];

export default function Forum() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterLesson, setFilterLesson] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('User not logged in');
      }
    };
    fetchUser();
  }, []);

  const { data: topics = [], refetch } = useQuery({
    queryKey: ['forum-topics', filterCourse, filterLesson, filterCategory],
    queryFn: async () => {
      const allTopics = await base44.entities.ForumTopic.filter({ status: 'active' }, '-created_date');
      let filtered = allTopics;
      
      if (filterCourse !== 'all') {
        filtered = filtered.filter(t => t.course_id === filterCourse);
      }
      if (filterLesson !== 'all') {
        filtered = filtered.filter(t => t.lesson_id === filterLesson);
      }
      if (filterCategory !== 'all') {
        filtered = filtered.filter(t => t.category === filterCategory);
      }
      
      return filtered.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return b.is_pinned - a.is_pinned;
        return new Date(b.last_reply_date || b.created_date) - new Date(a.last_reply_date || a.created_date);
      });
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.filter({ published: true }),
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', filterCourse],
    queryFn: async () => {
      if (filterCourse === 'all') return [];
      return base44.entities.Lesson.filter({ course_id: filterCourse, status: 'approved' });
    },
    enabled: filterCourse !== 'all',
  });

  const filteredTopics = topics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTopicCreated = () => {
    setShowCreateModal(false);
    refetch();
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-10 h-10 text-indigo-600" />
                Community Forum
              </h1>
              <p className="text-gray-600 mt-2">Connect, discuss, and learn together</p>
            </div>
            {user && (
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="w-5 h-5" />
                New Topic
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <Tag className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterCourse} onValueChange={(val) => {
                  setFilterCourse(val);
                  setFilterLesson('all');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterLesson} onValueChange={setFilterLesson} disabled={filterCourse === 'all'}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Lessons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lessons</SelectItem>
                    {lessons.map(lesson => (
                      <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Discussion Prompts */}
        {user && (
          <div className="mb-8">
            <AIDiscussionPrompts
              topic={filterCourse !== 'all' ? courses.find(c => c.id === filterCourse)?.title : 'general biblical studies'}
              onSelectPrompt={(prompt) => {
                setShowCreateModal(true);
                setTimeout(() => {
                  const titleInput = document.querySelector('input[placeholder*="topic title"]');
                  if (titleInput) titleInput.value = prompt.question;
                }, 100);
              }}
            />
          </div>
        )}

        {/* Topics List */}
        <div className="space-y-3">
          {filteredTopics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No topics found. Be the first to start a discussion!</p>
                {user && (
                  <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Topic
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTopics.map(topic => {
              const course = courses.find(c => c.id === topic.course_id);
              const lesson = lessons.find(l => l.id === topic.lesson_id);
              
              return (
                <Link key={topic.id} to={createPageUrl(`ForumTopic?id=${topic.id}`)}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {topic.is_pinned && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Pin className="w-3 h-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                            {topic.is_locked && (
                              <Badge variant="outline">
                                <Lock className="w-3 h-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                            {topic.category && (
                              <Badge className="bg-blue-100 text-blue-800">
                                {CATEGORIES.find(c => c.value === topic.category)?.label || topic.category}
                              </Badge>
                            )}
                            {course && <Badge variant="outline" className="text-xs">{course.title}</Badge>}
                            {lesson && <Badge variant="outline" className="text-xs">{lesson.title}</Badge>}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{topic.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{topic.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>By {topic.author_name}</span>
                            <span>•</span>
                            <span>{new Date(topic.created_date).toLocaleDateString()}</span>
                            {topic.last_reply_date && (
                              <>
                                <span>•</span>
                                <span>Last reply {new Date(topic.last_reply_date).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">{topic.views_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm font-semibold">{topic.replies_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateTopicModal
          user={user}
          courses={courses}
          onClose={() => setShowCreateModal(false)}
          onTopicCreated={handleTopicCreated}
        />
      )}
    </div>
  );
}