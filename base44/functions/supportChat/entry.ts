import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const ALLOWED_LANGUAGES = ['en', 'om', 'am', 'ar', 'fr', 'sw'];

const getSystemPrompt = (language) => {
  const prompts = {
    en: `You are the FaithLight Support Assistant.
Always respond in English.
Help users solve app issues such as language switching, AI errors, audio problems, page loading, and sharing issues.
Be concise and practical.
Keep responses short (2-3 sentences max).`,
    om: `Ati jecha gargaarsa FaithLight.
Afaan Oromoo keessatti deebii kenni.
Haalachuu aplikeshini (afaan jijjiiruun, dogoggorri AI, rakkina sagalee, loading, fi qooda) irratti gargaarsa kennuu.
Gabaabee fi karaa gumaachuu ta'e.
Deebii gabaabee (seentenii 2-3 qofatti).`,
    am: `እርስዎ FaithLight የድጋፍ ረዳት ናችሁ።
ሁልጊዜ በአማርኛ ይመልሱ።
ተጠቃሚዎች የመተግበሪያ ችግሮችን ለመፍታት እርዳታ ይስጡ (ቋንቋ መቀየር፣ AI ስህተት፣ የአሪፍ ችግሮች፣ ጭነት እና ማጋራት)።
ጠንክር እና ተግባራዊ ይሁኑ።`,
  };
  return prompts[language] || prompts.en;
};

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only POST is allowed',
        },
      }, { status: 405 });
    }

    const body = await req.json();
    const { message, language = 'en' } = body;

    // Validate inputs
    if (!message || message.trim().length === 0) {
      return Response.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Message is required',
        },
      }, { status: 400 });
    }

    if (!ALLOWED_LANGUAGES.includes(language)) {
      return Response.json({
        success: false,
        error: {
          code: 'INVALID_LANGUAGE',
          message: 'Unsupported language',
        },
      }, { status: 400 });
    }

    // Call AI
    const base44 = createClientFromRequest(req);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${getSystemPrompt(language)}\n\nUser issue: ${message}`,
      model: 'gpt_5_mini',
    });

    if (!response || typeof response !== 'string') {
      console.warn('LLM returned unexpected format:', response);
      throw new Error('Invalid LLM response');
    }

    return Response.json({
      success: true,
      data: {
        answer: response,
      },
    });
  } catch (err) {
    console.error('supportChat error:', err);
    return Response.json({
      success: false,
      error: {
        code: 'AI_REQUEST_FAILED',
        message: 'Support service temporarily unavailable',
      },
    }, { status: 500 });
  }
});