import { getChristianHolidays } from './christianCalendar';
import { holidayContent } from './christianHolidayContent';

export function buildChristianHolidays(year = new Date().getFullYear()) {
  return getChristianHolidays(year).map((holiday) => ({
    ...holiday,
    ...(holidayContent[holiday.id] || {
      title: { en: holiday.id },
      description: { en: '' },
    }),
  }));
}