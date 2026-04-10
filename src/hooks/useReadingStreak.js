import { useEffect, useState } from 'react';

export function useReadingStreak() {
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState([]);
  const [totalDaysRead, setTotalDaysRead] = useState(0);

  useEffect(() => {
    const storedStreak = localStorage.getItem('readingStreak');
    const storedDates = JSON.parse(localStorage.getItem('readingDates') || '[]');

    if (storedStreak) {
      setStreak(parseInt(storedStreak));
    }

    // Calculate total days read
    setTotalDaysRead(storedDates.length);

    // Calculate level based on total days
    const newLevel = Math.floor(storedDates.length / 10) + 1;
    setLevel(newLevel);

    // Award badges
    const newBadges = [];
    if (storedDates.length >= 7) newBadges.push('week');
    if (storedDates.length >= 30) newBadges.push('month');
    if (storedDates.length >= 365) newBadges.push('year');
    setBadges(newBadges);
  }, []);

  const recordReading = () => {
    const today = new Date().toISOString().split('T')[0];
    const storedDates = JSON.parse(localStorage.getItem('readingDates') || '[]');
    const lastDate = localStorage.getItem('lastReadingDate');

    if (lastDate !== today) {
      if (lastDate === getYesterdayDate()) {
        // Increment streak
        const currentStreak = parseInt(localStorage.getItem('readingStreak') || '0') + 1;
        localStorage.setItem('readingStreak', currentStreak);
        setStreak(currentStreak);
      } else {
        // Reset streak
        localStorage.setItem('readingStreak', '1');
        setStreak(1);
      }

      if (!storedDates.includes(today)) {
        storedDates.push(today);
        localStorage.setItem('readingDates', JSON.stringify(storedDates));
        setTotalDaysRead(storedDates.length);
      }

      localStorage.setItem('lastReadingDate', today);
    }
  };

  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  return { streak, level, badges, totalDaysRead, recordReading };
}