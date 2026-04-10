import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';

const Section = ({ num, title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
      <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold flex items-center justify-center flex-shrink-0">{num}</span>
      {title}
    </h2>
    <div className="text-gray-700 space-y-2 pl-9">{children}</div>
  </div>
);

export default function CopyrightNotice() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <Link to={createPageUrl('UserSettings')} className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Settings
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <FileText className="w-7 h-7 text-indigo-600" />
          <h1 className="text-3xl font-bold text-indigo-900">Copyright Notice</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">Effective Date: 2026</p>

        <p className="text-gray-700 mb-8 leading-relaxed">
          FaithLight may include Bible translations and audio resources provided by licensed partners. These materials remain the property of their respective publishers and organizations.
        </p>

        {/* Allowed / Not Allowed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="font-bold text-green-800 text-sm">Users May</p>
            </div>
            <ul className="space-y-2 text-sm text-green-900">
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Read Scripture within the app</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Share verses for personal use</li>
              <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Use study tools within the app</li>
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="font-bold text-red-800 text-sm">Users May Not</p>
            </div>
            <ul className="space-y-2 text-sm text-red-900">
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Reproduce full translations commercially</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Redistribute copyrighted audio or text without permission</li>
            </ul>
          </div>
        </div>

        <Section num="1" title="Bible Translations">
          <p className="text-sm">Bible translations included in FaithLight are used under license from their respective publishers and organizations. Translation credits are displayed where applicable within the app.</p>
        </Section>

        <Section num="2" title="Audio Bible Content">
          <p className="text-sm">Audio recordings of Scripture are provided by licensed ministries and organizations. These recordings remain the property of their respective copyright holders.</p>
        </Section>

        <Section num="3" title="App Content Ownership">
          <p className="text-sm">All app design, features, interface elements, and software are the property of FaithLight. Unauthorized reproduction or redistribution is prohibited.</p>
        </Section>

        <Section num="4" title="Acknowledgements">
          <p className="text-sm">Where applicable, FaithLight acknowledges the ministries and organizations that provide Bible translations and audio recordings. We are grateful for their ministry in making God's Word accessible worldwide.</p>
        </Section>

        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
          <p className="text-sm text-indigo-800">
            Copyright questions? Contact us at{' '}
            <a href="mailto:support@faithlight.app" className="text-indigo-600 font-semibold hover:underline">support@faithlight.app</a>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">FaithLight · support@faithlight.app</p>
      </div>
    </div>
  );
}