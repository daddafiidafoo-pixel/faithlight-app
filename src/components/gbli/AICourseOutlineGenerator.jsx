import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, ChevronDown, ChevronRight, BookOpen, Target, Download } from 'lucide-react';

export default function AICourseOutlineGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [outline, setOutline] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  const generateOutline = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setOutline(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a curriculum designer for the Global Biblical Leadership Institute (GBLI), a professional biblical leadership training program.

Create a structured course outline for a GBLI course with the following details:
- Course Title: "${title}"
- Description: "${description || 'A biblical leadership course'}"

Generate a comprehensive, seminary-quality course outline with:
- 4 to 6 modules
- Each module should have 3-5 lesson topics
- Each module should have 2-3 specific learning objectives
- A brief course overview (2-3 sentences)
- Suggested prerequisite courses if applicable
- Estimated total study hours

The content must be biblically grounded, theologically sound, and practical for Christian leaders worldwide.`,
        response_json_schema: {
          type: 'object',
          properties: {
            course_overview: { type: 'string' },
            prerequisites: { type: 'string' },
            total_hours: { type: 'number' },
            modules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  module_number: { type: 'number' },
                  module_title: { type: 'string' },
                  module_description: { type: 'string' },
                  lessons: { type: 'array', items: { type: 'string' } },
                  learning_objectives: { type: 'array', items: { type: 'string' } },
                  key_scripture: { type: 'string' },
                }
              }
            }
          }
        }
      });
      setOutline(result);
      setExpandedModule(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyOutlineAsText = () => {
    if (!outline) return;
    let text = `GBLI COURSE OUTLINE\n${'='.repeat(40)}\n`;
    text += `Course: ${title}\n`;
    text += `Overview: ${outline.course_overview}\n`;
    if (outline.prerequisites) text += `Prerequisites: ${outline.prerequisites}\n`;
    if (outline.total_hours) text += `Total Hours: ${outline.total_hours}\n\n`;
    outline.modules?.forEach(mod => {
      text += `MODULE ${mod.module_number}: ${mod.module_title}\n`;
      text += `${mod.module_description}\n`;
      if (mod.key_scripture) text += `Key Scripture: ${mod.key_scripture}\n`;
      text += `Lessons:\n${mod.lessons?.map(l => `  • ${l}`).join('\n')}\n`;
      text += `Learning Objectives:\n${mod.learning_objectives?.map(o => `  ✓ ${o}`).join('\n')}\n\n`;
    });
    navigator.clipboard.writeText(text);
    alert('Outline copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <Badge className="bg-purple-100 text-purple-700 border-0 mb-3">Admin Tool</Badge>
        <h2 className="text-3xl font-bold text-gray-900">AI Course Outline Generator</h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Enter a course title and description — our AI will generate a full structured GBLI course outline instantly.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Input form */}
        <Card className="md:col-span-2 border-2 border-purple-100">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Course Title *</label>
              <Input
                placeholder="e.g., Biblical Eschatology"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Brief Description</label>
              <Textarea
                placeholder="A brief overview of what this course covers and who it's for..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <Button
              className="w-full bg-[#1E1B4B] hover:bg-indigo-900 gap-2"
              onClick={generateOutline}
              disabled={loading || !title.trim()}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Outline</>
              )}
            </Button>
            <p className="text-xs text-gray-400 text-center">Powered by AI · GBLI curriculum standards</p>
          </CardContent>
        </Card>

        {/* Generated outline */}
        <div className="md:col-span-3">
          {!outline && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-400 font-medium">Your course outline will appear here</p>
              <p className="text-xs text-gray-300 mt-1">Fill in the course details and click Generate</p>
            </div>
          )}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-16 bg-indigo-50 rounded-2xl border-2 border-indigo-100">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
              <p className="text-indigo-600 font-medium">Generating your course outline...</p>
              <p className="text-xs text-indigo-400 mt-1">This may take a few seconds</p>
            </div>
          )}
          {outline && (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-[#1E1B4B] rounded-xl p-5 text-white">
                <p className="text-xs text-amber-400 font-bold uppercase tracking-widest mb-1">GBLI Course Outline</p>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-indigo-200 text-sm leading-relaxed">{outline.course_overview}</p>
                <div className="flex flex-wrap gap-3 mt-4 text-xs text-indigo-300">
                  {outline.total_hours && <span>⏱ {outline.total_hours} hrs</span>}
                  {outline.prerequisites && <span>📚 Prereq: {outline.prerequisites}</span>}
                  {outline.modules && <span>📋 {outline.modules.length} Modules</span>}
                </div>
              </div>

              {/* Modules */}
              <div className="space-y-2">
                {outline.modules?.map((mod, idx) => (
                  <div key={idx} className="rounded-xl border-2 border-gray-100 overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#1E1B4B] flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                          {mod.module_number}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{mod.module_title}</p>
                          <p className="text-xs text-gray-400">{mod.lessons?.length} lessons</p>
                        </div>
                      </div>
                      {expandedModule === idx
                        ? <ChevronDown className="w-4 h-4 text-gray-400" />
                        : <ChevronRight className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                    {expandedModule === idx && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        {mod.module_description && (
                          <p className="text-xs text-gray-500 mt-3 mb-3 italic">{mod.module_description}</p>
                        )}
                        {mod.key_scripture && (
                          <p className="text-xs text-amber-700 font-semibold mb-3">📖 {mod.key_scripture}</p>
                        )}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Lessons</p>
                            <ul className="space-y-1">
                              {mod.lessons?.map((l, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                  <span className="text-indigo-400 mt-0.5">•</span>{l}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                              <Target className="w-3 h-3" /> Learning Objectives
                            </p>
                            <ul className="space-y-1">
                              {mod.learning_objectives?.map((o, i) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">✓</span>{o}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Copy button */}
              <Button variant="outline" className="w-full gap-2 text-sm" onClick={copyOutlineAsText}>
                <Download className="w-4 h-4" /> Copy Outline to Clipboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}