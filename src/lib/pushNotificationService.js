// Push notification service for prayer reminders
const NOTIFICATION_PREFS_KEY = 'fl_notification_prefs';
const NOTIFICATION_HISTORY_KEY = 'fl_notification_history';

export const getPushNotificationPrefs = (userEmail) => {
  if (!userEmail) return { enabled: false, time: '09:00' };
  
  const prefs = JSON.parse(
    localStorage.getItem(`${NOTIFICATION_PREFS_KEY}_${userEmail}`) || 
    '{"enabled": false, "time": "09:00"}'
  );
  return prefs;
};

export const setPushNotificationPrefs = (userEmail, prefs) => {
  if (!userEmail) return;
  localStorage.setItem(
    `${NOTIFICATION_PREFS_KEY}_${userEmail}`,
    JSON.stringify(prefs)
  );
};

export const shouldShowDailyNotification = (userEmail) => {
  const prefs = getPushNotificationPrefs(userEmail);
  if (!prefs.enabled) return false;

  const today = new Date().toDateString();
  const history = JSON.parse(
    localStorage.getItem(`${NOTIFICATION_HISTORY_KEY}_${userEmail}`) || '[]'
  );

  return !history.includes(today);
};

export const markNotificationShown = (userEmail) => {
  if (!userEmail) return;
  
  const today = new Date().toDateString();
  const history = JSON.parse(
    localStorage.getItem(`${NOTIFICATION_HISTORY_KEY}_${userEmail}`) || '[]'
  );

  if (!history.includes(today)) {
    history.push(today);
    // Keep last 90 days
    if (history.length > 90) history.shift();
    localStorage.setItem(
      `${NOTIFICATION_HISTORY_KEY}_${userEmail}`,
      JSON.stringify(history)
    );
  }
};

export const scheduleNotification = (userEmail, callback) => {
  if (!userEmail) return;

  const prefs = getPushNotificationPrefs(userEmail);
  if (!prefs.enabled) return;

  const [hours, minutes] = prefs.time.split(':').map(Number);
  const now = new Date();
  let nextNotif = new Date();
  
  nextNotif.setHours(hours, minutes, 0, 0);

  if (nextNotif <= now) {
    nextNotif.setDate(nextNotif.getDate() + 1);
  }

  const timeUntilNotif = nextNotif.getTime() - now.getTime();

  const timeoutId = setTimeout(() => {
    if (shouldShowDailyNotification(userEmail)) {
      markNotificationShown(userEmail);
      callback?.();
    }
    // Reschedule for next day
    scheduleNotification(userEmail, callback);
  }, timeUntilNotif);

  return timeoutId;
};