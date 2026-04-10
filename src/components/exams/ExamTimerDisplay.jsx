import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';
import { getExamText } from '@/functions/certificateTranslations';

export default function ExamTimerDisplay({ 
  language = 'en',
  timeSeconds = 0,
  onTimeUp
}) {
  const [displayTime, setDisplayTime] = useState(timeSeconds);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    setDisplayTime(timeSeconds);
  }, [timeSeconds]);

  useEffect(() => {
    if (displayTime <= 0) {
      onTimeUp?.();
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime(prev => {
        const newTime = prev - 1;
        setIsWarning(newTime < 60); // Warn at 1 minute
        
        if (newTime <= 0) {
          onTimeUp?.();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [displayTime, onTimeUp]);

  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Card className={isWarning ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isWarning ? (
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 text-blue-600" />
            )}
            <span className={`font-medium ${isWarning ? 'text-red-900' : 'text-blue-900'}`}>
              {getExamText(language, 'timeRemaining')}
            </span>
          </div>
          <div className={`text-3xl font-bold tabular-nums ${isWarning ? 'text-red-700' : 'text-blue-700'}`}>
            {formattedTime}
          </div>
        </div>

        {isWarning && (
          <p className="text-xs text-red-700 mt-3">
            {language === 'ar' ? 'انتبه: وقتك ينفد!' :
             language === 'am' ? 'ጠንቅቅ: ጊዜከ አይበርም!' :
             language === 'om' ? 'Ofii jajjabu: yeroon xuquubaa!' :
             'Hurry! Time is running out!'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}