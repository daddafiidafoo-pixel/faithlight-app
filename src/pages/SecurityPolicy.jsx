import React, { useState } from 'react';
import { useAppStore } from '../components/store/appStore';
import { Globe } from 'lucide-react';

const content = {
  en: {
    title: 'Security',
    subtitle: 'FaithLight Security Policy',
    intro: 'FaithLight is designed with security and user safety in mind. We implement safeguards to protect the platform and user data.',
    sections: [
      {
        heading: 'Security Measures',
        preList: 'FaithLight employs several protections including:',
        list: ['Secure HTTPS connections', 'Authentication safeguards', 'Restricted access to internal systems', 'Input validation to prevent malicious content', 'Monitoring for suspicious activity', 'Protection against unauthorized access'],
      },
      { heading: 'Data Protection', text: 'User data is stored using secure infrastructure and access controls designed to prevent unauthorized exposure. FaithLight limits access to sensitive information and applies reasonable measures to protect stored data.' },
      {
        heading: 'Responsible Use',
        text: 'Users should protect their account credentials and avoid sharing login information with others.',
        info: 'ℹ️ FaithLight will never ask users to provide passwords through email or external messages.',
      },
      {
        heading: 'Reporting Security Issues',
        text: 'If you discover a security issue or vulnerability, please report it responsibly to:',
        email: true,
        note: 'FaithLight appreciates responsible disclosure and will investigate reported concerns promptly.',
      },
    ],
  },
  om: {
    title: 'Nageenya',
    subtitle: 'Imaammata Nageenya FaithLight',
    intro: 'FaithLight nageenya fi hirdhibbaa fayyadamaa yaadatee ijaarame. Wiirtuu fi deetaa fayyadamaa eeguuf tiksee hojiirra oolchina.',
    sections: [
      {
        heading: 'Tarkaanfiiwwan Nageenya',
        preList: 'FaithLight eeggannoo heddu hojiirra oolcha:',
        list: ['Walitti qabinsa HTTPS nagaa', 'Tiksee seensaa', 'Seeqqe gara siistemaalee keessaatti', 'Mirkaneessa galchaa dhiibbaa hamaa ittisuu', 'Hordoffii sochiiwwan shakkamoo', 'Eegumsa seensaa hayyama malee irraa'],
      },
      { heading: 'Eeggumsa Deetaa', text: 'Deetaan fayyadamaa sirna nageeyya qabu fi to\'annoo seensaa dhaan kuufama. FaithLight deetaa ija qabeessaa dachaan daanga\'a.' },
      {
        heading: 'Fayyadama Itti Gaafatamaa',
        text: 'Fayyadamtoonni sagantaa herregaa isaanii eeguu fi odeeffannoo seensaa namoota birootti qooduuf of-qusachuu qabu.',
        info: 'ℹ️ FaithLight imeelii ykn ergaa alaa dhaan darbii gaafachuu hin danda\'u.',
      },
      {
        heading: 'Gabaasaa Rakkoolee Nageenya',
        text: 'Rakkoo nageenya ykn hanqina argatte yoo ta\'e, itti gaafatamummaadhaan gabaasi:',
        email: true,
        note: 'FaithLight gabaasa itti gaafatamaa galateeffata waan ta\'eef dhimmoota gabaafaman hatattamaan qorata.',
      },
    ],
  },
};

export default function SecurityPolicy() {
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
              <span className="text-3xl">🛡️</span>
              <h1 className="text-3xl font-bold text-gray-900">{c.title}</h1>
            </div>
            <p className="text-sm text-gray-500">{c.subtitle}</p>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{c.intro}</p>

          {c.sections.map((s) => (
            <Section key={s.heading} title={s.heading}>
              {s.preList && <p className="text-gray-700 mb-3">{s.preList}</p>}
              {s.list && (
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {s.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {s.text && <p className="text-gray-700">{s.text}</p>}
              {s.info && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3">
                  <p className="text-sm text-blue-800 font-medium">{s.info}</p>
                </div>
              )}
              {s.email && (
                <a href="mailto:support@faithlight.app" className="text-indigo-600 font-medium hover:underline block mt-2">support@faithlight.app</a>
              )}
              {s.note && <p className="text-gray-600 text-sm mt-2">{s.note}</p>}
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