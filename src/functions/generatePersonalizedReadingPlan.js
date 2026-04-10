import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* global Deno */

const BIBLE_BOOKS = [
  { id: 'GEN', name: 'Genesis', chapters: 50 },
  { id: 'PSA', name: 'Psalms', chapters: 150 },
  { id: 'PRO', name: 'Proverbs', chapters: 31 },
  { id: 'JHN', name: 'John', chapters: 21 },
  { id: 'ROM', name: 'Romans', chapters: 16 },
  { id: 'MAT', name: 'Matthew', chapters: 28 },
  { id: 'MRK', name: 'Mark', chapters: 16 },
  { id: 'LUK', name: 'Luke', chapters: 24 },
  { id: '1JN', name: '1 John', chapters: 5 },
  { id: '1PE', name: '1 Peter', chapters: 5 },
];

const GOAL_BOOKS = {
  encouragement: ['PSA', 'JHN', '1JN', 'ROM'],
  prayer: ['PSA', 'MAT', 'LUK', 'ROM'],
  anxiety_peace: ['PHI', 'JHN', '1PE', 'PSA'],
  faith_growth: ['ROM', 'HEB', 'GAL', 'JHN'],
  family: ['PRO', 'EPH', 'COL', 'MAT'],
  healing: ['PSA', '1PE', '1JN', 'JAM'],
};

const REFLECTION_PROMPTS = {
  encouragement: 'How does this passage encourage you today?',
  prayer: 'What can you learn about prayer from this passage?',
  anxiety_peace: 'What does this passage say about peace and trust?',
  faith_growth: 'How does this passage strengthen your faith?',
  family: 'How can this passage apply to your family relationships?',
  healing: 'How does this passage speak to healing and restoration?',
};

function generatePlanDays(goal, durationDays) {
  const goalBookIds = GOAL_BOOKS[goal] || GOAL_BOOKS.encouragement;
  const planDays = [];

  for (let day = 1; day <= durationDays; day++) {
    const bookId = goalBookIds[(day - 1) % goalBookIds.length];
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    
    // Vary chapters to avoid repetition
    const chapter = 1 + ((day - 1) * 3) % Math.max(1, book.chapters - 1);
    
    planDays.push({
      day,
      book_id: bookId,
      book_name: book.name,
      chapter,
      reference: `${book.name} ${chapter}`,
      reflection_prompt: REFLECTION_PROMPTS[goal] || REFLECTION_PROMPTS.encouragement,
    });
  }

  return planDays;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { createClientFromRequest } = await import('npm:@base44/sdk@0.8.23');
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goal, durationDays } = await req.json();

    if (!goal || !durationDays) {
      return Response.json(
        { error: 'Missing goal or durationDays' },
        { status: 400 }
      );
    }

    if (![7, 14, 30].includes(durationDays)) {
      return Response.json(
        { error: 'Duration must be 7, 14, or 30 days' },
        { status: 400 }
      );
    }

    const goalMap = {
      encouragement: 'encouragement',
      prayer: 'prayer',
      anxiety_peace: 'anxiety_peace',
      faith_growth: 'faith_growth',
      family: 'family',
      healing: 'healing',
    };

    const normalizedGoal = goalMap[goal];
    if (!normalizedGoal) {
      return Response.json({ error: 'Invalid goal' }, { status: 400 });
    }

    const planDays = generatePlanDays(normalizedGoal, durationDays);

    const goalTitles = {
      encouragement: 'Encouragement & Hope',
      prayer: 'Prayer & Faith',
      anxiety_peace: 'Peace & Anxiety Relief',
      faith_growth: 'Growing Your Faith',
      family: 'Family Relationships',
      healing: 'Healing & Restoration',
    };

    const readingPlan = await base44.entities.UserReadingPlan.create({
      user_email: user.email,
      title: `${durationDays}-Day Plan: ${goalTitles[normalizedGoal]}`,
      goal: normalizedGoal,
      duration_days: durationDays,
      plan_days: planDays,
      created_at: new Date().toISOString(),
      is_active: true,
    });

    // Create progress tracker
    await base44.entities.UserReadingPlanProgress.create({
      user_email: user.email,
      reading_plan_id: readingPlan.id,
      plan_title: readingPlan.title,
      current_day: 1,
      completed_days: [],
      started_at: new Date().toISOString(),
      last_opened_at: new Date().toISOString(),
      is_completed: false,
    });

    return Response.json({
      plan: readingPlan,
      message: 'Reading plan created successfully',
    });
  } catch (error) {
    console.error('Error generating reading plan:', error);
    return Response.json(
      { error: error.message || 'Failed to generate reading plan' },
      { status: 500 }
    );
  }
});