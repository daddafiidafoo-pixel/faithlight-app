/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { mode, plan_id, book, chapter, reference, topic } = await req.json();

    // Validate input
    if (!mode || !['standalone', 'plan-based'].includes(mode)) {
      return Response.json({ error: 'Invalid mode' }, { status: 400 });
    }

    if (!book || !reference) {
      return Response.json({ error: 'Missing book or reference' }, { status: 400 });
    }

    // Generate quiz questions using AI
    const langName = 'English';
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a 5-question Bible quiz about ${reference} (${book} ${chapter}).
${topic ? `Topic: ${topic}` : ''}

Generate questions that test knowledge of the Bible passage, with multiple-choice answers.

Return a JSON object:
{
  "questions": [
    {
      "id": "q1",
      "question": "What does the passage teach about...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Brief explanation of why this answer is correct and what it teaches."
    }
  ]
}

Make questions progressive in difficulty. Ensure explanations help users learn from the passage.`,
      response_json_schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                question: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                correct_answer: { type: 'number' },
                explanation: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Create or update daily quiz record
    const today = new Date().toISOString().split('T')[0];
    
    const quizData = {
      date: today,
      mode,
      plan_id: plan_id || null,
      book,
      chapter,
      reference,
      topic: topic || 'General',
      questions: result.questions,
      difficulty: 'medium',
      is_published: true
    };

    // Check if quiz already exists for today
    const existingQuiz = await base44.asServiceRole.entities.DailyBibleQuiz.filter(
      { date: today, mode },
      '-created_date',
      1
    );

    let quiz;
    if (existingQuiz.length > 0) {
      quiz = await base44.asServiceRole.entities.DailyBibleQuiz.update(existingQuiz[0].id, quizData);
    } else {
      quiz = await base44.asServiceRole.entities.DailyBibleQuiz.create(quizData);
    }

    return Response.json({ quiz });
  } catch (error) {
    console.error('Generate quiz error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});