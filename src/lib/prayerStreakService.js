// Prayer streak tracking and management
const STREAK_STORAGE_KEY = 'fl_prayer_streak';
const STREAK_DATA_KEY = 'fl_prayer_streak_data';

export const getPrayerStreak = (userEmail) => {
  if (!userEmail) return { streak: 0, lastPrayedDate: null };
  
  const data = JSON.parse(localStorage.getItem(`${STREAK_DATA_KEY}_${userEmail}`) || '{"streak": 0, "lastPrayedDate": null}');
  return data;
};

export const updatePrayerStreak = (userEmail) => {
  if (!userEmail) return;
  
  const today = new Date().toDateString();
  const current = getPrayerStreak(userEmail);
  
  // If already prayed today, don't increment
  if (current.lastPrayedDate === today) return current;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  // If last prayer was yesterday, increment streak
  // Otherwise reset to 1
  const newStreak = current.lastPrayedDate === yesterdayStr ? current.streak + 1 : 1;
  
  const updated = { streak: newStreak, lastPrayedDate: today };
  localStorage.setItem(`${STREAK_DATA_KEY}_${userEmail}`, JSON.stringify(updated));
  
  return updated;
};

export const getMilestones = (streak) => {
  const milestones = [7, 14, 21, 30, 50, 100, 365];
  return milestones.filter(m => m <= streak);
};

export const getNextMilestone = (streak) => {
  const milestones = [7, 14, 21, 30, 50, 100, 365];
  return milestones.find(m => m > streak) || null;
};

export const resetStreak = (userEmail) => {
  if (!userEmail) return;
  localStorage.removeItem(`${STREAK_DATA_KEY}_${userEmail}`);
};