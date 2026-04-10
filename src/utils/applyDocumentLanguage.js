/**
 * Apply lang + dir to the document root on every language switch.
 * Mirrors config/languages.js RTL rules.
 */
import { applyDocumentLanguage as _apply } from '@/config/languages';

export function applyDocumentLanguage(lang) {
  _apply(lang);
}