import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, questionText, choices, correctIndex } = await req.json();

    // Create the question
    const question = await base44.entities.ChurchQuizQuestion.create({
      sessionId,
      pastorId: user.email,
      question: questionText,
      choices,
      correctIndex,
      status: 'live'
    });

    // Emit realtime event
    await base44.realtime.publish(`session:${sessionId}`, {
      event: 'quiz:question_live',
      data: {
        questionId: question.id,
        questionText: question.question,
        choices: question.choices,
        createdAt: question.created_date
      }
    }).catch(err => console.log('Realtime publish skipped:', err.message));

    return Response.json(question);
  } catch (error) {
    console.error('Error launching question:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});