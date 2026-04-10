/**
 * AppStore — global cross-app preferences only.
 * DO NOT add page-local state (loading flags, chat messages, etc.) here.
 *
 * Manages:
 *   - uiLanguage       : display language for all UI strings
 *   - bibleLanguage    : language for Bible text content
 *   - audioLanguage    : language for audio Bible playback
 *   - theme            : light | dark | system
 *   - currentUser      : authenticated user session (not persisted — fetched fresh)
 *   - globalAudioTrack : currently playing audio track (shared across pages)
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { serviceCache } from '@/components/services/cache/serviceCache';
import { getBibleConfig } from '../../lib/bibleConfig';

const AppContext = createContext(null);

const getStored = (key, fallback) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }) {
  // ── Persisted preferences ──────────────────────────────────
  const [uiLanguage, setUiLanguage] = useState(() => getStored("faithlight.uiLanguage", "en"));
  const [bibleLanguage, setBibleLanguage] = useState(() => getStored("faithlight.bibleLanguage", "en"));
  const [audioLanguage, setAudioLanguage] = useState(() => getStored("faithlight.audioLanguage", "en"));
  const [theme, setTheme] = useState(() => getStored("faithlight.theme", "system"));

  // ── Session state (not persisted) ─────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [globalAudioTrack, setGlobalAudioTrack] = useState(null);

  // When UI language changes, sync Bible language too (single source of truth)
  useEffect(() => {
    setBibleLanguage(uiLanguage);
    setAudioLanguage(uiLanguage);
  }, [uiLanguage]);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem("faithlight.bibleLanguage", JSON.stringify(bibleLanguage));
      } catch {}
    }
    // Invalidate cached Bible content when language changes so fresh content loads
    serviceCache.invalidatePrefix('bible_books:');
    serviceCache.invalidatePrefix('bible_chapter:');
    serviceCache.invalidatePrefix('verse_of_day:');
    serviceCache.invalidatePrefix('audio_track:');
    serviceCache.invalidatePrefix('audio_tracks:');
  }, [bibleLanguage]);
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem("faithlight.audioLanguage", JSON.stringify(audioLanguage));
      } catch {}
    }
    serviceCache.invalidatePrefix('audio_track:');
    serviceCache.invalidatePrefix('audio_tracks:');
  }, [audioLanguage]);
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem("faithlight.uiLanguage", JSON.stringify(uiLanguage));
      } catch {}
    }
    serviceCache.invalidatePrefix('ui_translations:');
  }, [uiLanguage]);
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem("faithlight.theme", JSON.stringify(theme));
      } catch {}
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      // preferences
      uiLanguage, setUiLanguage,
      bibleLanguage, setBibleLanguage,
      audioLanguage, setAudioLanguage,
      theme, setTheme,
      // session
      currentUser, setCurrentUser,
      globalAudioTrack, setGlobalAudioTrack,
    }),
    [uiLanguage, bibleLanguage, audioLanguage, theme, currentUser, globalAudioTrack]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppProvider");
  return ctx;
}