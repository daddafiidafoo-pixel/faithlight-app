import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F1' }}>
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => window.history.back()}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#F3F4F6' }}>
          <ArrowLeft className="w-5 h-5" style={{ color: '#1F2937' }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: '#1F2937' }}>Privacy Policy</h1>
      </div>
      <div className="px-5 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        <p className="text-sm" style={{ color: '#6B7280' }}>Last updated: March 2026</p>

        {[
          {
            title: 'What We Collect',
            body: 'We collect only the information you provide when creating an account (name, email). We also collect anonymous usage data to improve the app experience (e.g. which books are read most).'
          },
          {
            title: 'How We Use Your Data',
            body: 'Your data is used solely to provide the app experience — your reading progress, saved verses, and preferences. We do not sell or share your personal data with third parties.'
          },
          {
            title: 'Bible Content',
            body: 'Bible text and audio are provided via licensed APIs (Bible Brain / Digital Bible Platform). We do not store full Bible text on our servers.'
          },
          {
            title: 'Data Storage',
            body: 'Your account data is stored securely. You may request deletion of your account and data at any time by contacting us.'
          },
          {
            title: 'Cookies & Tracking',
            body: 'We use no third-party advertising trackers. Basic analytics help us understand app usage anonymously.'
          },
          {
            title: 'Customer Support Chat',
            body: 'We use Tidio, a third-party customer support service, to provide live chat assistance. Messages sent through the support chat may be processed by Tidio to help us respond to your questions and improve our support quality. Please review Tidio\'s privacy policy for more information on how they handle your data.'
          },
          {
            title: 'Contact',
            body: 'For any privacy questions, contact us at: support@faithlight.app'
          },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-3xl p-5" style={{ backgroundColor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base font-bold mb-2" style={{ color: '#8B5CF6' }}>{title}</h2>
            <p className="text-sm leading-7" style={{ color: '#374151' }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}