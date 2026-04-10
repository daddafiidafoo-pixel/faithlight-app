import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, ChevronDown } from 'lucide-react';

export default function FeedbackViewer({ lessonId, quizId, moduleId }) {
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const { data: feedback = [] } = useQuery({
    queryKey: ['feedback', lessonId, quizId, moduleId],
    queryFn: async () => {
      const query = {};
      if (lessonId) query.lesson_id = lessonId;
      if (quizId) query.quiz_id = quizId;
      if (moduleId) query.module_id = moduleId;
      return await base44.entities.TrainingFeedback.filter(query, '-created_date');
    },
  });

  const { data: responses = {} } = useQuery({
    queryKey: ['feedback-responses', feedback.map(f => f.id)],
    queryFn: async () => {
      const map = {};
      for (const f of feedback) {
        const resp = await base44.entities.FeedbackResponse.filter({ feedback_id: f.id });
        map[f.id] = resp;
      }
      return map;
    },
    enabled: feedback.length > 0,
  });

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-gray-100 text-gray-800',
      under_review: 'bg-blue-100 text-blue-800',
      planned: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.open;
  };

  if (feedback.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8 text-gray-600">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          No feedback yet
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Feedback ({feedback.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
              onClick={() => setSelectedFeedback(item)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description.substring(0, 100)}...</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    {item.tags?.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {item.tags[0]}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">by {item.submitted_by_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feedback Detail Dialog */}
      {selectedFeedback && (
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedFeedback.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Feedback Type</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {selectedFeedback.feedback_type.replace('_', ' ')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedFeedback.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedFeedback.status)}>
                    {selectedFeedback.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <Badge className={getPriorityColor(selectedFeedback.priority)}>
                    {selectedFeedback.priority}
                  </Badge>
                </div>
              </div>

              {responses[selectedFeedback.id]?.length > 0 && (
                <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-900 mb-3">Responses</p>
                  <div className="space-y-3">
                    {responses[selectedFeedback.id].map((resp) => (
                      <div key={resp.id} className="bg-white p-3 rounded">
                        <p className="text-sm font-semibold text-gray-900">
                          {resp.responded_by_name}
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          {new Date(resp.created_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-700">{resp.response_text}</p>
                        {resp.action_taken && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {resp.action_taken.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}