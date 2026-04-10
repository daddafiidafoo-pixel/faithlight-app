import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Manages offline content downloads for core discipleship
 * Coordinates: Bible Reader + Audio Bible + Level 1-2 courses
 */

Deno.serve(async (req) => {
  try {
    if (req.method === 'GET') {
      return Response.json({ status: 'ok' }, { status: 200 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const {
      contentType,
      contentId,
      action = 'download'
    } = payload;

    if (!contentType || !contentId) {
      return Response.json(
        { error: 'contentType and contentId required' },
        { status: 400 }
      );
    }

    // Validate content type
    const validTypes = ['bible_chapter', 'audio_chapter', 'course_lesson', 'study_plan'];
    if (!validTypes.includes(contentType)) {
      return Response.json({ error: 'Invalid contentType' }, { status: 400 });
    }

    // Check user's offline storage quota
    let offlineLibrary = await base44.asServiceRole.entities.OfflineLibrary.filter(
      { user_id: user.id },
      '-created_date',
      1
    );

    if (!offlineLibrary?.length) {
      offlineLibrary = [await base44.asServiceRole.entities.OfflineLibrary.create({
        user_id: user.id,
        total_size_mb: 0,
        items_count: 0,
        max_storage_mb: 500, // 500MB offline quota
        is_sync_enabled: true
      })];
    }

    const library = offlineLibrary[0];

    if (action === 'download') {
      // Get content metadata
      let contentData = null;
      let sizeEstimate = 0;

      if (contentType === 'bible_chapter') {
        contentData = await base44.asServiceRole.entities.BibleTextChapter.filter(
          { id: contentId },
          '-created_date',
          1
        );
        sizeEstimate = 0.5; // ~500KB per chapter
      } else if (contentType === 'audio_chapter') {
        contentData = await base44.asServiceRole.entities.AudioChapter.filter(
          { id: contentId },
          '-created_date',
          1
        );
        sizeEstimate = 25; // ~25MB per audio chapter
      } else if (contentType === 'course_lesson') {
        contentData = await base44.asServiceRole.entities.Lesson.filter(
          { id: contentId },
          '-created_date',
          1
        );
        sizeEstimate = 5; // ~5MB with media
      } else if (contentType === 'study_plan') {
        contentData = await base44.asServiceRole.entities.StudyPlan.filter(
          { id: contentId },
          '-created_date',
          1
        );
        sizeEstimate = 2; // ~2MB
      }

      if (!contentData?.length) {
        return Response.json({ error: 'Content not found' }, { status: 404 });
      }

      // Check quota
      const projectedSize = library.total_size_mb + sizeEstimate;
      if (projectedSize > library.max_storage_mb) {
        return Response.json({
          error: 'Storage quota exceeded',
          currentSize: library.total_size_mb,
          requestedSize: sizeEstimate,
          maxSize: library.max_storage_mb,
          available: Math.max(0, library.max_storage_mb - library.total_size_mb)
        }, { status: 413 });
      }

      // Create offline record
      let offlineEntity = null;
      if (contentType === 'bible_chapter') {
        offlineEntity = await base44.asServiceRole.entities.OfflineText.create({
          user_id: user.id,
          bible_chapter_id: contentId,
          chapter_reference: contentData[0].chapter,
          text_content: contentData[0].text,
          downloaded_at: new Date().toISOString(),
          size_mb: sizeEstimate,
          last_synced_at: new Date().toISOString()
        });
      } else if (contentType === 'audio_chapter') {
        offlineEntity = await base44.asServiceRole.entities.OfflineAudio.create({
          user_id: user.id,
          audio_chapter_id: contentId,
          audio_url: contentData[0].audio_url,
          chapter_reference: contentData[0].chapter,
          downloaded_at: new Date().toISOString(),
          size_mb: sizeEstimate,
          last_synced_at: new Date().toISOString()
        });
      }

      // Update library stats
      await base44.asServiceRole.entities.OfflineLibrary.update(library.id, {
        total_size_mb: projectedSize,
        items_count: library.items_count + 1,
        last_updated_at: new Date().toISOString()
      });

      return Response.json({
        success: true,
        message: 'Content queued for download',
        contentType,
        contentId,
        sizeEstimate,
        offlineId: offlineEntity?.id,
        storageStatus: {
          used: projectedSize,
          max: library.max_storage_mb,
          available: library.max_storage_mb - projectedSize
        }
      });

    } else if (action === 'delete') {
      // Delete offline content
      const deleted = await base44.asServiceRole.entities.OfflineText.filter(
        { user_id: user.id, bible_chapter_id: contentId }
      );

      if (deleted?.length) {
        await base44.asServiceRole.entities.OfflineText.delete(deleted[0].id);
      }

      // Update library stats
      await base44.asServiceRole.entities.OfflineLibrary.update(library.id, {
        total_size_mb: Math.max(0, library.total_size_mb - 0.5),
        items_count: Math.max(0, library.items_count - 1)
      });

      return Response.json({
        success: true,
        message: 'Content removed from offline storage'
      });
    }

  } catch (error) {
    console.error('Offline Download Error:', error);
    return Response.json(
      { error: 'Download failed', details: error.message },
      { status: 500 }
    );
  }
});