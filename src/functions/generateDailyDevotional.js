/* global Deno */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const VERSES = [
  { ref: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { ref: 'Psalm 23:1', text: 'The Lord is my shepherd, I lack nothing.' },
  { ref: 'Romans 3:23', text: 'for all have sinned and fall short of the glory of God' },
  { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { ref: 'Philippians 4:8', text: 'Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.' }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date().toISOString().split('T')[0];
    
    // Check if devotional already exists for today
    const existing = await base44.asServiceRole.entities.DailyDevotional.filter({
      date: today
    });

    if (existing.length > 0) {
      return Response.json({ devotional: existing[0] });
    }

    // Pick a random verse
    const verse = VERSES[Math.floor(Math.random() * VERSES.length)];

    // Generate AI reflection
    const reflection = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, encouraging 3-4 sentence devotional reflection on this Bible verse for daily engagement. Keep it personal and uplifting.

Verse: ${verse.ref}
"${verse.text}"

Reflection:`,
      model: 'gemini_3_flash'
    });

    // Save devotional
    const devotional = await base44.asServiceRole.entities.DailyDevotional.create({
      date: today,
      verse_reference: verse.ref,
      verse_text: verse.text,
      reflection: reflection.trim(),
      theme: 'Daily Inspiration'
    });

    return Response.json({ devotional, created: true });
  } catch (error) {
    console.error('Error generating devotional:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});