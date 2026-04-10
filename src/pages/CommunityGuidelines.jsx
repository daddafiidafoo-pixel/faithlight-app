import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, ChevronLeft } from 'lucide-react';

const Section = ({ num, title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
      <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 text-sm font-bold flex items-center justify-center flex-shrink-0">{num}</span>
      {title}
    </h2>
    <div className="text-gray-700 space-y-2 pl-9">{children}</div>
  </div>
);

export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        <Link to={createPageUrl('UserSettings')} className="inline-flex items-center gap-1 text-indigo-600 text-sm font-medium mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Settings
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-7 h-7 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Community Policy</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">Effective Date: 2026</p>

        <p className="text-gray-700 mb-8 leading-relaxed">
          FaithLight is designed to be a respectful and Christ-centered environment. Users agree to use the platform in a way that reflects kindness, respect, and integrity.
        </p>

        {/* Prohibited banner */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
          <p className="text-sm font-bold text-red-800 mb-3">The following behavior is prohibited:</p>
          <div className="grid grid-cols-2 gap-2">
            {['Hate speech', 'Harassment', 'Abusive language', 'Unlawful activity', 'Attempts to harm the platform', 'Spam or self-promotion'].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-red-700">
                <span className="text-red-400">✗</span> {item}
              </div>
            ))}
          </div>
        </div>

        <Section num="1" title="Christ-Centered Environment">
          <p className="text-sm">FaithLight is a place for spiritual growth and biblical study. All interactions should reflect the values of kindness, humility, and love that Scripture calls us to.</p>
        </Section>

        <Section num="2" title="Respectful Interaction">
          <p className="mb-2 text-sm">Treat all members with dignity regardless of their background, tradition, or theological perspective.</p>
          <ul className="list-disc ml-4 space-y-1 text-sm">
            <li>No harassment, bullying, or personal attacks</li>
            <li>No hate speech or discriminatory language</li>
            <li>Disagree gracefully and constructively</li>
          </ul>
        </Section>

        <Section num="3" title="Appropriate Content">
          <p className="mb-2 text-sm">All content must be appropriate for a faith-based community.</p>
          <ul className="list-disc ml-4 space-y-1 text-sm">
            <li>No explicit, violent, or harmful content</li>
            <li>No promotion of illegal activities</li>
            <li>No spam, unsolicited advertising, or self-promotion</li>
          </ul>
        </Section>

        <Section num="4" title="Intellectual Property & Privacy">
          <ul className="list-disc ml-4 space-y-1 text-sm">
            <li>Do not share copyrighted content without permission</li>
            <li>Do not share others' personal information</li>
            <li>Credit Bible translation sources when quoting Scripture</li>
          </ul>
        </Section>

        <Section num="5" title="Enforcement">
          <p className="text-sm">FaithLight reserves the right to restrict access for users who violate these principles. Violations may result in content removal, warnings, or account suspension depending on severity.</p>
        </Section>

        <Section num="6" title="Reporting">
          <p className="text-sm">If you see content that violates these guidelines, please report it using the in-app report feature or contact us directly. Our team reviews reported content as quickly as possible.</p>
        </Section>

        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-2xl p-5">
          <p className="text-sm font-semibold text-purple-900 mb-1">Remember</p>
          <p className="text-sm text-purple-800">We are a community united by faith and the desire to grow spiritually. Let's keep FaithLight a welcoming place for everyone.</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <a href="mailto:support@faithlight.app" className="text-purple-700 font-semibold hover:underline">📧 support@faithlight.app</a>
            <a href="mailto:hello@faithlight.app" className="text-purple-700 font-semibold hover:underline">📧 hello@faithlight.app</a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-10">FaithLight · support@faithlight.app</p>
      </div>
    </div>
  );
}