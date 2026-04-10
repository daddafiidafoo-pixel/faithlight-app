import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, CheckCircle2, Trash2, BookOpen, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationRemindersCenter() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const allTasks = await base44.entities.NotificationTask.filter({
        userEmail: user.email,
        status: filter
      });
      setTasks(allTasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (task) => {
    try {
      await base44.entities.NotificationTask.update(task.id, {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      toast.success('Task completed!');
      loadTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const dismissTask = async (task) => {
    try {
      await base44.entities.NotificationTask.update(task.id, {
        status: 'dismissed'
      });
      loadTasks();
    } catch (error) {
      toast.error('Failed to dismiss task');
    }
  };

  const taskIcons = {
    verse_of_day: <BookOpen className="w-4 h-4" />,
    prayer_request: <Heart className="w-4 h-4 text-red-500" />,
    reading_reminder: <BookOpen className="w-4 h-4 text-blue-500" />
  };

  const taskColors = {
    verse_of_day: 'bg-blue-50 border-blue-200',
    prayer_request: 'bg-red-50 border-red-200',
    reading_reminder: 'bg-purple-50 border-purple-200'
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-900">Reminders & Tasks</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['pending', 'completed', 'dismissed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors capitalize ${
              filter === f
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No {filter} tasks</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <Card
              key={task.id}
              className={`p-4 border-l-4 ${taskColors[task.taskType]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {taskIcons[task.taskType]}
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {task.taskType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{task.content}</p>
                  {task.sentAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Sent: {new Date(task.sentAt).toLocaleDateString()} at {new Date(task.sentAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {filter === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => markComplete(task)}
                        className="gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dismissTask(task)}
                        className="gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  {filter === 'completed' && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Send Reminders Button */}
      <div className="pt-4 border-t">
        <Button
          onClick={async () => {
            try {
              await base44.functions.invoke('sendNotificationReminders', {});
              toast.success('Reminders sent!');
              loadTasks();
            } catch (error) {
              toast.error('Failed to send reminders');
            }
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
        >
          <Bell className="w-4 h-4" />
          Send Me Today's Reminders
        </Button>
      </div>
    </div>
  );
}