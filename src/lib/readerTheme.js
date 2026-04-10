// Reader theme persistence: light | dark | sepia
const KEY = 'faithlight_reader_theme';

export const THEMES = {
  light: {
    id: 'light',
    label: 'Light',
    bg: '#F8F6F1',
    cardBg: '#FFFFFF',
    text: '#1F2937',
    muted: '#6B7280',
    border: '#E5E7EB',
    headerBg: '#FFFFFF',
    verseNumColor: '#9CA3AF',
    navBg: '#FFFFFF',
  },
  sepia: {
    id: 'sepia',
    label: 'Sepia',
    bg: '#F5EFE0',
    cardBg: '#FDF6E3',
    text: '#3B2F1E',
    muted: '#7C6547',
    border: '#DDD0B8',
    headerBg: '#FDF6E3',
    verseNumColor: '#A8906A',
    navBg: '#FDF6E3',
  },
  dark: {
    id: 'dark',
    label: 'Dark',
    bg: '#0F172A',
    cardBg: '#1E293B',
    text: '#F1F5F9',
    muted: '#94A3B8',
    border: '#334155',
    headerBg: '#1E293B',
    verseNumColor: '#64748B',
    navBg: '#1E293B',
  },
};

export function getReaderTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && THEMES[saved]) return THEMES[saved];
  } catch {}
  return THEMES.light;
}

export function saveReaderTheme(themeId) {
  try {
    localStorage.setItem(KEY, themeId);
  } catch {}
}