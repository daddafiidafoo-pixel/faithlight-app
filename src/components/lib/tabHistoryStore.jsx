/**
 * tabHistoryStore — kept for backward compatibility.
 * New code should use lib/navigationStore + hooks/useAppNavigation.
 */
import { create } from 'zustand';

const TAB_DEFAULTS = {
  Home:    '/',
  Bible:   '/BibleReaderPage',
  Study:   '/AIHub',
  Saved:   '/Saved',
  Profile: '/UserProfile',
};

export const useTabHistoryStore = create((set, get) => ({
  tabHistory: {
    Home:    ['/'],
    Bible:   ['/BibleReaderPage'],
    Study:   ['/AIHub'],
    Saved:   ['/Saved'],
    Profile: ['/UserProfile'],
  },

  pushToTab: (tabName, path) => set((state) => {
    const prev = state.tabHistory[tabName] || [TAB_DEFAULTS[tabName] || '/'];
    if (prev[prev.length - 1] === path) return state;
    return {
      tabHistory: {
        ...state.tabHistory,
        [tabName]: [...prev, path].slice(-20),
      },
    };
  }),

  getCurrentPath: (tabName) => {
    const { tabHistory } = get();
    const h = tabHistory[tabName] || [];
    return h[h.length - 1] || TAB_DEFAULTS[tabName] || '/';
  },

  navigateBack: (tabName) => set((state) => {
    const h = state.tabHistory[tabName] || [];
    if (h.length <= 1) return state;
    return {
      tabHistory: {
        ...state.tabHistory,
        [tabName]: h.slice(0, -1),
      },
    };
  }),

  // Legacy aliases
  getTabHistory: (tabName) => get().tabHistory[tabName] || [],
  getCurrentTabPath: (tabName) => {
    const h = get().tabHistory[tabName] || [];
    return h[h.length - 1] || TAB_DEFAULTS[tabName] || '/';
  },
  popFromTab: (tabName) => set((state) => ({
    tabHistory: {
      ...state.tabHistory,
      [tabName]: (state.tabHistory[tabName] || []).slice(0, -1),
    },
  })),
  resetTabHistory: (tabName) => set((state) => ({
    tabHistory: {
      ...state.tabHistory,
      [tabName]: [TAB_DEFAULTS[tabName] || '/'],
    },
  })),
}));