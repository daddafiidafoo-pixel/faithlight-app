import React, { createContext, useContext, useMemo } from "react";

const bundles = {
  en: {
    "common.welcome": "Welcome",
    "common.home": "Home",
    "common.settings": "Settings",
    "common.logout": "Logout",
    "nav.daily": "Daily",
    "nav.home": "Home",
    "nav.bible": "Bible",
    "nav.study": "Study",
    "nav.goals": "Goals",
    "nav.audio": "Audio",
    "nav.prayer": "Prayer",
    "nav.groups": "Groups",
    "nav.login": "Login",
    "prayer.title": "Prayer Assistant",
    "prayer.topicPlaceholder": "Enter prayer topic...",
    "prayer.generate": "Generate",
    "prayer.save": "Save",
    "prayer.requests": "Requests",
    "prayer.journal": "Journal",
    "prayer.active": "Active",
    "prayer.answered": "Answered",
    "bible.bookmarks": "Bookmarks",
    "bible.history": "Reading History",
    "bible.noBookmarks": "No bookmarks yet",
    "bible.noHistory": "No reading history yet"
  },
  om: {
    "common.welcome": "Akkasumus",
    "common.home": "Mana",
    "common.settings": "Filannoo",
    "common.logout": "Ba'a",
    "nav.daily": "Guyyaa",
    "nav.home": "Mana",
    "nav.bible": "Macaaba",
    "nav.study": "Barumsa",
    "nav.goals": "Galma",
    "nav.audio": "Fida",
    "nav.prayer": "Kadhannoo",
    "nav.groups": "Garee",
    "nav.login": "Gal",
    "prayer.title": "Kadhannaa Kadhannoo",
    "prayer.topicPlaceholder": "Gara kadhannaa galuu...",
    "prayer.generate": "Uumin",
    "prayer.save": "Kuula",
    "prayer.requests": "Gaaffii",
    "prayer.journal": "Kitaaba",
    "prayer.active": "Hojjii",
    "prayer.answered": "Deebii",
    "bible.bookmarks": "Mallattoo",
    "bible.history": "Seenaa Dubbisuu",
    "bible.noBookmarks": "Mallattoota hinqabne",
    "bible.noHistory": "Seenaa hinqabne"
  }
};

const I18nContext = createContext();

export function I18nProvider({ children, language = "en" }) {
  const value = useMemo(
    () => ({
      language,
      t: (key) => bundles[language]?.[key] || bundles.en[key] || key,
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}