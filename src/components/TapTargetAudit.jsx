import React, { useEffect, useState } from 'react';

/**
 * TapTargetAudit - Development utility to identify tap targets < 44×44px
 * Run in development mode to find accessibility violations
 * Add query param ?debug-a11y=true to enable
 */
export default function TapTargetAudit() {
  const [violations, setViolations] = useState([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check URL for debug flag
    const params = new URLSearchParams(window.location.search);
    const isDebugMode = params.get('debug-a11y') === 'true';
    setEnabled(isDebugMode);

    if (!isDebugMode) return;

    // Run audit on component mount and after delay for dynamic content
    const runAudit = () => {
      const violations = [];
      const selectors = [
        'button',
        'a',
        '[role="button"]',
        '[role="tab"]',
        '[role="switch"]',
        '[role="option"]',
        'input[type="checkbox"]',
        'input[type="radio"]',
        'select',
      ];

      document.querySelectorAll(selectors.join(', ')).forEach((el) => {
        // Skip if hidden
        if (el.offsetParent === null) return;

        // Skip exceptions
        if (
          el.matches('p a, li a, span a, footer a') ||
          el.classList.contains('sr-only')
        ) {
          return;
        }

        const rect = el.getBoundingClientRect();
        const { width, height } = rect;

        if (width < 44 || height < 44) {
          violations.push({
            element: el.tagName,
            text: el.textContent.substring(0, 50),
            width: Math.round(width),
            height: Math.round(height),
            className: el.className,
            selector: getSelector(el),
          });

          // Visual highlight
          el.style.outline = '3px solid red';
          el.style.outlineOffset = '2px';
        }
      });

      setViolations(violations);
    };

    runAudit();
    const timer = setTimeout(runAudit, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!enabled || violations.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 bg-red-900 text-white p-4 rounded-lg shadow-lg max-h-64 overflow-y-auto"
      role="alert"
      aria-live="polite"
    >
      <div className="font-bold mb-2">
        ⚠️ Tap Target Violations ({violations.length})
      </div>
      <div className="text-sm space-y-2">
        {violations.map((v, i) => (
          <div key={i} className="bg-red-800 p-2 rounded">
            <div>
              <strong>{v.element}</strong> - {v.width}×{v.height}px
            </div>
            <div className="text-red-200">
              {v.text || '(empty)'}
            </div>
            <div className="text-red-300 text-xs font-mono">
              {v.selector}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-red-200">
        Elements highlighted in red. Make all interactive elements ≥44×44px.
      </div>
    </div>
  );
}

/**
 * Generate CSS selector for element
 */
function getSelector(el) {
  if (el.id) return `#${el.id}`;
  if (el.className) {
    const classes = el.className.split(' ').join('.');
    return `.${classes}`;
  }
  return el.tagName.toLowerCase();
}