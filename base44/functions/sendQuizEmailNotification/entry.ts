import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Send email notification for quiz completion
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, quiz_title, score, passed, passed_threshold } = await req.json();

    if (!user_id || score === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.id !== user_id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check notification preference
    const prefs = await base44.entities.UserPreferences?.filter?.({ user_id })
      .catch(() => []);
    const canEmail = prefs?.[0]?.notify_email !== false;

    if (!canEmail || !user.email) {
      return Response.json({ success: true, sent: false });
    }

    const message = `Congratulations! You completed the quiz "${quiz_title}" with a score of ${score}%.`;
    const emoji = passed ? '✅' : '📝';

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `${emoji} Quiz Complete: ${quiz_title}`,
      body: `${message}\n\n${passed ? `You passed! (Score: ${score}% / Required: ${passed_threshold}%)` : `Keep practicing to improve your score!`}\n\nVisit FaithLight to see your progress.`,
    });

    return Response.json({ success: true, sent: true });
  } catch (err) {
    console.error('Email notification error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});