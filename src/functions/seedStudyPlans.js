/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const STUDY_PLANS = [
  {
    title: 'Overcoming Anxiety',
    topic: 'anxiety',
    description: 'A 7-day journey through Scripture to find peace and trust in God during anxious times.',
    duration_days: 7,
    daily_readings: [
      { day: 1, book_id: 'PHP', chapter: 4, verse_start: 4, verse_end: 7, reference: 'Philippians 4:4-7', reflection_prompt: 'What worries are you bringing to God?' },
      { day: 2, book_id: '1PE', chapter: 5, verse_start: 7, verse_end: 7, reference: '1 Peter 5:7', reflection_prompt: 'How does casting your cares on God help you?' },
      { day: 3, book_id: 'JHN', chapter: 14, verse_start: 27, verse_end: 27, reference: 'John 14:27', reflection_prompt: 'What kind of peace does Jesus offer?' },
      { day: 4, book_id: 'PSA', chapter: 23, verse_start: 1, verse_end: 6, reference: 'Psalm 23', reflection_prompt: 'How is God your shepherd?' },
      { day: 5, book_id: 'PRO', chapter: 3, verse_start: 5, verse_end: 6, reference: 'Proverbs 3:5-6', reflection_prompt: 'What does it mean to trust with all your heart?' },
      { day: 6, book_id: '2TI', chapter: 1, verse_start: 7, verse_end: 7, reference: '2 Timothy 1:7', reflection_prompt: 'What does a spirit of power, love, and discipline look like?' },
      { day: 7, book_id: 'ROM', chapter: 8, verse_start: 28, verse_end: 28, reference: 'Romans 8:28', reflection_prompt: 'How does God work all things together for good?' }
    ]
  },
  {
    title: 'Building Faith',
    topic: 'faith',
    description: 'Strengthen your faith through 7 days of powerful Scripture passages about trust and belief.',
    duration_days: 7,
    daily_readings: [
      { day: 1, book_id: 'ROM', chapter: 10, verse_start: 17, verse_end: 17, reference: 'Romans 10:17', reflection_prompt: 'Where does faith come from?' },
      { day: 2, book_id: 'HEB', chapter: 11, verse_start: 1, verse_end: 6, reference: 'Hebrews 11:1-6', reflection_prompt: 'What is true faith?' },
      { day: 3, book_id: 'MAT', chapter: 14, verse_start: 28, verse_end: 31, reference: 'Matthew 14:28-31', reflection_prompt: 'What made Peter sink in the water?' },
      { day: 4, book_id: 'MRK', chapter: 11, verse_start: 22, verse_end: 25, reference: 'Mark 11:22-25', reflection_prompt: 'What does it mean to have faith in God?' },
      { day: 5, book_id: 'JHN', chapter: 3, verse_start: 16, verse_end: 18, reference: 'John 3:16-18', reflection_prompt: 'What is the foundation of our faith?' },
      { day: 6, book_id: '1JN', chapter: 5, verse_start: 4, verse_end: 4, reference: '1 John 5:4', reflection_prompt: 'What overcomes the world?' },
      { day: 7, book_id: 'PRO', chapter: 3, verse_start: 5, verse_end: 6, reference: 'Proverbs 3:5-6', reflection_prompt: 'Reflect on your faith journey this week.' }
    ]
  },
  {
    title: 'Finding Peace',
    topic: 'peace',
    description: 'Discover biblical peace that surpasses understanding through this 7-day study.',
    duration_days: 7,
    daily_readings: [
      { day: 1, book_id: 'PSA', chapter: 4, verse_start: 6, verse_end: 8, reference: 'Psalm 4:6-8', reflection_prompt: 'What brings you peace?' },
      { day: 2, book_id: 'JHN', chapter: 14, verse_start: 26, verse_end: 27, reference: 'John 14:26-27', reflection_prompt: 'What gift does Jesus leave with us?' },
      { day: 3, book_id: 'COL', chapter: 3, verse_start: 15, verse_end: 17, reference: 'Colossians 3:15-17', reflection_prompt: 'How can peace rule in your heart?' },
      { day: 4, book_id: 'PHP', chapter: 4, verse_start: 8, verse_end: 9, reference: 'Philippians 4:8-9', reflection_prompt: 'What thoughts bring peace?' },
      { day: 5, book_id: 'EPH', chapter: 2, verse_start: 14, verse_end: 17, reference: 'Ephesians 2:14-17', reflection_prompt: 'Who is our peace?' },
      { day: 6, book_id: 'ISA', chapter: 26, verse_start: 3, verse_end: 3, reference: 'Isaiah 26:3', reflection_prompt: 'How do you keep your mind on God?' },
      { day: 7, book_id: 'PSA', chapter: 29, verse_start: 11, verse_end: 11, reference: 'Psalm 29:11', reflection_prompt: 'What blessing does the Lord give?' }
    ]
  }
];

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const created = [];
    for (const plan of STUDY_PLANS) {
      const result = await base44.entities.StudyPlan.create(plan);
      created.push(result);
    }

    return Response.json({
      message: `Created ${created.length} study plans`,
      plans: created
    });
  } catch (error) {
    console.error('Error seeding study plans:', error);
    return Response.json(
      { error: error.message || 'Failed to seed study plans' },
      { status: 500 }
    );
  }
});