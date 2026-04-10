/**
 * Certificate & Exam Translations
 * Multi-language support for FaithLight certificates and exams
 * Supports: English, Oromo, Amharic, Arabic
 */

export const CERTIFICATE_TRANSLATIONS = {
  en: {
    title: 'Certificate of Completion',
    certifies: 'This certifies that',
    hasCompleted: 'has successfully completed',
    through: 'through FaithLight',
    date: 'Date:',
    certificateId: 'Certificate ID:',
  },
  om: {
    title: 'Ragaa Xumuraa Leenjii',
    certifies: 'Ragaan kun mirkaneessa akka',
    hasCompleted: 'leenjii',
    through: 'karaa FaithLight guutummaatti xumuree jira',
    date: 'Guyyaa:',
    certificateId: 'Lakkoofsa Ragaa:',
  },
  am: {
    title: 'የማጠናቀቂያ ምስክር ወረቀት',
    certifies: 'ይህ ምስክር ወረቀት',
    hasCompleted: 'በ FaithLight በኩል',
    through: 'በተሳካ ሁኔታ እንዳጠናቀቀ ያረጋግጣል',
    date: 'ቀን፡',
    certificateId: 'የምስክር መለያ፡',
  },
  ar: {
    title: 'شهادة إتمام',
    certifies: 'تشهد هذه الشهادة بأن',
    hasCompleted: 'قد أتمّ بنجاح',
    through: 'من خلال FaithLight',
    date: 'التاريخ:',
    certificateId: 'رقم الشهادة:',
  },
};

export const EXAM_TRANSLATIONS = {
  en: {
    exam: 'Exam',
    finalExam: 'Final Exam',
    quiz: 'Quiz',
    startExam: 'Start Exam',
    submit: 'Submit',
    timeRemaining: 'Time Remaining',
    passed: 'Passed',
    failed: 'Failed',
    certificateEarned: 'Certificate Earned',
    question: 'Question',
    of: 'of',
    instructions: 'Read each question carefully and select the best answer. You cannot change your answers after submitting.',
    confirmSubmit: 'Are you sure? You cannot change your answers after submission.',
    examCompleted: 'Exam Completed',
    score: 'Score',
    passingScore: 'Passing Score',
    retake: 'Retake Exam',
    viewCertificate: 'View Certificate',
  },
  om: {
    exam: 'Qormaata',
    finalExam: 'Qormaata Xumuraa',
    quiz: 'Gaaffilee Qormaataa',
    startExam: 'Qormaata Jalqabi',
    submit: 'Ergi',
    timeRemaining: 'Yeroo Hafe',
    passed: 'Darbeera',
    failed: 'Hin Darbine',
    certificateEarned: 'Ragaa Argatte',
    question: 'Gaaffii',
    of: 'keessaa',
    instructions: 'Gaaffii hunda caalaatti hubadhu. Gaaffii hunda deebisi. Yeroon murtaa\'e qaba. Deebiin erga ergamee booda hin jijjiiramu.',
    confirmSubmit: 'Ati waliigalee? Deebiin erga ergamee booda hin jijjiiramu.',
    examCompleted: 'Qormaatni Xummuurame',
    score: 'Balaa',
    passingScore: 'Balaa Darbinaa',
    retake: 'Qormaata Irra Deebii',
    viewCertificate: 'Ragaa Ilali',
  },
  am: {
    exam: 'ፈተና',
    finalExam: 'የመጨረሻ ፈተና',
    quiz: 'አጭር ፈተና',
    startExam: 'ፈተናውን ጀምር',
    submit: 'አስገባ',
    timeRemaining: 'የቀረ ጊዜ',
    passed: 'አልፏል',
    failed: 'አልፎአል',
    certificateEarned: 'ምስክር አግኝቷል',
    question: 'ጥያቄ',
    of: 'ከ',
    instructions: 'እያንዳንዱን ጥያቄ በጥንቃቄ прочитайте በምርጫ ምልስ። ሁሉንም ጥያቄዎች መመለስ ይኖርብሃል። የተወሰነ ጊዜ አለው። እንደገና መቀየር አይችሉም።',
    confirmSubmit: 'እርግጠኛ ነዎት? መልሶችዎን ከልክ ማልቀስ በኋላ መቀየር አይችሉም።',
    examCompleted: 'ፈተናው ተጠናቋል',
    score: 'ውጤት',
    passingScore: 'ማለፊያ ውጤት',
    retake: 'ፈተናውን ድግም ውሰድ',
    viewCertificate: 'ምስክር ይመልከቱ',
  },
  ar: {
    exam: 'اختبار',
    finalExam: 'الاختبار النهائي',
    quiz: 'اختبار قصير',
    startExam: 'ابدأ الاختبار',
    submit: 'إرسال',
    timeRemaining: 'الوقت المتبقي',
    passed: 'ناجح',
    failed: 'راسب',
    certificateEarned: 'تم الحصول على الشهادة',
    question: 'سؤال',
    of: 'من',
    instructions: 'اقرأ كل سؤال بعناية واختر أفضل إجابة. لا يمكنك تغيير إجاباتك بعد الإرسال.',
    confirmSubmit: 'هل أنت متأكد؟ لا يمكن تعديل الإجابات بعد الإرسال.',
    examCompleted: 'اكتمل الاختبار',
    score: 'الدرجة',
    passingScore: 'درجة النجاح',
    retake: 'أعد الاختبار',
    viewCertificate: 'عرض الشهادة',
  },
};

export const TONE_PROFILES = {
  YOUTH: {
    description: 'Simple, encouraging, short sentences, practical examples',
    example: 'Accordion, supportive language. Questions like "Why is this important to you?"',
  },
  PASTOR: {
    description: 'Formal, respectful, Scripture-focused, leadership language',
    example: 'Respectful, pastoral tone. References biblical foundations and leadership principles.',
  },
  DEFAULT: {
    description: 'Clear, neutral, church-appropriate',
    example: 'Standard teaching tone, suitable for all audiences.',
  },
};

/**
 * Get translated text for certificate
 */
export function getCertificateText(language = 'en', userName = '', courseName = '', date = '') {
  const trans = CERTIFICATE_TRANSLATIONS[language] || CERTIFICATE_TRANSLATIONS.en;
  
  return {
    title: trans.title,
    line1: trans.certifies,
    name: userName,
    line2: trans.hasCompleted,
    course: courseName,
    line3: trans.through,
    date: `${trans.date} ${date}`,
  };
}

/**
 * Get translated exam text
 */
export function getExamText(language = 'en', key = '') {
  const trans = EXAM_TRANSLATIONS[language] || EXAM_TRANSLATIONS.en;
  return trans[key] || key;
}

/**
 * Get tone-aware prompt for content generation/translation
 */
export function getToneAwarePrompt(sourceText, language = 'om', tone = 'DEFAULT') {
  const toneDesc = TONE_PROFILES[tone] || TONE_PROFILES.DEFAULT;
  
  return `Translate and adapt the following Christian leadership content into the ${language} language.

Tone Profile: ${tone}
Tone Description: ${toneDesc.description}

Rules:
- Keep Bible references unchanged.
- Stay faithful to Scripture.
- Use ${tone === 'YOUTH' ? 'simple language, short sentences, practical life examples.' : tone === 'PASTOR' ? 'formal language, teaching-oriented, respectful tone.' : 'clear, neutral, church-appropriate language.'}
- Make it suitable for ${tone === 'YOUTH' ? 'young people' : tone === 'PASTOR' ? 'church leaders and pastors' : 'all church members'}.

Content to translate:
${sourceText}`;
}

/**
 * Get user's preferred tone from profile
 */
export async function getUserTonePreference(userId) {
  try {
    const user = await (await import('@/api/base44Client')).base44.entities.User.filter(
      { id: userId },
      null,
      1
    );
    
    if (user.length > 0 && user[0].preferred_tone) {
      return user[0].preferred_tone;
    }
    return 'DEFAULT';
  } catch (error) {
    console.error('Error fetching user tone preference:', error);
    return 'DEFAULT';
  }
}

/**
 * Format certificate display
 */
export function formatCertificateHTML(userName, courseName, date, certificateId, language = 'en') {
  const text = getCertificateText(language, userName, courseName, date);
  
  return `
    <div class="certificate-container">
      <h1 class="certificate-title">${text.title}</h1>
      <p class="certificate-text">
        ${text.line1}<br/>
        <span class="certificate-name">${text.name}</span><br/>
        ${text.line2}<br/>
        <span class="certificate-course">${text.course}</span><br/>
        ${text.line3}
      </p>
      <p class="certificate-meta">${text.date}</p>
      <p class="certificate-meta">${text.date.replace('Date:', 'Certificate ID:')} ${certificateId}</p>
    </div>
  `;
}