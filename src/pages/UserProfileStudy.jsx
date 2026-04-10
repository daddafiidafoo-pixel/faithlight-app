import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../components/I18nProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { BookOpen, Flame, Clock, CheckCircle, ChevronRight, AlertCircle, Volume2 } from 'lucide-react';
import ContinueAudioCard from '../components/profile/ContinueAudioCard';

/**
 * ContinueStudyCard
 * Show if user has active StudyPlanInstance
 */
function ContinueStudyCard({ instance, cacheId }) {
  const { t } = useI18n();
  const [marking, setMarking] = useState(false);

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      await base44.functions.invoke('completeStudyDay', {
        plan_instance_id: instance.id,
        day_number: instance.current_day,
      });
      window.location.reload();
    } catch (err) {
      console.error('Mark complete error:', err);
    } finally {
      setMarking(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-blue-50">
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{t('study.continueTitle', 'Continue Study Plan')}</h3>
          <p className="text-sm text-gray-600">
            {t('study.dayProgress', `Day {{current}} of {{total}}`).replace('{{current}}', instance.current_day).replace('{{total}}', instance.duration_days)}
          </p>
        </div>
        <p className="text-sm text-gray-700">{instance.title || 'Study Plan'}</p>
        <div className="flex gap-2 pt-2">
          <Link to={createPageUrl('StudyPlanDetail') + `?instance_id=${instance.id}`} className="flex-1">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              {t('study.continue', 'Continue')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Button
            onClick={handleMarkComplete}
            disabled={marking}
            variant="outline"
            className="flex-1"
          >
            {marking ? '✓' : t('study.markComplete', 'Mark Complete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * StatCard
 */
function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 space-y-2 text-center">
        <Icon className="w-5 h-5 text-indigo-600 mx-auto" />
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
      </CardContent>
    </Card>
  );
}

/**
 * UserProfileStudy
 * Profile page with Continue card + progress stats
 */
export default function UserProfileStudy() {
  const { t, lang } = useI18n();
  const [user, setUser] = useState(null);
  const [continueInstance, setContinueInstance] = useState(null);
  const [continueAudio, setContinueAudio] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Fetch active study plan
        const activeInstances = await base44.entities.StudyPlanInstance.filter(
          { user_id: currentUser.id, status: 'active' },
          '-started_at',
          1
        );
        if (activeInstances.length > 0) {
          setContinueInstance(activeInstances[0]);
        }

        // Fetch most recent incomplete audio
        const audioProgress = await base44.entities.AudioListenProgress.filter(
          { user_id: currentUser.id, is_completed: false },
          '-last_listened_at',
          1
        );
        if (audioProgress.length > 0 && audioProgress[0].last_position_seconds >= 10) {
          setContinueAudio(audioProgress[0]);
        }

        // Fetch progress summary
        const summaries = await base44.entities.UserProgressSummary.filter(
          { user_id: currentUser.id },
          null,
          1
        );
        if (summaries.length > 0) {
          setSummary(summaries[0]);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-gray-500">
        {t('common.loading', 'Loading...')}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-600 mb-4">{t('common.loginRequired', 'Please log in.')}</p>
        <Button onClick={() => base44.auth.redirectToLogin()}>
          {t('nav.login', 'Login')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{user.full_name || t('nav.profile', 'Profile')}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="px-2 py-1 bg-gray-200 rounded-full text-xs font-medium">{lang.toUpperCase()}</span>
            {summary?.current_study_streak > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <Flame className="w-4 h-4" />
                {summary.current_study_streak} {t('study.dayStreak', 'day streak')}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Continue Cards */}
        {(continueInstance || continueAudio) && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('study.continueSection', 'Continue')}</h2>
            <div className="space-y-3">
              {continueInstance && <ContinueStudyCard instance={continueInstance} />}
              {continueAudio && (
                <ContinueAudioCard
                  progress={continueAudio}
                  onResume={(prog, position) => {
                    // TODO: navigate to audio player with position
                    console.log('Resume audio:', prog, 'at', position);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Progress Stats */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('study.progress', 'Your Progress')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={BookOpen}
              label={t('study.plansCompleted', 'Plans Completed')}
              value={summary?.total_study_plans_completed}
            />
            <StatCard
              icon={CheckCircle}
              label={t('study.daysCompleted', 'Days Completed')}
              value={summary?.total_study_days_completed}
            />
            <StatCard
              icon={Flame}
              label={t('study.longestStreak', 'Longest Streak')}
              value={summary?.longest_study_streak}
            />
            <StatCard
              icon={Volume2}
              label={t('audio.chaptersCompleted', 'Chapters')}
              value={summary?.total_audio_chapters_completed}
            />
            <StatCard
              icon={Clock}
              label={t('audio.minutesListened', 'Minutes Listened')}
              value={summary?.total_audio_minutes_listened}
            />
          </div>
        </div>

        {/* New Plan CTA */}
        <div className="pt-4">
          <Link to={createPageUrl('AIStudyPlanBuilderV2')} className="block">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg">
              {t('study.newPlan', 'Generate New Study Plan')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}