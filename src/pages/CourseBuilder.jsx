import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, GripVertical, Plus, Trash2, Save, Eye, EyeOff, ArrowLeft, Loader2, Lightbulb, Sparkles } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LessonEditor from '../components/course/LessonEditor';
import QuizBuilder from '../components/course/QuizBuilder';
import CourseOutlineGenerator from '../components/ai/CourseOutlineGenerator';
import LessonPlanGenerator from '../components/ai/LessonPlanGenerator';
import TagsSuggester from '../components/ai/TagsSuggester';

export default function CourseBuilder() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id');
  const [user, setUser] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [languageCode, setLanguageCode] = useState('en');
  const [difficulty, setDifficulty] = useState('beginner');
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(false);
  const [estimatedHours, setEstimatedHours] = useState('');
  const [prerequisiteCourseIds, setPrerequisiteCourseIds] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [showLessonEditor, setShowLessonEditor] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState(null);
  const [showAIOutlineGenerator, setShowAIOutlineGenerator] = useState(false);
  const [showLessonGenerator, setShowLessonGenerator] = useState(false);

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

  const { data: existingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId && !!user,
    onSuccess: (course) => {
      if (course) {
        setTitle(course.title);
        setDescription(course.description || '');
        setLanguageCode(course.language_code);
        setDifficulty(course.difficulty || 'beginner');
        setImageUrl(course.image_url || '');
        setPublished(course.published || false);
        setEstimatedHours(course.estimated_hours?.toString() || '');
        setPrerequisiteCourseIds(course.prerequisite_course_ids || []);
      }
    }
  });

  const { data: courseLessons = [] } = useQuery({
    queryKey: ['course-lessons', courseId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ 
        course_id: courseId,
        status: 'approved'
      });
      return lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    },
    enabled: !!courseId,
    onSuccess: (lessons) => {
      setSelectedLessons(lessons.map(l => l.id));
    }
  });

  const { data: availableLessons = [] } = useQuery({
    queryKey: ['available-lessons', user?.id],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ 
        teacher_id: user.id,
        status: 'approved'
      });
      return lessons.filter(l => !l.course_id || l.course_id === courseId);
    },
    enabled: !!user
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list(),
    enabled: !!user
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const courseData = {
        title,
        description,
        language_code: languageCode,
        difficulty,
        image_url: imageUrl,
        published,
        estimated_hours: estimatedHours ? Number(estimatedHours) : null,
        prerequisite_course_ids: prerequisiteCourseIds,
        teacher_id: user.id
      };

      let savedCourse;
      if (courseId) {
        await base44.entities.Course.update(courseId, courseData);
        savedCourse = { id: courseId, ...courseData };
      } else {
        savedCourse = await base44.entities.Course.create(courseData);
      }

      // Update lesson order
      const lessonUpdates = selectedLessons.map((lessonId, index) =>
        base44.entities.Lesson.update(lessonId, {
          course_id: savedCourse.id,
          order_index: index
        })
      );
      await Promise.all(lessonUpdates);

      return savedCourse;
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries(['courses']);
      queryClient.invalidateQueries(['course', course.id]);
      navigate(createPageUrl('MyCourses'));
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedLessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedLessons(items);
  };

  const addLesson = (lessonId) => {
    if (!selectedLessons.includes(lessonId)) {
      setSelectedLessons([...selectedLessons, lessonId]);
    }
  };

  const removeLesson = (lessonId) => {
    setSelectedLessons(selectedLessons.filter(id => id !== lessonId));
  };

  const togglePrerequisite = (courseId) => {
    if (prerequisiteCourseIds.includes(courseId)) {
      setPrerequisiteCourseIds(prerequisiteCourseIds.filter(id => id !== courseId));
    } else {
      setPrerequisiteCourseIds([...prerequisiteCourseIds, courseId]);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  const selectedLessonObjects = selectedLessons
    .map(id => availableLessons.find(l => l.id === id) || courseLessons.find(l => l.id === id))
    .filter(Boolean);

  const unselectedLessons = availableLessons.filter(l => !selectedLessons.includes(l.id));
  const availablePrerequisites = allCourses.filter(c => c.id !== courseId);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(createPageUrl('MyCourses'))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {courseId ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className="text-gray-600">Build structured learning paths for your students</p>
          </div>
        </div>

        {showLessonEditor && (
          <div className="mb-8">
            <LessonEditor
              courseId={courseId}
              existingLesson={editingLesson}
              onLessonCreated={() => {
                setShowLessonEditor(false);
                setEditingLesson(null);
              }}
              onClose={() => {
                setShowLessonEditor(false);
                setEditingLesson(null);
              }}
            />
          </div>
        )}

        {showQuizBuilder && (
          <div className="mb-8">
            <QuizBuilder
              lessonId={showQuizBuilder}
              onQuizCreated={() => {
                setShowQuizBuilder(null);
              }}
              onClose={() => {
                setShowQuizBuilder(null);
              }}
            />
          </div>
        )}

        {/* AI Tools Section */}
        {!courseId && (
          <Tabs defaultValue="details" className="space-y-6 mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Manual Entry</TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI Builder
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="space-y-6">
              <Alert>
                <Lightbulb className="w-4 h-4" />
                <AlertDescription>
                  Use AI to generate course outlines and lesson content based on your topic and objectives.
                </AlertDescription>
              </Alert>

              <CourseOutlineGenerator
                onOutlineGenerated={(outline) => {
                  setTitle(outline.courseTitle);
                  setDescription(outline.summary);
                  setShowAIOutlineGenerator(false);
                }}
              />
            </TabsContent>
          </Tabs>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Introduction to the Gospel of John"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={languageCode} onValueChange={setLanguageCode}>
                      <SelectTrigger id="language" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger id="difficulty" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imageUrl">Cover Image URL (Optional)</Label>
                    <Input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hours">Estimated Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      placeholder="e.g., 10"
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                {availablePrerequisites.length === 0 ? (
                  <p className="text-gray-500 text-sm">No other courses available as prerequisites</p>
                ) : (
                  <div className="space-y-2">
                    {availablePrerequisites.map(course => (
                      <div
                        key={course.id}
                        onClick={() => togglePrerequisite(course.id)}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={prerequisiteCourseIds.includes(course.id)}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <Badge variant="outline" className="text-xs">{course.difficulty}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Lessons ({selectedLessonObjects.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowLessonGenerator(!showLessonGenerator)}
                      className="gap-1"
                    >
                      <Sparkles className="w-4 h-4" />
                      AI Generate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingLesson(null);
                        setShowLessonEditor(true);
                      }}
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Create New
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showLessonGenerator && (
                  <LessonPlanGenerator
                    topic={title}
                    objectives={description}
                    onLessonGenerated={(generatedLesson) => {
                      setEditingLesson({
                        title: generatedLesson.title,
                        content: generatedLesson.content,
                        scripture_references: generatedLesson.scriptureReferences,
                      });
                      setShowLessonEditor(true);
                      setShowLessonGenerator(false);
                    }}
                  />
                )}
                {showLessonGenerator && <hr className="my-4" />}
                {selectedLessonObjects.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Add lessons from the panel on the right to build your course
                    </AlertDescription>
                  </Alert>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="lessons">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {selectedLessonObjects.map((lesson, index) => (
                            <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-3 p-3 bg-white border rounded-lg"
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">{index + 1}</Badge>
                                      <p className="font-medium">{lesson.title}</p>
                                    </div>
                                    {lesson.scripture_references && (
                                      <p className="text-xs text-gray-600 mt-1">{lesson.scripture_references}</p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeLesson(lesson.id)}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <TagsSuggester
              courseTitle={title}
              description={description}
              onTagsSelected={(tags) => {
                // Store tags for later use when saving course
              }}
            />

            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onClick={() => setPublished(!published)}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  {published ? <Eye className="w-5 h-5 text-green-600" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                  <div>
                    <p className="font-medium">{published ? 'Published' : 'Draft'}</p>
                    <p className="text-xs text-gray-600">
                      {published ? 'Visible to students' : 'Only visible to you'}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={!title || saveMutation.isLoading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {saveMutation.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Course
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unselectedLessons.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    All approved lessons added
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {unselectedLessons.map(lesson => (
                      <div
                        key={lesson.id}
                        onClick={() => addLesson(lesson.id)}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 hover:border-indigo-300"
                      >
                        <p className="font-medium text-sm">{lesson.title}</p>
                        {lesson.scripture_references && (
                          <p className="text-xs text-gray-600 mt-1">{lesson.scripture_references}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}