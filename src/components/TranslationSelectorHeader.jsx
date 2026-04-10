import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';

const TRANSLATIONS = [
  { code: 'WEB', name: 'World English Bible', description: 'Clear modern English' },
  { code: 'ASV', name: 'American Standard Version', description: 'Classic formal English' }
];

export default function TranslationSelectorHeader({ 
  currentTranslation, 
  onTranslationChange,
  isDarkMode = false 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const bgColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';
  const hoverBg = isDarkMode ? '#2A3A2A' : '#F8F8F8';
  const selectedBg = isDarkMode ? '#2A3A2A' : '#F0F8F0';

  const handleSelect = (code) => {
    onTranslationChange(code);
    localStorage.setItem('preferred_translation', code);
    setIsOpen(false);
  };

  return (
    <div>
      {/* Header Chip Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full h-8 px-3 gap-2 text-xs font-medium"
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          color: textColor
        }}
      >
        {currentTranslation}
        <ChevronDown className="w-3 h-3" />
      </Button>

      {/* Bottom Sheet Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Sheet Modal */}
      {isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl shadow-2xl max-w-2xl mx-auto w-full"
          style={{ backgroundColor: bgColor }}
        >
          <div className="p-6">
            {/* Handle Bar */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: borderColor }} />
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold mb-6" style={{ color: textColor }}>
              Choose Bible Translation
            </h2>

            {/* Translation Options */}
            <div className="space-y-2">
              {TRANSLATIONS.map(translation => (
                <button
                  key={translation.code}
                  onClick={() => handleSelect(translation.code)}
                  className="w-full p-4 rounded-lg border-2 transition-all text-left"
                  style={{
                    backgroundColor: currentTranslation === translation.code ? selectedBg : bgColor,
                    borderColor: currentTranslation === translation.code ? primaryColor : borderColor,
                    borderWidth: '2px',
                    hover: { backgroundColor: hoverBg }
                  }}
                  onMouseEnter={(e) => {
                    if (currentTranslation !== translation.code) {
                      e.currentTarget.style.backgroundColor = hoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentTranslation !== translation.code) {
                      e.currentTarget.style.backgroundColor = bgColor;
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" style={{ color: textColor }}>
                          {translation.code}
                        </span>
                        {currentTranslation === translation.code && (
                          <Check className="w-4 h-4" style={{ color: primaryColor }} />
                        )}
                      </div>
                      <p className="text-xs mt-2" style={{ color: textColor }}>
                        {translation.name}
                      </p>
                      <p className="text-xs mt-1" style={{ color: isDarkMode ? '#A0A0A0' : '#6E6E6E' }}>
                        {translation.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Close Hint */}
            <div className="mt-6 pt-4 border-t" style={{ borderColor: borderColor }}>
              <p className="text-xs text-center" style={{ color: isDarkMode ? '#A0A0A0' : '#6E6E6E' }}>
                Tap outside or select a translation to close
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}