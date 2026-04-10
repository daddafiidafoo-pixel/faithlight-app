import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * completeStudyDay
 * 
 * Mark a study day as complete and update progress.
 * 
 * Body:
 * {
 *   plan_instance_id: string,
 *   day_number: number,
 *   notes?: string,
 *   reflection_answers?: string[]
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'Only POST allowed' }, { status: 405 });
    }

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan_instance_id, day_number, notes, reflection_answers } = body;

    if (!plan_instance_id || !day_number) {
      return Response.json({ error: 'Missing plan_instance_id or day_number' }, { status: 400 });
    }

    // Fetch instance
    const instance = await base44.entities.StudyPlanInstance.filter(
      { id: plan_instance_id, user_id: user.id },
      null,
      1
    ).then(r => r[0]);

    if (!instance) {
      return Response.json({ error: 'Plan instance not found' }, { status: 404 });
    }

    // Create progress record
    await base44.entities.StudyDayProgress.create({
      user_id: user.id,
      plan_instance_id,
      day_number,
      completed_at: new Date().toISOString(),
      notes: notes || '',
      reflection_answers: reflection_answers || [],
    });

    // Compute next incomplete day
    const allProgress = await base44.asServiceRole.entities.StudyDayProgress.filter(
      { plan_instance_id },
      'day_number',
      instance.duration_days + 1
    );
    const completedDays = new Set(allProgress.map(p => p.day_number));
    let nextDay = 1;
    for (let d = 1; d <= instance.duration_days; d++) {
      if (!completedDays.has(d)) {
        nextDay = d;
        break;
      }
    }

    // Check if plan is complete
    const isComplete = completedDays.size === instance.duration_days;
    const updateData = {
      current_day: isComplete ? instance.duration_days : nextDay,
    };
    if (isComplete) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    await base44.entities.StudyPlanInstance.update(plan_instance_id, updateData);

    // Update UserProgressSummary
    let summary = await base44.asServiceRole.entities.UserProgressSummary.filter(
      { user_id: user.id },
      null,
      1
    ).then(r => r[0]);

    if (!summary) {
      summary = await base44.asServiceRole.entities.UserProgressSummary.create({
        user_id: user.id,
        total_study_days_completed: 1,
        last_study_day_at: new Date().toISOString(),
      });
    } else {
      const updatedSummary = {
        total_study_days_completed: (summary.total_study_days_completed || 0) + 1,
        last_study_day_at: new Date().toISOString(),
      };
      if (isComplete) {
        updatedSummary.total_study_plans_completed = (summary.total_study_plans_completed || 0) + 1;
      }
      await base44.asServiceRole.entities.UserProgressSummary.update(summary.id, updatedSummary);
    }

    return Response.json({
      success: true,
      plan_complete: isComplete,
      next_day: isComplete ? null : nextDay,
    });
  } catch (err) {
    console.error('Complete day error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});