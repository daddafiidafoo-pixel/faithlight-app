import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role === 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Sample Afaan Oromo verses from Psalms 25 (first few)
    const sampleVerses = [
      {
        language_code: 'om',
        book_id: 'PSA',
        book_name: 'Faarfannaa',
        chapter: 25,
        verse: 1,
        text: 'Yaa Waaqayyoo, ani lubbuu koo sitti ol nan qaba.',
        reference: 'Faarfannaa 25:1'
      },
      {
        language_code: 'om',
        book_id: 'PSA',
        book_name: 'Faarfannaa',
        chapter: 25,
        verse: 2,
        text: 'Yaa Waaqaa koo, ani ammoo sinitti abdii nan qaba; akka ani na qaanaaf dhiibuudhaan cunqurfatun hin taʼin.',
        reference: 'Faarfannaa 25:2'
      },
      {
        language_code: 'om',
        book_id: 'PSA',
        book_name: 'Faarfannaa',
        chapter: 25,
        verse: 3,
        text: 'Qofa iyyuu kan isaa eegaa jiru hin qaanaʼin; warri siʼa sobaa hin taʼan, akka itti hin taʼan.',
        reference: 'Faarfannaa 25:3'
      },
      {
        language_code: 'om',
        book_id: 'PSA',
        book_name: 'Faarfannaa',
        chapter: 25,
        verse: 4,
        text: 'Yaa Waaqayyoo, karaa kee naa muldhisi; ina barumsa jiruu kee.',
        reference: 'Faarfannaa 25:4'
      },
      {
        language_code: 'om',
        book_id: 'PSA',
        book_name: 'Faarfannaa',
        chapter: 25,
        verse: 5,
        text: 'Ani gama mirgaa kee keessa jiru, qaakkaas naa laaji; wagga osoo hin turaatee eeguuf ani siirraa eegaluu qaba.',
        reference: 'Faarfannaa 25:5'
      },
      {
        language_code: 'om',
        book_id: 'GEN',
        book_name: 'Umuma',
        chapter: 1,
        verse: 1,
        text: 'Jalqabaan Waaqni samii fi lafaa uume.',
        reference: 'Umuma 1:1'
      },
      {
        language_code: 'om',
        book_id: 'GEN',
        book_name: 'Umuma',
        chapter: 1,
        verse: 2,
        text: 'Lafaan immoo waantoota waanaa ture, jiidha fi dullina isaa facaasa ture; hafuura Waaqaa garuu bishaani irra firiira ture.',
        reference: 'Umuma 1:2'
      }
    ];

    // Create verses in the database
    const result = await base44.asServiceRole.entities.BibleVerseText.bulkCreate(sampleVerses);
    
    return Response.json({
      success: true,
      message: `Seeded ${sampleVerses.length} Afaan Oromo verses`,
      created: result.length
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});