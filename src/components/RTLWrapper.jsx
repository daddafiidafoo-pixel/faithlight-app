import React from 'react';
import { getLanguageDirection } from '@/lib/i18n';

export default function RTLWrapper({ children, language = 'en', className = '' }) {
  const direction = getLanguageDirection(language);
  const isRTL = direction === 'rtl';

  return (
    <div
      dir={direction}
      className={`${className} ${isRTL ? 'rtl' : 'ltr'}`}
      style={{
        direction: direction,
        textAlign: isRTL ? 'right' : 'left'
      }}
    >
      {children}
    </div>
  );
}