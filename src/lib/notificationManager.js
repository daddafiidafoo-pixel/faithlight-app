// Browser push notification manager
const STORAGE_KEY = 'fl_notification_prefs';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { status: 'unsupported', message: 'Notifications not supported' };
  }
  
  if (Notification.permission === 'granted') {
    return { status: 'granted', message: 'Notifications already enabled' };
  }
  
  if (Notification.permission === 'denied') {
    return { status: 'denied', message: 'Notifications blocked by user' };
  }
  
  try {
    const permission = await Notification.requestPermission();
    return { status: permission, message: `Notifications ${permission}` };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export function getNotificationPermissionStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function saveNotificationPreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      enabled: prefs.enabled,
      time: prefs.time, // HH:MM format
      timezone: prefs.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      frequency: prefs.frequency || 'daily', // daily, weekdays, custom
      customDays: prefs.customDays || [],
    }));
  } catch (e) {
    console.error('Failed to save notification preferences:', e);
  }
}

export function getNotificationPreferences() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      enabled: false,
      time: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      frequency: 'daily',
      customDays: [],
    };
  } catch {
    return {
      enabled: false,
      time: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      frequency: 'daily',
      customDays: [],
    };
  }
}

export async function sendTestNotification(title = 'FaithLight Daily Verse', body = 'Sample verse notification') {
  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }
  
  return new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
  });
}

export function shouldNotifyToday(prefs) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  if (prefs.frequency === 'daily') return true;
  if (prefs.frequency === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
  if (prefs.frequency === 'custom') return prefs.customDays.includes(dayOfWeek);
  
  return false;
}

export function getTimeUntilNextNotification(prefs) {
  const [hours, minutes] = prefs.time.split(':').map(Number);
  const now = new Date();
  const scheduled = new Date();
  
  scheduled.setHours(hours, minutes, 0, 0);
  
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  
  return scheduled.getTime() - now.getTime();
}