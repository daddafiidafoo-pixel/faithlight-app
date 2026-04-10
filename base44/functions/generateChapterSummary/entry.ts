import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { book, chapter } = await req.json();

    if (!book || !chapter) {
      return Response.json({ error: 'Missing book or chapter' }, { status: 400 });
    }

    // Fetch chapter verses from database
    const verses = await base44.asServiceRole.entities.StructuredBibleVerse.filter(
      { book, chapter: parseInt(chapter) },
      'verse',
      1000
    );

    if (!verses || verses.length === 0) {
      return Response.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Combine verse text for context
    const chapterText = verses.map(v => `${v.verse}: ${v.text}`).join('\n');

    // Use InvokeLLM integration to generate summary
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a concise, comprehensive summary of ${book} chapter ${chapter} of the Bible. The summary should:
1. Be 150-200 words
2. Capture the main themes and key events
3. Highlight theological significance
4. Be accessible to general readers

Chapter text:
${chapterText}

Provide only the summary text, no additional commentary.`,
      model: 'gpt_5_mini'
    });

    // Handle response
    const summary = typeof response === 'string' ? response : response;

    return Response.json({
      success: true,
      summary: summary.trim(),
      book,
      chapter,
      verseCount: verses.length
    });
  } catch (error) {
    console.error('Chapter summary error:', error);
    return Response.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
});