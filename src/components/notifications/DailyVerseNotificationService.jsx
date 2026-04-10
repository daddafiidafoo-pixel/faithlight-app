import { useEffect, useState } from 'react';

const NOTIFICATION_PREFS_KEY = 'fl_verse_notification_prefs';
const LAST_NOTIFICATION_KEY = 'fl_last_notification_date';

export function useDailyVerseNotification() {
  const [enabled, setEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('08:00');

  useEffect(() => {
    // Load preferences
    const saved = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (saved) {
      try {
        const { enabled: e, time } = JSON.parse(saved);
        setEnabled(e);
        if (time) setNotificationTime(time);
      } catch (e) {
        console.error('Failed to load notification prefs:', e);
      }
    }
  }, []);

  // Save preferences
  const savePreferences = (enabledFlag, timeStr) => {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify({ enabled: enabledFlag, time: timeStr }));
    setEnabled(enabledFlag);
    setNotificationTime(timeStr);
  };

  // Request permission and schedule notification
  const scheduleNotification = async (enabledFlag = true) => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (Notification.permission === 'granted' || enabledFlag) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
      }
    }

    savePreferences(enabledFlag, notificationTime);
    scheduleDaily();
  };

  // Schedule daily notification check
  const scheduleDaily = () => {
    if (!enabled) return;

    const checkAndNotify = () => {
      const today = new Date().toDateString();
      const lastNotified = localStorage.getItem(LAST_NOTIFICATION_KEY);

      if (lastNotified !== today && 'Notification' in window && Notification.permission === 'granted') {
        // Send notification with verse data
        const verse = {
          book: 'John',
          chapter: 3,
          verse: 16,
          text: 'For God so loved the world...'
        };

        const notification = new Notification('📖 Today\'s Verse', {
          body: `${verse.book} ${verse.chapter}:${verse.verse}\n\n${verse.text.substring(0, 60)}...`,
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          tag: 'daily-verse',
          requireInteraction: true
        });

        notification.onclick = () => {
          // Open audio bible to the verse
          window.open(`/audio?book=${verse.book.toLowerCase()}&chapter=${verse.chapter}`, '_self');
          notification.close();
        };

        localStorage.setItem(LAST_NOTIFICATION_KEY, today);
      }

      // Reschedule for tomorrow
      const now = new Date();
      const [hours, minutes] = notificationTime.split(':');
      const nextRun = new Date();
      nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }

      const timeout = nextRun.getTime() - now.getTime();
      setTimeout(checkAndNotify, timeout);
    };

    checkAndNotify();
  };

  return { enabled, notificationTime, scheduleNotification, savePreferences };
}