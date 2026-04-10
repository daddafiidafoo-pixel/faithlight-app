import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BOOKS = [
  { name: "Genesis", id: 1 }, { name: "Exodus", id: 2 }, { name: "Leviticus", id: 3 },
  { name: "Numbers", id: 4 }, { name: "Deuteronomy", id: 5 }, { name: "Joshua", id: 6 },
  { name: "Judges", id: 7 }, { name: "Ruth", id: 8 }, { name: "1 Samuel", id: 9 },
  { name: "2 Samuel", id: 10 }, { name: "1 Kings", id: 11 }, { name: "2 Kings", id: 12 },
  { name: "1 Chronicles", id: 13 }, { name: "2 Chronicles", id: 14 }, { name: "Ezra", id: 15 },
  { name: "Nehemiah", id: 16 }, { name: "Esther", id: 17 }, { name: "Job", id: 18 },
  { name: "Psalms", id: 19 }, { name: "Proverbs", id: 20 }, { name: "Ecclesiastes", id: 21 },
  { name: "Song of Solomon", id: 22 }, { name: "Isaiah", id: 23 }, { name: "Jeremiah", id: 24 },
  { name: "Lamentations", id: 25 }, { name: "Ezekiel", id: 26 }, { name: "Daniel", id: 27 },
  { name: "Hosea", id: 28 }, { name: "Joel", id: 29 }, { name: "Amos", id: 30 },
  { name: "Obadiah", id: 31 }, { name: "Jonah", id: 32 }, { name: "Micah", id: 33 },
  { name: "Nahum", id: 34 }, { name: "Habakkuk", id: 35 }, { name: "Zephaniah", id: 36 },
  { name: "Haggai", id: 37 }, { name: "Zechariah", id: 38 }, { name: "Malachi", id: 39 },
  { name: "Matthew", id: 40 }, { name: "Mark", id: 41 }, { name: "Luke", id: 42 },
  { name: "John", id: 43 }, { name: "Acts", id: 44 }, { name: "Romans", id: 45 },
  { name: "1 Corinthians", id: 46 }, { name: "2 Corinthians", id: 47 }, { name: "Galatians", id: 48 },
  { name: "Ephesians", id: 49 }, { name: "Philippians", id: 50 }, { name: "Colossians", id: 51 },
  { name: "1 Thessalonians", id: 52 }, { name: "2 Thessalonians", id: 53 }, { name: "1 Timothy", id: 54 },
  { name: "2 Timothy", id: 55 }, { name: "Titus", id: 56 }, { name: "Philemon", id: 57 },
  { name: "Hebrews", id: 58 }, { name: "James", id: 59 }, { name: "1 Peter", id: 60 },
  { name: "2 Peter", id: 61 }, { name: "1 John", id: 62 }, { name: "2 John", id: 63 },
  { name: "3 John", id: 64 }, { name: "Jude", id: 65 }, { name: "Revelation", id: 66 }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch sample Bible verses from a public API (Bible API with WEB translation)
    const versesToCreate = [];
    let count = 0;

    // Sample verses to seed (you can expand this)
    const sampleData = [
      // Deuteronomy 3
      { book: "Deuteronomy", book_id: 5, chapter: 3, verse: 1, translation: "WEB", reference: "Deuteronomy 3:1", text: "Then we turned, and went up the way to Bashan: and Og the king of Bashan came out against us, he and all his people, to battle at Edrei." },
      { book: "Deuteronomy", book_id: 5, chapter: 3, verse: 2, translation: "WEB", reference: "Deuteronomy 3:2", text: "Yahweh said to me, 'Don't fear him: for I will deliver him, and all his people, and his land, into your hand; and you shall do to him as you did to Sihon king of the Amorites, who lived at Heshbon.'" },
      { book: "Deuteronomy", book_id: 5, chapter: 3, verse: 3, translation: "WEB", reference: "Deuteronomy 3:3", text: "So Yahweh our God delivered into our hand Og also, the king of Bashan, and all his people: and we struck him until none was left to him remaining." },
      { book: "Deuteronomy", book_id: 5, chapter: 3, verse: 4, translation: "WEB", reference: "Deuteronomy 3:4", text: "We took all his cities at that time; there was not a city which we didn't take from them; sixty cities, all the region of Argob, the kingdom of Og in Bashan." },
      { book: "Deuteronomy", book_id: 5, chapter: 3, verse: 5, translation: "WEB", reference: "Deuteronomy 3:5", text: "All these cities were fortified with high walls, gates, and bars; besides the unwalled towns a great many." },
      { book: "Deuteronomy", book_id: 5, chapter: 3, verse: 6, translation: "WEB", reference: "Deuteronomy 3:6", text: "We utterly destroyed them, as we did to Sihon king of Heshbon, utterly destroying every city, with the women and the little ones." },
      { book: "Deuteronomy", book_id: 5, chapter: 3, verse: 7, translation: "WEB", reference: "Deuteronomy 3:7", text: "But all the livestock, and the spoil of the cities, we took for ourselves." },
      
      // John 3:16 (common verse for testing)
      { book: "John", book_id: 43, chapter: 3, verse: 16, translation: "WEB", reference: "John 3:16", text: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have everlasting life." },
      
      // Genesis 1:1
      { book: "Genesis", book_id: 1, chapter: 1, verse: 1, translation: "WEB", reference: "Genesis 1:1", text: "In the beginning, God created the heavens and the earth." },
      { book: "Genesis", book_id: 1, chapter: 1, verse: 2, translation: "WEB", reference: "Genesis 1:2", text: "The earth was formless and empty. Darkness was on the surface of the deep. God's Spirit was hovering over the surface of the waters." },
      { book: "Genesis", book_id: 1, chapter: 1, verse: 3, translation: "WEB", reference: "Genesis 1:3", text: "God said, 'Let there be light,' and there was light." },
    ];

    for (const verse of sampleData) {
      versesToCreate.push({
        ...verse,
        language_code: "en",
      });
    }

    // Bulk create verses
    if (versesToCreate.length > 0) {
      await base44.asServiceRole.entities.BibleVerse.bulkCreate(versesToCreate);
      count = versesToCreate.length;
    }

    return Response.json({
      success: true,
      message: `Seeded ${count} sample Bible verses`,
      verses_created: count,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});