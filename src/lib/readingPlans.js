// Local reading plans data
export const readingPlans = [
  {
    id: 'new-believers-journey',
    title: "New Believer's Journey",
    description: 'A guided introduction to core Bible passages.',
    durationDays: 14,
    icon: '✨',
    dailyReadings: [
      {
        dayNumber: 1,
        title: "God's Love",
        passages: ['John 3:16', 'Romans 5:1-11'],
        reflectionPrompt: 'What does this passage teach you about God\'s love?',
      },
      {
        dayNumber: 2,
        title: 'Salvation Through Faith',
        passages: ['Ephesians 2:8-10', '1 Corinthians 15:3-4'],
        reflectionPrompt: 'How does faith shape your relationship with God?',
      },
      {
        dayNumber: 3,
        title: 'The Holy Spirit',
        passages: ['John 14:26', 'Galatians 5:22-23'],
        reflectionPrompt: 'How can the Holy Spirit guide your daily life?',
      },
      {
        dayNumber: 4,
        title: 'Prayer & Communication',
        passages: ['1 Thessalonians 5:17', 'Philippians 4:6-7'],
        reflectionPrompt: 'What does constant prayer mean in your context?',
      },
      {
        dayNumber: 5,
        title: 'God\'s Word',
        passages: ['2 Timothy 3:16-17', 'Psalm 119:105'],
        reflectionPrompt: 'How can Scripture guide your decisions?',
      },
      {
        dayNumber: 6,
        title: 'Community & Church',
        passages: ['Hebrews 10:24-25', 'Matthew 18:20'],
        reflectionPrompt: 'Why is Christian community important?',
      },
      {
        dayNumber: 7,
        title: 'Serving Others',
        passages: ['Galatians 5:13-14', 'Matthew 25:31-46'],
        reflectionPrompt: 'How can you serve those around you?',
      },
      {
        dayNumber: 8,
        title: 'Overcoming Sin',
        passages: ['Romans 6:11-12', 'James 1:14-15'],
        reflectionPrompt: 'What struggles do you face, and how can faith help?',
      },
      {
        dayNumber: 9,
        title: 'Trusting God',
        passages: ['Proverbs 3:5-6', 'Philippians 4:4-7'],
        reflectionPrompt: 'In what areas of life do you struggle to trust?',
      },
      {
        dayNumber: 10,
        title: 'Forgiveness',
        passages: ['Colossians 3:13', 'Matthew 18:21-22'],
        reflectionPrompt: 'Who do you need to forgive or ask forgiveness from?',
      },
      {
        dayNumber: 11,
        title: 'Living as a Christian',
        passages: ['1 Peter 2:11-12', 'Titus 2:11-12'],
        reflectionPrompt: 'How should your faith affect your daily choices?',
      },
      {
        dayNumber: 12,
        title: 'Hope & Future',
        passages: ['Romans 8:28', '1 John 3:2-3'],
        reflectionPrompt: 'What hope does your faith give you?',
      },
      {
        dayNumber: 13,
        title: 'Growing in Faith',
        passages: ['2 Peter 3:18', 'Ephesians 4:11-13'],
        reflectionPrompt: 'How will you continue growing spiritually?',
      },
      {
        dayNumber: 14,
        title: 'Your Journey Continues',
        passages: ['Joshua 1:8', 'Psalm 1:1-3'],
        reflectionPrompt: 'What comes next in your faith journey?',
      },
    ],
  },
  {
    id: 'psalms-30-days',
    title: 'Psalms in 30 Days',
    description: 'Journey through the Psalms—poetry, prayer, and truth.',
    durationDays: 30,
    icon: '🎵',
    dailyReadings: [
      { dayNumber: 1, title: 'Praise & Joy', passages: ['Psalm 100'], reflectionPrompt: 'What are you grateful for today?' },
      { dayNumber: 2, title: 'Trust in Crisis', passages: ['Psalm 23'], reflectionPrompt: 'How does God comfort you?' },
      { dayNumber: 3, title: 'Forgiveness', passages: ['Psalm 32'], reflectionPrompt: 'What do you need to let go of?' },
      { dayNumber: 4, title: 'Strength in Weakness', passages: ['Psalm 27'], reflectionPrompt: 'When do you feel weak?' },
      { dayNumber: 5, title: 'Seeking God', passages: ['Psalm 42'], reflectionPrompt: 'How do you seek closeness with God?' },
      { dayNumber: 6, title: 'Refuge', passages: ['Psalm 46'], reflectionPrompt: 'Where do you find safety?' },
      { dayNumber: 7, title: 'Worship', passages: ['Psalm 51'], reflectionPrompt: 'What does worship mean to you?' },
      { dayNumber: 8, title: 'Meditation', passages: ['Psalm 63'], reflectionPrompt: 'What truths do you need to remember?' },
      { dayNumber: 9, title: 'Justice & Mercy', passages: ['Psalm 72'], reflectionPrompt: 'How should justice and mercy meet?' },
      { dayNumber: 10, title: 'Thanksgiving', passages: ['Psalm 92'], reflectionPrompt: 'What recent blessings are you thankful for?' },
      { dayNumber: 11, title: 'Celebration', passages: ['Psalm 95'], reflectionPrompt: 'How do you celebrate with others?' },
      { dayNumber: 12, title: 'Guidance', passages: ['Psalm 119:1-32'], reflectionPrompt: 'How does Scripture guide you?' },
      { dayNumber: 13, title: 'Comfort', passages: ['Psalm 121'], reflectionPrompt: 'Where does your help come from?' },
      { dayNumber: 14, title: 'Belonging', passages: ['Psalm 133'], reflectionPrompt: 'How do you find belonging?' },
      { dayNumber: 15, title: 'Praise', passages: ['Psalm 138'], reflectionPrompt: 'What deserves your praise?' },
      { dayNumber: 16, title: 'Search', passages: ['Psalm 139'], reflectionPrompt: 'Does God truly know you?' },
      { dayNumber: 17, title: 'Petition', passages: ['Psalm 143'], reflectionPrompt: 'What do you need to ask God for?' },
      { dayNumber: 18, title: 'Celebration', passages: ['Psalm 145'], reflectionPrompt: 'How do you celebrate God\'s greatness?' },
      { dayNumber: 19, title: 'Stillness', passages: ['Psalm 131'], reflectionPrompt: 'Can you be still in your faith?' },
      { dayNumber: 20, title: 'Night Thoughts', passages: ['Psalm 17'], reflectionPrompt: 'What keeps you awake?' },
      { dayNumber: 21, title: 'The Shepherd', passages: ['Psalm 80'], reflectionPrompt: 'What shepherding do you need?' },
      { dayNumber: 22, title: 'Eternal Truth', passages: ['Psalm 90'], reflectionPrompt: 'What is eternal in your life?' },
      { dayNumber: 23, title: 'Joy', passages: ['Psalm 97'], reflectionPrompt: 'What brings you joy?' },
      { dayNumber: 24, title: 'Hope', passages: ['Psalm 71'], reflectionPrompt: 'Where is your hope?' },
      { dayNumber: 25, title: 'Evening Rest', passages: ['Psalm 4'], reflectionPrompt: 'Can you rest in peace tonight?' },
      { dayNumber: 26, title: 'Morning Praise', passages: ['Psalm 5'], reflectionPrompt: 'How do you start your day?' },
      { dayNumber: 27, title: 'Deliverance', passages: ['Psalm 7'], reflectionPrompt: 'From what do you need deliverance?' },
      { dayNumber: 28, title: 'Awe', passages: ['Psalm 8'], reflectionPrompt: 'What fills you with wonder?' },
      { dayNumber: 29, title: 'Justice', passages: ['Psalm 9'], reflectionPrompt: 'Where do you see injustice?' },
      { dayNumber: 30, title: 'Journey\'s End', passages: ['Psalm 150'], reflectionPrompt: 'How will you praise God going forward?' },
    ],
  },
];

// LocalStorage-backed progress
const PROGRESS_KEY = 'faithlight_reading_plan_progress';

export function getReadingPlanProgress(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    return all.filter(p => p.userId === userId);
  } catch {
    return [];
  }
}

export function saveReadingPlanProgress(userId, planId, completedDays, startedAt = new Date().toISOString()) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    const existing = all.findIndex(p => p.userId === userId && p.planId === planId);
    
    const progress = {
      userId,
      planId,
      completedDays: Array.isArray(completedDays) ? completedDays : [completedDays],
      startedAt,
      updatedAt: new Date().toISOString(),
    };

    if (existing >= 0) {
      all[existing] = progress;
    } else {
      all.push(progress);
    }

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
    return progress;
  } catch (e) {
    console.error('Error saving reading plan progress:', e);
    return null;
  }
}

export function getActivePlan(userId) {
  const progress = getReadingPlanProgress(userId);
  if (!progress.length) return null;
  
  const plan = readingPlans.find(p => p.id === progress[0].planId);
  const prg = progress[0];
  
  return {
    plan,
    progress: prg,
    percentComplete: Math.round((prg.completedDays.length / plan.durationDays) * 100),
    nextDay: Math.max(...prg.completedDays) + 1 || 1,
  };
}

export function markDayComplete(userId, planId, dayNumber) {
  const current = getReadingPlanProgress(userId).find(p => p.planId === planId);
  const completedDays = current ? [...new Set([...current.completedDays, dayNumber])] : [dayNumber];
  return saveReadingPlanProgress(userId, planId, completedDays, current?.startedAt);
}