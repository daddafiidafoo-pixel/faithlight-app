import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Helper to select daily verse (deterministic based on date)
function getDailyVerse(dayOfYear) {
  const verses = [
    { ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
    { ref: 'Psalm 23:1', text: 'The Lord is my shepherd, I lack nothing.' },
    { ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
    { ref: 'Philippians 4:6', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
    { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
    { ref: 'Proverbs 27:12', text: 'The prudent see danger and take refuge, but the simple keep going and pay the penalty.' },
    { ref: 'Hebrews 11:1', text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
    { ref: '1 Peter 5:7', text: 'Cast all your anxiety on him because he cares for you.' },
    { ref: 'Colossians 3:15', text: 'Let the peace of Christ rule in your hearts, since as members of one body you were called to peace.' },
    { ref: 'Matthew 11:28', text: 'Come to me, all you who are weary and burdened, and I will give you rest.' }
  ];
  
  return verses[dayOfYear % verses.length];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users with notification preferences
    const prefs = await base44.asServiceRole.entities.NotificationPreferences.list();
    
    if (!prefs || prefs.length === 0) {
      return Response.json({ processed: 0, sent: 0 });
    }

    const today = new Date().toISOString().split('T')[0];
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const { ref: verseRef, text: verseText } = getDailyVerse(dayOfYear);

    let sent = 0;

    for (const pref of prefs) {
      if (pref.verseReminderEnabled && pref.userEmail && ['email', 'push', 'both'].includes(pref.preferredChannel || 'both')) {
        // Generate AI reflection
        const reflectionResp = await base44.functions.invoke('generateDailyVerseDigest', {
          verseReference: verseRef,
          verseText: verseText,
          userLanguage: pref.reminderLanguage || 'en'
        });

        // Create digest record
        await base44.asServiceRole.entities.DailyBibleVerseDigest.create({
          userEmail: pref.userEmail,
          verseReference: verseRef,
          verseText: verseText,
          aiReflection: reflectionResp.data.aiReflection,
          digestDate: today,
          userPreference: pref.userEmail ? (pref.preferredChannel || 'both') : 'none',
          sentViaPush: false,
          sentViaEmail: false
        });

        // Send email if enabled
        if (pref.userEmail && ['email', 'both'].includes(pref.preferredChannel || 'both')) {
          try {
            await base44.integrations.Core.SendEmail({
              to: pref.userEmail,
              subject: `Daily Verse: ${verseRef}`,
              body: `${verseRef}\n\n"${verseText}"\n\nReflection:\n${reflectionResp.data.aiReflection}`
            });
            sent++;
          } catch (err) {
            console.error(`Email send failed for ${pref.userEmail}:`, err);
          }
        }
      }
    }

    return Response.json({ processed: prefs.length, sent });
  } catch (error) {
    console.error('Daily digest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});