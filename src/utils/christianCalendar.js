function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Gregorian Easter calculation
export function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

export function getChristianHolidays(year) {
  const easter = getEasterDate(year);

  const holidays = [
    {
      id: 'ash-wednesday',
      date: formatDateLocal(addDays(easter, -46)),
      type: 'moving',
    },
    {
      id: 'palm-sunday',
      date: formatDateLocal(addDays(easter, -7)),
      type: 'moving',
    },
    {
      id: 'maundy-thursday',
      date: formatDateLocal(addDays(easter, -3)),
      type: 'moving',
    },
    {
      id: 'good-friday',
      date: formatDateLocal(addDays(easter, -2)),
      type: 'moving',
    },
    {
      id: 'holy-saturday',
      date: formatDateLocal(addDays(easter, -1)),
      type: 'moving',
    },
    {
      id: 'easter-sunday',
      date: formatDateLocal(easter),
      type: 'moving',
    },
    {
      id: 'easter-monday',
      date: formatDateLocal(addDays(easter, 1)),
      type: 'moving',
    },
    {
      id: 'ascension-day',
      date: formatDateLocal(addDays(easter, 39)),
      type: 'moving',
    },
    {
      id: 'pentecost',
      date: formatDateLocal(addDays(easter, 49)),
      type: 'moving',
    },
    {
      id: 'trinity-sunday',
      date: formatDateLocal(addDays(easter, 56)),
      type: 'moving',
    },
    {
      id: 'christmas',
      date: `${year}-12-25`,
      type: 'fixed',
    },
    {
      id: 'epiphany',
      date: `${year}-01-06`,
      type: 'fixed',
    },
    {
      id: 'all-saints-day',
      date: `${year}-11-01`,
      type: 'fixed',
    },
  ];

  return holidays;
}