export function setupDailyReminder(hour, minute, title) {
  if (!('Notification' in window)) return;
  
  const reminderId = `prayer-reminder-${hour}-${minute}`;
  const reminder = { id: reminderId, hour, minute, title, enabled: true };
  
  const reminders = JSON.parse(localStorage.getItem('faithlight.reminders') || '[]');
  const existing = reminders.findIndex(r => r.id === reminderId);
  
  if (existing >= 0) {
    reminders[existing] = reminder;
  } else {
    reminders.push(reminder);
  }
  
  localStorage.setItem('faithlight.reminders', JSON.stringify(reminders));
  scheduleReminder(reminder);
  
  return reminder;
}

export function scheduleReminder(reminder) {
  if (Notification.permission !== 'granted') return;
  
  const now = new Date();
  const reminderTime = new Date();
  reminderTime.setHours(reminder.hour, reminder.minute, 0, 0);
  
  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }
  
  const timeUntilReminder = reminderTime - now;
  
  setTimeout(() => {
    if (reminder.enabled) {
      new Notification('Prayer Reminder', {
        body: reminder.title || 'Time to pray for your requests',
        icon: '/prayer-icon.png',
        badge: '/prayer-icon.png'
      });
      
      scheduleReminder(reminder);
    }
  }, timeUntilReminder);
}

export function loadReminders() {
  const reminders = JSON.parse(localStorage.getItem('faithlight.reminders') || '[]');
  return reminders;
}

export function deleteReminder(reminderId) {
  const reminders = JSON.parse(localStorage.getItem('faithlight.reminders') || '[]');
  const filtered = reminders.filter(r => r.id !== reminderId);
  localStorage.setItem('faithlight.reminders', JSON.stringify(filtered));
  return filtered;
}

export function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return Promise.reject('Browser does not support notifications');
  }
  
  if (Notification.permission === 'granted') {
    return Promise.resolve('granted');
  }
  
  if (Notification.permission !== 'denied') {
    return Notification.requestPermission();
  }
  
  return Promise.reject('Notification permission denied');
}