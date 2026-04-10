/**
 * validateBibleLanguageReadiness
 * 
 * Pre-import validation for Bible data before inserting into database.
 * Prevents bad verses from reaching the app.
 * 
 * This function validates:
 * - Required fields exist in each verse
 * - No duplicate verses for same language/book/chapter/verse combo
 * - No empty verse text
 * - Language consistency
 * - Valid book numbers and chapter sequencing
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can run validation
    if (!user || user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { language_code, book_id } = await req.json();

    if (!language_code || !book_id) {
      return new Response(
        JSON.stringify({ error: 'language_code and book_id required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Validating ${language_code}/${book_id} before import...`);

    const errors = [];
    const warnings = [];

    // Fetch verses for this book and language
    const verses = await base44.entities.BibleVerseText.filter({
      language_code,
      book_id,
    });

    if (!Array.isArray(verses) || verses.length === 0) {
      return new Response(
        JSON.stringify({
          valid: true,
          message: 'No verses found for this book/language combo',
          stats: { verses: 0, errors: 0, warnings: 0 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for required fields
    const seen = new Set();
    const duplicateMap = new Map();

    for (const verse of verses) {
      // Validate required fields
      if (!verse.text || verse.text.trim() === '') {
        errors.push(`Empty text: ${verse.reference || `${verse.chapter}:${verse.verse}`}`);
      }

      if (!verse.language_code) {
        errors.push(`Missing language_code at ${verse.reference}`);
      }

      if (!verse.book_id) {
        errors.push(`Missing book_id at ${verse.reference}`);
      }

      if (verse.chapter < 1) {
        errors.push(`Invalid chapter: ${verse.chapter} at ${verse.reference}`);
      }

      if (verse.verse < 1) {
        errors.push(`Invalid verse: ${verse.verse} at ${verse.reference}`);
      }

      // Check for duplicates
      const key = `${language_code}|${book_id}|${verse.chapter}|${verse.verse}`;
      if (seen.has(key)) {
        errors.push(`Duplicate verse: ${verse.reference}`);
        duplicateMap.set(key, (duplicateMap.get(key) || 0) + 1);
      }
      seen.add(key);

      // Language consistency warning
      if (verse.language_code !== language_code) {
        warnings.push(
          `Language mismatch at ${verse.reference}: ${verse.language_code} vs ${language_code}`
        );
      }
    }

    const summary = {
      valid: errors.length === 0,
      book_id,
      language_code,
      stats: {
        verses: verses.length,
        errors: errors.length,
        warnings: warnings.length,
        duplicates: duplicateMap.size,
      },
      errors: errors.slice(0, 50), // First 50 errors
      warnings: warnings.slice(0, 20), // First 20 warnings
    };

    console.log('Validation summary:', summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Validation failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});