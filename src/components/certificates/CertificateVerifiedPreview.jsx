import React from 'react';

export default function CertificateVerifiedPreview({ certificate }) {
  return (
    <div className="w-full aspect-[8.5/11] bg-gradient-to-br from-amber-50 via-slate-50 to-blue-50 p-8 rounded-lg border-4 border-amber-400 shadow-2xl relative overflow-hidden">
      {/* Security watermark - cross pattern */}
      <div className="absolute inset-0 opacity-5 flex items-center justify-center">
        <div className="text-9xl">✝️</div>
      </div>

      {/* Seal decoration */}
      <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-2 border-amber-600 flex items-center justify-center opacity-20">
        <div className="text-3xl">🔥</div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-between text-center">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-blue-900 mb-1">FAITHLIGHT SCHOOL OF BIBLICAL LEADERSHIP</h2>
          <p className="text-xs font-semibold text-amber-700">Official Certificate of Academic Completion</p>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-amber-900 border-b-4 border-amber-400 pb-3">
            CERTIFICATE IN CHRISTIAN LEADERSHIP & THEOLOGICAL STUDIES
          </h3>

          <div className="space-y-4">
            <p className="text-xs text-gray-700 uppercase font-semibold">This certifies that</p>

            <p className="text-2xl font-bold text-gray-900 border-b-2 border-amber-600 pb-3 px-8">
              {certificate.student_name}
            </p>

            <div className="space-y-2 bg-white bg-opacity-40 rounded-lg p-3">
              <p className="text-xs text-gray-800">has successfully completed the prescribed program of study in</p>
              <p className="text-base font-bold text-blue-900">{certificate.program_name}</p>
              <p className="text-xs text-gray-800 mt-2">
                and has demonstrated understanding of Biblical doctrine,<br />
                Christian leadership principles, and faithful ministry service<br />
                in accordance with the teachings of Holy Scripture.
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs italic text-gray-800">
                "Be diligent to present yourself approved to God…"
              </p>
              <p className="text-xs text-gray-700">— 2 Timothy 2:15</p>
            </div>
          </div>
        </div>

        {/* Official Details */}
        <div className="space-y-2 text-xs text-gray-900 w-full">
          <div className="border-t-2 border-amber-600 pt-3 space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-700 font-semibold">ISSUED</p>
                <p className="font-semibold">
                  {new Date(certificate.awarded_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-700 font-semibold">ID</p>
                <p className="font-mono font-bold text-blue-900">{certificate.certificate_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-700 font-semibold">AUTHORIZED</p>
                <p className="font-semibold">{certificate.instructor_name}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-amber-400">
              <p className="text-xs font-semibold text-amber-700">Official FaithLight Seal</p>
              <p className="text-xs text-gray-600">Verification Code: {certificate.verification_code?.substring(0, 20)}...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}