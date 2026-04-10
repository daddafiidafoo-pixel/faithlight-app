import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Extended translation pack (Live Events, Study Plans, Quiz, Admin, Policies, AppStore)
    const translations = [
      // ==================== LIVE EVENTS ====================
      { lang: 'en', key: 'events.title', value: 'Live Events' },
      { lang: 'en', key: 'events.subtitle', value: 'Watch live teachings or create your own event' },
      { lang: 'en', key: 'events.create', value: 'Create Event' },
      { lang: 'en', key: 'events.step.details', value: 'Event Details' },
      { lang: 'en', key: 'events.step.schedule', value: 'Date & Time' },
      { lang: 'en', key: 'events.step.location', value: 'Location or Link' },
      { lang: 'en', key: 'events.step.publish', value: 'Publish' },
      { lang: 'en', key: 'events.titleField', value: 'Event Title' },
      { lang: 'en', key: 'events.descriptionField', value: 'Description' },
      { lang: 'en', key: 'events.eventType', value: 'Event Type' },
      { lang: 'en', key: 'events.mode', value: 'Mode' },
      { lang: 'en', key: 'events.mode.online', value: 'Online' },
      { lang: 'en', key: 'events.mode.inPerson', value: 'In Person' },
      { lang: 'en', key: 'events.mode.hybrid', value: 'Hybrid' },
      { lang: 'en', key: 'events.date', value: 'Date' },
      { lang: 'en', key: 'events.time', value: 'Start Time' },
      { lang: 'en', key: 'events.duration', value: 'Duration (minutes)' },
      { lang: 'en', key: 'events.timezone', value: 'Timezone' },
      { lang: 'en', key: 'events.visibility', value: 'Visibility' },
      { lang: 'en', key: 'events.public', value: 'Public' },
      { lang: 'en', key: 'events.groupOnly', value: 'Group Only' },
      { lang: 'en', key: 'events.private', value: 'Private' },
      { lang: 'en', key: 'events.publish', value: 'Publish Event' },
      { lang: 'en', key: 'events.startLive', value: 'Go Live' },
      { lang: 'en', key: 'events.endLive', value: 'End Event' },
      { lang: 'en', key: 'events.empty', value: 'No events.' },
      { lang: 'en', key: 'events.emptyDesc', value: 'Create a new event to get started.' },

      { lang: 'om', key: 'events.title', value: 'Sagantaalee Jireenya (Live)' },
      { lang: 'om', key: 'events.subtitle', value: 'Sagantaalee amantii kallattiin hordofi yookaan uumi' },
      { lang: 'om', key: 'events.create', value: 'Sagantaa Uumi' },
      { lang: 'om', key: 'events.step.details', value: 'Ibsa Sagantaa' },
      { lang: 'om', key: 'events.step.schedule', value: 'Guyyaa fi Sa\'aatii' },
      { lang: 'om', key: 'events.step.location', value: 'Bakka yookaan Liinkii' },
      { lang: 'om', key: 'events.step.publish', value: 'Maxxansi' },
      { lang: 'om', key: 'events.titleField', value: 'Maqaa Sagantaa' },
      { lang: 'om', key: 'events.descriptionField', value: 'Ibsa' },
      { lang: 'om', key: 'events.eventType', value: 'Gosa Sagantaa' },
      { lang: 'om', key: 'events.mode', value: 'Akkaataa' },
      { lang: 'om', key: 'events.mode.online', value: 'Online' },
      { lang: 'om', key: 'events.mode.inPerson', value: 'Bakka irratti' },
      { lang: 'om', key: 'events.mode.hybrid', value: 'Walitti Makaa' },
      { lang: 'om', key: 'events.date', value: 'Guyyaa' },
      { lang: 'om', key: 'events.time', value: 'Sa\'aatii Jalqabaa' },
      { lang: 'om', key: 'events.duration', value: 'Yeroo turtii (daqiiqaa)' },
      { lang: 'om', key: 'events.timezone', value: 'Naannoo Sa\'aatii' },
      { lang: 'om', key: 'events.visibility', value: 'Mul\'achuu' },
      { lang: 'om', key: 'events.public', value: 'Iftaa (Public)' },
      { lang: 'om', key: 'events.groupOnly', value: 'Garee Qofa' },
      { lang: 'om', key: 'events.private', value: 'Dhuunfaa' },
      { lang: 'om', key: 'events.publish', value: 'Sagantaa Maxxansi' },
      { lang: 'om', key: 'events.startLive', value: 'Kallattiin Jalqabi' },
      { lang: 'om', key: 'events.endLive', value: 'Xumuri' },
      { lang: 'om', key: 'events.empty', value: 'Sagantaan hin jiru.' },
      { lang: 'om', key: 'events.emptyDesc', value: 'Sagantaa haaraa uumi jalqabuuf.' },

      // ==================== STUDY PLANS ====================
      { lang: 'en', key: 'studyPlans.title', value: 'Study Plans' },
      { lang: 'en', key: 'studyPlans.subtitle', value: 'Create reading plans and track your learning' },
      { lang: 'en', key: 'studyPlans.create', value: 'Create Plan' },
      { lang: 'en', key: 'studyPlans.name', value: 'Plan Name' },
      { lang: 'en', key: 'studyPlans.duration', value: 'Duration (weeks/months)' },
      { lang: 'en', key: 'studyPlans.description', value: 'Plan Description' },
      { lang: 'en', key: 'studyPlans.subscribe', value: 'Subscribe' },
      { lang: 'en', key: 'studyPlans.subscribed', value: 'Subscribed' },
      { lang: 'en', key: 'studyPlans.progress', value: 'Progress' },
      { lang: 'en', key: 'studyPlans.empty', value: 'No plans found.' },
      { lang: 'en', key: 'studyPlans.emptyDesc', value: 'Create a new plan or subscribe to an existing one.' },

      { lang: 'om', key: 'studyPlans.title', value: 'Karoora Barnootaa' },
      { lang: 'om', key: 'studyPlans.subtitle', value: 'Karoora dubbisaa fi barnoota kee qopheessi' },
      { lang: 'om', key: 'studyPlans.create', value: 'Karoora Uumi' },
      { lang: 'om', key: 'studyPlans.name', value: 'Maqaa Karooraa' },
      { lang: 'om', key: 'studyPlans.duration', value: 'Yeroo (torban/ji\'a)' },
      { lang: 'om', key: 'studyPlans.description', value: 'Ibsa Karooraa' },
      { lang: 'om', key: 'studyPlans.subscribe', value: 'Hordofi' },
      { lang: 'om', key: 'studyPlans.subscribed', value: 'Hordofteera' },
      { lang: 'om', key: 'studyPlans.progress', value: 'Tarkaanfii' },
      { lang: 'om', key: 'studyPlans.empty', value: 'Karoora hin argamne.' },
      { lang: 'om', key: 'studyPlans.emptyDesc', value: 'Karoora haaraa uumi yookaan kan jiru hordofi.' },

      // ==================== QUIZ ====================
      { lang: 'en', key: 'quiz.title', value: 'Bible Quiz' },
      { lang: 'en', key: 'quiz.subtitle', value: 'Test and grow your knowledge' },
      { lang: 'en', key: 'quiz.dailyChallenge', value: 'Daily Challenge' },
      { lang: 'en', key: 'quiz.multiplayer', value: 'Multiplayer Battle' },
      { lang: 'en', key: 'quiz.memVerse', value: 'Verse Memory (Fill in the Blank)' },
      { lang: 'en', key: 'quiz.start', value: 'Start' },
      { lang: 'en', key: 'quiz.next', value: 'Next Question' },
      { lang: 'en', key: 'quiz.submit', value: 'Submit' },
      { lang: 'en', key: 'quiz.score', value: 'Your Score' },
      { lang: 'en', key: 'quiz.correct', value: 'Correct!' },
      { lang: 'en', key: 'quiz.wrong', value: 'Wrong' },
      { lang: 'en', key: 'quiz.challengeFriend', value: 'Challenge a Friend' },
      { lang: 'en', key: 'quiz.randomMatch', value: 'Random Opponent' },
      { lang: 'en', key: 'quiz.inviteLink', value: 'Invite Link' },
      { lang: 'en', key: 'quiz.waiting', value: 'Waiting...' },
      { lang: 'en', key: 'quiz.winner', value: 'You won!' },
      { lang: 'en', key: 'quiz.loser', value: 'Try again next time.' },

      { lang: 'om', key: 'quiz.title', value: 'Quiz Kitaaba Qulqulluu' },
      { lang: 'om', key: 'quiz.subtitle', value: 'Beekumsa kee qori fi guddisi' },
      { lang: 'om', key: 'quiz.dailyChallenge', value: 'Qormaata Guyyaa' },
      { lang: 'om', key: 'quiz.multiplayer', value: 'Wal-dorgommii' },
      { lang: 'om', key: 'quiz.memVerse', value: 'Lakkoofsa yaadachuu (Fill in the Blank)' },
      { lang: 'om', key: 'quiz.start', value: 'Jalqabi' },
      { lang: 'om', key: 'quiz.next', value: 'Gaaffii Itti Aanu' },
      { lang: 'om', key: 'quiz.submit', value: 'Ergi' },
      { lang: 'om', key: 'quiz.score', value: 'Bu\'aa Kee' },
      { lang: 'om', key: 'quiz.correct', value: 'Sirrii!' },
      { lang: 'om', key: 'quiz.wrong', value: 'Dogoggora' },
      { lang: 'om', key: 'quiz.challengeFriend', value: 'Michuu Qoradhu' },
      { lang: 'om', key: 'quiz.randomMatch', value: 'Nama Hin Beekne Waliin Dorgomi' },
      { lang: 'om', key: 'quiz.inviteLink', value: 'Liinkii Afeerraa' },
      { lang: 'om', key: 'quiz.waiting', value: 'Eeggamaa jira...' },
      { lang: 'om', key: 'quiz.winner', value: 'Injifatteera!' },
      { lang: 'om', key: 'quiz.loser', value: 'Yeroo biraa yaali.' },

      // ==================== ADMIN MODERATION ====================
      { lang: 'en', key: 'admin.moderation.title', value: 'Content Moderation' },
      { lang: 'en', key: 'admin.moderation.pending', value: 'Pending Approval' },
      { lang: 'en', key: 'admin.moderation.reported', value: 'Reported Content' },
      { lang: 'en', key: 'admin.moderation.all', value: 'All' },
      { lang: 'en', key: 'admin.approve', value: 'Approve' },
      { lang: 'en', key: 'admin.remove', value: 'Remove' },
      { lang: 'en', key: 'admin.unpublish', value: 'Unpublish' },
      { lang: 'en', key: 'admin.reason', value: 'Reason' },

      { lang: 'om', key: 'admin.moderation.title', value: 'To\'annoo Qabiyyee' },
      { lang: 'om', key: 'admin.moderation.pending', value: 'Eeyyama Eeggachaa' },
      { lang: 'om', key: 'admin.moderation.reported', value: 'Kan Himataman' },
      { lang: 'om', key: 'admin.moderation.all', value: 'Hundumaa' },
      { lang: 'om', key: 'admin.approve', value: 'Eeyyami' },
      { lang: 'om', key: 'admin.remove', value: 'Haqi' },
      { lang: 'om', key: 'admin.unpublish', value: 'Maxxansaa irraa buusi' },
      { lang: 'om', key: 'admin.reason', value: 'Sababa' },

      // ==================== POLICIES & LEGAL ====================
      { lang: 'en', key: 'policy.privacyTitle', value: 'Privacy Policy' },
      { lang: 'en', key: 'policy.privacyIntro', value: 'FaithLight respects your privacy. Your personal information (name, email, account data) is stored securely.' },
      { lang: 'en', key: 'policy.privacyData', value: 'Data Usage' },
      { lang: 'en', key: 'policy.privacyDataDesc', value: 'Your data is used only to provide services, never sold to third parties, and protected with industry-standard security.' },
      { lang: 'en', key: 'policy.privacyRights', value: 'Your Rights' },
      { lang: 'en', key: 'policy.privacyRightsDesc', value: 'You can view, edit, or delete your information at any time. Contact us with questions.' },
      { lang: 'en', key: 'policy.termsTitle', value: 'Terms of Service' },
      { lang: 'en', key: 'policy.termsIntro', value: 'By using FaithLight, you agree to these terms.' },
      { lang: 'en', key: 'policy.termsRules', value: 'Community Rules' },
      { lang: 'en', key: 'policy.termsRulesDesc', value: 'You must respect laws, not post harmful content, and respect other users.' },
      { lang: 'en', key: 'policy.termsAI', value: 'AI Disclaimer' },
      { lang: 'en', key: 'policy.termsAIDesc', value: 'AI responses may contain errors. Always verify with Scripture. Violation of these terms may result in account suspension.' },
      { lang: 'en', key: 'policy.appStoreDesc', value: 'FaithLight - World-Class Bible Learning. Read the Bible, listen to audio, study with AI, discuss in groups, and take quizzes. AI creates personalized lessons, devotionals, and quizzes. Read offline. Grow your faith worldwide.' },

      { lang: 'om', key: 'policy.privacyTitle', value: 'Imaammata Iccitii' },
      { lang: 'om', key: 'policy.privacyIntro', value: 'FaithLight fayyadamtoota isaa kabaja. Odeeffannoo kee dhuunfaa (akka maqaa, email, fi odeeffannoo fayyadamaa) nageenyaan kuufna.' },
      { lang: 'om', key: 'policy.privacyData', value: 'Fayyada Odeeffannoo' },
      { lang: 'om', key: 'policy.privacyDataDesc', value: 'Odeeffannoon tajaajila siif kennuuf qofa fayyada, nama sadaffaatti hin gurguramne, fi nageenya sirna ammayyaa fayyadama.' },
      { lang: 'om', key: 'policy.privacyRights', value: 'Midhaa Kee' },
      { lang: 'om', key: 'policy.privacyRightsDesc', value: 'Yeroo barbaadde, odeeffannoo kee ilaaluu, sirreessuu yookaan haquu ni dandeessa. Gaaffii yoo qabaatte, nu qunnami.' },
      { lang: 'om', key: 'policy.termsTitle', value: 'Haala Tajaajilaa' },
      { lang: 'om', key: 'policy.termsIntro', value: 'FaithLight fayyadamuun haala kana kabajuu qabda.' },
      { lang: 'om', key: 'policy.termsRules', value: 'Seerota Jidda' },
      { lang: 'om', key: 'policy.termsRulesDesc', value: 'Seerota kabajuu qabda, qabiyyee miidhaa qabu maxxansuu hin qabdu, fi namoota biroo kabajuu qabda.' },
      { lang: 'om', key: 'policy.termsAI', value: 'Waanta AI' },
      { lang: 'om', key: 'policy.termsAIDesc', value: 'Deebiin AI dogoggora qabaachuu danda\'a. Kitaaba Qulqulluu irratti mirkaneessuun si barbaachisa. Seerota kana cabsite yoo ta\'e, akkaawuntiin kee cufamuu danda\'a.' },
      { lang: 'om', key: 'policy.appStoreDesc', value: 'FaithLight – Barnoota Kitaaba Qulqulluu Addunyaa Guutuu. Kitaaba Qulqulluu dubbisi, sagalee dhaggeeffadhu, AI waliin baradhu, gareewwan keessatti mari\'adhu, fi quiz dorgomi. AI sagantaa barsiisuu, cimsannaa amantii, fi qormaata siif uuma. Offline dubbisi. Addunyaa guutuu keessatti amantii kee guddisi.' },
    ];

    // Bulk create translations
    const result = await base44.asServiceRole.entities.LocaleStrings.bulkCreate(translations);

    return Response.json({ 
      success: true, 
      created: result.length,
      message: `Seeded ${result.length} extended locale strings (Live Events, Study Plans, Quiz, Admin, Policies)` 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});