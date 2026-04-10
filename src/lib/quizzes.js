// Sample quiz questions by chapter
export const quizBank = {
  'JHN_3': [
    {
      id: 'jhn3_q1',
      chapter: 'John 3',
      question: 'What does John 3:16 say about God\'s love?',
      options: [
        'God loves those who are perfect',
        'God loves the world and gave His only Son',
        'God loves only the righteous',
        'God\'s love is limited to believers',
      ],
      correct: 1,
      explanation: 'John 3:16 states that God loves the world so much that He gave His only Son.',
    },
    {
      id: 'jhn3_q2',
      chapter: 'John 3',
      question: 'What does being "born again" mean in John 3:3?',
      options: [
        'Being baptized as a baby',
        'Growing older in faith',
        'Being born of the Spirit; spiritual rebirth',
        'Reincarnation',
      ],
      correct: 2,
      explanation: 'Jesus explained that being "born again" requires a spiritual rebirth through faith.',
    },
  ],
  'ROM_5': [
    {
      id: 'rom5_q1',
      chapter: 'Romans 5',
      question: 'According to Romans 5, what does faith bring us?',
      options: [
        'Material wealth',
        'Peace with God and hope',
        'Freedom from all trials',
        'Instant healing',
      ],
      correct: 1,
      explanation: 'Romans 5:1-2 teaches that faith brings peace with God through Christ.',
    },
  ],
  'PSA_23': [
    {
      id: 'psa23_q1',
      chapter: 'Psalm 23',
      question: 'What does "the Lord is my shepherd" imply?',
      options: [
        'God herds animals',
        'God guides, protects, and provides for us',
        'We must be perfect',
        'Shepherding is a literal profession',
      ],
      correct: 1,
      explanation: 'This metaphor means God guides, protects, and provides for His people like a shepherd for sheep.',
    },
  ],
};

const ATTEMPTS_KEY = 'faithlight_quiz_attempts';

export function getQuizForChapter(chapterRef) {
  return quizBank[chapterRef] || [];
}

export function saveQuizAttempt(userEmail, chapterRef, score, totalQuestions) {
  try {
    const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
    
    const attempt = {
      id: Math.random().toString(36).substring(2, 11),
      userEmail,
      chapterRef,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      completedAt: new Date().toISOString(),
    };

    all.push(attempt);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(all));
    return attempt;
  } catch (e) {
    console.error('Error saving quiz attempt:', e);
    return null;
  }
}

export function getQuizAttempts(userEmail) {
  try {
    const all = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
    return all.filter(a => a.userEmail === userEmail).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  } catch {
    return [];
  }
}