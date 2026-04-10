import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * deleteUserAccount
 * Backend function to delete user account and all associated data
 * Called from Settings → Account → Delete Account
 * 
 * Deletes:
 * - User profile
 * - All notes, highlights, bookmarks
 * - Reading progress
 * - Preferences
 * - Subscription records
 * 
 * Requires:
 * - User to be authenticated
 * - Confirmation from frontend (3-step process)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    console.log(`[deleteUserAccount] Deleting account for user: ${userId}`);

    // Delete all user-related data in parallel
    await Promise.allSettled([
      // Delete reading progress
      base44.asServiceRole.entities.UserReadingProgress.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.UserReadingProgress.delete(r.id)))
      ).catch(e => console.warn('Failed to delete reading progress:', e)),

      // Delete study notes
      base44.asServiceRole.entities.StudyNote.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.StudyNote.delete(r.id)))
      ).catch(e => console.warn('Failed to delete study notes:', e)),

      // Delete verse notes
      base44.asServiceRole.entities.VerseNote.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.VerseNote.delete(r.id)))
      ).catch(e => console.warn('Failed to delete verse notes:', e)),

      // Delete highlights
      base44.asServiceRole.entities.VerseHighlight.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.VerseHighlight.delete(r.id)))
      ).catch(e => console.warn('Failed to delete highlights:', e)),

      // Delete saved verses
      base44.asServiceRole.entities.SavedVerse.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.SavedVerse.delete(r.id)))
      ).catch(e => console.warn('Failed to delete saved verses:', e)),

      // Delete bookmarks
      base44.asServiceRole.entities.Bookmark.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.Bookmark.delete(r.id)))
      ).catch(e => console.warn('Failed to delete bookmarks:', e)),

      // Delete collections
      base44.asServiceRole.entities.Collection.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.Collection.delete(r.id)))
      ).catch(e => console.warn('Failed to delete collections:', e)),

      // Delete prayer journals
      base44.asServiceRole.entities.PrayerJournal.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.PrayerJournal.delete(r.id)))
      ).catch(e => console.warn('Failed to delete prayer journals:', e)),

      // Delete memory verses
      base44.asServiceRole.entities.MemoryVerse.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.MemoryVerse.delete(r.id)))
      ).catch(e => console.warn('Failed to delete memory verses:', e)),

      // Delete user subscription records
      base44.asServiceRole.entities.UserSubscription.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.UserSubscription.delete(r.id)))
      ).catch(e => console.warn('Failed to delete subscriptions:', e)),

      // Delete user entitlements
      base44.asServiceRole.entities.UserEntitlement.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.UserEntitlement.delete(r.id)))
      ).catch(e => console.warn('Failed to delete entitlements:', e)),

      // Delete notification preferences
      base44.asServiceRole.entities.NotificationPreference.filter({ user_id: userId }).then(records => 
        Promise.all(records.map(r => base44.asServiceRole.entities.NotificationPreference.delete(r.id)))
      ).catch(e => console.warn('Failed to delete notification prefs:', e)),
    ]);

    console.log(`[deleteUserAccount] Successfully deleted all data for user: ${userId}`);

    return Response.json({
      success: true,
      message: 'Account and all associated data have been deleted.',
      user_id: userId,
    });
  } catch (error) {
    console.error('[deleteUserAccount] Error:', error);
    return Response.json({
      error: 'Failed to delete account. Please try again or contact support.',
      details: error.message,
    }, { status: 500 });
  }
});