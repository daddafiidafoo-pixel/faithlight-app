import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock } from 'lucide-react';
import { getExamText } from '@/functions/certificateTranslations';

export default function ExamInstructions({ 
  language = 'en',
  timeLimit = null,
  totalQuestions = 0,
  passingScore = 70,
  examType = 'finalExam'
}) {
  const isRTL = ['ar'].includes(language);

  return (
    <Card className={`border-blue-200 bg-blue-50 ${isRTL ? 'dir-rtl' : 'dir-ltr'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <AlertCircle className="w-5 h-5" />
          {getExamText(language, examType === 'quiz' ? 'quiz' : 'finalExam')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Instructions */}
        <div className="p-4 bg-white rounded-lg border border-blue-200">
          <p className="text-gray-800 leading-relaxed">
            {getExamText(language, 'instructions')}
          </p>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-3">
          {totalQuestions > 0 && (
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 font-medium">
                {getExamText(language, 'question')}
              </p>
              <p className="text-lg font-bold text-blue-700">{totalQuestions}</p>
            </div>
          )}

          {timeLimit && (
            <div className="p-3 bg-white rounded-lg border border-blue-200 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600 font-medium">
                  {getExamText(language, 'timeRemaining')}
                </p>
                <p className="text-lg font-bold text-blue-700">{timeLimit} min</p>
              </div>
            </div>
          )}

          <div className="p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 font-medium">
              {getExamText(language, 'passingScore')}
            </p>
            <p className="text-lg font-bold text-blue-700">{passingScore}%</p>
          </div>
        </div>

        {/* Important Note */}
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ {language === 'om' ? 'Akka gaaffii hunda deebif, yeroo xuquubaa.' : 
                language === 'am' ? 'ጥያቄዎችን በጥንቃቄ ይመልሱ, ጊዜ ሲያልቅ ፈተናው ይዘጋል.' :
                language === 'ar' ? 'أجب على جميع الأسئلة قبل انتهاء الوقت.' :
                'Make sure to answer all questions before time runs out.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}