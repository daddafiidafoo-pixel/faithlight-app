import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { isRTLLanguage, getLanguage } from '../functions/languageConfig.js';

const LANGUAGE_STORAGE_KEY = 'faithlight_language';

export function useLanguage() {
  const [selectedLanguage, setSelectedLanguageState] = useState('en');
  const [isRTL, setIsRTL] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Initialize language from storage or user profile
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Guard: Check base44 is available
        if (!base44?.auth) {
          setIsLoading(false);
          return;
        }

        // Check if user is logged in
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (isAuthenticated) {
          const currentUser = await base44.auth.me();
          if (currentUser) {
            setUser(currentUser);
            
            // Try user's saved preference
            if (currentUser.preferred_language_code) {
              const isRtl = isRTLLanguage({ code: currentUser.preferred_language_code });
              setSelectedLanguageState(currentUser.preferred_language_code);
              setIsRTL(typeof isRtl === 'boolean' ? isRtl : false);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error initializing language:', error);
      }

      // Fall back to localStorage
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) {
        const isRtl = isRTLLanguage({ code: stored });
        setSelectedLanguageState(stored);
        setIsRTL(typeof isRtl === 'boolean' ? isRtl : false);
      } else {
        // Default to English (first-launch detection handled in FirstLaunchLanguageModal)
        setSelectedLanguageState('en');
        setIsRTL(false);
      }
      
      setIsLoading(false);
    };

    initializeLanguage();
  }, []);

  const setLanguage = useCallback(async (langCode) => {
    // Guard: Validate language code
    if (!langCode || typeof langCode !== 'string') {
      console.error('[useLanguage] Invalid language code:', langCode);
      return;
    }

    const isRtl = isRTLLanguage({ code: langCode });
    setSelectedLanguageState(langCode);
    setIsRTL(typeof isRtl === 'boolean' ? isRtl : false);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);

    // Sync to user profile if logged in
    if (user?.id && base44?.auth?.updateMe) {
      try {
        await base44.auth.updateMe({ preferred_language_code: langCode });
      } catch (error) {
        console.error('[useLanguage] Error saving language preference:', error);
        // Don't crash on save error - language is still set locally
      }
    }
  }, [user]);

  const languageInfo = getLanguage({ code: selectedLanguage });

  return {
    selectedLanguage,
    setLanguage,
    isRTL,
    isLoading,
    languageInfo,
    user
  };
}