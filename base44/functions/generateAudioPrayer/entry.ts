import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const LANG_INSTRUCTIONS = {
  en: 'English',
  om: 'Afaan Oromoo (Oromo)',
  am: 'Amharic',
  ti: 'Tigrinya',
  sw: 'Kiswahili (Swahili)',
  fr: 'French',
  ar: 'Arabic',
};

const LANG_VOICES = {
  en: 'alloy',
  om: 'nova',
  am: 'nova',
  ti: 'nova',
  sw: 'shimmer',
  fr: 'echo',
  ar: 'onyx',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { verseText, reference, language = 'en' } = await req.json();

    if (!verseText) {
      return Response.json({ error: 'verseText is required' }, { status: 400 });
    }

    const langName = LANG_INSTRUCTIONS[language] || 'English';
    const voice = LANG_VOICES[language] || 'alloy';

    // Step 1: Generate the prayer text via AI
    const prayerPrompt = `You are a peaceful, meditative prayer guide.

Write a short, spoken meditative prayer (60-90 words) inspired by this Bible verse:
"${verseText}" — ${reference || ''}

Instructions:
- Language: ONLY write in ${langName}. Do not use any other language.
- Tone: calm, warm, contemplative, personal
- Format: spoken prayer, first-person, addressed to God
- Do not include titles, headers, or labels
- Speak naturally as if in quiet prayer

Write only the prayer text, nothing else.`;

    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: prayerPrompt,
    });

    const prayerText = typeof aiResult === 'string' ? aiResult : aiResult?.text || aiResult?.content || '';

    if (!prayerText) {
      throw new Error('Failed to generate prayer text');
    }

    // Step 2: Call OpenAI TTS
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not set');
      // Return the text so the frontend can display it at minimum
      return Response.json({ prayerText, audioUrl: null, message: 'TTS unavailable — API key not set' });
    }

    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: prayerText,
        voice: voice,
        speed: 0.9,
      }),
    });

    if (!ttsResponse.ok) {
      const err = await ttsResponse.text();
      console.error('TTS error:', err);
      return Response.json({ prayerText, audioUrl: null, message: 'TTS generation failed' });
    }

    // Step 3: Upload the audio file
    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    const audioFile = new File([audioBlob], `prayer-${Date.now()}.mp3`, { type: 'audio/mpeg' });

    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file: audioFile });

    return Response.json({ audioUrl: file_url, prayerText });
  } catch (error) {
    console.error('generateAudioPrayer error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});