import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles, Loader2, CheckCircle, XCircle, BarChart3,
  ArrowRight, ArrowLeft, RotateCw, Share2, BookOpen, ChevronRight, Database
} from 'lucide-react';
import { useI18n } from '../components/I18nProvider';
import AIHelperDrawer from '../components/ai/AIHelperDrawer';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';
import OromooDBQuiz from '../components/quiz/OromooDBQuiz';

const QUIZ_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'om', label: 'Afaan Oromoo', nativeLabel: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ', flag: '🇪🇹' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'sw', label: 'Swahili', nativeLabel: 'Kiswahili', flag: '🌍' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇧🇷' },
];

// UI strings per language
const UI_STRINGS = {
   en: { title: 'Bible Quizzes', chooseTopic: 'Choose a Topic', chooseLanguage: 'Quiz Language', correct: 'Correct!', wrong: 'Wrong', next: 'Next', tryAgain: 'Try Again', startQuiz: 'Start Quiz', generate: 'Generate Quiz', noQuestions: 'AI will generate questions in this language.', useEnglish: 'Use English for now', topicPlaceholder: 'E.g. Gospel of John, Faith, Forgiveness…', popularTopics: 'Popular Topics', genFailed: 'Quiz generation failed. Please try again.', back: 'Back', changeSettings: 'Change Settings', regenerate: 'Regenerate', info: 'Info' },
   om: { title: 'Qormaata Macaafa Qulqulluu', chooseTopic: 'Mata-duree filadhu', chooseLanguage: 'Afaan filadhu', correct: 'Sirrii!', wrong: 'Dogoggoraa', next: 'Itti aanuu', tryAgain: 'Irra deebi\'ii yaali', startQuiz: 'Qormaata jalqabi', generate: 'Qormaata uumi', noQuestions: 'AI Afaan Oromootiin gaaffilee uuma.', useEnglish: 'Afaan Ingliffaa fayyadami', topicPlaceholder: 'Fkn. Wangeela Yohaannis, Amantii…', popularTopics: 'Mata-duree beekamoo', genFailed: 'Qormaatni hin uumamne. Irra deebi\'ii yaali.', back: 'Deebi\'i', changeSettings: 'Qindaa\'ina Jijjiiri', regenerate: 'Irra deebi\'ee uumi', info: 'Odeeffannoo' },
   am: { title: 'የቅዱስ መጽሐፍ ፈተና', chooseTopic: 'ርዕስ ምረጥ', chooseLanguage: 'ቋንቋ ምረጥ', correct: 'ትክክል!', wrong: 'ስህተት', next: 'ቀጣይ', tryAgain: 'እንደገና ሞክር', startQuiz: 'ፈተና ጀምር', generate: 'ፈተና ፍጠር', noQuestions: 'AI ፈተናዎቹን በዚህ ቋንቋ ይፈጥራል።', useEnglish: 'እንግሊዝኛ ተጠቀም', topicPlaceholder: 'ለምሳሌ። የዮሐንስ ወንጌል, እምነት…', popularTopics: 'ታዋቂ ርዕሶች', genFailed: 'ፈተና መፍጠር አልተሳካም። እንደገና ሞክር።', back: 'ወደ ኋላ', changeSettings: 'ቅንብሮች ይለውጡ', regenerate: 'ዳግም ይፍጠሩ', info: 'መረጃ' },
   fr: { title: 'Quiz Biblique', chooseTopic: 'Choisir un sujet', chooseLanguage: 'Langue du quiz', correct: 'Correct !', wrong: 'Incorrect', next: 'Suivant', tryAgain: 'Réessayer', startQuiz: 'Démarrer le quiz', generate: 'Générer le quiz', noQuestions: "L'IA générera des questions dans cette langue.", useEnglish: "Utiliser l'anglais", topicPlaceholder: 'Ex. Évangile de Jean, Foi, Pardon…', popularTopics: 'Sujets populaires', genFailed: 'Échec de la génération. Veuillez réessayer.', back: 'Retour', changeSettings: 'Modifier les paramètres', regenerate: 'Régénérer', info: 'Info' },
   sw: { title: 'Maswali ya Biblia', chooseTopic: 'Chagua mada', chooseLanguage: 'Chagua lugha', correct: 'Sahihi!', wrong: 'Kosa', next: 'Endelea', tryAgain: 'Jaribu tena', startQuiz: 'Anza maswali', generate: 'Tengeneza maswali', noQuestions: 'AI itatengeneza maswali kwa lugha hii.', useEnglish: 'Tumia Kiingereza', topicPlaceholder: 'Mfano. Injili ya Yohana, Imani…', popularTopics: 'Mada maarufu', genFailed: 'Kutengeneza kumeshindwa. Jaribu tena.', back: 'Nyuma', changeSettings: 'Badilisha Mipango', regenerate: 'Tengeneza Tena', info: 'Taarifa' },
   pt: { title: 'Quiz Bíblico', chooseTopic: 'Escolha um tópico', chooseLanguage: 'Idioma do quiz', correct: 'Correto!', wrong: 'Errado', next: 'Próximo', tryAgain: 'Tentar novamente', startQuiz: 'Iniciar quiz', generate: 'Gerar quiz', noQuestions: 'A IA gerará perguntas neste idioma.', useEnglish: 'Usar inglês', topicPlaceholder: 'Ex. Evangelho de João, Fé, Perdão…', popularTopics: 'Tópicos populares', genFailed: 'Falha ao gerar. Por favor, tente novamente.', back: 'Voltar', changeSettings: 'Alterar Configurações', regenerate: 'Regenerar', info: 'Informações' },
};

// Topic keys + translations per language
const TOPIC_KEYS = [
  'faith', 'prayer', 'gospel_of_john', 'psalms', 'forgiveness', 'resurrection', 'grace', 'salvation',
  'parables', 'miracles', 'love', 'kingdom', 'repentance', 'disciples', 'genesis', 'romans',
  'feasts', 'commandments', 'covenant', 'wisdom', 'persecution', 'healing'
];

const TOPIC_LABELS = {
  en: {
    faith: 'Faith', prayer: 'Prayer', gospel_of_john: 'Gospel of John', psalms: 'Psalms', 
    forgiveness: 'Forgiveness', resurrection: 'The Resurrection', grace: 'Grace', salvation: 'Salvation',
    parables: 'Parables', miracles: 'Miracles', love: 'Love', kingdom: 'God\'s Kingdom',
    repentance: 'Repentance', disciples: 'The Disciples', genesis: 'Genesis', romans: 'Romans',
    feasts: 'Jewish Feasts', commandments: 'The Commandments', covenant: 'Covenants', wisdom: 'Wisdom',
    persecution: 'Persecution', healing: 'Healing & Wholeness'
  },
  om: {
    faith: 'Amantii', prayer: 'Kadhannaa', gospel_of_john: 'Wangeela Yohaannis', psalms: 'Faarfannaa',
    forgiveness: 'Dhiifama', resurrection: "Du'aa Ka'uu", grace: 'Ayyaana', salvation: 'Fayyina',
    parables: 'Seenaa', miracles: 'Signiiwwan', love: 'Jaaladhaa', kingdom: 'Mootummaa',
    repentance: 'Jijjiirama', disciples: 'Barattoonni', genesis: 'Genesis', romans: 'Romans',
    feasts: 'Ayyaana', commandments: 'Ajajawwan', covenant: 'Waaliigalaa', wisdom: 'Ogummaa',
    persecution: 'Miidhadhaa', healing: 'Fayyina'
  },
  am: {
    faith: 'እምነት', prayer: 'ጸሎት', gospel_of_john: 'የዮሐንስ ወንጌል', psalms: 'መዝሙር',
    forgiveness: 'ይቅርታ', resurrection: 'ትንሳኤ', grace: 'ጸጋ', salvation: 'መዳን',
    parables: 'ምሳሌዎች', miracles: 'ድንቅ ሥራዎች', love: 'ፍቅር', kingdom: 'መንግሥተ ሰማያት',
    repentance: 'ጸንበራ', disciples: 'ደቂቁ', genesis: 'ጌኔሲስ', romans: 'ሮማውያን',
    feasts: 'በዓላት', commandments: 'ትዕዛዞች', covenant: ' завет', wisdom: 'ጥበብ',
    persecution: 'ስቃይ', healing: 'ሕወካ'
  },
  fr: {
    faith: 'Foi', prayer: 'Prière', gospel_of_john: 'Évangile de Jean', psalms: 'Psaumes',
    forgiveness: 'Pardon', resurrection: 'La Résurrection', grace: 'Grâce', salvation: 'Salut',
    parables: 'Paraboles', miracles: 'Miracles', love: 'Amour', kingdom: 'Royaume',
    repentance: 'Repentance', disciples: 'Les Disciples', genesis: 'Genèse', romans: 'Romains',
    feasts: 'Fêtes', commandments: 'Commandements', covenant: 'Alliances', wisdom: 'Sagesse',
    persecution: 'Persécution', healing: 'Guérison'
  },
  sw: {
    faith: 'Imani', prayer: 'Sala', gospel_of_john: 'Injili ya Yohana', psalms: 'Zaburi',
    forgiveness: 'Msamaha', resurrection: 'Ufufuo', grace: 'Neema', salvation: 'Wokovu',
    parables: 'Mifano', miracles: 'Miujiza', love: 'Upendo', kingdom: 'Ufalme',
    repentance: 'Toba', disciples: 'Wanafunzi', genesis: 'Mwanzo', romans: 'Waroma',
    feasts: 'Sikukuu', commandments: 'Amri', covenant: 'Agano', wisdom: 'Hekima',
    persecution: 'Mateso', healing: 'Uponyaji'
  },
  pt: {
    faith: 'Fé', prayer: 'Oração', gospel_of_john: 'Evangelho de João', psalms: 'Salmos',
    forgiveness: 'Perdão', resurrection: 'A Ressurreição', grace: 'Graça', salvation: 'Salvação',
    parables: 'Parábolas', miracles: 'Milagres', love: 'Amor', kingdom: 'Reino',
    repentance: 'Arrependimento', disciples: 'Discípulos', genesis: 'Gênesis', romans: 'Romanos',
    feasts: 'Festas', commandments: 'Mandamentos', covenant: 'Alianças', wisdom: 'Sabedoria',
    persecution: 'Perseguição', healing: 'Cura'
  },
};

// Difficulty options (will be translated via t() in component)
const DIFFICULTIES = [
  { value: 'beginner', labelKey: 'quiz.beginner', descKey: 'quiz.beginnerDesc' },
  { value: 'intermediate', labelKey: 'quiz.intermediate', descKey: 'quiz.intermediateDesc' },
  { value: 'advanced', labelKey: 'quiz.advanced', descKey: 'quiz.advancedDesc' },
];

const QUESTION_COUNTS = [5, 10, 15];
const QUESTION_TYPES = [
  { value: 'multiple_choice', labelKey: 'quiz.multipleChoice' },
  { value: 'true_false', labelKey: 'quiz.trueFalse' },
  { value: 'mixed', labelKey: 'quiz.mixed' },
];
const TIMER_OPTIONS = [
  { value: 'none', labelKey: 'quiz.noTimer' },
  { value: '5', label: '5 min' },
  { value: '10', label: '10 min' },
];

const BIBLE_VERSIONS = [
  { value: 'NIV', label: 'NIV' },
  { value: 'KJV', label: 'KJV' },
  { value: 'ESV', label: 'ESV' },
  { value: 'NKJV', label: 'NKJV' },
  { value: 'NLT', label: 'NLT' },
  { value: 'MSG', label: 'The Message' },
];

const EXPLANATION_TONES = [
  { value: 'devotional', labelKey: 'quiz.devotional', descKey: 'quiz.devotionalDesc' },
  { value: 'academic', labelKey: 'quiz.academic', descKey: 'quiz.academicDesc' },
  { value: 'simple', labelKey: 'quiz.simple', descKey: 'quiz.simpleDesc' },
  { value: 'pastoral', labelKey: 'quiz.pastoral', descKey: 'quiz.pastoralDesc' },
];

const EXPLANATION_LENGTHS = [
  { value: 'brief', labelKey: 'quiz.brief', descKey: 'quiz.briefDesc' },
  { value: 'moderate', labelKey: 'quiz.moderate', descKey: 'quiz.moderateDesc' },
  { value: 'detailed', labelKey: 'quiz.detailed', descKey: 'quiz.detailedDesc' },
];

const BIBLE_BOOKS_LIST = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges',
  'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes',
  'Song of Songs', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John',
  'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
  '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation',
];

// Step indicator
function StepIndicator({ step, t }) {
  const steps = [t('quiz.topic', 'Topic'), t('quiz.difficulty', 'Difficulty'), t('quiz.settings', 'Settings')];
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done ? 'bg-green-500 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-indigo-600' : done ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-10 h-0.5 mb-4 rounded-full transition-all ${step > n ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function AIQuizzes() {
  const { t, lang } = useI18n();

  // Derive default language from app language
  const defaultLang = QUIZ_LANGUAGES.find(l => l.code === lang) ? lang : 'en';

  // Step flow state
  const [quizLang, setQuizLang] = useState(defaultLang);
  const [step, setStep] = useState(1);
  const [topicKey, setTopicKey] = useState(''); // e.g. 'faith'
  const [topic, setTopic] = useState(''); // display label in selected language
  const [difficulty, setDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [timer, setTimer] = useState('none');
  const [bibleVersion, setBibleVersion] = useState('NIV');
  const [explanationTone, setExplanationTone] = useState('devotional');
  const [explanationLength, setExplanationLength] = useState('moderate');
  const [excludedBooks, setExcludedBooks] = useState([]);
  const [showBookExcluder, setShowBookExcluder] = useState(false);
  const [customTags, setCustomTags] = useState(() => {
    const saved = localStorage.getItem('custom_quiz_tags');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTag, setNewTag] = useState('');
  const [showTagForm, setShowTagForm] = useState(false);

  // Generation state
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState(null);
  const [quiz, setQuiz] = useState(null);

  // Quiz play state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const quizRef = useRef(null);
  const timerRef = useRef(null);

  // Handle offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setGenError('No internet connection. Please check your network and try again.');
      setLoading(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      const updated = [...customTags, newTag.trim()];
      setCustomTags(updated);
      localStorage.setItem('custom_quiz_tags', JSON.stringify(updated));
      setNewTag('');
      setShowTagForm(false);
    }
  };

  const removeCustomTag = (tag) => {
    const updated = customTags.filter(t => t !== tag);
    setCustomTags(updated);
    localStorage.setItem('custom_quiz_tags', JSON.stringify(updated));
  };

  const resetAll = () => {
    setStep(1);
    setTopicKey('');
    setTopic('');
    setDifficulty('');
    setQuestionCount(5);
    setQuestionType('multiple_choice');
    setTimer('none');
    setBibleVersion('NIV');
    setExplanationTone('devotional');
    setExplanationLength('moderate');
    setExcludedBooks([]);
    setShowBookExcluder(false);
    setQuiz(null);
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setGenError(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const uiStr = UI_STRINGS[quizLang] || UI_STRINGS.en;

  // Language guard: detect English leaks in non-English quizzes
  const hasEnglishLeak = (quizData, langCode) => {
    if (langCode === 'en') return false;
    
    const englishLeakWords = [
      'Select', 'Difficulty', 'Beginner', 'Next', 'Grace', 'Salvation', 'Quiz', 'Question',
      'Correct', 'Explanation', 'Back', 'Previous', 'True', 'False', 'Option',
      'Repentance', 'Kingdom', 'Prayer', 'Love', 'Gospel'
    ];
    
    const textBlob = JSON.stringify(quizData);
    return englishLeakWords.some(word => {
      // Check if word is in non-Bible-reference context (rough heuristic)
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      return regex.test(textBlob);
    });
  };

  // Validate quiz response structure
  const validateQuizResponse = (data) => {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.questions) || data.questions.length === 0) return false;
    if (!data.title || !data.difficulty) return false;
    
    // Validate each question
    return data.questions.every(q => {
      return (
        q.id && typeof q.id === 'number' &&
        q.question && typeof q.question === 'string' &&
        q.options && typeof q.options === 'object' &&
        q.options.A && q.options.B && q.options.C && q.options.D &&
        ['A', 'B', 'C', 'D'].includes(q.correctAnswer) &&
        q.explanation && typeof q.explanation === 'string' &&
        q.scripture && typeof q.scripture === 'string'
      );
    });
  };

  const generateQuiz = async () => {
    if (!topic.trim()) { setGenError('Please enter a topic.'); return; }
    if (!difficulty) { setGenError('Please select a difficulty.'); return; }
    if (!isOnline) { setGenError('No internet connection. Please check your network and try again.'); return; }

    setGenError(null);
    setLoading(true);
    try {
      const langInfo = QUIZ_LANGUAGES.find(l => l.code === quizLang);
      const langName = langInfo?.label || 'English';

      const typeInstruction = questionType === 'true_false'
        ? 'True/False only (options: "True" and "False")'
        : questionType === 'mixed'
        ? 'Mix of multiple choice and true/false'
        : 'Multiple choice (A, B, C, D)';

      const langInstruction = `CRITICAL: Write ALL content (title, questions, options, explanations) ONLY in ${langName}. Do not use English.`;

      const excludeInstruction = excludedBooks.length > 0
        ? `Exclude questions from these books: ${excludedBooks.join(', ')}.`
        : '';

      const toneDesc = { devotional: 'warm and spiritually encouraging', academic: 'scholarly and theologically precise', simple: 'easy to understand for beginners', pastoral: 'practical and church-focused' }[explanationTone] || explanationTone;
      const lengthDesc = { brief: '1-2 sentences', moderate: '3-4 sentences', detailed: 'a full paragraph' }[explanationLength] || explanationLength;

             const topicLabel = topic; // User-provided or selected topic label

             // Enhanced explanation prompt
             const explanationQuality = `
             EXPLANATION QUALITY GUIDE (${explanationTone} tone):
             - **Theological Depth**: Reference key theological concepts (salvation, grace, redemption, covenant, faith, etc.)
             - **Scripture Context**: Cite and explain related passages that illuminate the answer
             - **Practical Application**: How does this truth apply to daily Christian living and spiritual growth?
             - **Historical Background**: Include cultural, historical, or geographical context when it clarifies understanding
             - **Deeper Study**: Suggest 1-2 related passages or questions for personal reflection
             - **Common Misconceptions**: Address typical misunderstandings about this topic
             - **Accessibility**: Use clear language while maintaining theological accuracy
             - **Examples**: Include biblical stories or examples that illustrate the principle`;

             const prompt = `
      You are generating a Bible quiz with high-quality explanations.

HARD RULES (must follow):
1) Output ONLY valid JSON. No markdown. No extra text. No comments.
2) ALL user-visible text MUST be written ONLY in ${langName} (language code: ${quizLang}).
   - Do NOT mix languages.
   - Exception: Bible book names + verse references may remain standard (e.g., Mat 8:17, Isa 53:5).
3) Do NOT use symbols like **, ##, [], (), <>, emojis, or stray punctuation.
4) Use clean, natural ${langName} suitable for native speakers.
5) Keep questions clear and short.
6) Each option A–D must be short (max 8 words).
7) correctAnswer must be ONLY "A" or "B" or "C" or "D".
8) If any English appears (outside Bible book names), regenerate internally and output only ${langName}.

QUIZ SETTINGS:
- Difficulty: ${difficulty}
- Number of questions: ${questionCount}
- Topic key (meaning): ${topicKey}
- Topic label (write in ${langName}): "${topicLabel}"
- Question type: ${typeInstruction}
- Bible version label: ${bibleVersion}
- Explanation tone: ${toneDesc}
- Explanation length: ${lengthDesc}
${excludeInstruction}

${explanationQuality}

STRUCTURE REQUIREMENT:
For each explanation, follow this structure:
1. Direct Answer: State why this answer is correct
2. Theological Insight: Key biblical/theological principle
3. Scripture Reference: Cite supporting passages
4. Practical Application: Real-world spiritual significance
5. Deeper Study: Related topic or reflection question
6. (For ${explanationTone} tone) Additional context specific to that tone

SCRIPTURE RULE:
- Provide only short references (e.g., "Mat 8:17", "Isa 53:5").
- Do NOT quote long verses.
- Scripture field is a single string; multiple refs separated by comma.

Return JSON only that matches the schema exactly.
`.trim();

      const response_json_schema = {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'topic', 'difficulty', 'language', 'questions'],
        properties: {
          title: { type: 'string', minLength: 3 },
          topic: { type: 'string', minLength: 2 },
          difficulty: { type: 'string' },
          language: { type: 'string' },
          questions: {
            type: 'array',
            minItems: Number(questionCount),
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'question', 'options', 'correctAnswer', 'explanation', 'scripture'],
              properties: {
                id: { type: 'integer', minimum: 1 },
                question: { type: 'string', minLength: 5 },
                options: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['A', 'B', 'C', 'D'],
                  properties: {
                    A: { type: 'string', minLength: 1 },
                    B: { type: 'string', minLength: 1 },
                    C: { type: 'string', minLength: 1 },
                    D: { type: 'string', minLength: 1 }
                  }
                },
                correctAnswer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
                explanation: { type: 'string', minLength: 5 },
                scripture: { type: 'string', minLength: 2 }
              }
            }
          }
        }
      };

      let response;
      try {
        response = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema
        });
      } catch (integrationError) {
        console.error('InvokeLLM integration error:', integrationError);
        const errorMsg = integrationError?.message || 'Failed to call LLM service';
        throw new Error(`LLM Error: ${errorMsg}`);
      }

      if (!response) {
        throw new Error('Empty response from LLM service');
      }

      let quizData = response?.data || response;

      // Language guarantee: detect & retry if English leaked
      if (quizLang !== 'en' && hasEnglishLeak(quizData, quizLang)) {
        console.warn(`English leak detected in ${langName} quiz. Retrying with stricter prompt...`);
        const retryPrompt = prompt + `\n\nCRITICAL: You must output ONLY in ${langName}. Do not leak any English words. No English except Bible book names like "John", "Matthew", etc.`;
        response = await base44.integrations.Core.InvokeLLM({
          prompt: retryPrompt,
          response_json_schema
        });
        quizData = response?.data || response;
      }

      if (quizData) quizData.language = quizLang;

      // Validate response structure
      if (!validateQuizResponse(quizData)) {
        setGenError('The quiz format was invalid. Please try again with a different topic.');
        setLoading(false);
        return;
      }

      // Final language check before showing
      if (quizLang !== 'en' && hasEnglishLeak(quizData, quizLang)) {
        setGenError(`The AI generated content with mixed languages. Please try again with a clearer topic.`);
        setLoading(false);
        return;
      }
      
      setQuiz(quizData);
      setTimeout(() => quizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (error) {
      console.error('Quiz generation error:', error);
      let message = 'Something went wrong while generating the quiz. Please try again.';
      
      if (error?.message?.includes('LLM')) {
        message = 'The AI service encountered an issue. Try a simpler topic or different settings.';
      } else if (error?.response?.status === 500) {
        message = 'Server error. Please try with a different topic or check your internet.';
      } else if (error?.code === 'NETWORK_ERROR' || !isOnline) {
        message = 'No internet connection. Please check your network and try again.';
      } else if (error?.message?.includes('Empty response')) {
        message = 'Received invalid response. Please try again with different settings.';
      }
      
      console.error('Error details:', {
        status: error?.response?.status,
        message: error?.message,
        data: error?.response?.data
      });
      
      setGenError(message);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setQuizStarted(true);

    if (timer !== 'none') {
      const secs = parseInt(timer) * 60;
      setTimeLeft(secs);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); calculateScore(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleAnswerSelect = (option) => {
    setAnswers({ ...answers, [currentQuestion]: option });
  };

  const calculateScore = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correct++;
    });
    setScore(Math.round((correct / quiz.questions.length) * 100));
    setShowResults(true);
    setQuizStarted(false);
  };

  const goNext = () => {
    if (currentQuestion < quiz.questions.length - 1) setCurrentQuestion(currentQuestion + 1);
    else calculateScore();
  };

  const goPrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const handleShare = () => {
    const text = `I just completed a "${quiz?.title}" quiz on FaithLight! Score: ${score}%. Try it yourself!`;
    if (navigator.share) navigator.share({ title: quiz?.title, text });
    else { navigator.clipboard.writeText(text); }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ─── QUIZ PLAY VIEW ───────────────────────────────────────────────────────
  if (quizStarted && quiz && !showResults) {
    const currentQ = quiz.questions[currentQuestion];
    const selectedAnswer = answers[currentQuestion];

    return (
      <div ref={quizRef} className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-500">{t('common.question', 'Question')} {currentQuestion + 1} {t('common.of', 'of')} {quiz.questions.length}</p>
          </div>
          {timer !== 'none' && timeLeft !== null && (
            <div className={`px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-700'}`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-indigo-600 transition-all"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        <Card>
          <CardContent className="pt-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">{currentQ.question}</h2>

            <div className="space-y-2.5">
              {Object.entries(currentQ.options || {}).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(key)}
                  className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                    selectedAnswer === key
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 ${
                    selectedAnswer === key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>{key}</span>
                  <span className="text-gray-800">{value}</span>
                </button>
              ))}
            </div>

            {currentQ.scripture && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                <p className="text-xs font-semibold text-amber-700 mb-0.5">📖 {t('quiz.scriptureReference', 'Scripture Reference')}</p>
                <p className="text-sm text-amber-800 italic">{currentQ.scripture}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={goPrev} disabled={currentQuestion === 0} variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> {t('quiz.back', 'Back')}
              </Button>
              <Button
                onClick={goNext}
                disabled={!selectedAnswer}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                {currentQuestion === quiz.questions.length - 1 ? t('quiz.submitQuiz', 'Submit Quiz') : t('quiz.next', 'Next')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── RESULTS VIEW ─────────────────────────────────────────────────────────
  if (showResults && quiz) {
    const results = quiz.questions.map((q, idx) => ({
      ...q,
      userAnswer: answers[idx],
      isCorrect: answers[idx] === q.correctAnswer,
    }));
    const correctCount = results.filter(r => r.isCorrect).length;

    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <Card className={`border-2 ${score >= 80 ? 'border-green-400 bg-green-50' : score >= 50 ? 'border-amber-400 bg-amber-50' : 'border-red-300 bg-red-50'}`}>
          <CardContent className="pt-6 pb-6 text-center">
            <div className={`text-6xl font-black mb-2 ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {score}%
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{quiz.title}</h2>
            <p className="text-gray-600">{correctCount} of {quiz.questions.length} correct</p>
            <p className="text-2xl mt-2">
            {score >= 80 ? `🎉 ${uiStr.correct}` : score >= 50 ? '👍 Good effort!' : `📖 ${uiStr.tryAgain}`}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Button onClick={startQuiz} className="gap-2 bg-indigo-600 hover:bg-indigo-700 col-span-2 sm:col-span-1">
            <RotateCw className="w-4 h-4" /> {uiStr.tryAgain}
          </Button>
          <Button onClick={generateQuiz} variant="outline" className="gap-2 col-span-2 sm:col-span-1" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {uiStr.regenerate}
          </Button>
          <Button onClick={handleShare} variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" /> {t('common.share', 'Share')}
          </Button>
          <Button onClick={resetAll} variant="ghost" className="gap-2 text-gray-600">
            {t('common.new', 'New Quiz')}
          </Button>
        </div>

        <div className="space-y-3">
          {results.map((result, idx) => (
            <Card key={idx} className={`border ${result.isCorrect ? 'border-green-200' : 'border-red-200'}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  {result.isCorrect
                    ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-gray-900">{idx + 1}. {result.question}</p>
                    <div className="text-sm">
                      <span className="text-green-700 font-medium">✓ {result.correctAnswer}. {result.options?.[result.correctAnswer]}</span>
                      {!result.isCorrect && result.userAnswer && (
                        <span className="ml-3 text-red-600">✗ Your answer: {result.userAnswer}</span>
                      )}
                    </div>
                    {result.explanation && (
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 text-sm text-gray-700 space-y-2">
                        <p className="whitespace-pre-wrap">{result.explanation}</p>
                        {result.explanation.includes('Related:') && (
                          <div className="pt-2 border-t border-indigo-200 text-xs text-indigo-700">
                            💡 <strong>Tip:</strong> Read the related passages to deepen your understanding.
                          </div>
                        )}
                      </div>
                    )}
                    {result.scripture && (
                      <p className="text-xs italic text-indigo-600">{result.scripture}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ─── QUIZ PREVIEW (after generation, before starting) ─────────────────────
  if (quiz && !quizStarted && !showResults) {
    return (
      <div ref={quizRef} className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-3">
            <CheckCircle className="w-4 h-4" /> {t('quiz.quizReady', 'Quiz Ready!')}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
        </div>

        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="pt-6 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-indigo-700">{quiz.questions?.length || questionCount}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('quiz.questions', 'Questions')}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800 capitalize">{t(DIFFICULTIES.find(d => d.value === difficulty)?.labelKey, difficulty)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('quiz.difficulty', 'Difficulty')}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{topic}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('quiz.topic', 'Topic')}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{timer === 'none' ? '∞' : `${timer} min`}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('quiz.timeLimit', 'Time Limit')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={startQuiz} className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-lg py-6 gap-2">
            <BookOpen className="w-5 h-5" /> {uiStr.startQuiz}
          </Button>
          <Button onClick={generateQuiz} variant="outline" className="gap-2" disabled={loading}>
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
             {uiStr.regenerate}
           </Button>
           <Button onClick={resetAll} variant="ghost" className="gap-2 text-gray-600">
             {uiStr.changeSettings}
           </Button>
        </div>

        {genError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{genError}</div>
        )}
      </div>
    );
  }

  // ─── SETUP FLOW (Steps 1–3) ────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{uiStr.title}</h1>
        </div>
        <p className="text-gray-500 text-sm">{t('quiz.subtitle', 'Test your knowledge with AI-generated Bible quizzes')}</p>
      </div>

      {/* Afaan Oromoo DB Quiz tab */}
      <Tabs defaultValue="ai" className="mb-6">
        <TabsList className="w-full">
          <TabsTrigger value="ai" className="flex-1 gap-2"><Sparkles className="w-4 h-4" /> AI Quiz</TabsTrigger>
          <TabsTrigger value="om" className="flex-1 gap-2"><Database className="w-4 h-4" /> Afaan Oromoo</TabsTrigger>
        </TabsList>
        <TabsContent value="om" className="pt-4">
          <OromooDBQuiz />
        </TabsContent>
        <TabsContent value="ai" className="pt-4">

          <div className="mb-6 flex justify-between items-center px-2">
            {[1, 2, 3].map((s, idx) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${s <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {s}
                </div>
                {idx < 2 && <div className={`flex-1 h-1 mx-2 transition-all ${s < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <Card className="shadow-md">
        <CardContent className="pt-6 pb-6">

          {/* ── STEP 1: Topic ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Offline warning */}
              {!isOnline && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
                  <p className="font-semibold">⚠️ {t('common.noInternet', 'No internet connection')}</p>
                  <p className="text-xs mt-0.5">{t('quiz.needsInternet', 'Quiz generation requires an active internet connection.')}</p>
                </div>
              )}

              {/* Language selector */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{uiStr.chooseLanguage}</p>
                <div className="flex flex-wrap gap-2">
                  {QUIZ_LANGUAGES.map(l => (
                    <button key={l.code} type="button" onClick={() => setQuizLang(l.code)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        quizLang === l.code
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                      }`}>
                      <span>{l.flag}</span> {l.nativeLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{uiStr.chooseTopic}</h2>
                <p className="text-sm text-gray-500">{t('quiz.topicHelp', 'What Bible subject do you want to be quizzed on?')}</p>
              </div>

              <input
                type="text"
                value={topic}
                onChange={e => { setTopic(e.target.value); setTopicKey(''); }}
                onKeyDown={e => { if (e.key === 'Enter' && topic.trim().length >= 2) setStep(2); }}
                placeholder={uiStr.topicPlaceholder}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{uiStr.popularTopics}</p>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_KEYS.map(key => {
                    const labels = TOPIC_LABELS[quizLang] || TOPIC_LABELS.en;
                    const label = labels[key] || TOPIC_LABELS.en[key];
                    return (
                      <button key={key} type="button" onClick={() => { setTopicKey(key); setTopic(label); }}
                        className={`text-sm px-3 py-1.5 rounded-full border-2 transition-all font-medium ${
                          topicKey === key
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50'
                        }`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{t('quiz.customTags', 'Your Custom Tags')}</p>
                  <button type="button" onClick={() => setShowTagForm(!showTagForm)} className="text-xs text-indigo-600 hover:underline">
                    {showTagForm ? t('common.cancel', 'Cancel') : t('common.add', '+ Add')}
                  </button>
                </div>
                {showTagForm && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addCustomTag(); }}
                      placeholder={t('quiz.customTagPlaceholder', "e.g., 'Prophecy', 'Discipleship'")}
                      className="flex-1 px-2.5 py-1.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={addCustomTag}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                    >
                      {t('common.save', 'Save')}
                    </button>
                  </div>
                )}
                {customTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {customTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => { setTopic(tag); setTopicKey(''); }}
                        className="text-sm px-3 py-1.5 rounded-full border-2 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all font-medium flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            removeCustomTag(tag);
                          }}
                          className="text-xs ml-0.5 hover:text-purple-900"
                        >
                          ✕
                        </button>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">{t('quiz.noCustomTags', 'No custom tags yet')}</p>
                )}
              </div>

              {/* Info note for non-English */}
              {quizLang !== 'en' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                  <p className="font-semibold">{uiStr.info ? `${uiStr.info} ℹ️` : 'ℹ️'} {uiStr.noQuestions}</p>
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={topic.trim().length < 2}
                className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2 py-5 text-base"
              >
                {uiStr.next} <ArrowRight className="w-4 h-4" />
              </Button>
              {topic.trim().length > 0 && topic.trim().length < 2 && (
                <p className="text-xs text-center text-amber-600">{t('common.minChars', 'Please enter at least 2 characters')}</p>
              )}
            </div>
          )}

          {/* ── STEP 2: Difficulty ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{t('quiz.selectDifficulty', 'Select Difficulty')}</h2>
                <p className="text-sm text-gray-500">{t('quiz.topic', 'Topic')}: <span className="font-semibold text-indigo-600">"{topic}"</span></p>
              </div>

              <div className="space-y-2.5">
                {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                    difficulty === d.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      difficulty === d.value ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                    }`}>
                      {difficulty === d.value && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t(d.labelKey, d.labelKey)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t(d.descKey, d.descKey)}</p>
                    </div>
                  </div>
                </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> {uiStr.back}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!difficulty}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
                >
                  {uiStr.next} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Settings ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{t('quiz.customizeQuiz', 'Customize Quiz')}</h2>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-indigo-600">"{topic}"</span> ·{' '}
                  <span className="capitalize">{t(DIFFICULTIES.find(d => d.value === difficulty)?.labelKey, difficulty)}</span>
                </p>
              </div>

              {/* Number of questions */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('quiz.numberOfQuestions', 'Number of Questions')}</p>
                <div className="flex gap-2">
                  {QUESTION_COUNTS.map(n => (
                    <button key={n} type="button" onClick={() => setQuestionCount(n)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                        questionCount === n ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question type */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('quiz.questionType', 'Question Type')}</p>
                <div className="flex gap-2 flex-wrap">
                  {QUESTION_TYPES.map(qt => (
                    <button key={qt.value} type="button" onClick={() => setQuestionType(qt.value)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        questionType === qt.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                      }`}>
                      {qt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('quiz.timeLimit', 'Time Limit')}</p>
                <div className="flex gap-2">
                  {TIMER_OPTIONS.map(to => (
                    <button key={to.value} type="button" onClick={() => setTimer(to.value)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        timer === to.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                      }`}>
                      {to.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bible Version */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('quiz.bibleVersion', 'Bible Version')}</p>
                <div className="flex gap-2 flex-wrap">
                  {BIBLE_VERSIONS.map(bv => (
                    <button key={bv.value} type="button" onClick={() => setBibleVersion(bv.value)}
                      className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        bibleVersion === bv.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                      }`}>
                      {bv.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation Tone */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('quiz.explanationTone', 'Explanation Tone')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {EXPLANATION_TONES.map(et => (
                    <button key={et.value} type="button" onClick={() => setExplanationTone(et.value)}
                      className={`p-3 text-left rounded-xl border-2 text-sm transition-all ${
                        explanationTone === et.value ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                      }`}>
                      <p className="font-medium text-gray-900">{t(et.labelKey, et.labelKey)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t(et.descKey, et.descKey)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation Length */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('quiz.explanationLength', 'Explanation Length')}</p>
                <div className="flex gap-2">
                  {EXPLANATION_LENGTHS.map(el => (
                    <button key={el.value} type="button" onClick={() => setExplanationLength(el.value)}
                      className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm transition-all text-left ${
                        explanationLength === el.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                      }`}>
                      <p className="font-semibold">{t(el.labelKey, el.labelKey)}</p>
                      <p className="text-xs text-gray-400">{t(el.descKey, el.descKey)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exclude Books */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">{t('quiz.excludeBooks', 'Exclude Books')}</p>
                  <button type="button" onClick={() => setShowBookExcluder(v => !v)}
                    className="text-xs text-indigo-600 hover:underline font-medium">
                    {showBookExcluder ? 'Hide' : t('quiz.selectBooksToExclude', 'Select books to exclude')}
                  </button>
                </div>
                {excludedBooks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {excludedBooks.map(b => (
                      <span key={b} className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-0.5 rounded-full">
                        {b}
                        <button onClick={() => setExcludedBooks(prev => prev.filter(x => x !== b))} className="hover:text-red-900 font-bold">×</button>
                      </span>
                    ))}
                    <button onClick={() => setExcludedBooks([])} className="text-xs text-gray-400 hover:text-gray-600 underline">Clear all</button>
                  </div>
                )}
                {showBookExcluder && (
                  <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-1.5">
                      {BIBLE_BOOKS_LIST.map(book => (
                        <button key={book} type="button"
                          onClick={() => setExcludedBooks(prev => prev.includes(book) ? prev.filter(b => b !== book) : [...prev, book])}
                          className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                            excludedBooks.includes(book) ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50/50'
                          }`}>
                          {book}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {genError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center justify-between">
                  {genError}
                  <button onClick={() => setGenError(null)} className="ml-2 text-red-400 hover:text-red-600 text-xs underline">Dismiss</button>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button onClick={() => setStep(2)} variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> {uiStr.back}
                </Button>
                <Button
                  onClick={generateQuiz}
                  disabled={loading || !topic.trim() || !difficulty}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 gap-2 py-5 text-base"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {uiStr.generate}…</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> {uiStr.generate}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
}