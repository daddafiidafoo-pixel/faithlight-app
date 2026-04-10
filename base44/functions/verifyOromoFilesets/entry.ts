/**
 * Automated Oromo Fileset Verification Test
 * 
 * Tests Bible Brain API responses for Oromo (om) text and audio filesets.
 * Call from backend to verify HAEBSE and HAEBSEDA before enabling in production.
 * 
 * Usage:
 * const results = await base44.functions.invoke('verifyOromoFilesets', {});
 * 
 * Returns: { success: boolean, text: TestResult, audio: TestResult, enabled: boolean }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TESTS = {
  TEXT_FILESET: 'HAEBSE',
  AUDIO_FILESET: 'HAEBSEDA',
  TEST_BOOKS: ['PSA', 'MAT', 'JHN', 'GEN'],
  TEST_CHAPTERS: [23, 25, 1, 3],
};

/**
 * Test a single fileset by attempting to fetch a chapter
 */
async function testFileset(filesetId, bookId, chapter, apiKey) {
  if (!filesetId || !apiKey) {
    return {
      fileset: filesetId,
      success: false,
      error: 'Missing fileset ID or API key',
      timestamp: new Date().toISOString(),
    };
  }

  const url = `https://4.dbt.io/api/bibles/filesets/${filesetId}/${bookId}/${chapter}?key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        fileset: filesetId,
        success: false,
        status: response.status,
        error: `HTTP ${response.status} ${response.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }

    const data = await response.json();
    const hasData = Array.isArray(data) && data.length > 0;

    if (!hasData) {
      return {
        fileset: filesetId,
        success: false,
        error: 'Empty response array',
        timestamp: new Date().toISOString(),
      };
    }

    // Extract sample data
    const sample = data[0];

    return {
      fileset: filesetId,
      success: true,
      verseCount: data.length,
      sampleText:
        sample.text?.substring(0, 80) ||
        sample.path?.substring(0, 80) ||
        JSON.stringify(sample).substring(0, 80),
      sampleStructure: Object.keys(sample),
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      fileset: filesetId,
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Run comprehensive fileset tests
 */
async function runTests(apiKey) {
  const results = {
    text: {
      fileset: TESTS.TEXT_FILESET,
      tests: [],
      overallSuccess: false,
      timestamp: new Date().toISOString(),
    },
    audio: {
      fileset: TESTS.AUDIO_FILESET,
      tests: [],
      overallSuccess: false,
      timestamp: new Date().toISOString(),
    },
  };

  // Test text fileset with multiple books
  for (let i = 0; i < TESTS.TEST_BOOKS.length; i++) {
    const book = TESTS.TEST_BOOKS[i];
    const chapter = TESTS.TEST_CHAPTERS[i];

    const result = await testFileset(TESTS.TEXT_FILESET, book, chapter, apiKey);
    results.text.tests.push(result);

    if (!result.success) {
      console.warn(`Text test failed for ${book} ${chapter}:`, result.error);
    }
  }

  // Test audio fileset with multiple books
  for (let i = 0; i < TESTS.TEST_BOOKS.length; i++) {
    const book = TESTS.TEST_BOOKS[i];
    const chapter = TESTS.TEST_CHAPTERS[i];

    const result = await testFileset(TESTS.AUDIO_FILESET, book, chapter, apiKey);
    results.audio.tests.push(result);

    if (!result.success) {
      console.warn(`Audio test failed for ${book} ${chapter}:`, result.error);
    }
  }

  // Calculate overall success (at least 2/4 tests must pass)
  const textPassCount = results.text.tests.filter((t) => t.success).length;
  const audioPassCount = results.audio.tests.filter((t) => t.success).length;

  results.text.overallSuccess = textPassCount >= 2;
  results.audio.overallSuccess = audioPassCount >= 2;

  return results;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin check: Only admins can trigger verification
    if (user?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const apiKey = Deno.env.get('BIBLE_BRAIN_API_KEY');
    if (!apiKey) {
      return Response.json(
        { error: 'BIBLE_BRAIN_API_KEY not set' },
        { status: 500 }
      );
    }

    console.log('[verifyOromoFilesets] Starting Oromo fileset verification...');

    // Run tests
    const testResults = await runTests(apiKey);

    console.log('[verifyOromoFilesets] Text tests:', testResults.text);
    console.log('[verifyOromoFilesets] Audio tests:', testResults.audio);

    // Determine if filesets should be enabled
    const shouldEnableText = testResults.text.overallSuccess;
    const shouldEnableAudio = testResults.audio.overallSuccess;

    // Log recommendation
    const recommendation = {
      enableText: shouldEnableText,
      enableAudio: shouldEnableAudio,
      reason: [],
    };

    if (shouldEnableText) {
      recommendation.reason.push(`✅ Text fileset ${TESTS.TEXT_FILESET} verified`);
    } else {
      recommendation.reason.push(
        `❌ Text fileset ${TESTS.TEXT_FILESET} failed verification`
      );
    }

    if (shouldEnableAudio) {
      recommendation.reason.push(
        `✅ Audio fileset ${TESTS.AUDIO_FILESET} verified`
      );
    } else {
      recommendation.reason.push(
        `❌ Audio fileset ${TESTS.AUDIO_FILESET} failed verification`
      );
    }

    console.log('[verifyOromoFilesets] Recommendation:', recommendation);

    // Update config in database if enabled
    if (shouldEnableText || shouldEnableAudio) {
      try {
        const existing = await base44.asServiceRole.entities.BibleLanguage.filter(
          { language_code: 'om' },
          null,
          1
        );

        if (existing && existing.length > 0) {
          const configUpdate = {
            is_active: shouldEnableText || shouldEnableAudio,
            audio_fileset_id: shouldEnableAudio
              ? TESTS.AUDIO_FILESET
              : null,
          };

          await base44.asServiceRole.entities.BibleLanguage.update(
            existing[0].id,
            configUpdate
          );

          console.log(
            '[verifyOromoFilesets] Updated BibleLanguage config for Oromo'
          );
        }
      } catch (err) {
        console.error(
          '[verifyOromoFilesets] Failed to update BibleLanguage config:',
          err.message
        );
      }
    }

    // Return full report
    return Response.json({
      success:
        testResults.text.overallSuccess || testResults.audio.overallSuccess,
      timestamp: new Date().toISOString(),
      testResults,
      recommendation,
      nextSteps: shouldEnableText || shouldEnableAudio
        ? [
            '✅ Verification passed',
            'Update bibleBrainFilesetsConfig.js with new enabled status',
            'Update FILESET_REFERENCE.md with ✅ status',
            'Test AudioBiblePage with Oromo selected',
            'Deploy to production',
          ]
        : [
            '❌ Verification failed',
            'Check API key validity',
            'Review Bible Brain account for Oromo filesets',
            'Update filesets or disable Oromo in config',
          ],
    });
  } catch (error) {
    console.error('[verifyOromoFilesets] Unhandled error:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
});