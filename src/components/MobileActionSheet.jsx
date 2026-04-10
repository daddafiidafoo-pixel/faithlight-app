/**
 * MobileActionSheet
 * Bottom sheet selector for mobile, standard Select on desktop
 * Respects safe area, supports swipe-to-dismiss, preserves selected state
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MobileActionSheet({
  value,
  onValueChange,
  options = [],
  label = 'Select',
  placeholder = 'Choose an option',
  renderOption = (opt) => opt.label || opt,
}) {
  const [open, setOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches?.[0]?.clientY || 0);
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches?.[0]?.clientY || 0;
    // Swipe down > 100px = dismiss
    if (touchStart && touchEnd - touchStart > 100) {
      setOpen(false);
    }
  };

  const selectedOpt = options.find(opt => (opt.value || opt) === value);

  // Desktop: use standard Select
  if (!isMobile) {
    return (
      <div>
        {label && <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>}
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt, idx) => (
              <SelectItem key={idx} value={opt.value || opt}>
                {renderOption(opt)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Mobile: bottom sheet
  return (
    <div>
      {label && <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>}
      
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-left text-sm text-gray-900 hover:border-indigo-400 transition-colors"
      >
        <span>{renderOption(selectedOpt) || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {/* Backdrop + Bottom Sheet */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Bottom Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Handle + Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Drag handle indicator */}
            <div className="flex justify-center py-2 pb-0">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Options list */}
            <div className="overflow-y-auto flex-1 px-4 py-2 space-y-1">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onValueChange(opt.value || opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${
                    (opt.value || opt) === value
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>✓ {renderOption(opt)}</span>
                </button>
              ))}
            </div>

            {/* Footer action */}
            <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setOpen(false)}
                className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}