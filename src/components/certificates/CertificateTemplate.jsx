import React from 'react';
import { Card } from '@/components/ui/card';

export default function CertificateTemplate({
  certificate,
  size = 'preview', // 'preview' or 'display'
}) {
  const isPreview = size === 'preview';
  const containerClass = isPreview
    ? 'w-full max-w-2xl mx-auto'
    : 'w-full';

  const getTierColor = (tier) => {
    switch (tier) {
      case 'theological':
        return {
          border: 'border-amber-600',
          bg: 'bg-amber-50',
          text: 'text-amber-900',
          accent: 'text-amber-700',
        };
      case 'leadership':
        return {
          border: 'border-purple-600',
          bg: 'bg-purple-50',
          text: 'text-purple-900',
          accent: 'text-purple-700',
        };
      default:
        return {
          border: 'border-indigo-600',
          bg: 'bg-indigo-50',
          text: 'text-indigo-900',
          accent: 'text-indigo-700',
        };
    }
  };

  const tierColors = getTierColor(certificate.certificate_tier);

  return (
    <div className={containerClass}>
      <div
        className={`${tierColors.bg} ${tierColors.border} border-8 rounded-lg p-8 sm:p-12 text-center relative overflow-hidden`}
        style={{
          aspectRatio: '1.4 / 1',
          backgroundImage:
            'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1), transparent), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1), transparent)',
        }}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 opacity-30" style={{ borderColor: 'currentColor' }} />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 opacity-30" style={{ borderColor: 'currentColor' }} />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 opacity-30" style={{ borderColor: 'currentColor' }} />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 opacity-30" style={{ borderColor: 'currentColor' }} />

        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div>
            <p className={`text-sm font-semibold tracking-widest ${tierColors.accent} uppercase`}>
              Certificate of Completion
            </p>
            <p className={`text-xs font-medium ${tierColors.accent} uppercase mt-1`}>
              {certificate.certificate_tier} Level
            </p>
          </div>

          {/* Main content */}
          <div className="space-y-3 py-4">
            <p className={`text-sm ${tierColors.text}`}>This certifies that</p>

            <h1 className={`text-3xl sm:text-4xl font-bold ${tierColors.text}`}>
              {certificate.student_name}
            </h1>

            <p className={`text-sm ${tierColors.text}`}>
              has successfully completed the course
            </p>

            <h2 className={`text-xl sm:text-2xl font-bold ${tierColors.accent}`}>
              {certificate.program_name}
            </h2>
          </div>

          {/* Footer Info */}
          <div className={`text-xs ${tierColors.text} space-y-1 pt-2`}>
            <p className="font-semibold">
              {new Date(certificate.awarded_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            {certificate.certificate_type === 'verified' && (
              <div className="space-y-1 border-t border-opacity-20 pt-2">
                <p className="font-bold text-green-700">✓ Verified Certificate</p>
                <p className="text-opacity-70">
                  Verification Code: {certificate.verification_code}
                </p>
              </div>
            )}

            <p className="text-opacity-60 pt-1">
              Certificate #{certificate.certificate_number}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom signature line (for display mode) */}
      {!isPreview && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Issued by FaithLight Academy</p>
          <p className="text-xs italic">Growing in faith through biblical education</p>
        </div>
      )}
    </div>
  );
}