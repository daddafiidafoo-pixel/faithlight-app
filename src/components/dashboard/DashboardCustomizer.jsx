import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { X, GripVertical, Plus, Check, Settings, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ALL_WIDGETS, ALL_QUICK_LINKS } from './dashboardConfig';

export default function DashboardCustomizer({ config, onSave, onClose }) {
  const [activeWidgets, setActiveWidgets] = useState(
    (config.widget_order || ALL_WIDGETS.filter(w => w.defaultOn).map(w => w.id))
  );
  const [quickLinks, setQuickLinks] = useState(
    config.quick_links || ALL_QUICK_LINKS.filter(l => l.defaultOn)
  );
  const [tab, setTab] = useState('widgets');

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(activeWidgets);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setActiveWidgets(items);
  };

  const toggleWidget = (id) => {
    setActiveWidgets(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const toggleQuickLink = (link) => {
    setQuickLinks(prev =>
      prev.find(l => l.id === link.id) ? prev.filter(l => l.id !== link.id) : [...prev, link]
    );
  };

  const handleSave = () => {
    onSave({ widget_order: activeWidgets, quick_links: quickLinks });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-gray-900 text-lg">Customize Dashboard</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {['widgets', 'quick_links'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'widgets' ? 'Widgets' : 'Quick Links'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'widgets' ? (
            <div className="space-y-5">
              {/* Active & orderable */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Active Widgets (drag to reorder)</p>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="active-widgets">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                        {activeWidgets.map((id, index) => {
                          const widget = ALL_WIDGETS.find(w => w.id === id);
                          if (!widget) return null;
                          return (
                            <Draggable key={id} draggableId={id} index={index}>
                              {(prov, snap) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  className={`flex items-center gap-3 p-3 rounded-xl border bg-white transition-shadow ${
                                    snap.isDragging ? 'shadow-lg border-indigo-300' : 'border-gray-200'
                                  }`}
                                >
                                  <div {...prov.dragHandleProps} className="cursor-grab text-gray-400 hover:text-gray-600">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <span className="text-xl">{widget.icon}</span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{widget.label}</p>
                                    <p className="text-xs text-gray-500">{widget.description}</p>
                                  </div>
                                  <button
                                    onClick={() => toggleWidget(id)}
                                    className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Inactive widgets */}
              {ALL_WIDGETS.filter(w => !activeWidgets.includes(w.id)).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Available to Add</p>
                  <div className="space-y-2">
                    {ALL_WIDGETS.filter(w => !activeWidgets.includes(w.id)).map(widget => (
                      <div key={widget.id} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                        <span className="text-xl">{widget.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{widget.label}</p>
                          <p className="text-xs text-gray-400">{widget.description}</p>
                        </div>
                        <button
                          onClick={() => toggleWidget(widget.id)}
                          className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Toggle Quick Links</p>
              {ALL_QUICK_LINKS.map(link => {
                const active = !!quickLinks.find(l => l.id === link.id);
                return (
                  <div key={link.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${active ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                    <span className="text-xl">{link.icon}</span>
                    <p className="flex-1 text-sm font-medium text-gray-900">{link.label}</p>
                    <button
                      onClick={() => toggleQuickLink(link)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400 hover:bg-indigo-100'
                      }`}
                    >
                      {active ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700">Save Layout</Button>
        </div>
      </div>
    </div>
  );
}