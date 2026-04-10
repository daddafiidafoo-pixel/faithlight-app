import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, BookOpen, ChevronDown, ChevronUp, Clock, Target } from 'lucide-react';
import AIContentSummarizer from '@/components/ai/AIContentSummarizer';

export default function StudyPlanViewer({ plan, onEdit }) {
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  if (!plan || !plan.modules) return null;

  const weeks = Array.isArray(plan.modules) ? plan.modules : [];

  return (
    <div className="space-y-4">
      {/* Plan Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{plan.title}</CardTitle>
              <p className="text-purple-100 mt-2">{plan.description}</p>
            </div>
            <Button
              onClick={onEdit}
              variant="secondary"
              size="sm"
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Customize
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-purple-100 text-sm">Duration</p>
            <p className="font-semibold">{plan.duration_weeks} weeks</p>
          </div>
          <div>
            <p className="text-purple-100 text-sm">Total Hours</p>
            <p className="font-semibold">{plan.total_estimated_hours}h</p>
          </div>
          <div>
            <p className="text-purple-100 text-sm">Difficulty</p>
            <p className="font-semibold capitalize">{plan.difficulty_level}</p>
          </div>
          <div>
            <p className="text-purple-100 text-sm">Pace</p>
            <p className="font-semibold capitalize">{plan.pace}</p>
          </div>
        </CardContent>
      </Card>

      {/* Plan Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Learning Goal
            </p>
            <p className="text-sm text-gray-600">{plan.goal}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Topics</p>
            <p className="text-sm text-gray-600">{plan.topics}</p>
          </div>
          {plan.focus_areas && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Focus Areas</p>
              <p className="text-sm text-gray-600">{plan.focus_areas}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Modules */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Study Modules
        </h3>

        {weeks.map((week) => (
          <Card key={week.week_number}>
            <button
              onClick={() => setExpandedWeek(expandedWeek === week.week_number ? null : week.week_number)}
              className="w-full text-left"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">Week {week.week_number}: {week.week_theme}</CardTitle>
                  </div>
                  {expandedWeek === week.week_number ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
            </button>

            {expandedWeek === week.week_number && (
              <CardContent className="space-y-3 pt-0">
                {week.days?.map((day, dayIdx) => (
                  <div key={dayIdx} className="border rounded-lg p-3 bg-gray-50">
                    <button
                      onClick={() => setExpandedDay(expandedDay === `${week.week_number}-${dayIdx}` ? null : `${week.week_number}-${dayIdx}`)}
                      className="w-full text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-sm">{day.day}</p>
                          <p className="text-sm text-purple-600 mt-1">{day.scripture_focus}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {day.time_minutes}m
                          </span>
                          {expandedDay === `${week.week_number}-${dayIdx}` ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {expandedDay === `${week.week_number}-${dayIdx}` && (
                      <div className="mt-3 pt-3 border-t space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Topic</p>
                          <p className="text-sm text-gray-700">{day.topic}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Learning Objectives</p>
                          <ul className="space-y-1">
                            {day.learning_objectives?.map((obj, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex gap-2">
                                <span className="text-blue-600">•</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Key Concepts</p>
                          <div className="flex flex-wrap gap-2">
                            {day.key_concepts?.map((concept, idx) => (
                              <span key={idx} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Reflection Questions</p>
                          <ul className="space-y-2">
                            {day.reflection_questions?.map((q, idx) => (
                              <li key={idx} className="text-sm text-gray-700 italic">"{q}"</li>
                            ))}
                          </ul>
                        </div>

                        {/* AI Summary for the day */}
                        <div className="pt-2">
                          <AIContentSummarizer
                            content={`${day.topic}\n\nObjectives: ${day.learning_objectives?.join(', ')}\n\nScripture: ${day.scripture_focus}`}
                            contentType="lesson"
                            title={day.day}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}