import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function StudentDetailedView({ studentId, courseId, onBack }) {
  const [showFeedback, setShowFeedback] = useState(false);

  const { data: studentProgress, isLoading } = useQuery({
    queryKey: ['student-progress', studentId, courseId],
    queryFn: async () => {
      const response = await base44.functions.invoke('getStudentDetailedProgress', {
        user_id: studentId,
        course_id: courseId,
      });
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading student details...
        </CardContent>
      </Card>
    );
  }

  if (!studentProgress) {
    return (
      <Card>
        <CardContent className="py-8 text-center">No data available</CardContent>
      </Card>
    );
  }

  const { student, course_progress, lesson_breakdown, quiz_performance, summary } = studentProgress;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const needsSupport = course_progress.progress_percentage < 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-sm text-gray-600">{student.email}</p>
          </div>
        </div>
        <Badge className={getStatusColor(course_progress.status)}>
          {course_progress.status}
        </Badge>
      </div>

      {/* Alert if struggling */}
      {needsSupport && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900">Student Needs Support</p>
              <p className="text-sm text-red-800 mt-1">
                This student is at {course_progress.progress_percentage}% progress. Consider reaching out to offer additional support.
              </p>
              <Button
                size="sm"
                onClick={() => setShowFeedback(true)}
                className="mt-2 gap-2"
              >
                Send Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-indigo-600">
              {course_progress.progress_percentage}%
            </div>
            <p className="text-xs text-gray-600 mt-1">Overall Progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {summary.completed_lessons}/{summary.total_lessons}
            </div>
            <p className="text-xs text-gray-600 mt-1">Lessons Done</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {summary.total_time_minutes}m
            </div>
            <p className="text-xs text-gray-600 mt-1">Time Spent</p>
          </CardContent>
        </Card>

        {summary.avg_quiz_score !== null && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {summary.avg_quiz_score}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Avg Quiz Score</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lesson Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lesson Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {lesson_breakdown.map((lesson) => (
              <div
                key={lesson.lesson_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{lesson.lesson_title}</p>
                  <p className="text-xs text-gray-600">
                    {lesson.time_spent_minutes} min • {lesson.avg_time_minutes || 0}min avg
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        lesson.status === 'completed'
                          ? 'bg-green-500'
                          : lesson.status === 'in_progress'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${lesson.progress_percentage}%` }}
                    />
                  </div>
                  <Badge className="w-12 text-center">
                    {lesson.progress_percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Performance */}
      {quiz_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quiz Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={quiz_performance.slice(-10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lesson_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {quiz_performance.map((quiz, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-600">
                    Attempt {idx + 1}
                  </span>
                  <Badge>
                    {quiz.score}/{quiz.max_score} ({quiz.percentage}%)
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Form */}
      {showFeedback && (
        <FeedbackForm
          studentId={studentId}
          courseId={courseId}
          studentName={student.name}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}

function FeedbackForm({ studentId, courseId, studentName, onClose }) {
  const [feedback, setFeedback] = React.useState('');
  const [category, setCategory] = React.useState('general');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await base44.entities.CourseMessage.create({
        course_id: courseId,
        sender_id: (await base44.auth.me()).id,
        sender_type: 'teacher',
        recipient_ids: [studentId],
        subject: `Feedback: ${category}`,
        content: feedback,
        is_group_message: false,
      });
      onClose();
    } catch (error) {
      alert('Failed to send feedback: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Feedback to {studentName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="general">General Feedback</option>
          <option value="encouragement">Encouragement</option>
          <option value="improvement">Areas to Improve</option>
          <option value="support">Offering Support</option>
        </select>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write your feedback here..."
          rows={4}
          className="w-full border rounded px-3 py-2 text-sm"
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !feedback.trim()}
          >
            {isSubmitting ? 'Sending...' : 'Send Feedback'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}