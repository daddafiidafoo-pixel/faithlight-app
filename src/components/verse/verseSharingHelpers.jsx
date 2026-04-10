import { VERSE_SHARING_CONFIG } from './verseSharingConfig';

/**
 * Build verse share payload with all metadata
 */
export function buildVerseSharePayload({
  reference,
  text,
  language = 'en',
  template = 'clean-light',
  format = 'square'
}) {
  return {
    reference,
    text,
    language,
    template,
    format,
    appName: VERSE_SHARING_CONFIG.branding.appName,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get template by key
 */
export function getTemplate(key) {
  return VERSE_SHARING_CONFIG.templates.find(t => t.key === key) || VERSE_SHARING_CONFIG.templates[0];
}

/**
 * Get format by key
 */
export function getFormat(key) {
  return VERSE_SHARING_CONFIG.formats.find(f => f.key === key) || VERSE_SHARING_CONFIG.formats[0];
}

/**
 * Get localized text from config
 */
export function getLocalizedText(key, language = 'en') {
  const action = VERSE_SHARING_CONFIG.actions[key];
  return action?.[language] || action?.['en'] || key;
}

/**
 * Get all supported languages
 */
export function getSupportedLanguages() {
  return VERSE_SHARING_CONFIG.supportedLanguages;
}

/**
 * Get all templates
 */
export function getAllTemplates() {
  return VERSE_SHARING_CONFIG.templates;
}

/**
 * Get all formats
 */
export function getAllFormats() {
  return VERSE_SHARING_CONFIG.formats;
}

/**
 * Generate image metadata for canvas rendering
 */
export function generateImageMetadata({ template, format, language }) {
  const tmpl = getTemplate(template);
  const fmt = getFormat(format);

  return {
    template: tmpl,
    format: fmt,
    language,
    canvas: {
      width: fmt.width,
      height: fmt.height
    },
    styling: {
      backgroundColor: tmpl.background.value,
      textColor: tmpl.textColor,
      accentColor: tmpl.accentColor,
      showBorder: tmpl.showBorder,
      showShadow: tmpl.showShadow,
      alignment: tmpl.alignment
    }
  };
}