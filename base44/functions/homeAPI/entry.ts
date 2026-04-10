import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ── Seed verses for verse of the day ──────────────────────────────────────
const DAILY_VERSES = [
  { ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { ref: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd, I lack nothing.' },
  { ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.' },
  { ref: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
];

function getVersForDate(date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

// ── Main handler ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, language = 'en' } = await req.json();

    console.log(`[homeAPI] userEmail=${userEmail} lang=${language}`);

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // 1. Get verse of the day
    const verse = getVersForDate(today);

    // 2. Generate or fetch daily devotion
    let devotion = null;
    try {
      const devRes = await base44.asServiceRole.functions.invoke('generateDailyAIDevotional', {
        date: dateStr,
        language: language || 'en',
      });
      if (devRes.data?.success) {
        devotion = devRes.data.devotion;
      }
    } catch (err) {
      console.warn('[homeAPI] devotion generation failed:', err.message);
    }

    // 3. Get user reading progress (if logged in)
    let readingProgress = null;
    if (userEmail) {
      const progress = await base44.entities.UserReadingProgress.filter(
        { userEmail, isActive: true },
        '-lastCompletedAt',
        1
      );
      if (progress.length > 0) {
        readingProgress = {
          planId: progress[0].planId,
          planTitle: progress[0].planTitle,
          dayNumber: progress[0].currentDay,
          totalDays: progress[0].totalDays,
          progressPercent: Math.round((progress[0].currentDay / progress[0].totalDays) * 100),
        };
      }
    }

    // 4. Get prayer summary (if logged in)
    let prayerSummary = null;
    if (userEmail) {
      const prayers = await base44.entities.PrayerCircleRequest.filter({ authorEmail: userEmail });
      prayerSummary = {
        activeCount: prayers.filter(p => p.status !== 'answered' && p.status !== 'archived').length,
        nextReminder: '20:00',
      };
    }

    console.log(`[homeAPI] success`);

    return Response.json({
      success: true,
      verseOfDay: {
        reference: verse.ref,
        text: verse.text,
      },
      dailyDevotion: devotion || null,
      readingProgress,
      prayerSummary,
      date: dateStr,
    });
  } catch (error) {
    console.error('[homeAPI] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});