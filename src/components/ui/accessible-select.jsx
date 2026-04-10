import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { BottomSheet } from './bottom-sheet';
import { ChevronDown, Check } from 'lucide-react';

/**
 * AccessibleSelect — native-feel dropdown for all platforms.
 *
 * Desktop : styled <select> (native keyboard + screen reader support)
 * Mobile  : BottomSheet with listbox role + full keyboard nav
 *
 * WCAG 2.1 AA compliant:
 * - Min 44×44px tap targets
 * - aria-label / aria-labelledby
 * - role="listbox" + role="option" + aria-selected
 * - Focus visible ring
 * - Keyboard: Enter/Space = open, Esc = close, Arrow keys = navigate
 */
export function AccessibleSelect({
  value,
  onValueChange,
  options = [],
  label,
  placeholder = 'Select…',
  disabled = false,
  name,
  className = '',
  compact = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef(null);
  const triggerRef = useRef(null);
  const labelId = useId();
  const listId = useId();

  // SSR-safe mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Set focused index when opening
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((o) => o.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, options]);

  // Focus the focused option in the list
  useEffect(() => {
    if (isOpen && listRef.current && focusedIndex >= 0) {
      const btns = listRef.current.querySelectorAll('[role="option"]');
      btns[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && options[focusedIndex]) {
          onValueChange(options[focusedIndex].value);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      default:
        break;
    }
  }, [isOpen, focusedIndex, options, onValueChange]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  const heightClass = 'min-h-[44px]';

  // ── Desktop: native <select> ──────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && (
          <label id={labelId} htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={disabled}
          aria-labelledby={label ? labelId : undefined}
          aria-label={!label ? placeholder : undefined}
          className={`${heightClass} w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
        >
          {!value && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // ── Mobile: BottomSheet with listbox ─────────────────────────────────────
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span id={labelId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      )}

      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? labelId : undefined}
        aria-label={!label ? placeholder : undefined}
        aria-controls={listId}
        className={`flex items-center justify-between ${heightClass} w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors`}
      >
        <span className={`text-sm ${value ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <BottomSheet
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); triggerRef.current?.focus(); }}
        title={label || placeholder}
      >
        <div
          id={listId}
          ref={listRef}
          role="listbox"
          aria-labelledby={label ? labelId : undefined}
          aria-label={!label ? placeholder : undefined}
          className="space-y-1.5"
        >
          {options.map((opt, idx) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={idx === focusedIndex ? 0 : -1}
                onKeyDown={handleKeyDown}
                onClick={() => {
                  onValueChange(opt.value);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                onFocus={() => setFocusedIndex(idx)}
                className={`w-full min-h-[44px] px-4 py-3 text-left rounded-xl text-sm font-medium transition-colors flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}