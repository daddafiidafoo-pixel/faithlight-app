import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Loader2, Globe, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPageUrl } from '../utils';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from './I18nProvider';
import { useLanguageSettings } from './context/LanguageSettingsContext';
import { useBackendAPI } from './hooks/useBackendAPI';

const CHATBOT_LANGUAGES = {
  en: {
    greeting: '🌍 FaithLight AI\nYour companion in God\'s Word — anytime, anywhere',
    welcome: 'Welcome {{name}} 🙏',
    intro: 'I\'m here to help you listen to Scripture, understand God\'s Word, and walk daily in faith.\n\nYou can:',
    buttons: [
      { id: 'tutor', label: '📘 Bible Tutor — Ask faith questions & get explanations', route: '/BibleTutor' },
      { id: 'reader', label: '📖 Bible Reader — Read verses and chapters in text', route: '/BibleReader' },
      { id: 'audio', label: '🎧 Audio Bible — Chapter-by-chapter listening', route: '/AudioBible' },
    ],
    note: '💡 Good to know:\nThe Audio Bible plays full chapters for uninterrupted listening.\nFor specific verses, use Bible Reader or Bible Tutor.',
    placeholder: '✨ How would you like to begin today?',
    inputPlaceholder: 'Ask: "verses about peace" or "explain Romans 8:28"',
    thinking: 'Thinking...',
  },
  om: {
    greeting: '🌍 FaithLight AI\nDubbii Waaqayyoo keessatti hiriyyaa kee',
    welcome: 'Baga Nagaan Dhuftan {{name}} 🙏',
    intro: 'Dubbii Waaqayyoo dhaggeeffachuu, hubachuu, fi amantii keessan guddisuuf as jira.\n\nMaal gochuu dandeessa:',
    buttons: [
      { id: 'tutor', label: '📘 Barsiisaa Macaaba — Gaaffii gaafadhu & deebii argadhu', route: '/BibleTutor' },
      { id: 'reader', label: '📖 Dubbiisaa Macaaba — Aayata barreeffama dubbisi', route: '/BibleReader' },
      { id: 'audio', label: '🎧 Sagalee Macaaba — Boqonnaa guutuu dhaggeeffadhu', route: '/AudioBible' },
    ],
    note: '💡 Beekumsa:\nSagalee Macaaba boqonnaa guutuu addaan kutuu malee taphata.\nAayata murtaa\'oo barbaadde, Dubbiisaa ykn Barsiisaa fayyadami.',
    placeholder: '✨ Har\'a akkamitti jalqabuu barbaadda?',
    inputPlaceholder: 'Gaafadhu: "aayata waa\'ee nagaa" ykn "Roomaa 8:28 hiiki"',
    thinking: 'Yaadaa jira...',
  },
  am: {
    greeting: '🌍 FaithLight AI\nበእግዚአብሔር ቃል ውስጥ የእርስዎ ጓደኛ',
    welcome: 'እንኳን ደህና መጡ {{name}} 🙏',
    intro: 'መጽሐፍ ቅዱስን ለማዳመጥ፣ ለመረዳት እና በእምነት ለማደግ እዚህ ነኝ.\n\nየሚችሉት:',
    buttons: [
      { id: 'tutor', label: '📘 የመጽሐፍ አስተማሪ — ጥያቄዎችን ጠይቁ & መልስ ያግኙ', route: '/BibleTutor' },
      { id: 'reader', label: '📖 የመጽሐፍ አንባቢ — ቁጥሮችን በጽሑፍ ያንብቡ', route: '/BibleReader' },
      { id: 'audio', label: '🎧 የድምጽ መጽሐፍ — ምዕራፎችን ያዳምጡ', route: '/AudioBible' },
    ],
    note: '💡 ማወቅ ይኖርብዎታል:\nየድምጽ መጽሐፍ ሙሉ ምዕራፎችን ያለማቋረጥ ይጫወታል.\nለተወሰኑ ቁጥሮች አንባቢን ወይም አስተማሪን ይጠቀሙ።',
    placeholder: '✨ ዛሬ እንዴት መጀመር ይፈልጋሉ?',
    inputPlaceholder: 'ይጠይቁ: "ስለ ሰላም ቁጥሮች" ወይም "ሮሜ 8፡28 ያብራሩ"',
    thinking: 'እያሰብኩ ነው...',
  },
  es: {
    greeting: '🌍 FaithLight AI\nTu compañero en la Palabra de Dios — en cualquier momento y lugar',
    welcome: 'Bienvenido {{name}} 🙏',
    intro: 'Estoy aquí para ayudarte a escuchar las Escrituras, entender la Palabra de Dios y crecer en fe.\n\nPuedes:',
    buttons: [
      { id: 'tutor', label: '📘 Tutor Bíblico — Haz preguntas de fe y recibe explicaciones', route: '/BibleTutor' },
      { id: 'reader', label: '📖 Lector Bíblico — Lee versículos y capítulos en texto', route: '/BibleReader' },
      { id: 'audio', label: '🎧 Biblia Audio — Escucha capítulo por capítulo', route: '/AudioBible' },
    ],
    note: '💡 Bueno saber:\nLa Biblia Audio reproduce capítulos completos sin interrupciones.\nPara versículos específicos, usa el Lector o Tutor Bíblico.',
    placeholder: '✨ ¿Cómo te gustaría comenzar hoy?',
    inputPlaceholder: 'Pregunta: "versículos sobre paz" o "explica Romanos 8:28"',
    thinking: 'Pensando...',
  },
  fr: {
    greeting: '🌍 FaithLight AI\nVotre compagnon dans la Parole de Dieu — à tout moment, n\'importe où',
    welcome: 'Bienvenue {{name}} 🙏',
    intro: 'Je suis là pour vous aider à écouter l\'Écriture, comprendre la Parole de Dieu et marcher dans la foi.\n\nVous pouvez:',
    buttons: [
      { id: 'tutor', label: '📘 Tuteur Biblique — Posez des questions de foi', route: '/BibleTutor' },
      { id: 'reader', label: '📖 Lecteur Biblique — Lisez les versets en texte', route: '/BibleReader' },
      { id: 'audio', label: '🎧 Bible Audio — Écoutez chapitre par chapitre', route: '/AudioBible' },
    ],
    note: '💡 Bon à savoir:\nLa Bible Audio lit des chapitres complets sans interruption.\nPour des versets spécifiques, utilisez le Lecteur ou Tuteur.',
    placeholder: '✨ Comment souhaitez-vous commencer aujourd\'hui?',
    inputPlaceholder: 'Demandez: "versets sur la paix" ou "expliquez Romains 8:28"',
    thinking: 'Réflexion...',
  },
};

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'om', name: 'Afaan Oromoo' },
  { code: 'am', name: 'አማርኛ (Amharic)' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

// Translation helpers for support UI
const SUPPORT_UI_TEXTS = {
  greetingHeader: {
    en: "Hi! 👋 I'm the FaithLight Support Assistant.",
    om: "Akkam! 👋 Ani Gargaaraa FaithLight AI dha.",
    am: "ሰላም! 👋 ከFaithLight ድጋፍ ረዳት ነኝ።",
    es: "¡Hola! 👋 Soy el asistente de soporte de FaithLight.",
    fr: "Bonjour! 👋 Je suis l'assistant d'assistance FaithLight.",
  },
  introText: {
    en: "How can I help you today? You can pick a common issue below or type your own question.",
    om: "Har'a akkamitti si gargaaruu danda'a? Rakkoo keessaa tokko filachuu dandeessa yookaan gaaffii kee barreessuu dandeessa.",
    am: "ዛሬ እንዴት እሳተፍ ይችላለሁ? ከዚህ በታች የተለመዱ ጉዳዮችን መምረጥ ወይም የራስዎን ጥያቄ መተየብ ይችላሉ።",
    es: "¿Cómo puedo ayudarte hoy? Puedes elegir un problema común a continuación o escribir tu propia pregunta.",
    fr: "Comment puis-je vous aider aujourd'hui? Vous pouvez choisir un problème courant ci-dessous ou poser votre propre question.",
  },
  supportLanguageLabel: {
    en: 'Support Language',
    om: 'Afaan Gargaaraa',
    am: 'ድጋፍ ቋንቋ',
    es: 'Idioma de soporte',
    fr: 'Langue d\'assistance',
  },
  placeholder: {
    en: 'Describe your issue...',
    om: 'Rakkoo kee ibsi...',
    am: 'ችግርዎን ይግለጹ...',
    es: 'Describe tu problema...',
    fr: 'Décrivez votre problème...',
  },
  sendButton: {
    en: 'Send',
    om: 'Ergaa',
    am: 'ላከ',
    es: 'Enviar',
    fr: 'Envoyer',
  },
  loading: {
    en: 'Thinking...',
    om: 'Yaadaa jira...',
    am: 'እያሰብኩ ነው...',
    es: 'Pensando...',
    fr: 'Réflexion...',
  },
  footer: {
    en: "Can't resolve it? Email support@faithlight.app",
    om: "Furmaata hin argannee? Imeelii support@faithlight.app",
    am: "ሊፈታ አልቻለ? Email support@faithlight.app",
    es: "¿No puedes resolverlo? Envía un correo a support@faithlight.app",
    fr: "Impossible de résoudre? Email support@faithlight.app",
  },
};

const QUICK_ISSUES = {
  en: [
    'Page not loading',
    'Language not changing',
    'AI response failed',
    'Audio Bible problem',
  ],
  om: [
    'Fuulni hin banamu',
    'Afaan hin jijjiiramu',
    'Deebiin AI fashale',
    'Rakkoo Macaaba sagalee',
  ],
  am: [
    'ገጹ ሊገኝ አልቻለ',
    'ቋንቋ ነቅጥ አልቻለ',
    'የAI ምላሽ ወድቋል',
    'የድምፅ መጽሐፍ ቅዱስ ችግር',
  ],
  es: [
    'La página no se carga',
    'El idioma no cambia',
    'La respuesta de IA falló',
    'Problema con la Biblia de audio',
  ],
  fr: [
    'La page ne charge pas',
    'La langue ne change pas',
    'Réponse IA échouée',
    'Problème avec la Bible audio',
  ],
};

export default function AIHelper({ user }) {
  const { lang } = useI18n();
  const { uiLanguage } = useLanguageSettings();
  const { supportChat: apiSupportChat } = useBackendAPI();
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [supportLanguage, setSupportLanguage] = useState(uiLanguage || lang);
  const navigate = useNavigate();

  // Sync with global language
  useEffect(() => {
    setSupportLanguage(uiLanguage || lang);
  }, [uiLanguage, lang]);

  const handleAIQuestion = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setAiResponse('');

    try {
      // Use backend API instead of direct LLM call
      const answer = await apiSupportChat(userInput, supportLanguage);
      setAiResponse(answer);
    } catch (error) {
      const errorMessages = {
        om: 'Fedhii, rakkoon tokko uumame. Yaali irra deebi\'i yaali.',
        am: 'ይቅርታ፣ ስህተት ተፈጠረ። እንደገና ሞክር።',
        en: 'I apologize, but I encountered an error. Please try again.',
      };
      setAiResponse(errorMessages[supportLanguage] || errorMessages.en);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 px-4 sm:px-0">
        {isOpen ? (
          <div className="w-full max-w-96 sm:max-w-md shadow-2xl mb-4 flex flex-col rounded-2xl overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">FaithLight Support</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>



            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-white space-y-4 min-h-[300px]">
              {!userInput && !aiResponse && (
                <>
                  <div>
                    <p className="text-sm font-semibold text-indigo-600">
                      {SUPPORT_UI_TEXTS.greetingHeader[supportLanguage] || SUPPORT_UI_TEXTS.greetingHeader.en}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      {SUPPORT_UI_TEXTS.introText[supportLanguage] || SUPPORT_UI_TEXTS.introText.en}
                    </p>
                  </div>

                  {/* Quick Issues */}
                  <div className="grid grid-cols-1 gap-2">
                    {(QUICK_ISSUES[supportLanguage] || QUICK_ISSUES.en).map((issue, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUserInput(issue)}
                        className="text-left px-3 py-2 bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 rounded-lg text-sm border border-gray-200 transition-colors"
                      >
                        {issue}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {aiResponse && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-800">
                  {aiResponse}
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {SUPPORT_UI_TEXTS.loading[supportLanguage] || SUPPORT_UI_TEXTS.loading.en}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 px-4 py-3 bg-white flex-shrink-0">
              <form onSubmit={handleAIQuestion} className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={SUPPORT_UI_TEXTS.placeholder[supportLanguage] || SUPPORT_UI_TEXTS.placeholder.en}
                  className="text-sm h-8 flex-1"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !userInput.trim()}
                  className="px-3 h-8 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {SUPPORT_UI_TEXTS.sendButton[supportLanguage] || SUPPORT_UI_TEXTS.sendButton.en}
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                {SUPPORT_UI_TEXTS.footer[supportLanguage] || SUPPORT_UI_TEXTS.footer.en}
              </p>
            </div>
          </div>
        ) : null}
        
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </Button>
      </div>
    </>
  );
}