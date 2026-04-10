import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Award } from 'lucide-react';
import { getExamText } from '@/functions/certificateTranslations';

export default function ExamResults({ 
  language = 'en',
  score = 0,
  totalQuestions = 0,
  passingScore = 70,
  passed = false,
  certificateId = null,
  onViewCertificate,
  onRetake
}) {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isRTL = ['ar'].includes(language);

  return (
    <div className={`space-y-6 ${isRTL ? 'dir-rtl' : 'dir-ltr'}`}>
      <Card className={passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardHeader className="text-center">
          <CardTitle className={`flex items-center justify-center gap-3 text-3xl ${passed ? 'text-green-900' : 'text-red-900'}`}>
            {passed ? (
              <>
                <CheckCircle className="w-8 h-8" />
                {getExamText(language, 'passed')}
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8" />
                {getExamText(language, 'failed')}
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 font-medium">
              {getExamText(language, 'score')}
            </p>
            <div className="text-5xl font-bold text-blue-700">
              {percentage}%
            </div>
            <p className="text-gray-600">
              {score} / {totalQuestions} {getExamText(language, 'question')}
            </p>
          </div>

          {/* Passing Score Indicator */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Passing Score</span>
              <span className="font-bold text-blue-700">{passingScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            {passed && certificateId && (
              <Button
                onClick={onViewCertificate}
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
              >
                <Award className="w-5 h-5" />
                {getExamText(language, 'viewCertificate')}
              </Button>
            )}

            {!passed && (
              <Button
                onClick={onRetake}
                className="w-full gap-2"
              >
                {getExamText(language, 'retake')}
              </Button>
            )}

            <Button variant="outline" className="w-full">
              {language === 'ar' ? 'العودة إلى الدرس' : 
               language === 'am' ? 'ወደ ትምህርቱ ተመለስ' :
               language === 'om' ? 'Baraa Irra Deebii' :
               'Back to Lesson'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}