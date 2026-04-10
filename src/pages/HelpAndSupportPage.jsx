import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Book, Headphones, Globe, Heart, Download, Zap, ChevronRight, ArrowLeft } from 'lucide-react';
import { useLanguageStore } from '@/components/languageStore';

const LABELS = {
  en: {
    title: 'Help & Support',
    subtitle: "We're here when you need assistance",
    needHelp: 'Need help now?',
    needHelpDesc: 'Choose an option below or chat with support.',
    chatButton: 'Chat with Support',
    quickActions: [
      'Bible Not Loading',
      'Audio Not Working',
      'Language Problem',
      'My Prayers Help',
    ],
    faqCategories: ['Account', 'Bible', 'Audio', 'Language', 'Prayer', 'Offline', 'Technical'],
    helpTopics: [
      { title: 'Bible chapters are not loading', icon: 'Book' },
      { title: 'Audio is not available', icon: 'Headphones' },
      { title: 'Language is showing wrong text', icon: 'Globe' },
      { title: 'How do I save prayers?', icon: 'Heart' },
      { title: 'How do I link a verse to a prayer?', icon: 'Zap' },
      { title: 'How do I change language?', icon: 'Globe' },
      { title: 'How do I use offline reading?', icon: 'Download' },
    ],
    contact: {
      title: 'Contact Support',
      email: 'support@faithlight.app',
      desc: 'Usually replies within 24–48 hours',
    },
    appInfo: {
      title: 'App Information',
      version: 'Version 1.0.0',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
    privacyNote: 'Your support requests are important to us.',
  },
  om: {
    title: 'Gargaarsa fi Deeggarsa',
    subtitle: 'Yeroo barbaaddan isin gargaaruuf as jirra',
    needHelp: 'Amma gargaarsa barbaadduu?',
    needHelpDesc: 'Filannoo keessaa tokko filadhu yookaan deeggarsa waliin haasa\'i.',
    chatButton: 'Deeggarsa Waliin Haasa\'i',
    quickActions: [
      'Macaafni hin fe\'amu',
      'Sagaleen hin hojjetu',
      'Rakkoo Afaanii',
      'Gargaarsa Kadhata Koo',
    ],
    faqCategories: ['Akaawuntii', 'Macaafa Qulqulluu', 'Sagalee', 'Afaan', 'Kadhata', 'Offline', 'Teeknikaa'],
    helpTopics: [
      { title: 'Boqonnaawwan Macaafa Qulqulluu hin fe\'amanii' },
      { title: 'Sagaleen hin argamu' },
      { title: 'Afaan barruu dogoggoraa agarsiisaa jira' },
      { title: 'Kadhata akkamitti kuusa?' },
      { title: 'Aayata kadhata waliin akkamitti walqabsiisa?' },
      { title: 'Afaan akkamitti jijjiira?' },
      { title: 'Offline dubbisuu akkamitti fayyadama?' },
    ],
    contact: {
      title: 'Deeggarsa Quunnami',
      email: 'support@faithlight.app',
      desc: 'Yeroo baayyee sa\'aatii 24–48 keessatti deebii kenna',
    },
    appInfo: {
      title: 'Odeeffannoo Appii',
      version: 'Version 1.0.0',
      privacy: 'Imaammata Icciitii',
      terms: 'Haala Tajaajilaa',
    },
    privacyNote: 'Gaafilleedhiin deeggarsa keenya mullaata.',
  },
  am: {
    title: 'እገዛ እና ድጋፍ',
    subtitle: 'እርዳታ ሲያስፈልግዎ እዚህ ነን',
    needHelp: 'አሁን እገዛ ይፈልጋሉ?',
    needHelpDesc: 'ከታች ካሉት አማራጮች ይምረጡ ወይም ከድጋፍ ጋር ይወያዩ።',
    chatButton: 'ከድጋፍ ጋር ይወያዩ',
    quickActions: [
      'የመጽሐፍ ገጽ አይጫነም',
      'ኦዲዮ አይሰራም',
      'የቋንቋ ችግር',
      'የእኔ ጸሎቶች እገዛ',
    ],
    faqCategories: ['ሂሳብ', 'መጽሐፍ', 'ኦዲዮ', 'ቋንቋ', 'ጸሎት', 'ከመስመር ውጭ', 'ቴክኒካል'],
    helpTopics: [
      { title: 'የመጽሐፍ ምዕራፎች አይጫነም' },
      { title: 'ኦዲዮ አይገኝም' },
      { title: 'ቋንቋ ሕ字ይ ቃላት ከመጠኑ በላይ ይታያል' },
      { title: 'ጸሎቶቼን እንዴት ማስቀመጥ እችላለሁ?' },
      { title: 'አዩን ለጸሎት እንዴት አገናኘ?' },
      { title: 'ቋንቋ እንዴት እቀይር?' },
      { title: 'ከመስመር ውጭ ንባብ እንዴት ጠቀም?' },
    ],
    contact: {
      title: 'ድጋፍ ያነጋግሩ',
      email: 'support@faithlight.app',
      desc: 'ብዙውን ጊዜ በ 24–48 ሰዓታት ውስጥ ምላሽ ይሰጣል',
    },
    appInfo: {
      title: 'የመተግበሪያ መረጃ',
      version: 'Version 1.0.0',
      privacy: 'የግላዊነት ፖሊሲ',
      terms: 'የአገልግሎት ውል',
    },
    privacyNote: 'የድጋፍ ጥያቄዎ ለእኛ ጠቃሚ ነው።',
  },
  ar: {
    title: 'المساعدة والدعم',
    subtitle: 'نحن هنا عندما تحتاج إلى المساعدة',
    needHelp: 'هل تحتاج إلى مساعدة الآن؟',
    needHelpDesc: 'اختر أحد الخيارات أدناه أو تحدث مع الدعم.',
    chatButton: 'تحدث مع الدعم',
    quickActions: [
      'الكتاب لم يتم تحميله',
      'الصوت لا يعمل',
      'مشكلة اللغة',
      'مساعدة في صلواتي',
    ],
    faqCategories: ['الحساب', 'الكتاب', 'الصوت', 'اللغة', 'الدعاء', 'غير متصل', 'تقني'],
    helpTopics: [
      { title: 'لا يتم تحميل فصول الكتاب' },
      { title: 'الصوت غير متوفر' },
      { title: 'اللغة تعرض نصاً خاطئاً' },
      { title: 'كيف أحفظ الصلوات?' },
      { title: 'كيف أربط آية بالصلاة?' },
      { title: 'كيف أغير اللغة?' },
      { title: 'كيف أستخدم القراءة بدون اتصال؟' },
    ],
    contact: {
      title: 'اتصل بالدعم',
      email: 'support@faithlight.app',
      desc: 'عادة ما يرد خلال 24-48 ساعة',
    },
    appInfo: {
      title: 'معلومات التطبيق',
      version: 'Version 1.0.0',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
    },
    privacyNote: 'طلبات الدعم الخاصة بك مهمة لنا.',
  },
  sw: {
    title: 'Msaada na Huduma',
    subtitle: 'Tupo hapa unapohitaji msaada',
    needHelp: 'Unahitaji msaada sasa?',
    needHelpDesc: 'Chagua mojawapo hapa chini au zungumza na msaada.',
    chatButton: 'Ongea na Msaada',
    quickActions: [
      'Kitabu Haipatikani',
      'Sauti Haifanyi Kazi',
      'Tatizo la Lugha',
      'Msaada wa Maombezi Yangu',
    ],
    faqCategories: ['Akaunti', 'Kitabu', 'Sauti', 'Lugha', 'Dua', 'Offlain', 'Kiteknolojia'],
    helpTopics: [
      { title: 'Sura za Kitabu Hazipatikani' },
      { title: 'Sauti Haipo' },
      { title: 'Lugha Inaonyesha Maandishi Makosa' },
      { title: 'Ninaokusanya Maombezi Namna Gani?' },
      { title: 'Ninatunza Ayati na Dua Namna Gani?' },
      { title: 'Ninabadle Lugha Namna Gani?' },
      { title: 'Ninatumia Kusoma Offlain Namna Gani?' },
    ],
    contact: {
      title: 'Wasiliana na Msaada',
      email: 'support@faithlight.app',
      desc: 'Kawaida hujibu ndani ya 24–48 saa',
    },
    appInfo: {
      title: 'Taarifa ya Programu',
      version: 'Version 1.0.0',
      privacy: 'Sera ya Faragha',
      terms: 'Sheria za Huduma',
    },
    privacyNote: 'Ombi lako la msaada ni muhimu kwetu.',
  },
};

const ICON_MAP = {
  Book: Book,
  Headphones: Headphones,
  Globe: Globe,
  Heart: Heart,
  Zap: Zap,
  Download: Download,
};

export default function HelpAndSupportPage() {
  const navigate = useNavigate();
  const uiLanguage = useLanguageStore((s) => s.uiLanguage) || 'en';
  const isRTL = uiLanguage === 'ar';
  const L = LABELS[uiLanguage] || LABELS.en;

  return (
    <div className={`min-h-screen transition-colors ${isRTL ? 'rtl' : 'ltr'}`} style={{ backgroundColor: '#F8F6F1' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-indigo-600 font-medium"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{L.title}</h1>
        <p className="text-base text-gray-600">{L.subtitle}</p>
      </div>

      <div className="px-5 pb-8 max-w-2xl mx-auto space-y-6">
        {/* Quick Help Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{L.needHelp}</h2>
          <p className="text-sm text-gray-600 mb-5">{L.needHelpDesc}</p>
          <div className="flex flex-wrap gap-2">
            {L.quickActions.map((action, idx) => (
              <button
                key={idx}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full hover:bg-indigo-100 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Button */}
        <a
          href={`mailto:${L.contact.email}`}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Mail size={20} />
          {L.chatButton}
        </a>

        {/* FAQ Categories */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {L.faqCategories.map((cat, idx) => (
              <button
                key={idx}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Help Topics */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 px-1">Popular Help Topics</h2>
          {L.helpTopics.map((topic, idx) => {
            const IconComponent = ICON_MAP[topic.icon] || Book;
            return (
              <button
                key={idx}
                className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow border border-gray-100"
              >
                <IconComponent size={24} className="text-indigo-600 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-base font-medium text-gray-900">{topic.title}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Contact Support Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{L.contact.title}</h2>
          <p className="text-sm text-gray-600 mb-4">{L.contact.desc}</p>
          <a
            href={`mailto:${L.contact.email}`}
            className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
          >
            <Mail size={18} />
            {L.contact.email}
          </a>
        </div>

        {/* App Info Card */}
        <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{L.appInfo.title}</h2>
          <p className="text-sm text-gray-600 mb-4">{L.appInfo.version}</p>
          <div className="space-y-3">
            <a href="/PrivacyPolicy" className="block text-indigo-600 font-medium hover:text-indigo-700">
              {L.appInfo.privacy}
            </a>
            <a href="/TermsOfService" className="block text-indigo-600 font-medium hover:text-indigo-700">
              {L.appInfo.terms}
            </a>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-xs text-gray-500 text-center px-2 pb-4">
          {L.privacyNote}
        </div>
      </div>
    </div>
  );
}