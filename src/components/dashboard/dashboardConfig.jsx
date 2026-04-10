export const ALL_WIDGETS = [
  {
    id: 'my_progress',
    label: 'My Progress',
    icon: '📈',
    description: 'Track your spiritual growth level and course progress',
    defaultOn: true,
  },
  {
    id: 'daily_verse',
    label: 'Daily Verse',
    icon: '📖',
    description: 'Verse of the day with reflection',
    defaultOn: true,
  },
  {
    id: 'recommended_courses',
    label: 'Recommended Courses',
    icon: '✨',
    description: 'AI-powered Bible study recommendations',
    defaultOn: true,
  },
  {
    id: 'community_activity',
    label: 'Community Activity',
    icon: '👥',
    description: 'Recent activity in your groups',
    defaultOn: true,
  },
  {
    id: 'prayer_requests',
    label: 'Prayer Requests',
    icon: '🙏',
    description: 'Prayer requests from your groups',
    defaultOn: true,
  },
  {
    id: 'growth_path',
    label: 'Growth Path',
    icon: '🌱',
    description: 'Your 4-level spiritual journey',
    defaultOn: false,
  },
  {
    id: 'daily_checkin',
    label: 'Daily Check-In',
    icon: '🔥',
    description: 'Earn points for daily activities & study',
    defaultOn: true,
  },
  {
    id: 'ai_content_hub',
    label: 'AI Content Studio',
    icon: '✨',
    description: 'Generate devotionals, discussion prompts & prayer responses',
    defaultOn: false,
  },
];

export const ALL_QUICK_LINKS = [
  { id: 'bible',        label: 'Bible Reader',          icon: '📖', page: 'BibleReader',          defaultOn: true  },
  { id: 'audio',        label: 'Audio Bible',           icon: '🎧', page: 'AudioBible',            defaultOn: true  },
  { id: 'groups',       label: 'My Groups',             icon: '👥', page: 'Groups',                defaultOn: true  },
  { id: 'tutor',        label: 'Bible Tutor',           icon: '💬', page: 'BibleTutor',            defaultOn: true  },
  { id: 'courses',      label: 'Explore Courses',       icon: '📚', page: 'ExploreCourses',        defaultOn: false },
  { id: 'study_hub',   label: 'Study Hub',             icon: '🔍', page: 'BibleStudyHub',         defaultOn: false },
  { id: 'paths',        label: 'Learning Paths',        icon: '🗺️',  page: 'LearningPathsBrowser', defaultOn: false },
  { id: 'sermon',       label: 'Sermon Builder',        icon: '🎤', page: 'SermonBuilder',         defaultOn: false },
  { id: 'friends',      label: 'Friends',               icon: '🤝', page: 'Friends',               defaultOn: false },
  { id: 'leaderboard',  label: 'Leaderboard',           icon: '🏆', page: 'GamificationLeaderboard', defaultOn: true  },
  { id: 'my_paths',     label: 'My Learning Paths',     icon: '🗺️',  page: 'PersonalizedLearningPath', defaultOn: true  },
];

export const DEFAULT_WIDGET_ORDER = ALL_WIDGETS.filter(w => w.defaultOn).map(w => w.id);
export const DEFAULT_QUICK_LINKS  = ALL_QUICK_LINKS.filter(l => l.defaultOn);