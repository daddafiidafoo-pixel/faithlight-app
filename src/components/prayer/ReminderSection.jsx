import React, { useState, useEffect } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import { setupDailyReminder, loadReminders, deleteReminder, requestNotificationPermission } from "../utils/reminderUtils";

export default function ReminderSection() {
  const [reminders, setReminders] = useState([]);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    const loaded = loadReminders();
    setReminders(loaded);
    setNotificationEnabled(typeof Notification !== 'undefined' && Notification.permission === 'granted');
  }, []);

  const handleAddReminder = async () => {
    if (!notificationEnabled) {
      try {
        await requestNotificationPermission();
        setNotificationEnabled(true);
      } catch {
        alert('Notification permission required');
        return;
      }
    }

    const title = `Pray for your requests`;
    const reminder = setupDailyReminder(hour, minute, title);
    setReminders(loadReminders());
  };

  const handleDeleteReminder = (reminderId) => {
    deleteReminder(reminderId);
    setReminders(loadReminders());
  };

  const formatTime = (h, m) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 font-semibold">
        <Clock className="h-5 w-5" />
        Daily Reminders
      </div>

      <div className="mb-3 space-y-2">
        <div className="flex gap-2">
          <select
            value={hour}
            onChange={(e) => setHour(parseInt(e.target.value))}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          <select
            value={minute}
            onChange={(e) => setMinute(parseInt(e.target.value))}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            {[0, 15, 30, 45].map(m => (
              <option key={m} value={m}>
                {m.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddReminder}
            className="flex items-center gap-2 rounded-lg bg-black px-3 py-1 text-sm text-white"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {reminders.map(reminder => (
          <div key={reminder.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
            <span>{formatTime(reminder.hour, reminder.minute)}</span>
            <button
              onClick={() => handleDeleteReminder(reminder.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}