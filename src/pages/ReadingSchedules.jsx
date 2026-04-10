import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, CheckCircle, Circle } from 'lucide-react';

export default function ReadingSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    chapters_per_day: 1
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const user = await base44.auth.me();
      const schedules = await base44.entities.ReadingSchedule.filter({
        user_email: user.email,
        is_active: true
      });
      setSchedules(schedules);

      // Fetch progress for each schedule
      const progressMap = {};
      for (const schedule of schedules) {
        const progressData = await base44.entities.ReadingProgress.filter({
          schedule_id: schedule.id
        });
        progressMap[schedule.id] = progressData;
      }
      setProgress(progressMap);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      const user = await base44.auth.me();
      await base44.entities.ReadingSchedule.create({
        user_email: user.email,
        ...formData,
        end_date: new Date(new Date().setDate(new Date().getDate() + 90)).toISOString().split('T')[0]
      });
      setFormData({ title: '', description: '', start_date: new Date().toISOString().split('T')[0], chapters_per_day: 1 });
      setShowForm(false);
      fetchSchedules();
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reading Schedules</h1>
            <p className="text-gray-600">{schedules.length} active plan{schedules.length !== 1 ? 's' : ''}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Schedule
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Reading Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., 90-Day Bible Challenge"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Chapters Per Day</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.chapters_per_day}
                      onChange={(e) => setFormData({ ...formData, chapters_per_day: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Schedule</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Schedules List */}
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reading schedules yet. Create one to start tracking your progress!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {schedules.map(schedule => {
              const scheduleProgress = progress[schedule.id] || [];
              const completionPercentage = Math.round((scheduleProgress.length / 90) * 100);
              return (
                <Card key={schedule.id}>
                  <CardHeader>
                    <CardTitle>{schedule.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {schedule.description && (
                      <p className="text-gray-600 text-sm">{schedule.description}</p>
                    )}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Progress: {scheduleProgress.length} chapters</span>
                        <span className="text-sm text-gray-600">{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <span>📅 {schedule.chapters_per_day} chapter(s) per day</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}