import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId, sessionId, choiceIndex } = await req.json();

    // Check if user already responded
    const existing = await base44.entities.ChurchQuizResponse.filter({
      questionId,
      userId: user.email
    });

    if (existing.length > 0) {
      return Response.json({ error: 'Already answered' }, { status: 400 });
    }

    // Create response
    const response = await base44.entities.ChurchQuizResponse.create({
      questionId,
      sessionId,
      userId: user.email,
      choiceIndex
    });

    // Get updated counts
    const allResponses = await base44.entities.ChurchQuizResponse.filter({
      questionId
    });

    const counts = [0, 0, 0, 0];
    allResponses.forEach(r => {
      if (r.choiceIndex < counts.length) counts[r.choiceIndex]++;
    });

    const answeredCount = allResponses.length;
    const participationPercent = 0; // TODO: get from session participant count if available

    // Emit results update (throttle in UI if needed)
    await base44.realtime.publish(`session:${sessionId}`, {
      event: 'quiz:results_update',
      data: {
        questionId,
        counts,
        answeredCount,
        participationPercent
      }
    }).catch(err => console.log('Realtime publish skipped:', err.message));

    return Response.json(response);
  } catch (error) {
    console.error('Error submitting response:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});