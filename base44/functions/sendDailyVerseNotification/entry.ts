import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Localized notification titles & CTAs
const NOTIF_STRINGS = {
  en: { title: '📖 Daily Verse — FaithLight', cta: 'Read today\'s verse' },
  om: { title: '📖 Aayata Guyyaa — FaithLight', cta: 'Aayata har\'aa dubbisuuf' },
  am: { title: '📖 የዕለቱ ቃል — FaithLight', cta: 'የዛሬውን ቃል ያንብቡ' },
  ar: { title: '📖 آية اليوم — FaithLight', cta: 'اقرأ آية اليوم' },
  fr: { title: '📖 Verset du Jour — FaithLight', cta: 'Lire le verset du jour' },
  sw: { title: '📖 Aya ya Leo — FaithLight', cta: 'Soma aya ya leo' },
};

const ALLOWED_LANGUAGES = ['en', 'om', 'am', 'ar', 'fr', 'sw'];

// One verse-of-day result cached per language per run (avoids repeated API calls)
const verseCache = {};

async function getLocalizedVerse(base44, lang) {
  if (verseCache[lang]) return verseCache[lang];
  try {
    const res = await base44.functions.invoke('bibleBrainAPI', {
      action: 'verseOfDay',
      lang,
    });
    const verse = res?.data?.verse || null;
    verseCache[lang] = verse;
    return verse;
  } catch (e) {
    console.error(`[sendDailyVerseNotification] getLocalizedVerse failed lang=${lang}:`, e.message);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only for manual invocations; scheduled calls won't have a user
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }
    }

    // Current time in Toronto (hh:mm)
    const now = new Date();
    const torontoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Toronto' }));
    const currentTime = `${String(torontoTime.getHours()).padStart(2, '0')}:${String(torontoTime.getMinutes()).padStart(2, '0')}`;
    console.log(`[sendDailyVerseNotification] Running at ${currentTime} Toronto time`);

    // Fetch all users who have opted in to daily verse notifications
    const users = await base44.asServiceRole.entities.User.filter({
      daily_verse_notif_enabled: true,
    });

    let sent = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        // Only fire if user's chosen reminder time matches current minute
        const userTime = user.daily_verse_notif_time || '08:00';
        if (userTime !== currentTime) { skipped++; continue; }

        // Respect user's saved language preference; fall back to 'en'
        const lang = ALLOWED_LANGUAGES.includes(user.uiLanguage) ? user.uiLanguage : 'en';

        const verse = await getLocalizedVerse(base44, lang);
        const strings = NOTIF_STRINGS[lang] || NOTIF_STRINGS.en;

        // Build deep-link to verse of the day in the app
        const deepLink = verse?.book && verse?.chapter
          ? `/BibleReader?book=${verse.book}&chapter=${verse.chapter}&verse=${verse.verse}&lang=${lang}`
          : `/BibleReader?lang=${lang}`;

        const notifTitle = strings.title;
        const notifBody = verse?.available && verse?.text
          ? `${verse.reference}: "${verse.text.slice(0, 120)}…"`
          : `${strings.cta} — ${verse?.reference || 'Open FaithLight'}`;

        // Log notification record for client-side pickup
        await base44.asServiceRole.entities.Notification.create({
          userEmail: user.email,
          type: 'daily_verse',
          title: notifTitle,
          body: notifBody,
          deepLink,
          language: lang,
          isRead: false,
          sentAt: new Date().toISOString(),
        });

        // Also log digest record (used by existing email pipeline)
        await base44.asServiceRole.entities.DailyBibleVerseDigest.create({
          userEmail: user.email,
          verseReference: verse?.reference || 'Daily Verse',
          verseText: verse?.text || '',
          digestDate: now.toISOString().split('T')[0],
          sentViaPush: true,
          sentAt: new Date().toISOString(),
          language: lang,
          userPreference: 'morning',
        });

        sent++;
        console.log(`[sendDailyVerseNotification] sent to ${user.email} lang=${lang} ref=${verse?.reference}`);
      } catch (err) {
        console.error(`[sendDailyVerseNotification] failed for user ${user.email}:`, err.message);
      }
    }

    return Response.json({
      success: true,
      currentTime,
      usersChecked: users.length,
      sent,
      skipped,
    });
  } catch (error) {
    console.error('[sendDailyVerseNotification] Error:', error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});