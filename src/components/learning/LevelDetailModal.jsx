import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CheckCircle, BookOpen, Target, Zap } from 'lucide-react';

export default function LevelDetailModal({ level, isOpen, onClose, userProgress }) {
  if (!level) return null;

  const isCompleted = userProgress?.completed_levels?.includes(level.level_number);
  const isCurrent = level.level_number === userProgress?.current_level;
  const isLeadershipLevel = level.level_number === 4;
  const isLeaderEligible = isLeadershipLevel && userProgress?.leader_eligible && !userProgress?.leader_approved;
  const isLeaderApproved = isLeadershipLevel && userProgress?.leader_approved;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="text-6xl">{level.icon}</div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{level.title}</DialogTitle>
              <DialogDescription className="text-base mt-1">{level.subtitle}</DialogDescription>
              {isCompleted && !isLeadershipLevel && <Badge className="bg-green-600 mt-2">✓ Completed</Badge>}
              {isCurrent && <Badge className="bg-indigo-600 mt-2">Current Level</Badge>}
              {isLeaderEligible && <Badge className="bg-yellow-600 mt-2">🔒 Awaiting Admin Approval</Badge>}
              {isLeaderApproved && <Badge className="bg-green-600 mt-2">✓ Leadership Approved</Badge>}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="curriculum">Path</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Goal</h3>
                    <p className="text-gray-600 mt-1">{level.goal}</p>
                  </div>
                </div>

                {level.focus_areas && level.focus_areas.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-indigo-600" />
                      Key Focus Areas
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {level.focus_areas.map((area, idx) => (
                        <Badge key={idx} variant="outline" className="justify-center py-2">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {isCurrent && userProgress && (
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <p className="text-sm font-semibold text-indigo-900 mb-3">Your Progress</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-indigo-700">{Math.round(userProgress.current_level_progress_percent)}% Complete</span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all"
                        style={{ width: `${userProgress.current_level_progress_percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {level.badge_name && (
                  <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <span className="text-3xl">{level.badge_emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">Completion Badge</p>
                      <p className="text-xs text-yellow-700">{level.badge_name}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="books" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Core Bible Books</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Study these foundational passages for this level
                    </p>
                  </div>
                </div>

                {level.core_books && level.core_books.length > 0 ? (
                  <div className="space-y-2">
                    {level.core_books.map((book, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <CheckCircle className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm text-gray-700">{book}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Books to be added</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Complete the courses below to progress through this level and unlock the next stage.
                </p>
                {level.required_course_ids && level.required_course_ids.length > 0 ? (
                  <div className="space-y-2">
                    {level.required_course_ids.map((courseId, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">Course {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Curriculum coming soon</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {isCurrent && (
            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              Continue Learning
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}