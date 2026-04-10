import React from 'react';

export default function CertificateVerifiedLayout({ certificate }) {
  return (
    <div className="w-full bg-white" style={{ aspectRatio: '8.5/5.5' }}>
      {/* A4 Landscape Professional Layout */}
      <div className="w-full h-full flex flex-col relative overflow-hidden" style={{ 
        padding: '40px 64px', // 1 inch margins (96px) converted to reasonable spacing
        fontFamily: 'Garamond, Georgia, serif',
        backgroundColor: '#f5f3f0',
      }}>
        
        {/* Subtle watermark background */}
        <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
          <div className="text-9xl">✝️</div>
        </div>

        {/* Content container */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          
          {/* TOP SECTION */}
          <div className="text-center space-y-2">
            {/* Main header */}
            <h1 style={{ 
              fontSize: '28pt', 
              fontWeight: 'bold',
              color: '#0A1F44',
              letterSpacing: '2px',
              margin: 0,
            }}>
              FAITHLIGHT SCHOOL OF BIBLICAL LEADERSHIP
            </h1>
            
            {/* Tagline */}
            <p style={{ 
              fontSize: '13pt', 
              color: '#666',
              letterSpacing: '1px',
              margin: 0,
              marginTop: '4px',
            }}>
              Equipping Believers. Strengthening Leaders. Advancing the Gospel.
            </p>

            {/* Gold divider */}
            <div style={{ 
              height: '2px', 
              backgroundColor: '#C8A24C',
              width: '60px',
              margin: '12px auto',
            }} />

            {/* Certificate title */}
            <h2 style={{ 
              fontSize: '24pt', 
              fontWeight: 'bold',
              color: '#0A1F44',
              margin: '16px 0 0 0',
            }}>
              CERTIFICATE IN CHRISTIAN LEADERSHIP<br />& THEOLOGICAL STUDIES
            </h2>
          </div>

          {/* MIDDLE SECTION - Body */}
          <div className="text-center space-y-3">
            <p style={{ fontSize: '14pt', color: '#333', margin: 0 }}>
              This certifies that
            </p>

            {/* Student name - prominent */}
            <p style={{ 
              fontSize: '26pt', 
              fontStyle: 'italic',
              color: '#0A1F44',
              fontWeight: 'bold',
              borderBottom: '3px solid #C8A24C',
              paddingBottom: '8px',
              margin: '8px 20px 0 20px',
            }}>
              {certificate.student_name}
            </p>

            {/* Body text */}
            <p style={{ fontSize: '14pt', color: '#333', margin: '12px 0 0 0', lineHeight: '1.6' }}>
              has successfully completed the prescribed program of study in
            </p>

            <p style={{ fontSize: '16pt', fontWeight: 'bold', color: '#0A1F44', margin: '4px 0' }}>
              {certificate.program_name}
            </p>

            <p style={{ fontSize: '13pt', color: '#333', margin: '8px 0', lineHeight: '1.5' }}>
              and has demonstrated understanding of Biblical doctrine,<br />
              Christian leadership principles, and faithful ministry service<br />
              in accordance with the teachings of Holy Scripture.
            </p>

            {/* Scripture */}
            <p style={{ fontSize: '12pt', fontStyle: 'italic', color: '#555', margin: '12px 0 0 0' }}>
              "Be diligent to present yourself approved to God…"<br />
              <span style={{ fontSize: '11pt' }}>— 2 Timothy 2:15</span>
            </p>
          </div>

          {/* BOTTOM SECTION */}
          <div className="space-y-3">
            {/* Signature line */}
            <div style={{ 
              borderTop: '2px solid #0A1F44',
              paddingTop: '12px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '20px',
              textAlign: 'center',
            }}>
              <div>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#0A1F44', margin: 0 }}>
                  ISSUED
                </p>
                <p style={{ fontSize: '12pt', color: '#333', margin: '2px 0 0 0' }}>
                  {new Date(certificate.awarded_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#0A1F44', margin: 0 }}>
                  CERTIFICATE ID
                </p>
                <p style={{ fontSize: '12pt', fontFamily: 'monospace', fontWeight: 'bold', color: '#0A1F44', margin: '2px 0 0 0' }}>
                  {certificate.certificate_number}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#0A1F44', margin: 0 }}>
                  AUTHORIZED BY
                </p>
                <p style={{ fontSize: '12pt', color: '#333', margin: '2px 0 0 0' }}>
                  {certificate.instructor_name}
                </p>
              </div>
            </div>

            {/* Seal and verification info */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '8px',
            }}>
              {/* Official Seal - Left */}
              <div style={{ textAlign: 'center' }}>
                <OfficialSeal size="small" />
                <p style={{ fontSize: '9pt', color: '#666', margin: '4px 0 0 0' }}>
                  Official FaithLight Seal
                </p>
              </div>

              {/* Verification code - Right */}
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '9pt', color: '#666', margin: '0 0 4px 0' }}>
                  Verification Code:
                </p>
                <p style={{ fontSize: '10pt', fontFamily: 'monospace', fontWeight: 'bold', color: '#0A1F44', margin: 0 }}>
                  {certificate.verification_code?.substring(0, 16)}...
                </p>
              </div>
            </div>

            {/* Legal disclaimer */}
            <p style={{ 
              fontSize: '8pt', 
              color: '#999', 
              textAlign: 'center', 
              margin: '8px 0 0 0',
              borderTop: '1px solid #ddd',
              paddingTop: '6px',
              fontStyle: 'italic',
            }}>
              This certificate is issued by FaithLight School of Biblical Leadership as a ministry training program<br />
              and does not represent government-accredited academic degree status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Official Seal Component
 */
function OfficialSeal({ size = 'small' }) {
  const sizes = {
    small: 60,
    medium: 80,
    large: 120,
  };

  const sizePixels = sizes[size];

  return (
    <div
      style={{
        width: `${sizePixels}px`,
        height: `${sizePixels}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer circle */}
      <svg
        width={sizePixels}
        height={sizePixels}
        viewBox="0 0 100 100"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Outer ring */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="#C8A24C" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#0A1F44" strokeWidth="1" />

        {/* Outer text - Top */}
        <path id="topCurve" d="M 20,50 A 30,30 0 0,1 80,50" fill="none" />
        <text
          fontSize="9"
          fontWeight="bold"
          fill="#0A1F44"
          letterSpacing="1"
        >
          <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
            FAITHLIGHT
          </textPath>
        </text>

        {/* Outer text - Bottom */}
        <path id="bottomCurve" d="M 80,50 A 30,30 0 0,1 20,50" fill="none" />
        <text
          fontSize="8"
          fontWeight="bold"
          fill="#0A1F44"
          letterSpacing="0.5"
        >
          <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
            SCHOOL OF BIBLICAL LEADERSHIP
          </textPath>
        </text>

        {/* Center content - Cross */}
        <text
          x="50"
          y="42"
          fontSize="24"
          fill="#0A1F44"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ✝️
        </text>

        {/* Center content - Flame */}
        <text
          x="50"
          y="58"
          fontSize="16"
          fill="#C8A24C"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          🔥
        </text>

        {/* Bottom text - EST */}
        <text
          x="50"
          y="78"
          fontSize="7"
          fontWeight="bold"
          fill="#0A1F44"
          textAnchor="middle"
        >
          EST. 2026
        </text>
      </svg>
    </div>
  );
}

export { OfficialSeal };