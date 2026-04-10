import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * saveAudioProgress
 * 
 * Save playback position and check for completion at ~90%.
 * Idempotent—only writes if position changed.
 * 
 * Body:
 * {
 *   fileset_id_audio: string,
 *   book_id: string,
 *   book_name: string,
 *   chapter: number,
 *   language_code: string,
 *   last_position_seconds: number,
 *   duration_seconds?: number,
 *   playback_active?: boolean (true if still playing, false if paused/stopped)
 * }
 * 
 * Returns:
 * {
 *   saved: boolean,
 *   is_completed: boolean,
 *   total_listen_seconds: number
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    if (req.method !== 'POST') {
      return Response.json({ error: 'Only POST allowed' }, { status: 405 });
    }

    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      fileset_id_audio,
      book_id,
      book_name,
      chapter,
      language_code,
      last_position_seconds,
      duration_seconds,
      playback_active = false,
    } = body;

    if (!fileset_id_audio || !book_id || !book_name || !chapter || !language_code) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find or create progress record
    const existing = await base44.asServiceRole.entities.AudioListenProgress.filter(
      {
        user_id: user.id,
        fileset_id_audio,
        book_id,
        chapter,
      },
      null,
      1
    );

    let record = existing[0];
    const delta = record
      ? Math.max(0, last_position_seconds - (record.last_position_seconds || 0))
      : last_position_seconds;

    // Only save if position advanced (avoid no-op writes)
    if (delta === 0 && record && !playback_active) {
      return Response.json({
        saved: false,
        is_completed: record.is_completed,
        total_listen_seconds: record.total_listen_seconds || 0,
      });
    }

    const updateData = {
      last_position_seconds,
      total_listen_seconds: (record?.total_listen_seconds || 0) + delta,
      last_listened_at: new Date().toISOString(),
    };

    // Check for completion at ~90%
    let isCompleted = record?.is_completed || false;
    if (!isCompleted && duration_seconds && last_position_seconds >= duration_seconds * 0.9) {
      updateData.is_completed = true;
      updateData.completed_at = new Date().toISOString();
      isCompleted = true;
    }

    if (record) {
      // Update existing
      await base44.asServiceRole.entities.AudioListenProgress.update(record.id, updateData);
    } else {
      // Create new
      record = await base44.asServiceRole.entities.AudioListenProgress.create({
        user_id: user.id,
        fileset_id_audio,
        book_id,
        book_name,
        chapter,
        language_code,
        ...updateData,
        duration_seconds: duration_seconds || null,
      });
    }

    // If completed and first time, update UserProgressSummary
    if (isCompleted && !existing[0]?.is_completed) {
      try {
        let summary = await base44.asServiceRole.entities.UserProgressSummary.filter(
          { user_id: user.id },
          null,
          1
        ).then(r => r[0]);

        if (!summary) {
          summary = await base44.asServiceRole.entities.UserProgressSummary.create({
            user_id: user.id,
            total_audio_chapters_completed: 1,
            total_audio_minutes_listened: Math.floor(updateData.total_listen_seconds / 60),
            last_audio_at: new Date().toISOString(),
          });
        } else {
          await base44.asServiceRole.entities.UserProgressSummary.update(summary.id, {
            total_audio_chapters_completed: (summary.total_audio_chapters_completed || 0) + 1,
            total_audio_minutes_listened: Math.floor(
              (summary.total_audio_minutes_listened || 0) * 60 + updateData.total_listen_seconds
            ) / 60,
            last_audio_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Summary update error:', err);
        // Don't fail the response; progress was still saved
      }
    }

    return Response.json({
      saved: true,
      is_completed: isCompleted,
      total_listen_seconds: updateData.total_listen_seconds,
    });
  } catch (err) {
    console.error('Save audio progress error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});