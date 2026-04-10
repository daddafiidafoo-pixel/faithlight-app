import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/components/I18nProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Check, Settings, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PrayerFormModal from '@/components/prayer/PrayerFormModal';
import PrayerCard from '@/components/prayer/PrayerCard';
import PrayerReminderSettings from '@/components/prayer/PrayerReminderSettings';
import PrayerStreakCelebration from '@/components/gamification/PrayerStreakCelebration';
import CategoryFilter from '@/components/prayer/CategoryFilter';
import DailyScriptureWidget from '@/components/prayer/DailyScriptureWidget';
import JournalScheduleSettings from '@/components/prayer/JournalScheduleSettings';
import PrayerStreakCalendar from '@/components/prayer/PrayerStreakCalendar';
import AudioPrayerRecorder from '@/components/prayer/AudioPrayerRecorder';
import AudioPrayerEntry from '@/components/prayer/AudioPrayerEntry';
import PrayerAnalyticsDashboard from '@/components/prayer/PrayerAnalyticsDashboard';
import PrayerFiltersPanel from '@/components/prayer/PrayerFiltersPanel';
import PullToRefresh from '@/components/PullToRefresh';

export default function MyPrayerJournal() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [filter, setFilter] = useState('active');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showReminders, setShowReminders] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [streakCelebration, setStreakCelebration] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [prayedDates, setPrayedDates] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    keyword: '',
    favoritesOnly: false,
    dateRange: null,
  });

  // Load streak + prayer dates for calendar
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    base44.entities.UserStreak.filter({ userEmail: user.email })
      .then(rows => { if (rows.length > 0) setStreakData(rows[0]); })
      .catch(() => {});
    base44.entities.PrayerRequest.filter({ userEmail: user.email })
      .then(rows => {
        const dates = rows.map(r => r.created_date).filter(Boolean);
        setPrayedDates(dates);
      })
      .catch(() => {});
  }, [isAuthenticated, user?.email]);

  const { data: prayers = [], refetch, isLoading } = useQuery({
    queryKey: ['prayers', user?.email],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const res = await base44.functions.invoke('prayerCRUD', {
        action: 'list',
        userEmail: user?.email,
      });
      return res.data?.prayers || [];
    },
    enabled: isAuthenticated,
  });

  const { data: audioEntries = [] } = useQuery({
    queryKey: ['prayerAudio', user?.email],
    queryFn: () => base44.entities.PrayerAudioEntry.filter({ userEmail: user?.email }),
    enabled: !!user?.email,
  });

  const filteredPrayers = prayers.filter(p => {
    const statusMatch = p.status === filter;
    const categoryMatch = categoryFilter === 'all' || p.category === categoryFilter;
    const favMatch = !advancedFilters.favoritesOnly || p.isFavorite;

    // Keyword search
    const keywordLower = advancedFilters.keyword.toLowerCase();
    const keywordMatch = !advancedFilters.keyword || 
      p.title?.toLowerCase().includes(keywordLower) ||
      p.body?.toLowerCase().includes(keywordLower) ||
      (p.tags || []).some(tag => tag.toLowerCase().includes(keywordLower));

    // Date range
    let dateMatch = true;
    if (advancedFilters.dateRange) {
      const prayerDate = new Date(p.created_date).toISOString().split('T')[0];
      if (advancedFilters.dateRange.start && prayerDate < advancedFilters.dateRange.start) {
        dateMatch = false;
      }
      if (advancedFilters.dateRange.end && prayerDate > advancedFilters.dateRange.end) {
        dateMatch = false;
      }
    }

    return statusMatch && categoryMatch && favMatch && keywordMatch && dateMatch;
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await base44.functions.invoke('prayerCRUD', {
        action: 'create',
        userEmail: user?.email,
        ...data,
      });

      // Update prayer streak (server-side calculation)
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const streakResponse = await base44.functions.invoke('updatePrayerStreak', {
        timezone: userTimezone,
      });

      return streakResponse.data;
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['prayers', user?.email] });

      // Snapshot the previous value
      const previousPrayers = queryClient.getQueryData(['prayers', user?.email]);

      // Optimistically update cache with new prayer
      const optimisticPrayer = {
        id: `temp-${Date.now()}`,
        ...data,
        created_date: new Date().toISOString(),
        status: 'active',
      };

      queryClient.setQueryData(['prayers', user?.email], (old) => [
        ...(old || []),
        optimisticPrayer,
      ]);

      return { previousPrayers };
    },
    onSuccess: (streakData) => {
      setShowForm(false);
      
      // Handle celebration if earned
      if (streakData?.celebration) {
        setStreakCelebration({
          type: streakData.celebration,
          streakDays: streakData.streakMilestone,
        });
      } else if (!streakData?.streakUpdated) {
        toast.success(streakData?.message || "Keep praying! 🙏");
      } else {
        toast.success(`Prayer streak: ${streakData?.currentStreak} days! 🔥`);
      }

      refetch();
      queryClient.invalidateQueries({ queryKey: ['userStreak'] });
    },
    onError: (error, data, context) => {
      if (context?.previousPrayers) {
        queryClient.setQueryData(['prayers', user?.email], context.previousPrayers);
      }
      toast.error('Failed to create prayer');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers', user?.email] });
    },
  });

  const handleCreate = (data) => {
    createMutation.mutate(data);
  };

  const updateMutation = useMutation({
    mutationFn: (data) =>
      base44.functions.invoke('prayerCRUD', {
        action: 'update',
        prayerId: editingPrayer.id,
        ...data,
      }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['prayers', user?.email] });
      const previousPrayers = queryClient.getQueryData(['prayers', user?.email]);

      queryClient.setQueryData(['prayers', user?.email], (old) =>
        (old || []).map((p) => (p.id === editingPrayer.id ? { ...p, ...data } : p))
      );

      return { previousPrayers };
    },
    onSuccess: () => {
      setEditingPrayer(null);
      setShowForm(false);
      toast.success('Prayer updated');
      refetch();
    },
    onError: (error, data, context) => {
      if (context?.previousPrayers) {
        queryClient.setQueryData(['prayers', user?.email], context.previousPrayers);
      }
      toast.error('Failed to update prayer');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers', user?.email] });
    },
  });

  const handleUpdate = (data) => {
    updateMutation.mutate(data);
  };

  const answeredMutation = useMutation({
    mutationFn: (prayer) =>
      base44.functions.invoke('prayerCRUD', {
        action: 'markAnswered',
        prayerId: prayer.id,
        answerNotes: `Answered on ${new Date().toLocaleDateString()}`,
      }),
    onMutate: async (prayer) => {
      await queryClient.cancelQueries({ queryKey: ['prayers', user?.email] });
      const previousPrayers = queryClient.getQueryData(['prayers', user?.email]);

      queryClient.setQueryData(['prayers', user?.email], (old) =>
        (old || []).map((p) =>
          p.id === prayer.id ? { ...p, status: 'answered' } : p
        )
      );

      return { previousPrayers };
    },
    onSuccess: () => {
      toast.success('Prayer marked as answered');
    },
    onError: (error, prayer, context) => {
      if (context?.previousPrayers) {
        queryClient.setQueryData(['prayers', user?.email], context.previousPrayers);
      }
      toast.error('Failed to mark prayer');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers', user?.email] });
    },
  });

  const handleMarkAnswered = (prayer) => {
    answeredMutation.mutate(prayer);
  };

  const deleteMutation = useMutation({
    mutationFn: (prayerId) =>
      base44.functions.invoke('prayerCRUD', {
        action: 'delete',
        prayerId,
      }),
    onMutate: async (prayerId) => {
      await queryClient.cancelQueries({ queryKey: ['prayers', user?.email] });
      const previousPrayers = queryClient.getQueryData(['prayers', user?.email]);

      queryClient.setQueryData(['prayers', user?.email], (old) =>
        (old || []).filter((p) => p.id !== prayerId)
      );

      return { previousPrayers };
    },
    onSuccess: () => {
      toast.success('Prayer deleted');
    },
    onError: (error, prayerId, context) => {
      if (context?.previousPrayers) {
        queryClient.setQueryData(['prayers', user?.email], context.previousPrayers);
      }
      toast.error('Failed to delete prayer');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['prayers', user?.email] });
    },
  });

  const handleDelete = (prayerId) => {
    if (confirm('Delete this prayer?')) {
      deleteMutation.mutate(prayerId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">{t('prayerJournal.loginRequired', 'Please log in to manage your prayers.')}</p>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={refetch}>
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Streak Celebration Modal */}
      {streakCelebration && (
        <PrayerStreakCelebration
          isOpen={!!streakCelebration}
          streakDays={streakCelebration.streakDays}
          celebrationType={streakCelebration.type}
          onClose={() => setStreakCelebration(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
         {/* Header */}
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-gray-900">{t('prayerJournal.title', 'Prayer Journal')}</h1>
           <div className="flex gap-2">
             <Button
               onClick={() => setShowSchedule(!showSchedule)}
               variant="outline"
               className="flex items-center gap-2"
             >
               <Clock className="w-4 h-4" />
               {t('prayerJournal.schedule', 'Schedule')}
             </Button>
             <Button
               onClick={() => setShowReminders(!showReminders)}
               variant="outline"
               className="flex items-center gap-2"
             >
               <Settings className="w-4 h-4" />
               {t('common.settings', 'Settings')}
             </Button>
             <Button onClick={() => { setEditingPrayer(null); setShowForm(true); }} className="flex items-center gap-2">
               <Plus className="w-4 h-4" />
               {t('prayerJournal.newPrayer', 'New Prayer')}
             </Button>
           </div>
         </div>

         {/* Prayer Streak Calendar */}
         <div className="mb-6">
           <PrayerStreakCalendar streak={streakData || {}} prayedDates={prayedDates} />
         </div>

         {/* Daily Scripture Widget */}
         <DailyScriptureWidget onSaveVerse={() => refetch()} />

         {/* Reminder Settings */}
         {showReminders && (
           <div className="mb-6">
             <PrayerReminderSettings />
           </div>
         )}

         {/* Schedule Settings */}
         {showSchedule && (
           <div className="mb-6">
             <JournalScheduleSettings />
           </div>
         )}

        {/* Form Modal */}
        {showForm && (
          <PrayerFormModal
            prayer={editingPrayer}
            onSubmit={editingPrayer ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingPrayer(null); }}
          />
        )}

        {/* Audio Prayers Section */}
         <div className="mb-6">
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🎤 {t('prayerJournal.audioPrayers', 'Audio Prayers')}
            </h2>
           <AudioPrayerRecorder
             userEmail={user?.email}
             onSaved={() => queryClient.invalidateQueries({ queryKey: ['prayerAudio'] })}
           />
           {audioEntries.length > 0 && (
             <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
               {audioEntries.slice().reverse().map((entry) => (
                 <AudioPrayerEntry
                   key={entry.id}
                   entry={entry}
                   onDelete={() => queryClient.invalidateQueries({ queryKey: ['prayerAudio'] })}
                 />
               ))}
             </div>
           )}
         </div>

        {/* Advanced Filters */}
         <div className="mb-6 flex justify-between items-center">
           <CategoryFilter activeCategory={categoryFilter} onCategoryChange={setCategoryFilter} />
           <Button
             onClick={() => setShowFilters(!showFilters)}
             variant={showFilters ? 'default' : 'outline'}
             className="flex items-center gap-2"
           >
             🔍 {t('common.filters', 'Filters')}
           </Button>
         </div>

         {showFilters && (
           <div className="mb-6">
             <PrayerFiltersPanel
               onFilterChange={setAdvancedFilters}
               onClose={() => setShowFilters(false)}
             />
           </div>
         )}

         {/* Tabs */}
         <Tabs value={filter} onValueChange={setFilter} className="w-full">
           <TabsList className="grid w-full grid-cols-4">
             <TabsTrigger value="active">{t('prayerJournal.active', 'Active')}</TabsTrigger>
             <TabsTrigger value="answered">{t('prayerJournal.answered', 'Answered')}</TabsTrigger>
             <TabsTrigger value="archived">{t('prayerJournal.archived', 'Archived')}</TabsTrigger>
             <TabsTrigger value="analytics">📊 {t('prayerJournal.insights', 'Insights')}</TabsTrigger>
           </TabsList>

          {/* Active Prayers */}
          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : filteredPrayers.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-xl font-bold text-gray-800 mb-2">🙏 Start Your Prayer Journey</p>
                <p className="text-gray-600 mb-6">You have no active prayers yet. Begin by sharing what's on your heart.</p>
                <Button onClick={() => { setEditingPrayer(null); setShowForm(true); }} className="mx-auto flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t('prayerJournal.newPrayer', 'Add Prayer')}
                </Button>
              </Card>
            ) : (
              filteredPrayers.map(prayer => (
                <PrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  onEdit={() => { setEditingPrayer(prayer); setShowForm(true); }}
                  onMarkAnswered={() => handleMarkAnswered(prayer)}
                  onDelete={() => handleDelete(prayer.id)}
                />
              ))
            )}
          </TabsContent>

          {/* Answered Prayers */}
          <TabsContent value="answered" className="space-y-4">
            {filteredPrayers.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-xl font-bold text-gray-800 mb-2">✨ No Answered Prayers Yet</p>
                <p className="text-gray-600">Your prayers will appear here when God answers them. Keep believing!</p>
              </Card>
            ) : (
              filteredPrayers.map(prayer => (
                <PrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  onEdit={() => { setEditingPrayer(prayer); setShowForm(true); }}
                  onDelete={() => handleDelete(prayer.id)}
                />
              ))
            )}
          </TabsContent>

          {/* Archived Prayers */}
          <TabsContent value="archived" className="space-y-4">
            {filteredPrayers.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-xl font-bold text-gray-800 mb-2">📚 No Archived Prayers</p>
                <p className="text-gray-600">Archive prayers you want to keep but no longer actively pray for.</p>
              </Card>
            ) : (
              filteredPrayers.map(prayer => (
                <PrayerCard
                  key={prayer.id}
                  prayer={prayer}
                  onDelete={() => handleDelete(prayer.id)}
                />
              ))
            )}
          </TabsContent>

          {/* Analytics / Insights */}
          <TabsContent value="analytics">
           <PrayerAnalyticsDashboard prayers={prayers} />
          </TabsContent>
          </Tabs>
          </div>
          </div>
          </PullToRefresh>
          );
}