import React from 'react';

export default function CertificateBasicLayout({ certificate }) {
  return (
    <div className="w-full bg-white" style={{ aspectRatio: '8.5/5.5' }}>
      {/* A4 Landscape Professional Layout - Basic Version */}
      <div className="w-full h-full flex flex-col relative overflow-hidden" style={{ 
        padding: '40px 64px',
        fontFamily: 'Garamond, Georgia, serif',
        backgroundColor: '#fafaf8',
      }}>
        
        {/* Minimal watermark */}
        <div className="absolute inset-0 opacity-3 flex items-center justify-center pointer-events-none">
          <div className="text-9xl">📖</div>
        </div>

        {/* Content container */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          
          {/* TOP SECTION */}
          <div className="text-center space-y-1">
            <h1 style={{ 
              fontSize: '20pt', 
              fontWeight: 'bold',
              color: '#333',
              letterSpacing: '1px',
              margin: 0,
            }}>
              FAITHLIGHT SCHOOL OF BIBLICAL LEADERSHIP
            </h1>
            
            <p style={{ 
              fontSize: '11pt', 
              color: '#666',
              margin: 0,
            }}>
              Ministry Training Program
            </p>

            {/* Simple divider */}
            <div style={{ 
              height: '1px', 
              backgroundColor: '#999',
              width: '40px',
              margin: '8px auto',
            }} />
          </div>

          {/* TITLE */}
          <div className="text-center">
            <h2 style={{ 
              fontSize: '22pt', 
              fontWeight: 'bold',
              color: '#333',
              margin: '8px 0',
            }}>
              CERTIFICATE OF COMPLETION
            </h2>
          </div>

          {/* MIDDLE SECTION - Body */}
          <div className="text-center space-y-2">
            <p style={{ fontSize: '13pt', color: '#555', margin: 0 }}>
              This certifies that
            </p>

            {/* Student name */}
            <p style={{ 
              fontSize: '24pt', 
              color: '#333',
              fontWeight: 'bold',
              borderBottom: '2px solid #999',
              paddingBottom: '6px',
              margin: '4px 16px 0 16px',
            }}>
              {certificate.student_name}
            </p>

            {/* Body text */}
            <p style={{ fontSize: '13pt', color: '#555', margin: '8px 0 0 0', lineHeight: '1.4' }}>
              has successfully completed the course of study in
            </p>

            <p style={{ fontSize: '15pt', fontWeight: 'bold', color: '#333', margin: '2px 0' }}>
              {certificate.program_name}
            </p>

            <p style={{ fontSize: '12pt', color: '#555', margin: '6px 0', lineHeight: '1.4' }}>
              and has demonstrated commitment to Christian learning<br />
              and spiritual growth through FaithLight School of Biblical Leadership.
            </p>
          </div>

          {/* BOTTOM SECTION */}
          <div className="space-y-2">
            {/* Signature line */}
            <div style={{ 
              borderTop: '1px solid #999',
              paddingTop: '8px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              textAlign: 'center',
            }}>
              <div>
                <p style={{ fontSize: '11pt', color: '#666', margin: 0 }}>Date</p>
                <p style={{ fontSize: '12pt', color: '#333', margin: '2px 0 0 0' }}>
                  {new Date(certificate.awarded_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11pt', color: '#666', margin: 0 }}>Digital Signature</p>
                <p style={{ fontSize: '12pt', fontStyle: 'italic', color: '#333', margin: '2px 0 0 0' }}>
                  FaithLight
                </p>
              </div>
            </div>

            {/* Status line */}
            <p style={{ 
              fontSize: '9pt', 
              color: '#999', 
              textAlign: 'center', 
              margin: '4px 0 0 0',
              fontStyle: 'italic',
            }}>
              Non-Verified Completion Certificate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}