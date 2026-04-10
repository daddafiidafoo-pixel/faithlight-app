import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, ChevronLeft, BookOpen, Users, Lightbulb } from 'lucide-react';

const Section = ({ num, title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
      <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold flex items-center justify-center flex-shrink-0">{num}</span>
      {title}
    </h2>
    <div className="text-gray-700 space-y-2 pl-9">{children}</div>
  </div>
);

export default function StatementOfFaith() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <Link to={createPageUrl('UserSettings')} className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Settings
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <Heart className="w-7 h-7 text-indigo-600" />
          <h1 className="text-3xl font-bold text-indigo-900">Christian Content Disclaimer</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">Effective Date: 2026</p>

        <p className="text-gray-700 mb-8 leading-relaxed">
          FaithLight provides Bible-based educational tools intended to support spiritual growth.
        </p>

        {/* Key points banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 space-y-3">
          <p className="text-sm font-bold text-amber-800 mb-2">The content provided within the app:</p>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <p className="text-sm text-amber-900">Does not replace Scripture</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <p className="text-sm text-amber-900">Does not replace pastoral counsel</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <p className="text-sm text-amber-900">Does not represent a single denominational doctrine</p>
          </div>
        </div>

        <Section num="1" title="AI-Generated Content">
          <p className="text-sm">AI-generated insights are designed to help users explore biblical themes but should not be considered authoritative theological teaching. Always verify AI responses against Scripture and trusted biblical resources.</p>
        </Section>

        <Section num="2" title="User Guidance">
          <p className="mb-2 text-sm">Users are encouraged to:</p>
          <ul className="list-disc ml-4 space-y-1 text-sm">
            <li>Study Scripture directly</li>
            <li>Consult church leaders or pastors</li>
            <li>Engage in prayer and reflection</li>
          </ul>
        </Section>

        <Section num="3" title="Respect for Christian Traditions">
          <p className="text-sm">FaithLight respects the diversity of Christian traditions worldwide. Content is designed to be accessible and helpful to believers from evangelical, Pentecostal, Reformed, Baptist, Methodist, and other traditions.</p>
        </Section>

        {/* Footer cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-indigo-50 rounded-2xl p-4 text-center">
            <BookOpen className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-indigo-800">Scripture First</p>
            <p className="text-xs text-indigo-600 mt-1">The Bible is our foundation and authority</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 text-center">
            <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-green-800">Globally Inclusive</p>
            <p className="text-xs text-green-600 mt-1">Welcome to all Christian traditions</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 text-center">
            <Lightbulb className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-purple-800">Study Tool</p>
            <p className="text-xs text-purple-600 mt-1">Designed to support, not replace, personal study</p>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <p className="text-sm text-gray-700">
            Questions? Contact us at{' '}
            <a href="mailto:support@faithlight.app" className="text-indigo-600 font-semibold hover:underline">support@faithlight.app</a>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">FaithLight · support@faithlight.app</p>
      </div>
    </div>
  );
}