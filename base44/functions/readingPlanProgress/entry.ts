import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const url = new URL(req.url);
  const method = req.method;

  try {
    if (method === 'GET') {
      // GET /api/v1/reading-plans/:planId/progress
      const planId = url.searchParams.get('planId');
      const userEmail = url.searchParams.get('userEmail');

      if (!planId || !userEmail) {
        return Response.json(
          { error: 'planId and userEmail required' },
          { status: 400 }
        );
      }

      const progress = await base44.entities.ReadingPlanProgress.filter({
        planId,
        userEmail,
      });

      if (!progress || progress.length === 0) {
        return Response.json(
          { data: null, error: 'No progress found' },
          { status: 404 }
        );
      }

      const p = progress[0];
      const completions = await base44.entities.ReadingPlanDayCompletion.filter({
        planId,
        userEmail,
      });

      return Response.json({
        success: true,
        data: {
          planId: p.planId,
          currentDay: p.currentDay,
          completedDaysCount: p.completedDaysCount,
          isActive: p.isActive,
          startedAt: p.startedAt,
          lastActivityAt: p.lastActivityAt,
          completedAt: p.completedAt,
          completedDays: (completions || []).map(c => c.dayNumber),
        },
      });
    } else if (method === 'POST') {
      // POST /api/v1/reading-plans/:planId/days/:dayNumber/complete
      const { planId, dayNumber, userEmail } = await req.json();

      if (!planId || !dayNumber || !userEmail) {
        return Response.json(
          { error: 'planId, dayNumber, userEmail required' },
          { status: 400 }
        );
      }

      // Record day completion
      await base44.entities.ReadingPlanDayCompletion.create({
        planId,
        dayNumber,
        userEmail,
        completedAt: new Date().toISOString(),
        completionSource: 'app',
      });

      // Update progress
      let progress = await base44.entities.ReadingPlanProgress.filter({
        planId,
        userEmail,
      });

      if (progress && progress.length > 0) {
        const p = progress[0];
        const newCompletedCount = (p.completedDaysCount || 0) + 1;
        await base44.entities.ReadingPlanProgress.update(p.id, {
          currentDay: dayNumber + 1,
          completedDaysCount: newCompletedCount,
          lastActivityAt: new Date().toISOString(),
        });
      }

      // Trigger streak engine
      await base44.functions.invoke('streakEngine', {
        userEmail,
        engagementType: 'plan',
      });

      return Response.json({
        success: true,
        message: 'Day completed',
      });
    }
  } catch (error) {
    console.error('Reading plan progress error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});