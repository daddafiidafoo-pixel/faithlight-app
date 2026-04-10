import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Auto-generates weekly/monthly progress reports for all active projects.
 * Called by a scheduled automation.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Service role to access all projects
    const projects = await base44.asServiceRole.entities.Project.filter({ status: 'active' }, '-updated_date', 200);
    if (!projects.length) return Response.json({ ok: true, message: 'No active projects' });

    const now = new Date();
    const reportType = req.method === 'POST' ? (await req.json().catch(() => ({}))).report_type || 'weekly' : 'weekly';

    const results = [];

    for (const project of projects) {
      const tasks = await base44.asServiceRole.entities.ProjectTask.filter({ project_id: project.id }, '-updated_date', 500).catch(() => []);
      const periodMs = reportType === 'weekly' ? 7 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
      const periodStart = new Date(now.getTime() - periodMs);

      const completedInPeriod = tasks.filter(t => t.status === 'completed' && t.updated_date && new Date(t.updated_date) >= periodStart).length;
      const createdInPeriod = tasks.filter(t => t.created_date && new Date(t.created_date) >= periodStart).length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const milestonesHit = (project.milestones || []).filter(m => m.completed && m.completed_at && new Date(m.completed_at) >= periodStart).length;

      // Contributor stats
      const contrib = {};
      tasks.filter(t => t.status === 'completed' && t.assignee_name && t.updated_date && new Date(t.updated_date) >= periodStart).forEach(t => {
        contrib[t.assignee_id] = contrib[t.assignee_id] || { user_name: t.assignee_name, tasks_done: 0 };
        contrib[t.assignee_id].tasks_done++;
      });
      const topContributors = Object.entries(contrib)
        .map(([uid, d]) => ({ user_id: uid, user_name: d.user_name, tasks_done: d.tasks_done }))
        .sort((a, b) => b.tasks_done - a.tasks_done)
        .slice(0, 5);

      const summaryText = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Write a concise ${reportType} progress report for project "${project.title}". ${completedInPeriod} tasks completed, ${inProgress} in progress, ${milestonesHit} milestones hit. Top contributors: ${topContributors.map(c => `${c.user_name} (${c.tasks_done})`).join(', ') || 'none'}. Write 2 sentences, professional and encouraging.`,
      }).catch(() => `${reportType} report: ${completedInPeriod} tasks completed this period.`);

      await base44.asServiceRole.entities.ProjectReport.create({
        project_id: project.id,
        report_type: reportType,
        period_start: periodStart.toISOString(),
        period_end: now.toISOString(),
        tasks_completed: completedInPeriod,
        tasks_created: createdInPeriod,
        tasks_in_progress: inProgress,
        milestones_hit: milestonesHit,
        progress_delta: project.progress_percentage || 0,
        summary_text: summaryText,
        top_contributors: topContributors,
        generated_at: now.toISOString(),
      });

      // Notify project owner
      if (completedInPeriod > 0 || milestonesHit > 0) {
        await base44.asServiceRole.entities.AppNotification.create({
          user_id: project.owner_id,
          title: `📊 ${project.title} – ${reportType} report ready`,
          body: summaryText.slice(0, 120),
          type: 'project_report',
        }).catch(() => {});
      }

      results.push({ project_id: project.id, title: project.title, tasks_completed: completedInPeriod });
    }

    return Response.json({ ok: true, reports_generated: results.length, results });
  } catch (error) {
    console.error('generateProjectReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});