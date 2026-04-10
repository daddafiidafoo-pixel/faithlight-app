import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function GeneratedLessonPreview({ lesson, onSave, loading, error }) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!lesson) {
    return (
      <div className="text-center py-12 text-gray-500">
        Generated lesson content will appear here
      </div>
    );
  }

  const handleSave = async () => {
    if (onSave) {
      const success = await onSave(lesson);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{lesson.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {lesson.scripture_references?.map((ref, idx) => (
                  <Badge key={idx} variant="outline">{ref}</Badge>
                ))}
              </div>
            </div>
            {lesson.estimated_minutes && (
              <Badge className="ml-2">{lesson.estimated_minutes} min</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Learning Points */}
      {lesson.learning_points && lesson.learning_points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lesson.learning_points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {lesson.content && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reflection Questions */}
      {lesson.reflection_questions && lesson.reflection_questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reflection Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside">
              {lesson.reflection_questions.map((q, idx) => (
                <li key={idx} className="text-sm">{q}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Quiz Questions */}
      {lesson.quiz_questions && lesson.quiz_questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quiz Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lesson.quiz_questions.map((q, idx) => (
              <div key={idx} className="border-l-4 border-indigo-600 pl-4">
                <p className="font-medium text-sm mb-2">{idx + 1}. {q.question}</p>
                <ul className="space-y-1">
                  {q.options?.map((option, optIdx) => (
                    <li key={optIdx} className={`text-sm ${optIdx === q.correct_answer_index ? 'font-semibold text-green-700' : 'text-gray-700'}`}>
                      {String.fromCharCode(65 + optIdx)}) {option}
                      {optIdx === q.correct_answer_index && <span className="ml-1">✓</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Save Button */}
      <Button 
        onClick={handleSave}
        disabled={loading}
        className="w-full gap-2"
      >
        {saveSuccess ? (
          <>
            <Check className="w-4 h-4" />
            Lesson Saved
          </>
        ) : loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Lesson to Course'
        )}
      </Button>
    </div>
  );
}