import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SermonEditorDragDrop({ outline, onUpdate }) {
  const [sections, setSections] = useState(outline?.outline_sections || []);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.index === destination.index) return;

    const newSections = Array.from(sections);
    const [movedSection] = newSections.splice(source.index, 1);
    newSections.splice(destination.index, 0, movedSection);
    
    setSections(newSections);
    onUpdate({ ...outline, outline_sections: newSections });
  };

  const handleAddSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      content: 'Add content here...',
    };
    const newSections = [...sections, newSection];
    setSections(newSections);
    onUpdate({ ...outline, outline_sections: newSections });
  };

  const handleDeleteSection = (id) => {
    const newSections = sections.filter(s => s.id !== id);
    setSections(newSections);
    onUpdate({ ...outline, outline_sections: newSections });
  };

  const handleUpdateSection = (id, field, value) => {
    const newSections = sections.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    );
    setSections(newSections);
    onUpdate({ ...outline, outline_sections: newSections });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Edit Sermon Sections</h3>
        <Button size="sm" onClick={handleAddSection} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Section
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sermon-sections">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-3 rounded-lg p-2 ${snapshot.isDraggingOver ? 'bg-indigo-50' : ''}`}
            >
              {sections.map((section, index) => (
                <Draggable key={section.id} draggableId={section.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`border rounded-lg p-4 transition-all ${
                        snapshot.isDragging
                          ? 'shadow-lg bg-white border-indigo-400'
                          : 'border-gray-200 bg-gray-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Drag Handle */}
                        <div {...provided.dragHandleProps} className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* Section Content */}
                        <div className="flex-1 min-w-0">
                          {editingId === section.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                placeholder="Section title"
                                className="font-bold text-base"
                                onBlur={() => {
                                  handleUpdateSection(section.id, 'title', editingText);
                                  setEditingId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateSection(section.id, 'title', editingText);
                                    setEditingId(null);
                                  }
                                }}
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div>
                              <h4 className="font-bold text-gray-900 mb-2">{section.title}</h4>
                              {expandedId === section.id && (
                                <Textarea
                                  value={section.content}
                                  onChange={(e) => handleUpdateSection(section.id, 'content', e.target.value)}
                                  className="text-sm resize-none h-32 mb-2"
                                />
                              )}
                              {!expandedId && (
                                <p className="text-sm text-gray-600 line-clamp-2">{section.content}</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Expand"
                          >
                            {expandedId === section.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(section.id);
                              setEditingText(section.title);
                            }}
                            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Edit title"
                          >
                            <Edit2 className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}