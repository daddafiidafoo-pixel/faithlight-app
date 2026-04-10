import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Curated plan catalog (mirrors the frontend) — needed to resolve day/passage info
const CURATED_PLANS = {
  'overcoming-anxiety': { title: 'Overcoming Anxiety', emoji: '🕊️', total_days: 7, days: [
    { day: 1, title: 'Cast Your Anxiety on Him', passage: 'Philippians 4:6-7' },
    { day: 2, title: 'Do Not Fear', passage: 'Isaiah 41:10' },
    { day: 3, title: 'The Peace That Surpasses', passage: 'John 14:27' },
    { day: 4, title: 'Renewing Your Mind', passage: 'Romans 12:2' },
    { day: 5, title: 'God\'s Perfect Love', passage: '1 John 4:18' },
    { day: 6, title: 'Strength in Stillness', passage: 'Psalm 46:10' },
    { day: 7, title: 'A Sound Mind', passage: '2 Timothy 1:7' },
  ]},
  'gospel-of-john-21': { title: 'Gospel of John in 21 Days', emoji: '✝️', total_days: 21,
    days: Array.from({ length: 21 }, (_, i) => ({ day: i+1, title: `John Chapter ${i+1}`, passage: `John ${i+1}` }))
  },
  'psalms-of-praise': { title: 'Psalms of Praise', emoji: '🎵', total_days: 10, days: [
    { day: 1, passage: 'Psalm 1', title: 'The Blessed Life' },
    { day: 2, passage: 'Psalm 23', title: 'The Lord is My Shepherd' },
    { day: 3, passage: 'Psalm 27', title: 'The Lord is My Light' },
    { day: 4, passage: 'Psalm 34', title: 'Taste and See' },
    { day: 5, passage: 'Psalm 46', title: 'God Our Refuge' },
    { day: 6, passage: 'Psalm 91', title: 'Under His Wings' },
    { day: 7, passage: 'Psalm 100', title: 'Shout for Joy' },
    { day: 8, passage: 'Psalm 103', title: 'Praise His Holy Name' },
    { day: 9, passage: 'Psalm 121', title: 'My Help Comes from the Lord' },
    { day: 10, passage: 'Psalm 150', title: 'Let Everything Praise Him' },
  ]},
  'sermon-on-the-mount': { title: 'Sermon on the Mount', emoji: '⛰️', total_days: 14,
    days: Array.from({ length: 14 }, (_, i) => {
      const passages = ['Matthew 5:1-12','Matthew 5:13-16','Matthew 5:17-26','Matthew 5:27-37','Matthew 5:38-48','Matthew 6:1-8','Matthew 6:9-15','Matthew 6:16-24','Matthew 6:25-34','Matthew 7:1-6','Matthew 7:7-12','Matthew 7:13-23','Matthew 7:24-29','Matthew 5-7 Review'];
      const titles = ['The Beatitudes','Salt and Light','The Law Fulfilled','Oaths and Anger','Love Your Enemies','Secret Giving','The Lord\'s Prayer','Fasting and Treasure','Do Not Worry','Do Not Judge','Ask, Seek, Knock','The Narrow Gate','Wise and Foolish Builders','Full Review'];
      return { day: i+1, passage: passages[i], title: titles[i] };
    })
  },
  'faith-heroes': { title: 'Heroes of Faith', emoji: '🦁', total_days: 12, days: [
    { day: 1, passage: 'Hebrews 11:1-7', title: 'What is Faith?' },
    { day: 2, passage: 'Genesis 22:1-18', title: 'Abraham\'s Test' },
    { day: 3, passage: 'Exodus 14:15-31', title: 'Moses at the Sea' },
    { day: 4, passage: 'Joshua 6:1-20', title: 'Rahab and Jericho' },
    { day: 5, passage: 'Judges 16:28-30', title: 'Samson\'s Final Act' },
    { day: 6, passage: '1 Samuel 17:32-50', title: 'David and Goliath' },
    { day: 7, passage: 'Daniel 3:13-30', title: 'The Fiery Furnace' },
    { day: 8, passage: 'Daniel 6:10-23', title: 'Daniel in the Lions\' Den' },
    { day: 9, passage: 'Ruth 1:15-22', title: 'Ruth\'s Loyalty' },
    { day: 10, passage: 'Esther 4:14-16', title: 'Esther\'s Courage' },
    { day: 11, passage: 'Hebrews 11:32-40', title: 'The Great Cloud' },
    { day: 12, passage: 'Hebrews 12:1-3', title: 'Fix Your Eyes on Jesus' },
  ]},
  'prayer-school': { title: 'Prayer School: 7 Days', emoji: '🙏', total_days: 7, days: [
    { day: 1, passage: 'Matthew 6:5-15', title: 'How Jesus Taught Us to Pray' },
    { day: 2, passage: 'Luke 11:1-13', title: 'Persistent Prayer' },
    { day: 3, passage: 'John 17:1-26', title: 'Jesus\' High Priestly Prayer' },
    { day: 4, passage: 'Philippians 4:4-7', title: 'Prayer with Thanksgiving' },
    { day: 5, passage: 'Acts 4:23-31', title: 'Corporate Prayer' },
    { day: 6, passage: 'Romans 8:26-27', title: 'The Spirit Intercedes' },
    { day: 7, passage: '1 Thessalonians 5:16-18', title: 'Pray Without Ceasing' },
  ]},
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const nowUTC = new Date();
    const hourUTC = nowUTC.getUTCHours();
    const minuteUTC = nowUTC.getUTCMinutes();

    // Only run near the top of the hour
    if (minuteUTC > 5) {
      return Response.json({ skipped: true, reason: 'Not near top of hour' });
    }

    // Fetch all reading progress records with reminders enabled
    const allProgress = await base44.asServiceRole.entities.UserReadingProgress.filter(
      { reminders_enabled: true }, null, 500
    ).catch(() => []);

    if (!allProgress.length) {
      return Response.json({ success: true, sent: 0, reason: 'No users with reminders enabled' });
    }

    // Group progress by user_id
    const byUser = {};
    for (const prog of allProgress) {
      if (!prog.user_id) continue;
      if (!byUser[prog.user_id]) byUser[prog.user_id] = [];
      byUser[prog.user_id].push(prog);
    }

    const userIds = Object.keys(byUser);
    let sent = 0;
    let skipped = 0;

    for (const userId of userIds) {
      try {
        const users = await base44.asServiceRole.entities.User.filter({ id: userId }, null, 1).catch(() => []);
        const user = users[0];
        if (!user?.email) { skipped++; continue; }

        // Simple hour-based dispatch: send at 8am UTC (configurable later)
        if (hourUTC !== 8) { skipped++; continue; }

        const userPlans = byUser[userId];
        const activePlans = userPlans.filter(prog => {
          const plan = CURATED_PLANS[prog.plan_id];
          if (!plan) return false;
          const done = (prog.completed_days || []).length;
          return done < plan.total_days;
        });

        if (!activePlans.length) { skipped++; continue; }

        // Build the email body listing each active plan's next day
        const planLines = activePlans.map(prog => {
          const plan = CURATED_PLANS[prog.plan_id];
          const completedSet = new Set(prog.completed_days || []);
          const nextDay = plan.days.find(d => !completedSet.has(d.day));
          if (!nextDay) return null;
          const pct = Math.round((completedSet.size / plan.total_days) * 100);
          return `📖 ${plan.emoji} ${plan.title}\n   Day ${nextDay.day} of ${plan.total_days}: "${nextDay.title}"\n   Passage: ${nextDay.passage}\n   Progress: ${pct}% complete`;
        }).filter(Boolean).join('\n\n');

        const greeting = hourUTC < 12 ? 'Good morning' : hourUTC < 17 ? 'Good afternoon' : 'Good evening';
        const body = `${greeting}, ${user.full_name || 'Friend'}! 🌟\n\nYour daily Bible reading is ready. Here's what's on your plan today:\n\n${planLines}\n\n✨ Open FaithLight to read and mark your day complete.\n\n"Your word is a lamp for my feet, a light on my path." — Psalm 119:105\n\nKeep going — you're doing great!\n\n🙏 The FaithLight Team`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `📖 Your Reading Plan for Today — ${activePlans.length > 1 ? `${activePlans.length} plans` : CURATED_PLANS[activePlans[0].plan_id]?.title || 'FaithLight'}`,
          body,
        });

        sent++;
        console.log(`Sent reading reminder to ${user.email} for ${activePlans.length} plan(s)`);
      } catch (userErr) {
        console.error(`Failed for user ${userId}:`, userErr.message);
        skipped++;
      }
    }

    return Response.json({ success: true, sent, skipped, hour: hourUTC });
  } catch (err) {
    console.error('sendDailyReadingReminder error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});