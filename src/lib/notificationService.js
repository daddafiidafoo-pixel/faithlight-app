export const notificationService = {
  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
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
  },

  sendNotification: (title, options = {}) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/badge.png',
        ...options,
      });
    }
  },

  scheduleDaily: (title, hour, minute = 0) => {
    const scheduleCheck = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);

      if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delay = scheduledTime.getTime() - now.getTime();

      setTimeout(() => {
        notificationService.sendNotification(title, {
          body: 'Time to read your daily Bible verse!',
          tag: 'daily-reading',
        });
        scheduleCheck(); // Schedule next day
      }, delay);
    };

    scheduleCheck();
  },
};