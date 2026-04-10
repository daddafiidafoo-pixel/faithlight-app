import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, MessageCircle, BookOpen, Heart, HelpCircle } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';

const LANGUAGES = {
  en: {
    name: 'English',
    welcome: 'Welcome to FaithLight 🙏',
    welcomeSubtitle: "I'm here to help with:\n📖 Bible verses\n🙏 Prayer\n✨ Faith questions\n\nPlease choose your language:",
    langSelected: 'You selected English 🇺🇸',
    selectLanguage: 'Select Your Language:',
    menuTitle: 'How can I help you today?',
    verse: 'Find a Bible verse',
    verseDesc: 'Find verses by topic',
    prayer: 'Generate a prayer',
    prayerDesc: 'Generate thoughtful prayers',
    faith: 'Ask a faith question',
    faithDesc: 'Ask faith questions',
    quickStarters: 'Quick starters',
    placeholder: 'Type your request here...',
    send: 'Send',
    loading: 'Listening...',
    subtitle: 'Bible, Prayer, and Faith Guidance',
    starters: [
      'Give me a Bible verse about hope',
      'Write a short prayer for peace',
      'What does the Bible say about faith?',
      'Give me a Bible verse about strength',
      'Pray for my family',
      'How can I trust God more?',
    ],
  },
  om: {
    name: 'Afaan Oromoo',
    welcome: 'Jecha-Caasoo keessaa dhufedhaa 🙏',
    welcomeSubtitle: "Gargaaruu danda'a:\n📖 Aayata Macaaba\n🙏 Kadhannaa\n✨ Gaaffii amantii\n\nAfaan keessan filannoo:",
    langSelected: 'Afaan Oromoo filatte 🇪🇹',
    selectLanguage: 'Afaan keessan filannoo:',
    menuTitle: "Har'a maal irratti si gargaaruu danda'a?",
    verse: 'Aayata Macaaba barbaadi',
    verseDesc: 'Mata dureen aayata barbaadi',
    prayer: 'Kadhannaa uuma',
    prayerDesc: 'Kadhannaa yaadatamtu uumi',
    faith: 'Gaaffii amantii gaafadhu',
    faithDesc: 'Gaaffii amantii gaafadhu',
    quickStarters: 'Jalqabbiiwwan saffisaa',
    placeholder: 'Gaaffii kee barreessi...',
    send: 'Ergi',
    loading: 'Haastu...',
    subtitle: 'Macaaba, Kadhannaa, fi Gargaarsa Amantii',
    starters: [
      "Waa'ee abdii aayata naa kenni",
      'Kadhannaa gabaabaa nageenyaaf naa barreessi',
      "Macaafni Qulqulluun waa'ee amantii maal jedhu?",
      "Waa'ee jajjabinaa aayata naa kenni",
      'Maatii kootiif kadhadhu',
      'Akkamittan Waaqayyoon caalaatti amanachuu danda\'a?',
    ],
  },
  am: {
    name: 'አማርኛ',
    welcome: 'ወደ ፌዝላይት ተመለስ 🙏',
    welcomeSubtitle: 'እዚህ እናገዝ:\n📖 የመጽሐፍ ቅዱስ ቃል\n🙏 ጸሎት\n✨ የእምነት ጥያቄ\n\nቋንቋዎን ይምረጡ:',
    langSelected: 'አማርኛ መርጠዋል 🇪🇹',
    selectLanguage: 'ቋንቋዎን ይምረጡ:',
    menuTitle: 'ዛሬ በምን ልረዳዎት?',
    verse: 'የመጽሐፍ ቅዱስ ጥቅስ ያግኙ',
    verseDesc: 'ርዕስ ፈልጎ ጥቅስ ያግኙ',
    prayer: 'ጸሎት ይፃፍልዎ',
    prayerDesc: 'ጸሎት ያዘጋጁ',
    faith: 'የእምነት ጥያቄ ይጠይቁ',
    faithDesc: 'የእምነት ጥያቄዎችን ይጠይቁ',
    quickStarters: 'ፈጣን ጅምሮች',
    placeholder: 'ጥያቄዎን እዚህ ይጻፉ...',
    send: 'ላክ',
    loading: 'ሰምተዋል...',
    subtitle: 'መጽሐፍ ቅዱስ፣ ጸሎት፣ እና አመልካች',
    starters: [
      'ስለ ተስፋ የመጽሐፍ ቅዱስ ጥቅስ ስጠኝ',
      'አጭር የሰላም ጸሎት ጻፍልኝ',
      'መጽሐፍ ቅዱስ ስለ እምነት ምን ይላል?',
      'ስለ ብርታት ጥቅስ ስጠኝ',
      'ለቤተሰቤ ጸልይልኝ',
      'እግዚአብሔርን የበለጠ እንዴት ልታመን?',
    ],
  },
};

export default function FaithLightAIChat() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  // Map store language codes to chat language codes
  const chatLang = uiLanguage === 'om' ? 'om' : uiLanguage === 'am' ? 'am' : 'en';
  const [selectedAction, setSelectedAction] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const language = chatLang;
  const L = LANGUAGES[chatLang] || LANGUAGES.en;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (message = input) => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('faithlightChat', {
        message: message,
        language: language,
        action: selectedAction || 'general',
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.reply,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, I am having trouble responding right now. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleStarterPrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  // Main chat view
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">FaithLight AI</h1>
              <p className="text-xs text-slate-500">{L.subtitle}</p>
            </div>
          </div>
          <span className="text-xs text-purple-600 font-semibold px-3 py-1.5 rounded-lg bg-purple-50">
            {L.name}
          </span>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
          {/* Welcome Section - Show when no messages */}
          {messages.length === 0 && (
            <>
              {/* Greeting */}
              <div className="text-center space-y-2 pt-4">
                <h2 className="text-2xl font-bold text-slate-900">{L.langSelected}</h2>
                <p className="text-slate-600 font-medium">{L.menuTitle}</p>
              </div>

              {/* Action Buttons */}
              <div className="grid gap-3">
                <button
                  onClick={() => setSelectedAction('verse')}
                  className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                      <BookOpen size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{L.verse}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{L.verseDesc}</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedAction('prayer')}
                  className="group bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border border-amber-200 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-500 rounded-lg group-hover:bg-amber-600 transition-colors">
                      <Heart size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{L.prayer}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{L.prayerDesc}</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedAction('faith')}
                  className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                      <HelpCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{L.faith}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{L.faithDesc}</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Starter Prompts */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center">{L.quickStarters}</p>
                <div className="grid gap-2">
                  {L.starters.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStarterPrompt(prompt)}
                      className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-300 rounded-lg p-3 text-sm text-slate-700 font-medium transition-all duration-200 text-left hover:shadow-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Chat Messages */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-sm lg:max-w-md rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                <Loader2 size={16} className="animate-spin text-purple-600" />
                <span className="text-sm text-slate-600">{L.loading}</span>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 sticky bottom-0 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={L.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-200 disabled:opacity-50 disabled:bg-slate-100"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold text-sm shadow-sm hover:shadow-md disabled:shadow-none"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}