/**
 * Premium Gating Matrix & Feature Check
 * Determines what features are available based on user entitlement status
 * 
 * Product: faithlight_premium
 * 
 * Free users: Limited AI, limited offline, limited audio
 * Premium users: Full access to Pro features, higher AI limits, unlimited offline
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    if (req.method === 'POST') {
      // Check entitlement for a specific user
      const { user_id } = await req.json();
      if (!user_id) {
        return Response.json({ error: 'user_id required' }, { status: 400 });
      }
      
      const entitlements = await base44.asServiceRole.entities.Entitlement.filter({
        user_id,
        product: 'faithlight_premium',
      });
      
      const isPremium = entitlements.length > 0 && entitlements[0].status === 'active';
      
      return Response.json({
        user_id,
        isPremium,
        features: getPremiumFeatures(isPremium),
      });
    }

    // GET: Return gating matrix documentation
    return Response.json({
      product: 'faithlight_premium',
      matrix: {
        alwaysFree: [
          { area: 'Bible Reader', feature: 'Read Bible (online)', limit: 'none' },
          { area: 'Bible Reader', feature: 'Basic navigation', limit: 'none' },
          { area: 'Search', feature: 'Keyword search (basic)', limit: 'none' },
          { area: 'Search', feature: 'Book/chapter navigation', limit: 'none' },
          { area: 'Notes', feature: 'Basic notes & highlights (online)', limit: 'none' },
          { area: 'Groups', feature: 'Browse public groups (read-only)', limit: 'none' },
          { area: 'Legal', feature: 'Privacy/Terms/Settings', limit: 'none' },
        ],
        freeWithLimits: [
          { area: 'AI Chat', feature: 'Chat with AI', limit: '5 messages/day' },
          { area: 'AI Outputs', feature: 'Short answers', limit: 'max length cap' },
          { area: 'Offline', feature: 'Download chapters', limit: '1-3 books or 10 chapters total' },
          { area: 'Audio', feature: 'Stream online', limit: 'basic TTS only' },
        ],
        premiumOnly: [
          { area: 'AI Tools', feature: 'Sermon Builder Pro', detail: 'audience + duration + packs + export' },
          { area: 'AI Tools', feature: 'Study Plan Builder Pro', detail: 'durations + difficulty + minutes/day' },
          { area: 'AI Tools', feature: 'Verse Commentary', detail: 'explanation + cross refs + theology' },
          { area: 'AI Tools', feature: 'Group AI Tools', detail: 'summarize + suggest + weekly guides' },
          { area: 'Offline', feature: 'Advanced Offline', detail: 'unlimited downloads (as allowed)' },
          { area: 'Library', feature: 'Saved AI Outputs', detail: 'save + tag + export + templates' },
          { area: 'Academy', feature: 'Academy Courses', detail: 'full access + certificates' },
          { area: 'AI Limits', feature: 'Higher AI Quotas', detail: '50 messages/day + longer responses' },
        ],
      },
      uiStrings: {
        locked: {
          en: 'Premium feature. Upgrade to unlock.',
          om: 'Tajaajila Premium dha. Fooyyessi itti fayyadamuuf.',
        },
        upgradeButton: {
          en: 'Upgrade',
          om: 'Fooyyessi',
        },
        notNow: {
          en: 'Not now',
          om: 'Amma miti',
        },
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getPremiumFeatures(isPremium) {
  return {
    // Always free
    bibleReader: true,
    basicSearch: true,
    basicNotesHighlights: true,
    publicGroupsBrowse: true,
    legalSettings: true,

    // Free with limits
    aiChat: {
      enabled: true,
      messagesPerDay: isPremium ? 50 : 5,
      maxResponseLength: isPremium ? 'unlimited' : 'capped',
    },

    // Offline
    offline: {
      enabled: true,
      maxDownload: isPremium ? 'unlimited' : '10 chapters',
      advancedOffline: isPremium,
    },

    // Audio
    audio: {
      streamOnline: true,
      textToSpeech: true,
      ttsQuality: isPremium ? 'premium' : 'basic',
    },

    // Premium only
    sermonBuilderPro: isPremium,
    studyPlanBuilderPro: isPremium,
    verseCommentary: isPremium,
    groupAITools: isPremium,
    savedAIOutputsLibrary: isPremium,
    academyCourses: isPremium,
    advancedCommentary: isPremium,
    crossReferences: isPremium,
    theologicalInsights: isPremium,
  };
}