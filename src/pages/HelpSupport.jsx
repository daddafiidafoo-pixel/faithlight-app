import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Mail, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTidioManager, openTidioChat } from '../components/TidioManager';
import { useLanguage } from '../components/i18n/LanguageProvider';

const translations = {
  en: {
    title: 'Help & Support',
    description: 'Get help or chat with our support team',
    chatButton: 'Chat with Support',
    faqTitle: 'Frequently Asked Questions',
    contactTitle: 'Contact Us',
    contactEmail: 'Email: support@faithlight.app',
    privacy: 'Privacy Policy',
  },
  om: {
    title: 'Gargaarsa & Deeggarsa',
    description: 'Gargaarsa argaa ykn tiimii deeggarsa keenyan waliin haasawa',
    chatButton: 'Tiimii Deggarsa Waliin Haasawa',
    faqTitle: 'Gaaffii Yeroo Hunda Gaaffataman',
    contactTitle: 'Nu Qunnamaa',
    contactEmail: 'Imeelii: support@faithlight.app',
    privacy: 'Seera Cubbuu Eenyummaa',
  },
  am: {
    title: 'ሚስጥር እና ድጋፍ',
    description: 'ሚስጥር ያግኙ ወይም ከድጋፍ ቡድናችን ጋር ይወያዩ',
    chatButton: 'ከድጋፍ ቡድን ጋር ይወያዩ',
    faqTitle: 'በተደጋጋሚ የሚጠየቁ ጥያቄዎች',
    contactTitle: 'ያግኙን',
    contactEmail: 'ኢሜይል፡ support@faithlight.app',
    privacy: 'የግላዊነት መግለጫ',
  },
  ar: {
    title: 'المساعدة والدعم',
    description: 'احصل على المساعدة أو تحدث مع فريق الدعم الخاص بنا',
    chatButton: 'الدردشة مع الدعم',
    faqTitle: 'الأسئلة الشائعة',
    contactTitle: 'تواصل معنا',
    contactEmail: 'البريد الإلكتروني: support@faithlight.app',
    privacy: 'سياسة الخصوصية',
  },
  sw: {
    title: 'Msaada na Usaidizi',
    description: 'Pata msaada au kamatiana na timu ya usaidizi wetu',
    chatButton: 'Sema na Usaidizi',
    faqTitle: 'Maswali Yanayoulizwa Mara Kwa Mara',
    contactTitle: 'Wasiliana Nasi',
    contactEmail: 'Barua Pepe: support@faithlight.app',
    privacy: 'Sera ya Faragha',
  },
};

export default function HelpSupport() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

  // Show Tidio on this page only
  useTidioManager(true, language);

  const faqs = {
    en: [
      { q: 'How do I save a verse?', a: 'Tap the heart icon on any verse to save it. Your saved verses appear in the "Saved" section.' },
      { q: 'Can I read offline?', a: 'Yes! Download chapters for offline reading in the Downloads section.' },
      { q: 'How do I switch languages?', a: 'Use the language switcher in the home page header. Your selection is saved.' },
      { q: 'How do I report a problem?', a: 'Use the chat button below to contact our support team. We respond within 24 hours.' },
    ],
    om: [
      { q: 'Akkamitti aayataa kuusuu dandaayuu?', a: 'Calqaba jidhaakaa hammam fudhataa calaa keessatti taphaa. Aayataa kuusuuraa keessani kutaa "Kuusuuraa" irratti mul\'atu.' },
      { q: 'Seenama jalqabaa dubbisuu dandaayuu?', a: 'Eeyyee! Baajaj kutaa "Choofa" keessa buusuu jalqaba.' },
      { q: 'Akkaami afaan jijjiira?', a: 'Filannoo afaanaa fuula murtaa irratti fayyadamuun. Filannoo kee kuufamaa jira.' },
      { q: 'Akkamitti rakkoo mirkaneessuu?', a: 'Buuton haasawa armaan gadii fayyadamee tiimii deeggarsa keenyatti haasawa.' },
    ],
    am: [
      { q: 'አንድ ገጽ እንዴት ልቆጥ?', a: 'በማንኛውም አንቀፅ ላይ ለውጥ አዝራር 터치ያድርጉ። የተቆጠሙ አንቀጾችህ በ "ተቆጠመ" ክፍል ውስጥ ይታያሉ።' },
      { q: 'ኦፍላይን ማንበብ ትችላለሁ?', a: 'አዎ! ኦፍላይን ስለማንበብ ለክወናስ ለውጡን በ "ውርደተ" ክፍል ውስጥ ያውርዱ።' },
      { q: 'ቋንቋ እንዴት ትቀይራለሁ?', a: 'በመነሻ ገጽ ራስ ላይ ቋንቋ ምርጫ ይጠቀሙ። የእርስዎ ምርጫ ተቀምጧል።' },
      { q: 'ችግር እንዴት ሪፖርት ማድረግ?', a: 'ከዚህ በታች ያለውን ቻት ቁልፍ ይጠቀሙ ከድጋፍ ቡድናችን ጋር ይገቡ።' },
    ],
    ar: [
      { q: 'كيف أحفظ نصًا؟', a: 'اضغط على أيقونة القلب على أي آية لحفظها. تظهر الآيات المحفوظة في قسم "المحفوظ".' },
      { q: 'هل يمكنني القراءة بدون إنترنت؟', a: 'نعم! قم بتنزيل الفصول للقراءة بدون إنترنت في قسم التنزيلات.' },
      { q: 'كيف أغير اللغة؟', a: 'استخدم محدد اللغة في رأس الصفحة الرئيسية. يتم حفظ اختيارك.' },
      { q: 'كيف أبلغ عن مشكلة؟', a: 'استخدم زر الدردشة أدناه للتواصل مع فريق الدعم الخاص بنا.' },
    ],
    sw: [
      { q: 'Ninawezaje kuokoa fungu?', a: 'Tap kwenye mbolea juu ya fungu yoyote kuokoa. Funguo zako zilizookoeshwa zinaonekana katika sehemu ya "Zilizookoeshwa".' },
      { q: 'Je, naweza kusoma kwa kushindwa?', a: 'Ndiyo! Pakua maandishi kwa kusoma kwa haba ya mtandao katika sehemu ya Kupakua.' },
      { q: 'Ninawezaje kubadilisha lugha?', a: 'Tumia kigeuzi cha lugha katika kichwa cha ukurasa kuu. Chaguo lako linataifiwa.' },
      { q: 'Ninawezaje kuripoti tatizo?', a: 'Tumia kitufe cha kuzungumza hapa chini kuwasiliana na timu yetu ya usaidizi.' },
    ],
  };

  const pageLanguageFaqs = faqs[language] || faqs.en;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F1' }}>
      {/* Header */}
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3 border-b" style={{ borderColor: '#E5E7EB' }}>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#F3F4F6' }}
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: '#1F2937' }} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1F2937' }}>
            {t.title}
          </h1>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            {t.description}
          </p>
        </div>
      </div>

      <div className="px-5 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        {/* Chat with Support Button */}
        <button
          onClick={openTidioChat}
          className="w-full rounded-2xl p-4 flex items-center gap-3 transition-all duration-200"
          style={{ backgroundColor: '#6C5CE7', color: 'white' }}
          aria-label={t.chatButton}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold text-sm">{t.chatButton}</span>
        </button>

        {/* FAQs */}
        <div>
          <h2 className="text-base font-bold mb-3" style={{ color: '#1F2937' }}>
            {t.faqTitle}
          </h2>
          <div className="space-y-2">
            {pageLanguageFaqs.map(({ q, a }, idx) => (
              <details
                key={idx}
                className="rounded-xl p-4 border"
                style={{ backgroundColor: '#fff', borderColor: '#E5E7EB' }}
              >
                <summary className="cursor-pointer font-semibold text-sm flex items-center gap-2" style={{ color: '#1F2937' }}>
                  <HelpCircle className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                  {q}
                </summary>
                <p className="mt-2 text-sm leading-6" style={{ color: '#6B7280' }}>
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: '#1F2937' }}>
            {t.contactTitle}
          </h2>
          <div className="flex items-center gap-2" style={{ color: '#6B7280' }}>
            <Mail className="w-4 h-4" />
            <span className="text-sm">{t.contactEmail}</span>
          </div>
        </div>

        {/* Privacy Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/PrivacyPolicy')}
            className="text-sm font-semibold underline"
            style={{ color: '#6C5CE7' }}
          >
            {t.privacy}
          </button>
        </div>
      </div>
    </div>
  );
}