import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Global cache of translations
let translationCache = {};
let cacheLoaded = false;

export function useLocalization() {
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          setLoading(false);
          return;
        }
        setUser(currentUser);

        // Load or create user settings
        const settings = await base44.entities.UserSettings.filter({ user_id: currentUser.id });
        if (settings.length > 0) {
          setUserSettings(settings[0]);
        } else {
          // Create default settings for new user
          const newSettings = await base44.entities.UserSettings.create({
            user_id: currentUser.id,
            ui_lang: 'en',
            content_lang: 'en',
            bible_translation: 'WEB'
          });
          setUserSettings(newSettings);
        }

        // Load translations once
        if (!cacheLoaded) {
          const allStrings = await base44.entities.LocaleStrings.list();
          allStrings.forEach(item => {
            const cacheKey = `${item.key}:${item.lang}`;
            translationCache[cacheKey] = item.value;
          });
          cacheLoaded = true;
        }
      } catch (error) {
        console.error('Localization init error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // t(key) — get translation with fallback
  const t = (key, defaultValue = '') => {
    const lang = userSettings?.ui_lang || 'en';
    const cacheKey = `${key}:${lang}`;
    const enKey = `${key}:en`;

    // Try user language first
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    // Fallback to English
    if (lang !== 'en' && translationCache[enKey]) {
      return translationCache[enKey];
    }

    // Return default or key (for debugging)
    return defaultValue || key;
  };

  // Update user language preference
  const setUILang = async (lang) => {
    if (!userSettings) return;
    try {
      const updated = await base44.entities.UserSettings.update(userSettings.id, {
        ui_lang: lang
      });
      setUserSettings(updated);
      // Trigger re-render across app by dispatching event
      window.dispatchEvent(new CustomEvent('localization-changed', { detail: { lang } }));
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  const setContentLang = async (lang) => {
    if (!userSettings) return;
    try {
      const updated = await base44.entities.UserSettings.update(userSettings.id, {
        content_lang: lang
      });
      setUserSettings(updated);
    } catch (error) {
      console.error('Failed to update content language:', error);
    }
  };

  return {
    t,
    ui_lang: userSettings?.ui_lang || 'en',
    content_lang: userSettings?.content_lang || 'en',
    setUILang,
    setContentLang,
    user,
    loading
  };
}