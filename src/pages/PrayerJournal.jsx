import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, CheckCircle2, Circle, Calendar } from 'lucide-react';
import PrayerEntryForm from '@/components/prayer/PrayerEntryForm';
import PrayerStreakCalendar from '@/components/prayer/PrayerStreakCalendar';
import PrayerEntryCard from '@/components/prayer/PrayerEntryCard';

export default function PrayerJournal() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: prayers, isLoading, refetch } = useQuery({
    queryKey: ['prayers', user?.email],
    queryFn: () => user ? base44.entities.PrayerEntry.filter({ user_email: user.email }, '-prayer_date') : Promise.resolve([]),
    enabled: !!user
  });

  if (!user) return <div className="p-6 text-center">Please log in to access Prayer Journal</div>;
  if (isLoading) return <div className="p-6 text-center">Loading prayers...</div>;

  const monthPrayers = prayers?.filter(p => {
    const d = new Date(p.prayer_date);
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
  }) || [];

  const streakCount = prayers?.filter(p => p.prayer_date && new Date(p.prayer_date).toDateString() !== new Date(p.created_date).toDateString()).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Prayer Journal</h1>
            <p className="text-slate-600 mt-2">Track your prayers and celebrate answered prayers</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Prayer
          </Button>
        </div>

        {showForm && (
          <PrayerEntryForm 
            onSubmit={() => { setShowForm(false); refetch(); }} 
            onCancel={() => setShowForm(false)} 
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 col-span-1 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Prayer Calendar
            </h2>
            <PrayerStreakCalendar prayers={prayers || []} month={selectedMonth} onMonthChange={setSelectedMonth} />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-purple-600">{prayers?.length || 0}</div>
                <div className="text-sm text-slate-600">Total Prayers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{prayers?.filter(p => p.is_answered).length || 0}</div>
                <div className="text-sm text-slate-600">Answered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{streakCount}</div>
                <div className="text-sm text-slate-600">Streak</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })} Prayers
          </h2>
          <div className="grid gap-4">
            {monthPrayers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No prayers recorded this month</div>
            ) : (
              monthPrayers.map(prayer => (
                <PrayerEntryCard key={prayer.id} prayer={prayer} onUpdate={refetch} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}