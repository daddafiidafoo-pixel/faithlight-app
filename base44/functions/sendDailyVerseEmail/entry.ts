import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Daily verse content per language
const DAILY_VERSES = {
  en: {
    reference: 'Proverbs 3:5',
    text: 'Trust in the LORD with all your heart, and do not lean on your own understanding.',
    subject: 'Your Daily Verse 📖',
  },
  om: {
    reference: 'Faarfannaa 23:1',
    text: 'Waaqayyo tiksee koo; waan barbaachisu hunda naa kennaadha.',
    subject: 'Aayata Guyyaa Keessan 📖',
  },
  am: {
    reference: 'ምሳሌ 3፥5',
    text: 'በፍጹም ልብህ በእግዚአብሔር ታመን፤ በራስህም ማስተዋል አትደገፍ።',
    subject: 'የቀኑ ቃልዎ 📖',
  },
  sw: {
    reference: 'Mithali 3:5',
    text: 'Umwamini Bwana kwa moyo wako wote, wala usitegemee akili yako mwenyewe.',
    subject: 'Neno Lako la Leo 📖',
  },
  ar: {
    reference: 'أمثال 3:5',
    text: 'ثِقْ بِالرَّبِّ مِنْ كُلِّ قَلْبِكَ، وَلا تَعْتَمِدْ عَلَى فَهْمِكَ أَنْتَ.',
    subject: 'آية اليوم 📖',
  },
  fr: {
    reference: 'Proverbes 3:5',
    text: 'Confie-toi en l\'Éternel de tout ton cœur, et ne t\'appuie pas sur ta sagesse.',
    subject: 'Votre Verset du Jour 📖',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { email, language = 'en', test = false } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    const verse = DAILY_VERSES[language] || DAILY_VERSES.en;

    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <div style="background: linear-gradient(135deg, #8B5CF6, #A78BFA); border-radius: 16px; padding: 24px; margin-bottom: 20px; text-align: center;">
    <p style="color: white; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">FaithLight — Daily Verse</p>
    <p style="color: #DDD6FE; font-size: 14px; font-weight: 600; margin: 0;">${verse.reference}</p>
  </div>
  <div style="background: #F9FAFB; border-radius: 12px; padding: 20px; border-left: 4px solid #8B5CF6;">
    <p style="font-size: 17px; line-height: 1.7; color: #1F2937; margin: 0; font-style: italic;">"${verse.text}"</p>
  </div>
  <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #9CA3AF;">
    FaithLight • Daily Scripture${test ? ' (test)' : ''}
  </p>
</div>
    `.trim();

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: verse.subject + (test ? ' (Test)' : ''),
      body: emailBody,
      from_name: 'FaithLight',
    });

    console.log(`Daily verse email sent to ${email} (lang: ${language}, test: ${test})`);
    return Response.json({ success: true, reference: verse.reference });

  } catch (error) {
    console.error('sendDailyVerseEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});