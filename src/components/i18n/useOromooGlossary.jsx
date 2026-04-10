import omFaithLight from './om-FaithLight.json';

/**
 * Get a translated string from the Afaan Oromoo master glossary
 * @param {string} path - Dot notation path (e.g., "aiBibleGuide.title")
 * @returns {string} Translated text or path if not found
 */
export function tOm(path) {
  try {
    const keys = path.split('.');
    let value = omFaithLight;
    
    for (const key of keys) {
      value = value[key];
      if (!value) return path;
    }
    
    return typeof value === 'string' ? value : path;
  } catch {
    return path;
  }
}

/**
 * Check if a key exists in the glossary
 * @param {string} path - Dot notation path
 * @returns {boolean}
 */
export function hasOm(path) {
  try {
    const keys = path.split('.');
    let value = omFaithLight;
    
    for (const key of keys) {
      if (!value[key]) return false;
      value = value[key];
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the entire glossary reference (for reference/consistency checks)
 * @returns {object} Full Oromo glossary
 */
export function getOromooGlossary() {
  return omFaithLight.glossary;
}

export default { tOm, hasOm, getOromooGlossary };