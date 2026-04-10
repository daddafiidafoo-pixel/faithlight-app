import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F1' }}>
      <div className="bg-white px-5 pt-5 pb-4 flex items-center gap-3" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => window.history.back()}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#F3F4F6' }}>
          <ArrowLeft className="w-5 h-5" style={{ color: '#1F2937' }} />
        </button>
        <h1 className="text-xl font-bold" style={{ color: '#1F2937' }}>Terms of Service</h1>
      </div>
      <div className="px-5 py-6 max-w-2xl mx-auto space-y-6 pb-24">
        <p className="text-sm" style={{ color: '#6B7280' }}>Last updated: March 2026</p>

        {[
          {
            title: 'Acceptance of Terms',
            body: 'By using FaithLight, you agree to these terms. If you do not agree, please do not use the app.'
          },
          {
            title: 'App Usage',
            body: 'FaithLight is a Bible reading and listening app intended for personal, non-commercial spiritual growth. You agree not to use the app for any unlawful purpose.'
          },
          {
            title: 'Bible Content License',
            body: 'Bible text and audio are provided under license from their respective copyright holders. Content may not be redistributed, sold, or used outside the app without written permission.'
          },
          {
            title: 'User Accounts',
            body: 'You are responsible for maintaining the security of your account. Do not share your credentials with others.'
          },
          {
            title: 'Intellectual Property',
            body: 'The FaithLight app design, branding, and original content are protected by copyright. You may not copy or reproduce any part of the app without permission.'
          },
          {
            title: 'Limitation of Liability',
            body: 'FaithLight is provided "as is". We are not liable for any loss or damage resulting from use of the app or temporary unavailability of content.'
          },
          {
            title: 'Contact',
            body: 'Questions about these terms? Contact us at: support@faithlight.app'
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