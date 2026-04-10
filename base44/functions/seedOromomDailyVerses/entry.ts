import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Admin-only protection
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // dateKey uses MM-DD format to match the DailyVerse entity schema
    const oromoVerses = [
      {
        dateKey: '03-14',
        language: 'om',
        reference: 'Filiphisiyus 4:13',
        verseText: "Isa na jabeessu Kiristoosiin waan hundumaa gochuu nan danda'a.",
        explanation: 'Kiristoos humna nuu kenna; humna isaatiin waan ulfaataa keessa iyyuu jabaachuu dandeenya.',
        theme: 'Jajjabina',
        prayerFocus: 'Jajjabina Waaqayyoo akka argannu kadhachuu',
      },
      {
        dateKey: '03-15',
        language: 'om',
        reference: 'Yohaannis 3:16',
        verseText: "Waaqayyo hamma mootummaa lafa kanaa jaallateef Ilma isaa tokkicha kenne; namni isa amanu hundinuu jireenya bara baraa haa qabaatu malee hin badin.",
        explanation: 'Jaalalli Waaqayyoo guddaa dha; fayyinni Yesus Kiristoosiin argama.',
        theme: 'Jaalala Waaqayyoo',
        prayerFocus: 'Jaalala Waaqayyoo hubachuu fi itti jiraachuu',
      },
      {
        dateKey: '03-16',
        language: 'om',
        reference: 'Roomaa 8:28',
        verseText: "Warra Waaqayyoon jaallatanii fi akka kaayyoo isaatti waamaman hundaaf Waaqayyo waan hundumaa gara gaariitti hojjechaa akka jiru ni beekna.",
        explanation: "Waaqayyo haala hundumaa keessatti hojii gaarii hojjechuu danda'a.",
        theme: 'Abdii fi Amanamummaa',
        prayerFocus: 'Kaayyoo Waaqayyoo irratti amanamummaa qabaachuu',
      },
      {
        dateKey: '03-17',
        language: 'om',
        reference: 'Faarfannaa 23:1',
        verseText: 'Waaqayyo tiksee koo dha; homaa hin dhabu.',
        explanation: 'Waaqayyo nu eega, nu qajeelcha, nuufis guuta.',
        theme: 'Eegumsa Waaqayyoo',
        prayerFocus: 'Eegumsa fi qajeelfama Waaqayyoo kadhachuu',
      },
      {
        dateKey: '03-18',
        language: 'om',
        reference: '1 Qorontos 13:4-5',
        verseText: 'Jaalalli obsa qaba; gaarummaa qaba; hin hinaafu; of hin jajju; of hin tuulu.',
        explanation: 'Jaalalli dhugaan amala Kiristoos agarsiisa.',
        theme: 'Jaalala',
        prayerFocus: 'Jaalala dhugaa jiraachuuf kadhachuu',
      },
      {
        dateKey: '03-19',
        language: 'om',
        reference: 'Isaayyaas 40:31',
        verseText: "Warri Waaqayyoon abdatan humna isaanii ni haaromsu; akka risaa ni barrisu; ni fiigu, hin dadhaban; ni adeemu, hin keessaa'an.",
        explanation: 'Warri Waaqayyoon abdatanii eegatan humna haarawaa argatu.',
        theme: 'Abdii',
        prayerFocus: 'Humna haarawaa fi abdii Waaqayyoo argachuuf kadhachuu',
      },
      {
        dateKey: '03-20',
        language: 'om',
        reference: 'Maatewoos 5:16',
        verseText: "Hojiin keessan inni gaariin akka mul'atu haa ifu; namoonni hojii keessan gaarii arguudhaan Abbaa keessan isa samii keessa jiru haa ulfeessan.",
        explanation: 'Jireenyi keenya hojii gaariidhaan ulfina Waaqayyoo haa mul\'isu.',
        theme: "Ifa Ta'uu",
        prayerFocus: 'Jireenya keenya keessatti ifa Kiristoos mul\'isuuf kadhachuu',
      },
    ];

    const results = [];
    let inserted = 0;
    let skipped = 0;

    for (const verse of oromoVerses) {
      // Duplicate protection — skip if dateKey + language already exists
      const existing = await base44.asServiceRole.entities.DailyVerse.filter(
        { dateKey: verse.dateKey, language: verse.language },
        'dateKey',
        1
      );

      if (existing && existing.length > 0) {
        skipped++;
        results.push({ date: verse.dateKey, reference: verse.reference, status: 'skipped' });
        continue;
      }

      const created = await base44.asServiceRole.entities.DailyVerse.create({
        dateKey: verse.dateKey,
        language: verse.language,
        reference: verse.reference,
        verseText: verse.verseText,
        explanation: verse.explanation,
        theme: verse.theme,
        prayerFocus: verse.prayerFocus,
      });

      inserted++;
      results.push({ date: verse.dateKey, reference: verse.reference, status: created ? 'created' : 'unknown' });
    }

    return Response.json({
      success: true,
      message: 'Oromo daily verses processed successfully',
      inserted,
      skipped,
      count: results.length,
      results,
    });

  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
});