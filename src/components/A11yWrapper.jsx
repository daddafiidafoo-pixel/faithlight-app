import React, { useEffect } from 'react';

export default function A11yWrapper({ children }) {
  useEffect(() => {
    const skipLink = document.querySelector('#skip-to-main');
    if (!skipLink) return;
    const handleClick = (e) => {
      e.preventDefault();
      const main = document.getElementById('main-content') || document.querySelector('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: false });
      }
    };
    skipLink.addEventListener('click', handleClick);
    return () => skipLink.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      {/* Persistent skip link — visible on keyboard focus, hidden otherwise */}
      <a
        id="skip-to-main"
        href="#main-content"
        className="skip-to-content"
      >
        Skip to main content
      </a>
      <div id="app-root">
        {children}
      </div>
    </>
  );
}