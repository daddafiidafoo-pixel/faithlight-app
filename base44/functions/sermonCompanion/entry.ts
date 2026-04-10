import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PROMPTS = {
  explain: ({ sermonTitle, mainVerse, allVerses, outline, language }) => `
You are a warm, encouraging Christian Bible teacher.

A church service just ended. Explain the sermon message clearly and encouragingly so that members can understand it more deeply.

Sermon details:
- Title: "${sermonTitle}"
- Main verse: ${mainVerse || 'not specified'}
- All verses covered: ${allVerses || mainVerse || 'not specified'}
- Outline points: ${outline.length > 0 ? outline.join(' | ') : 'not provided'}

Write a clear, faithful explanation (3–4 paragraphs) that:
1. Summarizes what the pastor taught
2. Explains the meaning of the main verse in context
3. Connects it to everyday Christian life
4. Ends with an encouraging sentence

Keep the tone warm, pastoral, and accessible. Language: ${language}. Do not use bullet points — write in flowing paragraphs.
`,

  reflect: ({ sermonTitle, mainVerse, outline, language }) => `
You are a Christian discipleship guide.

Based on this sermon, generate 4 thoughtful reflection questions that help believers apply the message to their daily lives.

Sermon details:
- Title: "${sermonTitle}"
- Main verse: ${mainVerse || 'not specified'}
- Outline: ${outline.length > 0 ? outline.join(' | ') : 'not provided'}

Format:
Reflection Questions

1. [question]
2. [question]
3. [question]
4. [question]

Make questions personal, practical, and rooted in Scripture. Language: ${language}.
`,

  prayer: ({ sermonTitle, mainVerse, outline, churchName, language }) => `
You are a Christian pastor writing a personal prayer.

Write a sincere, heartfelt prayer based on today's sermon that a church member can pray as their own.

Sermon details:
- Title: "${sermonTitle}"
- Main verse: ${mainVerse || 'not specified'}
- Outline: ${outline.length > 0 ? outline.join(' | ') : 'not provided'}
${churchName ? `- Church: ${churchName}` : ''}

Write a personal prayer (6–8 sentences) that:
- Acknowledges God's Word from today's message
- Asks for help to apply the sermon
- Thanks God specifically related to the sermon theme
- Ends with "Amen."

Tone: sincere, personal, not overly formal. Language: ${language}.
`,

  ask: ({ sermonTitle, mainVerse, allVerses, outline, question, language }) => `
You are a knowledgeable, encouraging Christian Bible teacher.

A church member just attended a service and has a question. Answer it faithfully based on the sermon and Scripture.

Sermon details:
- Title: "${sermonTitle}"
- Main verse: ${mainVerse || 'not specified'}
- All verses: ${allVerses || mainVerse || 'not specified'}
- Outline: ${outline.length > 0 ? outline.join(' | ') : 'not provided'}

Member's question: "${question}"

Provide a clear, encouraging answer (2–3 paragraphs) rooted in the sermon and Scripture. If relevant, suggest additional verses. Language: ${language}.
`,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action, sermonTitle, mainVerse, allVerses, outline = [], churchName, language = 'en', question } = body;

    if (!action || !PROMPTS[action]) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
    if (!sermonTitle && !mainVerse) {
      return Response.json({ error: 'Sermon data required' }, { status: 400 });
    }

    const prompt = PROMPTS[action]({ sermonTitle, mainVerse, allVerses, outline, churchName, language, question });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

    return Response.json({ result });
  } catch (err) {
    console.error('sermonCompanion error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});