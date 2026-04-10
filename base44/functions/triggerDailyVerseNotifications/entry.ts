import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// This function is called by a scheduled automation daily.
// It checks all users with dailyDevotionEnabled=true and sends them their daily verse email
// at approximately their preferred delivery time.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get the current UTC hour
    const nowUTC = new Date();
    const currentHour = nowUTC.getUTCHours();
    const currentHHMM = `${String(currentHour).padStart(2, '0')}:00`;

    console.log(`[DailyVerseNotifications] Running for hour: ${currentHHMM} UTC`);

    // Get all users with daily devotion enabled at this hour
    // We look for users whose dailyDevotionTime matches the current hour
    const allUsers = await base44.asServiceRole.entities.UserSession.filter({
      dailyDevotionEnabled: true,
    });

    const targetUsers = allUsers.filter(u => {
      if (!u.dailyDevotionTime) return currentHHMM === '08:00'; // default 8am
      return u.dailyDevotionTime.startsWith(currentHHMM.split(':')[0]);
    });

    console.log(`[DailyVerseNotifications] Found ${targetUsers.length} users to notify`);

    if (targetUsers.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No users scheduled for this hour' });
    }

    // Get today's verse
    const today = new Date().toISOString().split('T')[0];
    let verseRef = 'John 3:16';
    let verseText = 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.';
    let verseTheme = 'Love';

    try {
      const verses = await base44.asServiceRole.entities.DailyAIDevotional.filter({ date: today });
      if (verses.length > 0) {
        verseRef = verses[0].verseReference;
        verseText = verses[0].verseText || verseText;
        verseTheme = verses[0].theme || verseTheme;
      }
    } catch (e) {
      console.warn('[DailyVerseNotifications] Could not fetch devotional, using fallback verse', e.message);
    }

    let sent = 0;
    const errors = [];

    for (const user of targetUsers) {
      if (!user.userEmail) continue;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.userEmail,
          subject: `✨ Your Daily Bible Verse — ${verseTheme}`,
          body: `
<!DOCTYPE html>
<html>
<body style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #F7F8FC; padding: 24px;">
  <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 24px;">
      <p style="font-size: 13px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px 0;">✨ Daily Verse — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      <h1 style="font-size: 22px; font-weight: bold; color: #1F2937; margin: 0;">${verseTheme}</h1>
    </div>

    <div style="background: linear-gradient(135deg, #EEF2FF, #F5F3FF); border-radius: 12px; padding: 24px; margin: 20px 0; border-left: 4px solid #6C5CE7;">
      <p style="font-size: 13px; font-weight: bold; color: #6C5CE7; margin: 0 0 12px 0;">${verseRef}</p>
      <p style="font-size: 17px; line-height: 1.7; color: #374151; font-style: italic; margin: 0;">"${verseText}"</p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <p style="font-size: 13px; color: #9CA3AF;">May this verse guide your day 🙏</p>
      <p style="font-size: 11px; color: #D1D5DB; margin-top: 16px;">
        You're receiving this because you subscribed to Daily Verse in FaithLight.<br/>
        To change your delivery time, visit <strong>Settings → Notifications</strong>.
      </p>
    </div>
  </div>
</body>
</html>
          `.trim(),
        });
        sent++;
        console.log(`[DailyVerseNotifications] Sent to ${user.userEmail}`);
      } catch (e) {
        console.error(`[DailyVerseNotifications] Failed for ${user.userEmail}:`, e.message);
        errors.push(user.userEmail);
      }
    }

    return Response.json({
      success: true,
      sent,
      failed: errors.length,
      hour: currentHHMM,
      verse: verseRef,
    });
  } catch (error) {
    console.error('[DailyVerseNotifications] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});