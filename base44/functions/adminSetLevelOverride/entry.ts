import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { userId, level, reason } = await req.json();

    if (!userId || !level || !reason) {
      return Response.json(
        { error: 'Missing required fields: userId, level, reason' },
        { status: 400 }
      );
    }

    if (![1, 2, 3, 4].includes(level)) {
      return Response.json(
        { error: 'Invalid level. Must be 1, 2, 3, or 4' },
        { status: 400 }
      );
    }

    // Fetch user's spiritual progress
    const progressRecords = await base44.entities.UserSpiritualProgress.filter({
      user_id: userId,
    });
    const progress = progressRecords?.[0];

    if (!progress) {
      return Response.json(
        { error: 'User spiritual progress not found' },
        { status: 404 }
      );
    }

    // Set level override
    await base44.entities.UserSpiritualProgress.update(progress.id, {
      level_override: level,
      current_level: level,
      override_reason: reason,
      override_set_at: new Date().toISOString(),
      override_set_by: user.id,
    });

    return Response.json({
      success: true,
      message: `User ${userId} level set to ${level}`,
      reason: reason,
      setBy: user.id,
    });
  } catch (error) {
    console.error('Error setting level override:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});