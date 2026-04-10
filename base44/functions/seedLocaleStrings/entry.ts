import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const LOCALE_STRINGS = [
  // Navigation
  { key: 'nav.home', lang: 'en', value: 'Home', category: 'navigation' },
  { key: 'nav.home', lang: 'om', value: 'Mana', category: 'navigation' },
  { key: 'nav.bible', lang: 'en', value: 'Bible', category: 'navigation' },
  { key: 'nav.bible', lang: 'om', value: 'Kitaaba Qulqulluu', category: 'navigation' },
  { key: 'nav.study', lang: 'en', value: 'Study Plans', category: 'navigation' },
  { key: 'nav.study', lang: 'om', value: 'Sagantaa Barnoota', category: 'navigation' },
  { key: 'nav.audio', lang: 'en', value: 'Audio Bible', category: 'navigation' },
  { key: 'nav.audio', lang: 'om', value: 'Kitaaba Sagalee', category: 'navigation' },
  { key: 'nav.groups', lang: 'en', value: 'Groups', category: 'navigation' },
  { key: 'nav.groups', lang: 'om', value: 'Gamoota', category: 'navigation' },
  { key: 'nav.downloads', lang: 'en', value: 'Downloads', category: 'navigation' },
  { key: 'nav.downloads', lang: 'om', value: 'Buufamtoota', category: 'navigation' },

  // Common buttons
  { key: 'common.save', lang: 'en', value: 'Save', category: 'common' },
  { key: 'common.save', lang: 'om', value: 'Olkaa\'i', category: 'common' },
  { key: 'common.cancel', lang: 'en', value: 'Cancel', category: 'common' },
  { key: 'common.cancel', lang: 'om', value: 'Dhiisi', category: 'common' },
  { key: 'common.next', lang: 'en', value: 'Next', category: 'common' },
  { key: 'common.next', lang: 'om', value: 'Itti Aanu', category: 'common' },
  { key: 'common.back', lang: 'en', value: 'Back', category: 'common' },
  { key: 'common.back', lang: 'om', value: 'Deebi\'i', category: 'common' },
  { key: 'common.loading', lang: 'en', value: 'Loading...', category: 'common' },
  { key: 'common.loading', lang: 'om', value: 'Akka\'amaa jira...', category: 'common' },
  { key: 'common.retry', lang: 'en', value: 'Retry', category: 'common' },
  { key: 'common.retry', lang: 'om', value: 'Irra Deebi\'i Yaali', category: 'common' },

  // AI Study Content Creator page
  { key: 'aiStudy.title', lang: 'en', value: 'AI Study Content Creator', category: 'aiStudy' },
  { key: 'aiStudy.title', lang: 'om', value: 'Uumsa Qabiyyee Barnootaa AI', category: 'aiStudy' },
  { key: 'aiStudy.subtitle', lang: 'en', value: 'Generate sermons, quizzes, devotionals — powered by AI', category: 'aiStudy' },
  { key: 'aiStudy.subtitle', lang: 'om', value: 'Sagantaa barsiisuu, gaaffii-deebii (quiz), fi cimsannaa amantii uumu — AI\'n kan deeggaramu', category: 'aiStudy' },

  { key: 'aiStudy.cards.sermon.title', lang: 'en', value: 'Sermon / Lesson Outline', category: 'aiStudy' },
  { key: 'aiStudy.cards.sermon.title', lang: 'om', value: 'Qajeelfama Sagantaa / Barnootaa', category: 'aiStudy' },
  { key: 'aiStudy.cards.sermon.desc', lang: 'en', value: 'AI-powered sermon outlines — tailored to a Bible passage, topic, or question', category: 'aiStudy' },
  { key: 'aiStudy.cards.sermon.desc', lang: 'om', value: 'Karoora barsiisuu AI\'n qindaa\'e — kutaa Kitaabaa, mata-duree, yookaan yaada irratti', category: 'aiStudy' },

  { key: 'aiStudy.cards.quiz.title', lang: 'en', value: 'Quiz & Flashcards', category: 'aiStudy' },
  { key: 'aiStudy.cards.quiz.title', lang: 'om', value: 'Quiz fi Kaardii Barnootaa', category: 'aiStudy' },
  { key: 'aiStudy.cards.quiz.desc', lang: 'en', value: 'Interactive quizzes and flashcard sets for any passage or topic', category: 'aiStudy' },
  { key: 'aiStudy.cards.quiz.desc', lang: 'om', value: 'Quiz fi kaardii barnootaa wal-qunnamtii qabu (interactive)', category: 'aiStudy' },

  { key: 'aiStudy.cards.devotional.title', lang: 'en', value: 'Devotional Reflection', category: 'aiStudy' },
  { key: 'aiStudy.cards.devotional.title', lang: 'om', value: 'Cimsannaa Amantii', category: 'aiStudy' },
  { key: 'aiStudy.cards.devotional.desc', lang: 'en', value: 'Personal devotional thoughts — based on a passage or spiritual topic', category: 'aiStudy' },
  { key: 'aiStudy.cards.devotional.desc', lang: 'om', value: 'Yaada cimsannaa amantii dhuunfaa — kutaa Kitaabaa yookaan mata-duree irratti', category: 'aiStudy' },

  { key: 'aiStudy.section.sermon.title', lang: 'en', value: 'Sermon / Lesson Outline', category: 'aiStudy' },
  { key: 'aiStudy.section.sermon.title', lang: 'om', value: 'Qajeelfama Sagantaa / Barnootaa', category: 'aiStudy' },
  { key: 'aiStudy.tabs.sermon', lang: 'en', value: 'Sermon', category: 'aiStudy' },
  { key: 'aiStudy.tabs.sermon', lang: 'om', value: 'Sagantaa', category: 'aiStudy' },
  { key: 'aiStudy.tabs.lesson', lang: 'en', value: 'Lesson', category: 'aiStudy' },
  { key: 'aiStudy.tabs.lesson', lang: 'om', value: 'Barnoota', category: 'aiStudy' },
  { key: 'aiStudy.tabs.devTalk', lang: 'en', value: 'Devotional Talk', category: 'aiStudy' },
  { key: 'aiStudy.tabs.devTalk', lang: 'om', value: 'Haasawa Cimsannaa', category: 'aiStudy' },

  { key: 'aiStudy.input.placeholder', lang: 'en', value: 'Enter a Bible passage (e.g., "John 15:1–17"), topic (e.g., "God\'s Love"), or question...', category: 'aiStudy' },
  { key: 'aiStudy.input.placeholder', lang: 'om', value: 'Kutaa Kitaabaa galchi (fkn. "Yohaannis 15:1–17"), mata-duree (fkn. "Jaalala Waaqayyoo"), yookaan gaaffii barreessi...', category: 'aiStudy' },
  { key: 'aiStudy.input.helper', lang: 'en', value: 'For best results, provide a clear Bible passage or topic.', category: 'aiStudy' },
  { key: 'aiStudy.input.helper', lang: 'om', value: 'AI\'n deebii kennuuf, kutaa Kitaabaa yookaan mata-duree ifatti barreessi.', category: 'aiStudy' },

  { key: 'aiStudy.actions.generate', lang: 'en', value: 'Generate', category: 'aiStudy' },
  { key: 'aiStudy.actions.generate', lang: 'om', value: 'Uumi', category: 'aiStudy' },
  { key: 'aiStudy.actions.clear', lang: 'en', value: 'Clear', category: 'aiStudy' },
  { key: 'aiStudy.actions.clear', lang: 'om', value: 'Haqi', category: 'aiStudy' },
  { key: 'aiStudy.actions.copy', lang: 'en', value: 'Copy', category: 'aiStudy' },
  { key: 'aiStudy.actions.copy', lang: 'om', value: 'Garagalchi', category: 'aiStudy' },
  { key: 'aiStudy.actions.save', lang: 'en', value: 'Save', category: 'aiStudy' },
  { key: 'aiStudy.actions.save', lang: 'om', value: 'Olkaa\'i', category: 'aiStudy' },

  { key: 'aiStudy.disclaimer', lang: 'en', value: 'AI output is for guidance only; always verify with Scripture.', category: 'aiStudy' },
  { key: 'aiStudy.disclaimer', lang: 'om', value: 'Yaada AI qoradhu; dogoggora qabaachuu danda\'a. Kitaaba Qulqulluu irratti mirkaneessi.', category: 'aiStudy' },

  // Error messages
  { key: 'errors.generic', lang: 'en', value: 'Something went wrong', category: 'errors' },
  { key: 'errors.generic', lang: 'om', value: 'Waan tokko dogoggore', category: 'errors' },
  { key: 'errors.offline', lang: 'en', value: 'You are offline', category: 'errors' },
  { key: 'errors.offline', lang: 'om', value: 'Interneetii irraa hin gaʼin jirta', category: 'errors' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Check if already seeded
    const count = await base44.entities.LocaleStrings.list();
    if (count.length > 0) {
      return Response.json({ message: 'Already seeded', count: count.length });
    }

    // Seed translations
    const created = await base44.entities.LocaleStrings.bulkCreate(LOCALE_STRINGS);

    return Response.json({ success: true, count: created.length });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});