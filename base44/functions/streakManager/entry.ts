import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Returns yesterday's date string given a YYYY-MM-DD string
function getYesterday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.email;

    // ── GET: return current streak ──────────────────────────────────
    if (req.method === 'GET') {
      const records = await base44.entities.UserStreak.filter({ userId });
      const record = records?.[0];
      if (!record) {
        return Response.json({ success: true, data: { currentStreak: 0, longestStreak: 0, completedToday: false, totalActiveDays: 0 } });
      }
      // Use local date from query param if provided, else server UTC (best-effort)
      const url = new URL(req.url);
      const today = url.searchParams.get('localDate') || new Date().toISOString().slice(0, 10);
      return Response.json({
        success: true,
        data: {
          currentStreak: record.currentStreak || 0,
          longestStreak: record.longestStreak || 0,
          lastCompletedDate: record.lastCompletedDate,
          completedToday: record.lastCompletedDate === today,
          totalActiveDays: record.totalActiveDays || 0,
        }
      });
    }

    // ── POST: record a faith action ─────────────────────────────────
    if (req.method === 'POST') {
      const body = await req.json();
      const { activityType, localDate } = body;
      const today = localDate || new Date().toISOString().slice(0, 10);
      const yesterday = getYesterday(today);

      const records = await base44.entities.UserStreak.filter({ userId });
      const record = records?.[0];

      // Already completed today — just log the extra activity
      if (record?.lastCompletedDate === today) {
        await base44.entities.StreakActivity.create({ userId, date: today, activityType });
        console.log(`[streak] ${userId} already completed ${today}, just logging ${activityType}`);
        return Response.json({
          success: true,
          data: {
            currentStreak: record.currentStreak,
            longestStreak: record.longestStreak,
            completedToday: true,
            event: 'STREAK_COMPLETED_TODAY',
          }
        });
      }

      // Compute new streak values
      let currentStreak, longestStreak, totalActiveDays, event;
      const prevStreak = record?.currentStreak || 0;
      const prevLongest = record?.longestStreak || 0;
      const prevTotal = record?.totalActiveDays || 0;

      if (!record?.lastCompletedDate) {
        currentStreak = 1;
        event = 'STREAK_STARTED';
      } else if (record.lastCompletedDate === yesterday) {
        currentStreak = prevStreak + 1;
        event = 'STREAK_EXTENDED';
      } else {
        // Missed at least one day — reset
        currentStreak = 1;
        event = prevStreak > 0 ? 'STREAK_BROKEN' : 'STREAK_STARTED';
      }

      longestStreak = Math.max(prevLongest, currentStreak);
      totalActiveDays = prevTotal + 1;

      console.log(`[streak] ${userId} | ${event} | streak=${currentStreak} | activity=${activityType}`);

      const data = { userId, currentStreak, longestStreak, lastCompletedDate: today, totalActiveDays };
      if (record) {
        await base44.entities.UserStreak.update(record.id, data);
      } else {
        await base44.entities.UserStreak.create(data);
      }

      // Log the activity
      await base44.entities.StreakActivity.create({ userId, date: today, activityType });

      return Response.json({
        success: true,
        data: { currentStreak, longestStreak, completedToday: true, event }
      });
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('[streakManager] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});