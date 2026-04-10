/**
 * FaithLight Accessibility Store
 * Persists user accessibility preferences to localStorage.
 * Settings are applied as CSS classes on <html> by AccessibilityProvider.
 */
import React, { useState, useEffect, createContext, useContext } from 'react';

const STORAGE_KEY = 'faithlight_a11y';

const DEFAULTS = {
  textSize: 'medium',       // small | medium | large | xlarge
  highContrast: false,
  reduceMotion: false,
  screenReaderOptimized: false,
  captions: true,
  audioSpeed: 1.0,          // 0.75 | 1.0 | 1.25 | 1.5
};

function load() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }; }
  catch { return DEFAULTS; }
}

function save(prefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
}

function applyToDOM(prefs) {
  const html = document.documentElement;
  html.classList.remove('fl-text-small', 'fl-text-medium', 'fl-text-large', 'fl-text-xlarge');
  html.classList.add(`fl-text-${prefs.textSize}`);
  html.classList.toggle('fl-high-contrast', prefs.highContrast);
  html.classList.toggle('fl-reduce-motion', prefs.reduceMotion);
  html.classList.toggle('fl-sr-optimized', prefs.screenReaderOptimized);
}

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
   const [prefs, setPrefs] = useState(load());

  useEffect(() => {
    applyToDOM(prefs);
    save(prefs);
  }, [prefs]);

  const update = (key, value) => setPrefs(p => ({ ...p, [key]: value }));

  return (
    <AccessibilityContext.Provider value={{ prefs, update }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) return { prefs: DEFAULTS, update: () => {} };
  return ctx;
}