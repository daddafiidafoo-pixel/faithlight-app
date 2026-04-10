import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Headphones, Flame, Clock } from 'lucide-react';
import { useI18n } from '../I18nProvider';

export default function StudyProgressDisplay({ userId }) {
  const { lang } = useI18n();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const userProgress = await base44.entities.UserStudyProgress.filter(
          { user_id: userId },
          '-created_date',
          1
        );

        if (userProgress && userProgress.length > 0) {
          setProgress(userProgress[0]);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            {lang === 'om' ? 'Lakkaawamu...' : 'Loading...'}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            {lang === 'om'
              ? 'Barnoota kee jalqabaa'
              : 'Start your study journey'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      icon: BookOpen,
      label: lang === 'om' ? 'Barnoota xumuraman' : 'Lessons Completed',
      value: progress.lessons_completed,
      color: 'text-blue-600',
    },
    {
      icon: BookOpen,
      label: lang === 'om' ? 'Verses' : 'Verses Studied',
      value: progress.verses_studied,
      color: 'text-green-600',
    },
    {
      icon: Headphones,
      label: lang === 'om' ? 'Audio Minits' : 'Audio Minutes',
      value: Math.round(progress.audio_minutes_listened),
      color: 'text-purple-600',
    },
    {
      icon: Flame,
      label: lang === 'om' ? 'Streak' : 'Study Streak',
      value: `${progress.study_streak_days} ${lang === 'om' ? 'guyyaa' : 'days'}`,
      color: 'text-orange-600',
    },
  ];

  const hours = Math.round(progress.total_study_hours * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Study Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6 text-center">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-gray-900">
                  {typeof stat.value === 'number' && stat.value > 1000
                    ? `${(stat.value / 1000).toFixed(1)}K`
                    : stat.value}
                </p>
                <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Level & Books */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {lang === 'om' ? 'Sadarkaa Barnoota' : 'Study Level'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--faith-light-primary)] capitalize">
              {progress.level}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {lang === 'om'
                ? 'Sadarkaa kee haala ammayyaa'
                : 'Your current level'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {lang === 'om' ? 'Tiim Guutaman' : 'Books Completed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {progress.books_completed?.length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {progress.books_completed?.length > 0 ? (
                <span title={progress.books_completed.join(', ')}>
                  {progress.books_completed.slice(0, 2).join(', ')}
                  {progress.books_completed.length > 2 && ' +more'}
                </span>
              ) : (
                (lang === 'om' ? 'Jalqaba' : 'Not started')
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Total Study Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-sm">
              {lang === 'om' ? 'Waldi Barnoota' : 'Total Study Time'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[var(--faith-light-primary)]">
            {hours}
            <span className="text-sm text-gray-500 ml-2">
              {lang === 'om' ? 'saatii' : 'hours'}
            </span>
          </div>
          <Progress value={Math.min((hours / 100) * 100, 100)} className="mt-3" />
          <p className="text-xs text-gray-500 mt-2">
            {lang === 'om'
              ? 'Damma barnoota jiidha'
              : 'Keep up your daily study!'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}