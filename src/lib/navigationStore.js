/**
 * Unified Navigation Store
 * Manages per-tab history stack, back navigation, and URL state.
 * Additive — does not break existing web router behaviour.
 */
import { create } from 'zustand';

// The five root tabs and their default landing pages
export const TAB_ROOTS = {
  Home:    '/',
  Bible:   '/BibleReaderPage',
  Study:   '/AIHub',
  Saved:   '/Saved',
  Profile: '/UserProfile',
};

// Which page names belong to which tab root
export const PAGE_TO_TAB = {
  Home: 'Home',
  // Bible tab
  BibleReaderPage: 'Bible',
  BibleReader: 'Bible',
  BibleReaderNew: 'Bible',
  BibleSearch: 'Bible',
  BibleMarathon: 'Bible',
  BibleProgressDashboard: 'Bible',
  BibleJournal: 'Bible',
  AudioBible: 'Bible',
  // Study tab
  AIHub: 'Study',
  AIBibleGuide: 'Study',
  AIPrayerJournal: 'Study',
  SermonAnalyzer: 'Study',
  AIStudyPlanBuilder: 'Study',
  DailyDevotional: 'Study',
  FaithRoutineHub: 'Study',
  FaithXPDashboard: 'Study',
  MentorshipHub: 'Study',
  ReadingPlans: 'Study',
  Quiz: 'Study',
  Leaderboard: 'Study',
  // Saved tab
  Saved: 'Saved',
  SavedVerses: 'Saved',
  MyJournal: 'Saved',
  MyHighlights: 'Saved',
  PrayerJournalPage: 'Saved',
  PersonalPrayerJournal: 'Saved',
  MyPrayerJournal: 'Saved',
  // Profile tab
  UserProfile: 'Profile',
  Settings: 'Profile',
  UserSettings: 'Profile',
  NotificationSettings: 'Profile',
  PrayerTimeSettings: 'Profile',
  PrayerReminderSettings: 'Profile',
  AccessibilitySettings: 'Profile',
  About: 'Profile',
};

// Pages that are root/tab landing pages — no back button shown
export const ROOT_PAGES = new Set([
  'Home', 'BibleReaderPage', 'AIHub', 'Saved', 'UserProfile',
]);

export const useNavigationStore = create((set, get) => ({
  // Per-tab history stacks  ['/path1', '/path2', ...]
  stacks: {
    Home:    ['/'],
    Bible:   ['/BibleReaderPage'],
    Study:   ['/AIHub'],
    Saved:   ['/Saved'],
    Profile: ['/UserProfile'],
  },

  // Which tab is currently active
  activeTab: 'Home',

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Push a page into the correct tab stack
  push: (tab, path) => set((state) => {
    const prev = state.stacks[tab] || [TAB_ROOTS[tab] || '/'];
    if (prev[prev.length - 1] === path) return state; // no-op if same page
    return {
      stacks: {
        ...state.stacks,
        [tab]: [...prev, path].slice(-20),
      },
    };
  }),

  // Pop the top of a tab's stack and return the new top
  pop: (tab) => {
    const state = get();
    const stack = state.stacks[tab] || [];
    if (stack.length <= 1) return TAB_ROOTS[tab] || '/';
    const newStack = stack.slice(0, -1);
    set({ stacks: { ...state.stacks, [tab]: newStack } });
    return newStack[newStack.length - 1];
  },

  // Get the top of a tab stack (current page in that tab)
  peek: (tab) => {
    const { stacks } = get();
    const stack = stacks[tab] || [];
    return stack[stack.length - 1] || TAB_ROOTS[tab] || '/';
  },

  // Reset a tab to its root
  resetTab: (tab) => set((state) => ({
    stacks: {
      ...state.stacks,
      [tab]: [TAB_ROOTS[tab] || '/'],
    },
  })),

  // Determine which tab a pathname belongs to
  resolveTab: (pathname) => {
    // Exact match on root
    const tabEntry = Object.entries(TAB_ROOTS).find(([, root]) => root === pathname);
    if (tabEntry) return tabEntry[0];
    // Strip leading slash, match page name
    const page = pathname.replace(/^\//, '').split('?')[0];
    return PAGE_TO_TAB[page] || null;
  },
}));