import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, planId, day } = body;

    if (action === 'getProgress') {
      // Fetch all progress records for this user
      const records = await base44.entities.ReadingPlanProgress.filter(
        { userEmail: user.email },
        '-updated_date',
        100
      ).catch(() => []);

      // Group by planId
      const byPlan = {};
      for (const r of records) {
        if (!byPlan[r.planId]) byPlan[r.planId] = { completed: [], startedAt: r.startedAt, planId: r.planId };
        if (r.dayNumber && !byPlan[r.planId].completed.includes(r.dayNumber)) {
          byPlan[r.planId].completed.push(r.dayNumber);
        }
      }
      return Response.json({ ok: true, progress: byPlan });
    }

    if (action === 'markDay') {
      if (!planId || !day) return Response.json({ error: 'planId and day required' }, { status: 400 });

      // Check if already marked
      const existing = await base44.entities.ReadingPlanProgress.filter(
        { userEmail: user.email, planId, dayNumber: day },
        '-created_date',
        1
      ).catch(() => []);

      if (existing.length === 0) {
        await base44.entities.ReadingPlanProgress.create({
          userEmail: user.email,
          planId,
          dayNumber: day,
          completedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
        });
      }
      return Response.json({ ok: true });
    }

    if (action === 'resetPlan') {
      if (!planId) return Response.json({ error: 'planId required' }, { status: 400 });

      const records = await base44.entities.ReadingPlanProgress.filter(
        { userEmail: user.email, planId },
        '-created_date',
        200
      ).catch(() => []);

      await Promise.all(records.map(r => base44.entities.ReadingPlanProgress.delete(r.id).catch(() => {})));
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[readingPlanTracker]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});