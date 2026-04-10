const SETTINGS_KEY = 'faithlight_reader_settings';

export const DEFAULT_SETTINGS = {
  fontSize: 16,
  theme: 'light', // 'light' | 'dark' | 'sepia'
  lineHeight: 1.7,
};

export function getReaderSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveReaderSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}