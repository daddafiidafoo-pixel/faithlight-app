import React from 'react';

/**
 * VerseShareCard
 * Visual card for sharing — verse text, reference, and app link
 * Used to generate social image via html2canvas
 */
export default function VerseShareCard({ 
  verseText, 
  reference, 
  appUrl = 'https://faithlight.app' 
}) {
  return (
    <div
      id="verse-share-card"
      style={{
        width: '1080px',
        height: '1350px',
        background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7EEF 100%)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: '"Inter", sans-serif',
        color: '#ffffff',
        boxSizing: 'border-box',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
      }}
    >
      {/* Top spacer */}
      <div />

      {/* Verse content */}
      <div style={{ maxWidth: '900px' }}>
        <p
          style={{
            fontSize: '48px',
            fontWeight: '600',
            lineHeight: '1.6',
            marginBottom: '40px',
            fontStyle: 'italic',
          }}
        >
          "{verseText}"
        </p>

        <p
          style={{
            fontSize: '32px',
            fontWeight: '500',
            opacity: '0.95',
          }}
        >
          {reference}
        </p>
      </div>

      {/* Bottom branding */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <p
          style={{
            fontSize: '24px',
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}
        >
          FaithLight
        </p>
        <p
          style={{
            fontSize: '18px',
            opacity: '0.85',
          }}
        >
          {appUrl}
        </p>
      </div>
    </div>
  );
}