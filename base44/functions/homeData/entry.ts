/**
 * FaithLight Home Screen Data Loader
 * Single endpoint that powers the entire Home page.
 * Fetches: daily verse, streak, saved count, prayer count,
 *          reading plan progress, recent activity, notification prefs.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const DEFAULT_VERSE = {
  reference: 'Philippians 4:13',
  text: 'I can do all things through Christ who strengthens me.',
  theme: 'Strength',
  fallback: true,
};

async function getDailyVerse(base44, language) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const schedules = await base44.asServiceRole.entities.DailyVerseSchedule.filter({ scheduleDate: today });

    if (!schedules?.length) return { ...DEFAULT_VERSE };

    const schedule = schedules[0];
    const verseRefId = schedule.verseRefId;

    const [refs, texts] = await Promise.all([
      base44.asServiceRole.entities.BibleVerseRefs.filter({ id: verseRefId }),
      base44.asServiceRole.entities.BibleVerseTexts.filter({ verseRefId, languageCode: language }),
    ]);

    let verseText = null;
    let usedFallback = false;

    if (texts?.length) {
      verseText = texts[0].verseText;
    } else if (language !== 'en') {
      // Fallback to English
      const enTexts = await base44.asServiceRole.entities.BibleVerseTexts.filter({ verseRefId, languageCode: 'en' });
      verseText = enTexts?.[0]?.verseText || null;
      usedFallback = true;
    }

    if (!verseText || !refs?.length) return { ...DEFAULT_VERSE };

    const ref = refs[0];
    const bookNames = await base44.asServiceRole.entities.BibleBookNames.filter({ bookCode: ref.bookCode, languageCode: language });
    const bookName = bookNames?.[0]?.name || ref.bookCode;

    return {
      reference: `${bookName} ${ref.chapter}:${ref.verse}`,
      text: verseText,
      theme: schedule.theme || '',
      reflection: schedule.reflection || '',
      fallback: usedFallback,
    };
  } catch (err) {
    console.error('getDailyVerse error:', err.message);
    return { ...DEFAULT_VERSE };
  }
}

async function getStreak(base44, userEmail) {
  try {
    const streaks = await base44.asServiceRole.entities.Streak.filter({
      userEmail,
      streakType: 'bible_reading',
    });
    if (!streaks?.length) return { currentCount: 0, longestCount: 0 };
    return { currentCount: streaks[0].currentCount || 0, longestCount: streaks[0].longestCount || 0 };
  } catch {
    return { currentCount: 0, longestCount: 0 };
  }
}

async function getSavedCount(base44, userEmail) {
  try {
    const saved = await base44.asServiceRole.entities.Favorites.filter({ userId: userEmail });
    return saved?.length || 0;
  } catch {
    return 0;
  }
}

async function getPrayerCount(base44, userEmail) {
  try {
    const prayers = await base44.asServiceRole.entities.PrayerJournalEntry.filter({ userEmail });
    return prayers?.length || 0;
  } catch {
    return 0;
  }
}

async function getReadingPlanProgress(base44, userEmail) {
  try {
    const progress = await base44.asServiceRole.entities.ReadingPlanProgress.filter({
      userEmail,
      isActive: true,
    });
    if (!progress?.length) return null;

    const p = progress[0];
    return {
      planId: p.planId,
      currentDay: p.currentDay || 1,
      completedDaysCount: p.completedDaysCount || 0,
      startedAt: p.startedAt,
    };
  } catch {
    return null;
  }
}

async function getTodayEngagement(base44, userEmail) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const engagement = await base44.asServiceRole.entities.UserDailyEngagement.filter({
      userEmail,
      engagementDate: today,
    });
    if (!engagement?.length) return null;
    return engagement[0];
  } catch {
    return null;
  }
}

async function getRecentActivity(base44, userEmail) {
  try {
    const history = await base44.asServiceRole.entities.VerseHistory.filter(
      { userEmail },
    );
    // Sort by updated_date desc, take top 5
    const sorted = (history || [])
      .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
      .slice(0, 5);
    return sorted.map(h => ({
      type: 'read_verse',
      reference: h.reference || '',
      createdAt: h.updated_date,
    }));
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { language = 'en' } = await req.json().catch(() => ({}));

    // Try to get authenticated user
    let userEmail = null;
    let userName = null;
    try {
      const user = await base44.auth.me();
      userEmail = user?.email || null;
      userName = user?.full_name || user?.display_name || null;
    } catch {
      // Not authenticated — return public data only
    }

    // Always fetch the daily verse
    const dailyVerse = await getDailyVerse(base44, language);

    // If not logged in, return minimal payload fast
    if (!userEmail) {
      return Response.json({
        success: true,
        dailyVerse,
        streak: null,
        savedCount: 0,
        prayerCount: 0,
        readingPlan: null,
        todayEngagement: null,
        recentActivity: [],
        userName: null,
      });
    }

    // Logged-in: fetch all user data in parallel
    const [streak, savedCount, prayerCount, readingPlan, todayEngagement, recentActivity] = await Promise.all([
      getStreak(base44, userEmail),
      getSavedCount(base44, userEmail),
      getPrayerCount(base44, userEmail),
      getReadingPlanProgress(base44, userEmail),
      getTodayEngagement(base44, userEmail),
      getRecentActivity(base44, userEmail),
    ]);

    return Response.json({
      success: true,
      dailyVerse,
      streak,
      savedCount,
      prayerCount,
      readingPlan,
      todayEngagement,
      recentActivity,
      userName,
    });
  } catch (error) {
    console.error('homeData error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});