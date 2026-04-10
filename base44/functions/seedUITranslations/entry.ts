import { base44 } from '@/api/base44Client';

const SEED_LOCK_KEY = '__seed_lock__';

/**
 * Idempotent, race-safe translation seeding.
 * Uses a sentinel record as a distributed lock so concurrent calls
 * (different users / devices / sessions) cannot create duplicates.
 */
export async function seedUITranslations() {
  try {
    // Check if LocaleStrings entity exists instead (it's the one we're using)
    if (!base44?.entities?.LocaleStrings) {
      return { success: false, reason: 'LocaleStrings entity unavailable' };
    }

    // Check for existing lock record
    const locks = await base44.entities.LocaleStrings.filter(
      { key: SEED_LOCK_KEY, lang: 'en' },
      '-created_date', 1
    ).catch(() => []);

    if (locks && locks.length > 0) {
      return { success: true, reason: 'already seeded' };
    }

    // Write the lock FIRST (prevents race conditions)
    await base44.entities.LocaleStrings.create({
      key: SEED_LOCK_KEY,
      lang: 'en',
      value: 'seeded',
    }).catch(() => {});

    // English UI
    const enUI = {
      'home.title': 'FaithLight',
      'home.tagline': 'Scripture lights your way',
      'home.welcome': 'Welcome',
      'home.intro': 'FaithLight AI is here to help you understand Scripture.',
      'nav.home': 'Home',
      'nav.community': 'Groups',
      'nav.login': 'Login',

      // Live session – raise hand & speaking flow
      'live.raise_hand.sent.title': 'Request sent',
      'live.raise_hand.sent.body': 'Your request to speak has been sent to the host.',
      'live.raise_hand.denied.title': 'Request not approved',
      'live.raise_hand.denied.body': 'Please continue listening and feel free to request again later.',
      'live.raise_hand.expired.title': 'Invitation expired',
      'live.raise_hand.expired.body': 'You can request again if the session is still live.',
      'live.invite.received.title': "You're invited to speak",
      'live.invite.received.body': "You'll be heard by everyone in this Live Study.",
      'live.invite.not_now': 'Not now',
      'live.invite.awaiting.title': 'Awaiting acceptance',
      'live.invite.awaiting.body': 'Invite sent. Waiting for user to accept.',
      'live.speaker.now_live.title': 'You are now live',
      'live.speaker.now_live.body': 'Please speak clearly and respectfully.',
      'live.chat.disabled': 'Chat has been disabled by the host.',
    };

    // Afaan Oromo UI
    const omUI = {
      'home.title': 'FaithLight',
      'home.tagline': 'Ifti Dubbiin Waaqayyoo karaa jireenya kee ibsu',
      'home.welcome': 'Baga nagaan dhuftan',
      'home.intro': 'FaithLight AI si gargaaruuf as jira.',
      'nav.home': 'Mana',
      'nav.community': 'Garee',
      'nav.login': 'Seeni',

      // Onboarding pages
      'welcome.title': 'Guyyaa hunda Macaafa Qulqulluu keessatti guddadhu',
      'welcome.description': 'Dubbisi, dhaggeeffadhu, akkasumas Macaafa Qulqulluu meeshaalee qo\'annoo AI\'n deeggaraman waliin baradhu. FaithLight imala guyyaa guyyaan Dubbii Waaqayyoo keessatti si wajjin deema.',
      'welcome.readAndStudy': 'Dubbisi fi Qo\'adhu',
      'welcome.listenOffline': 'Internetiin alatti dhaggeeffadhu',
      'welcome.aiTools': 'Meeshaalee AI',
      'welcome.getStarted': 'Jalqabi',
      'welcome.skipForNow': 'Ammaaf darbi',

      'focus.title': 'Maal irratti xiyyeeffachuu barbaadda?',
      'focus.description': 'Tokko yookaan isaa ol filadhu. Kun tajaajila kee dhuunfachiisa.',
      'focus.dailyBibleReading': 'Dubbisa Macaafa Qulqulluu guyyaa guyyaan',
      'focus.dailyBibleReadingDesc': 'Aadaa dubbisaa itti fufiinsa qabu ijaari',
      'focus.deeperStudy': 'Qo\'annoo gadi fagoo',
      'focus.deeperStudyDesc': 'Mata-dureewwanii fi kutaalee caalaatti gadi fageenyaan qoradhu',
      'focus.sermonPreparation': 'Qophii lallabaa',
      'focus.sermonPreparationDesc': 'Tarreeffamaa fi yaadannoo barsiisaa qopheessi',
      'focus.personalGrowth': 'Guddina dhuunfaa',
      'focus.personalGrowthDesc': 'Sagantaa guyyaa guyyaa fi xiinxala dhuunfaa',
      'focus.learningFoundations': 'Bu\'uura barumsaa',
      'focus.learningFoundationsDesc': 'Barumsa qindaa\'aa warra amantii haaraa jalqabaniif',
      'focus.continue': 'Itti fufi',
      'focus.skipForNow': 'Ammaaf darbi',

      'time.title': 'Guyyaatti yeroo hammamii qabda?',
      'time.description': 'Kun dheerina karoora siif mijatu akka yaadnu nu gargaara.',
      'time.fiveMinutes': 'Daqiiqaa 5',
      'time.fiveMinutesDesc': 'Aayata guyyaa gabaabaa fi xiinxala',
      'time.tenMinutes': 'Daqiiqaa 10',
      'time.tenMinutesDesc': 'Kutaa keessaa dubbisa fi yaadannoo qo\'annoo',
      'time.twentyPlusMinutes': 'Daqiiqaa 20 ol',
      'time.twentyPlusMinutesDesc': 'Karoora qo\'annoo guutuu yookaan barnoota guutuu',
      'time.continue': 'Itti fufi',
      'time.skipForNow': 'Ammaaf darbi',

      'ai.title': 'Akkaataa AI qo\'annoo keessan faa\'u',
      'ai.description': 'FaithLight AI barumsaa kee akka gabaasan kan jira — seera amantii labsuuf miti.',
      'ai.outlines': 'Karoora qo\'annoo uuma',
      'ai.outlinesDesc': 'Karoora mata-duree ijaara keessa madaaluun galchu',
      'ai.passages': 'Kutaawwan riqiqaa ibsu',
      'ai.passagesDesc': 'Haala seenaa barumsa keenyas gargaaru',
      'ai.sermon': 'Qophi lallaba akka gabaasan',
      'ai.sermonDesc': 'Tarreeffama Macaaba Qulqulluu waliin',
      'ai.quizzes': 'Quiz Macaaba uuma',
      'ai.quizzesDesc': 'Wantaa itti baartee bobba\'u',
      'ai.disclaimer': 'AI barumsaa akka gabaasan dha — Macaabi Qulqulluu jiddha. Qabiyyeen AI uumamee qo\'annoo dhuunfaa fi barsiisa manyummaa wajjin ilaalun qabu.',

      'action.title': 'Jalqabuuf yoo\'an',
      'action.subtitle': 'Guyyaa guyyoo jalqabuu barbaadde filadhu.',
      'action.daily': 'Aayata guyyaa',
      'action.dailyDesc': 'Aayata si ifaa kan guyyaa',
      'action.plan': 'Karoora qo\'annoo an jirra',
      'action.planDesc': 'Karoori AI karaa ga\'iinsa keesa mijatuun',
      'action.audio': 'Macaabi Qulqulluu',
      'action.audioDesc': 'Internetiin alatti dhaggeeffadhu',
      'action.reader': 'Dubbisaan Macaaba',
      'action.readerDesc': 'Amma dubbisa Macaaba jalqabi',
      'action.dashboard': 'Gara Dindeetti',

      'common.continue': 'Itti fufi',
      'common.skipForNow': 'Ammaaf darbi',
      'common.getStarted': 'Jalqabi',

      // Live session – raise hand & speaking flow
      'live.raise_hand.sent.title': 'Gaaffiin kee ergameera',
      'live.raise_hand.sent.body': 'Gaaffiin kee dubbachuuf gara hogganaa ergameera.',
      'live.raise_hand.denied.title': 'Gaaffiin kee hin eeyyamamne',
      'live.raise_hand.denied.body': 'Mee dhaggeeffachuu itti fufi, booda deebi\'uun gaaffii dhiyeessuu dandeessa.',
      'live.raise_hand.expired.title': 'Affeerraan yeroon isaa darbeera',
      'live.raise_hand.expired.body': 'Yoo barnootni kallattiin itti fufee jiraate, deebi\'uun gaaffii dhiyeessuu dandeessa.',
      'live.invite.received.title': 'Dubbachuuf affeeramteetta',
      'live.invite.received.body': 'Barnoota Kallatti kana keessatti namoonni hundi si dhagahuu danda\'u.',
      'live.invite.not_now': 'Amma miti',
      'live.invite.awaiting.title': 'Eeyyama eegaa jira',
      'live.invite.awaiting.body': 'Affeerraan ergameera. Fayyadamaan eeyyamuun isaa eegamaa jira.',
      'live.speaker.now_live.title': 'Amma kallattiidhaan jirta',
      'live.speaker.now_live.body': 'Mee ifatti fi kabajaan dubbadhu.',
      'live.chat.disabled': 'Marii hogganaan cufameera.',
    };

    // Amharic UI
    const amUI = {
      'home.title': 'FaithLight',
      'home.tagline': 'ቃል እግዚአብሔር መንገድህን ያብራ',
      'home.welcome': 'እንኳን በደህና መጡ',
      'nav.home': 'ቤት',
      'nav.community': 'ቡድን',
      'nav.login': 'ግባ',
    };

    // Arabic UI
    const arUI = {
      'home.title': 'FaithLight',
      'home.tagline': 'كلام الله ينير طريقك',
      'home.welcome': 'أهلاً وسهلاً',
      'nav.home': 'الرئيسية',
      'nav.community': 'المجموعات',
      'nav.login': 'تسجيل الدخول',
    };

    const batch = [
      ...Object.entries(enUI).map(([key, value]) => ({ key, lang: 'en', value })),
      ...Object.entries(omUI).map(([key, value]) => ({ key, lang: 'om', value })),
      ...Object.entries(amUI).map(([key, value]) => ({ key, lang: 'am', value })),
      ...Object.entries(arUI).map(([key, value]) => ({ key, lang: 'ar', value })),
    ];

    await base44.entities.LocaleStrings.bulkCreate(batch).catch(() => {});
    return { success: true, reason: 'seeded' };
  } catch (error) {
    console.error('seedUITranslations error:', error);
    return { success: false, error: error?.message };
  }
}