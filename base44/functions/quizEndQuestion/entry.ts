import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId, sessionId } = await req.json();

    // Get the question to verify ownership
    const question = await base44.entities.ChurchQuizQuestion.get(questionId);

    if (!question || question.pastorId !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // End the question
    const updated = await base44.entities.ChurchQuizQuestion.update(questionId, {
      status: 'ended'
    });

    // Get final counts
    const allResponses = await base44.entities.ChurchQuizResponse.filter({
      questionId
    });

    const counts = [0, 0, 0, 0];
    allResponses.forEach(r => {
      if (r.choiceIndex < counts.length) counts[r.choiceIndex]++;
    });

    const percentages = counts.map(c =>
      allResponses.length === 0 ? 0 : Math.round((c / allResponses.length) * 100)
    );

    // Emit ended event
    await base44.realtime.publish(`session:${sessionId}`, {
      event: 'quiz:question_ended',
      data: {
        questionId,
        counts,
        percentages,
        answeredCount: allResponses.length,
        correctIndex: question.correctIndex
      }
    }).catch(err => console.log('Realtime publish skipped:', err.message));

    return Response.json(updated);
  } catch (error) {
    console.error('Error ending question:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});