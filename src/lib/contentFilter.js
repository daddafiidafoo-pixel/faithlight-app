// Basic content filtering for moderation
const BANNED_WORDS = [
  'hate', 'harmful', 'abuse', 'violence', 'illegal',
  'spam', 'scam', 'fraud', 'exploit', 'explicit'
];

const SPAM_PATTERNS = [
  /(.)\1{4,}/g, // Excessive repetition
  /https?:\/\/[^\s]+/g, // URLs
  /[A-Z]{5,}/g, // Excessive caps
];

export function filterContent(text) {
  if (!text) return { isClean: true, issues: [] };
  
  const issues = [];
  const lowerText = text.toLowerCase();

  // Check for banned words
  BANNED_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      issues.push(`Contains banned word: "${word}"`);
    }
  });

  // Check for spam patterns
  if (SPAM_PATTERNS.some(pattern => pattern.test(text))) {
    issues.push('Contains spam patterns');
  }

  // Check text length (too short = likely spam)
  if (text.trim().length < 5) {
    issues.push('Text too short');
  }

  return {
    isClean: issues.length === 0,
    issues,
  };
}

export function shouldAutoFlag(text) {
  const { isClean, issues } = filterContent(text);
  return !isClean && issues.length > 1;
}