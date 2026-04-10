const NOTIFICATION_SETTINGS_KEY = "faithlight_holiday_notifications";
const NOTIFIED_HOLIDAYS_KEY = "faithlight_notified_holidays";

export const notificationPreferences = {
  ALL: "all",
  MAJOR: "major",
  NONE: "none",
};

export function getNotificationPreference() {
  const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  return stored || notificationPreferences.ALL;
}

export function setNotificationPreference(preference) {
  if (Object.values(notificationPreferences).includes(preference)) {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, preference);
  }
}

export function hasNotificationPermission() {
  return "Notification" in window && Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return Notification.permission === "granted";
}

export function shouldNotifyForHoliday(holiday) {
  const preference = getNotificationPreference();
  
  if (preference === notificationPreferences.NONE) {
    return false;
  }
  
  if (preference === notificationPreferences.MAJOR) {
    return holiday.category === "major";
  }
  
  return true; // ALL
}

export function sendHolidayNotification(holiday) {
  if (!hasNotificationPermission()) {
    return;
  }

  if (!shouldNotifyForHoliday(holiday)) {
    return;
  }

  const notifiedHolidays = getNotifiedHolidaysForToday();
  if (notifiedHolidays.includes(holiday.id)) {
    return; // Already notified today
  }

  const notification = new Notification(holiday.title, {
    body: holiday.greeting,
    icon: "/favicon.ico",
    tag: `holiday-${holiday.id}`,
    requireInteraction: false,
  });

  notification.onclick = () => {
    window.location.href = `/holiday/${holiday.id}`;
    notification.close();
  };

  // Mark as notified
  markHolidayAsNotified(holiday.id);
}

export function getNotifiedHolidaysForToday() {
  const today = new Date().toISOString().split("T")[0];
  const stored = localStorage.getItem(`${NOTIFIED_HOLIDAYS_KEY}_${today}`);
  return stored ? JSON.parse(stored) : [];
}

export function markHolidayAsNotified(holidayId) {
  const today = new Date().toISOString().split("T")[0];
  const key = `${NOTIFIED_HOLIDAYS_KEY}_${today}`;
  const notified = getNotifiedHolidaysForToday();
  if (!notified.includes(holidayId)) {
    notified.push(holidayId);
    localStorage.setItem(key, JSON.stringify(notified));
  }
}

export function cleanOldNotificationRecords() {
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(NOTIFIED_HOLIDAYS_KEY)) {
      const dateStr = key.replace(`${NOTIFIED_HOLIDAYS_KEY}_`, "");
      const date = new Date(dateStr);
      if (date < sevenDaysAgo) {
        localStorage.removeItem(key);
      }
    }
  }
}

export function scheduleHolidayNotifications(holidays) {
  cleanOldNotificationRecords();
  
  const today = new Date().toISOString().split("T")[0];
  
  holidays.forEach((holiday) => {
    // Check if holiday is today or tomorrow
    const holidayDate = holiday.date;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    
    if (holidayDate === today || holidayDate === tomorrowStr) {
      sendHolidayNotification(holiday);
    }
  });
}