const PREFS_KEY = 'faithlight_notification_prefs';

export function getNotificationPreferences(userEmail) {
  try {
    const all = JSON.parse(localStorage.getItem(PREFS_KEY) || '[]');
    return all.find(p => p.userEmail === userEmail) || {
      userEmail,
      dailyVerseEnabled: false,
      dailyVerseTime: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  } catch {
    return {
      userEmail,
      dailyVerseEnabled: false,
      dailyVerseTime: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

export function saveNotificationPreferences(userEmail, settings) {
  try {
    const all = JSON.parse(localStorage.getItem(PREFS_KEY) || '[]');
    const idx = all.findIndex(p => p.userEmail === userEmail);

    const prefs = {
      userEmail,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      all[idx] = prefs;
    } else {
      all.push(prefs);
    }

    localStorage.setItem(PREFS_KEY, JSON.stringify(all));
    return prefs;
  } catch (e) {
    console.error('Error saving notification preferences:', e);
    return null;
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendTestNotification(verseReference, verseText) {
  if (Notification.permission === 'granted') {
    new Notification('Daily Verse', {
      body: `${verseReference}\n\n"${verseText.substring(0, 100)}..."`,
      icon: '✨',
      tag: 'daily-verse-test',
    });
  }
}

export function scheduleNotificationCheck(userEmail) {
  // This will be enhanced with service worker later
  const prefs = getNotificationPreferences(userEmail);
  if (!prefs.dailyVerseEnabled) return;

  // Store preference for service worker to pick up
  localStorage.setItem('fl_notification_scheduled', JSON.stringify({
    userEmail,
    time: prefs.dailyVerseTime,
    timezone: prefs.timezone,
  }));
}