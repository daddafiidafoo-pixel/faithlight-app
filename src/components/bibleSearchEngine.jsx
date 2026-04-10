/**
 * Bible Search Engine - Fast, intelligent search with relevance ranking
 */

// Tokenize text and remove stop words for better matching
const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'be']);

const tokenize = (text) => {
  return text
    .toLowerCase()
    .match(/\b[\w']+\b/g) || [];
};

const removeStopWords = (tokens) => {
  return tokens.filter(t => !STOP_WORDS.has(t));
};

// Calculate relevance score for a verse based on query
const calculateRelevance = (verseText, queryTokens, queryType = 'keyword') => {
  const verseTokens = tokenize(verseText);
  const verseTokensNoStops = removeStopWords(verseTokens);
  
  let score = 0;
  let matches = 0;

  queryTokens.forEach(queryToken => {
    // Exact match (highest priority)
    if (verseTokens.includes(queryToken)) {
      score += 10;
      matches++;
    }
    // Partial match (lower priority)
    else if (verseTokensNoStops.some(t => t.includes(queryToken))) {
      score += 3;
      matches++;
    }
  });

  // Boost score based on word position and density
  if (matches > 0) {
    score += matches * 2; // Bonus for multiple matches
  }

  return score;
};

// Main search function
export const searchVerses = (verses, query) => {
  if (!query || !query.trim()) return verses;

  const queryTokens = removeStopWords(tokenize(query));
  if (queryTokens.length === 0) return verses;

  // Score and filter verses
  const scored = verses
    .map(v => ({
      ...v,
      relevanceScore: calculateRelevance(v.text, queryTokens)
    }))
    .filter(v => v.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return scored;
};

// Advanced search with multiple filters
export const advancedSearch = (verses, filters = {}) => {
  let results = verses;

  // Filter by book
  if (filters.book) {
    results = results.filter(v => v.book === filters.book);
  }

  // Filter by chapter range
  if (filters.startChapter !== undefined) {
    const start = filters.startChapter;
    const end = filters.endChapter !== undefined ? filters.endChapter : start;
    results = results.filter(v => v.chapter >= start && v.chapter <= end);
  }

  // Filter by verse range
  if (filters.startVerse !== undefined) {
    const start = filters.startVerse;
    const end = filters.endVerse !== undefined ? filters.endVerse : 9999;
    results = results.filter(v => v.verse >= start && v.verse <= end);
  }

  // Filter by translation
  if (filters.translation) {
    results = results.filter(v => v.translation === filters.translation);
  }

  // Keyword search with relevance ranking
  if (filters.keyword && filters.keyword.trim()) {
    results = searchVerses(results, filters.keyword);
  }

  return results;
};

// Deduplication and optimization
export const optimizeResults = (verses) => {
  const seen = new Set();
  return verses.filter(v => {
    const key = `${v.book}:${v.chapter}:${v.verse}:${v.translation}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Fuzzy matching for typos and variations
export const fuzzyMatch = (query, target, threshold = 0.7) => {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  if (queryLower === targetLower) return 1;
  if (targetLower.includes(queryLower)) return 0.9;

  // Levenshtein-inspired simple distance
  const maxLen = Math.max(queryLower.length, targetLower.length);
  const matches = [...queryLower].filter(c => targetLower.includes(c)).length;
  const similarity = matches / maxLen;

  return similarity >= threshold ? similarity : 0;
};

// Search with fuzzy matching for typo tolerance
export const fuzzySearch = (verses, query, threshold = 0.7) => {
  if (!query || !query.trim()) return verses;

  const queryTokens = removeStopWords(tokenize(query));
  if (queryTokens.length === 0) return verses;

  const scored = verses
    .map(v => {
      const verseTokens = tokenize(v.text);
      let score = 0;

      queryTokens.forEach(queryToken => {
        const maxMatch = Math.max(
          ...verseTokens.map(t => fuzzyMatch(queryToken, t, threshold))
        );
        score += maxMatch * 10;
      });

      return { ...v, fuzzyScore: score };
    })
    .filter(v => v.fuzzyScore > 0)
    .sort((a, b) => b.fuzzyScore - a.fuzzyScore);

  return scored;
};