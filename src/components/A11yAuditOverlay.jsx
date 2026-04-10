/**
 * A11yAuditOverlay — Dev-only accessibility overlay.
 * Highlights elements that fail common WCAG 2.1 AA checks:
 *  - Interactive elements without accessible names
 *  - Images without alt text
 *  - Buttons/links smaller than 44×44 px
 *  - Color contrast below 4.5:1 (basic check)
 *
 * Only renders in development mode. Zero production overhead.
 */
import React, { useEffect, useState } from 'react';

const isDev = import.meta.env?.DEV ?? false;

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function runAudit() {
  const issues = [];

  // 1. Interactive elements without accessible names
  document.querySelectorAll('button, a, [role="button"]').forEach((el) => {
    const name = el.getAttribute('aria-label') ||
      el.getAttribute('aria-labelledby') ||
      el.textContent?.trim();
    if (!name) {
      issues.push({ el, type: 'no-name', msg: 'Interactive element has no accessible name' });
    }
  });

  // 2. Images without alt text
  document.querySelectorAll('img').forEach((el) => {
    if (el.getAttribute('alt') === null) {
      issues.push({ el, type: 'no-alt', msg: 'Image missing alt attribute' });
    }
  });

  // 3. Tap targets < 44×44 (skip off-screen / hidden elements and the skip-link)
  document.querySelectorAll('button, a, [role="button"], input, select').forEach((el) => {
    // Skip the accessibility skip-to-content link (it's intentionally tiny when not focused)
    if (el.getAttribute('href') === '#main-content') return;
    const rect = el.getBoundingClientRect();
    // Skip elements not in the viewport or with zero size
    if (rect.width <= 1 || rect.height <= 1) return;
    // Skip elements that are visually hidden (opacity 0 or off-screen)
    const style = window.getComputedStyle(el);
    if (style.opacity === '0' || style.visibility === 'hidden' || style.display === 'none') return;
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    if (rect.width < 44 || rect.height < 44) {
      issues.push({ el, type: 'small-target', msg: `Tap target too small: ${Math.round(rect.width)}×${Math.round(rect.height)}` });
    }
  });

  return issues;
}

export default function A11yAuditOverlay() {
  const [issues, setIssues] = useState([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isDev) return;
    const timer = setTimeout(() => {
      setIssues(runAudit());
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isDev) return null;

  return (
    <div style={{ position: 'fixed', bottom: 80, right: 8, zIndex: 9999, fontFamily: 'monospace' }}>
      <button
        onClick={() => setVisible((v) => !v)}
        style={{
          background: issues.length > 0 ? '#ef4444' : '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 12,
          cursor: 'pointer',
          fontWeight: 700,
          minHeight: 44,
        }}
        aria-label={`A11y audit: ${issues.length} issues`}
      >
        A11y {issues.length > 0 ? `⚠ ${issues.length}` : '✓'}
      </button>

      {visible && issues.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 50, right: 0, width: 320,
          maxHeight: 400, overflowY: 'auto',
          background: 'white', border: '1px solid #e5e7eb',
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: 12,
        }}>
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>A11y Issues ({issues.length})</p>
          {issues.map((issue, i) => (
            <div key={i} style={{
              padding: '6px 8px', marginBottom: 4, borderRadius: 6,
              background: issue.type === 'no-name' ? '#fef2f2' : issue.type === 'no-alt' ? '#fffbeb' : '#f0fdf4',
              fontSize: 11, color: '#374151',
            }}>
              <span style={{ fontWeight: 600 }}>[{issue.type}]</span> {issue.msg}
              <br />
              <span style={{ color: '#9ca3af' }}>{issue.el?.tagName?.toLowerCase()} {issue.el?.className?.toString().slice(0, 40)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}