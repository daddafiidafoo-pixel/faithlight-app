import React from 'react';

export default function CertificateBasicPreview({ certificate }) {
  return (
    <div className="w-full aspect-[8.5/11] bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-lg border-2 border-gray-300 shadow-lg relative overflow-hidden">
      {/* Minimal watermark */}
      <div className="absolute inset-0 opacity-3 flex items-center justify-center">
        <div className="text-9xl">📖</div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-between text-center">
        {/* Header */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-1">FAITHLIGHT SCHOOL OF BIBLICAL LEADERSHIP</h2>
          <p className="text-xs text-gray-600">Ministry Training Program</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-gray-900">CERTIFICATE OF COMPLETION</h3>

          <div className="space-y-4">
            <p className="text-xs text-gray-700">This certifies that</p>

            <p className="text-xl font-bold text-gray-900 border-b-2 border-gray-400 pb-2 px-8">
              {certificate.student_name}
            </p>

            <div className="space-y-2">
              <p className="text-xs text-gray-700">has successfully completed the course of study in</p>
              <p className="text-lg font-semibold text-gray-900">{certificate.program_name}</p>
              <p className="text-xs text-gray-700 mt-3">
                and has demonstrated commitment to Christian learning<br />
                and spiritual growth through FaithLight School of Biblical Leadership.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-2 text-xs text-gray-800 w-full">
          <div className="border-t border-gray-400 pt-3 flex justify-between px-4">
            <div>
              <p className="text-xs text-gray-600">Date</p>
              <p className="font-semibold">
                {new Date(certificate.awarded_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Digital Signature</p>
              <p className="font-semibold italic">FaithLight</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 italic pt-2">Non-Verified Completion Certificate</p>
        </div>
      </div>
    </div>
  );
}