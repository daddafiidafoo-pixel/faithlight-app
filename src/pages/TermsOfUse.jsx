import React, { useState } from 'react';
import { useAppStore } from '../components/store/appStore';
import { Globe } from 'lucide-react';

const content = {
  en: {
    title: 'Terms of Use',
    effective: 'Effective Date: March 2026',
    intro: 'By using FaithLight, you agree to the following terms.',
    sections: [
      { heading: 'Acceptance of Terms', text: 'By accessing or using FaithLight, you agree to comply with these Terms of Use. If you do not agree, please do not use the service.' },
      { heading: 'Purpose of the App', text: 'FaithLight is a Bible reading, study, and prayer application designed to support spiritual growth through Scripture, AI-powered study tools, and devotional resources.' },
      {
        heading: 'User Responsibilities',
        preList: 'Users agree to:',
        list: ['Use FaithLight respectfully and lawfully', 'Avoid submitting harmful or abusive content', 'Avoid attempting to disrupt or exploit the service', 'Respect intellectual property rights'],
      },
      {
        heading: 'AI Content Disclaimer',
        text: 'FaithLight includes AI-generated content for Bible explanations, prayer suggestions, and support responses.',
        warning: '⚠️ AI-generated responses are automatically generated, may contain inaccuracies, and should not be considered professional theological, medical, or legal advice.',
      },
      {
        heading: 'Intellectual Property',
        text: 'The FaithLight name, branding, and software are protected intellectual property. Users may not copy, reproduce, distribute, or reverse engineer the platform without permission. Bible translations used in the app remain the property of their respective copyright holders.',
      },
      {
        heading: 'Limitation of Liability',
        preList: 'FaithLight is provided "as is" without warranties. We are not responsible for:',
        list: ['Interruptions in service', 'Inaccuracies in AI-generated responses', 'Losses arising from reliance on app content'],
      },
      { heading: 'Changes to the Service', text: 'FaithLight may update or modify the platform and features at any time to improve functionality and user experience.' },
      { heading: 'Contact', email: true },
    ],
  },
  om: {
    title: 'Haala Fayyadamaa',
    effective: 'Guyyaa Hojii Eegalame: Bitootessa 2026',
    intro: 'FaithLight fayyadamuun, haaloota armaan gadii kana irratti walii galuu kee mirkaneessa.',
    sections: [
      { heading: 'Haaloota Fudhachuu', text: 'FaithLight seenuun ykn fayyadamuun, Haala Fayyadamaa kanaaf hordofuu irratti walii galuu kee mul\'isa. Yoo walii hin gallee, tajaajila hin fayyadamin.' },
      { heading: 'Kaayyoo Appii', text: 'FaithLight appii dubbisaa Macaafa Qulqulluu, barumsaa, fi kadhaa kan guddinni hawwii gara Kitaaba Qulqulluu, meeshaalee barumsaa AI-powered, fi qabiyyee hawwii of keessaa qabu dha.' },
      {
        heading: 'Itti Gaafatamummaa Fayyadamaa',
        preList: 'Fayyadamtoonni irratti walii galu:',
        list: ['FaithLight kabajaan fi seeraan fayyadamuu', 'Qabiyyee miidhaa ykn dararaa dhiyeessuuf of-qusachuu', 'Tajaajila jeequuf ykn fayyadamuuf yaalu dhiisuu', 'Mirga qabeenya sammuu kabajuu'],
      },
      {
        heading: 'Iftoomina Qabiyyee AI',
        text: 'FaithLight ibsaa Macaafa Qulqulluu, yaadannoo kadhaa, fi deebii deeggarsa gara AI dhaan uumame of keessaa qaba.',
        warning: '⚠️ Deebiin AI ofumaan uumama, dogoggora of keessaa qabaachuu danda\'a, fi gorsa teolojii, fayyaa, ykn seeraa ogummaa jedhamee hin fudhatamuuf.',
      },
      {
        heading: 'Qabeenya Komiishinii',
        text: 'Maqaa FaithLight, mallattoo, fi sooftiweeri qabeenya komiishinii eegame. Fayyadamtoonni hayyama malee garagalchuu, raabsuu, ykn meeshaa guddaa haquu hin danda\'an. Hiikkoon Macaafa Qulqulluu qabeenya abbaa mirga dhuunfaa isaanii ta\'uu itti fufna.',
      },
      {
        heading: 'Daangaa Itti Gaafatamummaa',
        preList: 'FaithLight "akka jiretti" malee mirkaneessaa malee kennama. Kanaaf itti hin gaafatamnu:',
        list: ['Addaan kutuuwwan tajaajilaa', 'Dogoggoraalee deebii AI', 'Miidhaa qabiyyee appii irratti hirkatuu irraa ka\'e'],
      },
      { heading: 'Jijjiirraa Tajaajilaa', text: 'FaithLight yeroo kamiyyuu wiirtuu fi amalootaa fooyyessuu ykn jijjiiruu danda\'a.' },
      { heading: 'Qunnamtii', email: true },
    ],
  },
};

export default function TermsOfUse() {
  const { uiLanguage } = useAppStore();
  const [pageLang, setPageLang] = useState('auto');
  const lang = pageLang === 'auto' ? (uiLanguage || 'en') : pageLang;
  const c = content[lang] || content.en;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Language selector */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1">
              <Globe className="w-4 h-4 text-gray-400 ml-2" />
              {[['auto', 'App Language'], ['en', 'English'], ['om', 'Afaan Oromoo']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setPageLang(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${pageLang === val ? 'bg-white shadow text-indigo-700 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📋</span>
              <h1 className="text-3xl font-bold text-gray-900">{c.title}</h1>
            </div>
            <p className="text-sm text-gray-500">{c.effective}</p>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{c.intro}</p>

          {c.sections.map((s) => (
            <Section key={s.heading} title={s.heading}>
              {s.text && <p className="text-gray-700">{s.text}</p>}
              {s.preList && <p className="text-gray-700 mb-3">{s.preList}</p>}
              {s.list && (
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {s.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {s.warning && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
                  <p className="text-sm text-amber-800 font-medium">{s.warning}</p>
                </div>
              )}
              {s.email && (
                <a href="mailto:support@faithlight.app" className="text-indigo-600 font-medium hover:underline">support@faithlight.app</a>
              )}
            </Section>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}