import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Trash2, GripVertical, Save, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function CustomLearningPathBuilder({ user }) {
  const [pathTitle, setPathTitle] = useState('');
  const [pathDescription, setPathDescription] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentType, setContentType] = useState('all');
  const [showBuilder, setShowBuilder] = useState(false);

  const queryClient = useQueryClient();

  // Fetch available content
  const { data: sermons = [] } = useQuery({
    queryKey: ['sermons-for-path'],
    queryFn: () => base44.entities.SharedSermon.list('-created_date', 100)
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-path'],
    queryFn: () => base44.entities.Course.list('-created_date', 50)
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons-for-path'],
    queryFn: () => base44.entities.Lesson.list('-created_date', 100)
  });

  const createPathMutation = useMutation({
    mutationFn: async (pathData) => {
      return await base44.entities.LearningPath.create(pathData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-paths']);
      toast.success('Custom learning path created!');
      resetBuilder();
      setShowBuilder(false);
    }
  });

  const resetBuilder = () => {
    setPathTitle('');
    setPathDescription('');
    setSelectedItems([]);
    setSearchQuery('');
  };

  const addItem = (item, type) => {
    const newItem = {
      id: `${type}-${item.id}`,
      contentId: item.id,
      type,
      title: item.title || item.name,
      description: item.summary || item.description || item.topic,
      order: selectedItems.length
    };
    setSelectedItems([...selectedItems, newItem]);
    toast.success(`Added to path`);
  };

  const removeItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reordered = items.map((item, idx) => ({ ...item, order: idx }));
    setSelectedItems(reordered);
  };

  const savePath = () => {
    if (!pathTitle.trim()) {
      toast.error('Please enter a path title');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('Please add at least one item to your path');
      return;
    }

    const pathData = {
      user_id: user.id,
      title: pathTitle,
      description: pathDescription,
      path_items: selectedItems,
      total_items: selectedItems.length,
      progress_percentage: 0,
      status: 'active'
    };

    createPathMutation.mutate(pathData);
  };

  const filteredSermons = sermons.filter(s => 
    !searchQuery || s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCourses = courses.filter(c => 
    !searchQuery || c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredLessons = lessons.filter(l => 
    !searchQuery || l.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Custom Learning Path
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Build Your Custom Learning Path
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Path Configuration */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Path Title</label>
              <Input
                placeholder="e.g., My Journey Through Romans"
                value={pathTitle}
                onChange={(e) => setPathTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe your learning goals..."
                value={pathDescription}
                onChange={(e) => setPathDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Selected Items with Drag & Drop */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Selected Items ({selectedItems.length})
              </label>
              <Card className="bg-gray-50">
                <CardContent className="pt-4 max-h-96 overflow-y-auto">
                  {selectedItems.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-4">
                      Add items from the right panel
                    </p>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="path-items">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {selectedItems.map((item, index) => (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="bg-white p-3 rounded-lg border flex items-center gap-2"
                                  >
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{item.title}</p>
                                      <Badge variant="outline" className="mt-1 text-xs">
                                        {item.type}
                                      </Badge>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeItem(item.id)}
                                    >
                                      <X className="w-4 h-4" />
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

            <Button onClick={savePath} className="w-full" disabled={createPathMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save Learning Path
            </Button>
          </div>

          {/* Right: Available Content */}
          <div className="space-y-4">
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="sermons">Sermons</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="max-h-96 overflow-y-auto space-y-2 mt-4">
                {filteredSermons.slice(0, 5).map(sermon => (
                  <ContentCard key={`sermon-${sermon.id}`} item={sermon} type="sermon" onAdd={addItem} />
                ))}
                {filteredCourses.slice(0, 5).map(course => (
                  <ContentCard key={`course-${course.id}`} item={course} type="course" onAdd={addItem} />
                ))}
                {filteredLessons.slice(0, 5).map(lesson => (
                  <ContentCard key={`lesson-${lesson.id}`} item={lesson} type="lesson" onAdd={addItem} />
                ))}
              </TabsContent>

              <TabsContent value="sermons" className="max-h-96 overflow-y-auto space-y-2 mt-4">
                {filteredSermons.map(sermon => (
                  <ContentCard key={sermon.id} item={sermon} type="sermon" onAdd={addItem} />
                ))}
              </TabsContent>

              <TabsContent value="courses" className="max-h-96 overflow-y-auto space-y-2 mt-4">
                {filteredCourses.map(course => (
                  <ContentCard key={course.id} item={course} type="course" onAdd={addItem} />
                ))}
              </TabsContent>

              <TabsContent value="lessons" className="max-h-96 overflow-y-auto space-y-2 mt-4">
                {filteredLessons.map(lesson => (
                  <ContentCard key={lesson.id} item={lesson} type="lesson" onAdd={addItem} />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContentCard({ item, type, onAdd }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{item.title || item.name}</h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {item.summary || item.description || item.topic}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => onAdd(item, type)}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}