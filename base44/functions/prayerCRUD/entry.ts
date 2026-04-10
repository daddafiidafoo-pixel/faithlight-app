import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, userEmail, prayerId, title, body, status, reminderFrequency, reminderTime, reminderDaysOfWeek, reminderEnabled, answerNotes } = await req.json();

    console.log(`[prayerCRUD] action=${action} userEmail=${userEmail}`);

    // ── CREATE ────────────────────────────────────────────────────────────
    if (action === 'create') {
      if (!userEmail || !title || !body) {
        return Response.json({ error: 'userEmail, title, and body required' }, { status: 400 });
      }

      const prayer = await base44.entities.PrayerRequest.create({
        userEmail,
        title,
        body,
        status: status || 'active',
        reminderFrequency: reminderFrequency || 'none',
        reminderTime,
        reminderDaysOfWeek,
        reminderEnabled: reminderEnabled !== false,
      });

      console.log(`[prayerCRUD] created: ${prayer.id}`);
      return Response.json({ success: true, prayer });
    }

    // ── LIST ──────────────────────────────────────────────────────────────
    if (action === 'list') {
      if (!userEmail) {
        return Response.json({ error: 'userEmail required' }, { status: 400 });
      }

      const prayers = await base44.entities.PrayerRequest.filter({ userEmail }, '-created_date', 100);
      return Response.json({ success: true, prayers });
    }

    // ── GET FILTERED ──────────────────────────────────────────────────────
    if (action === 'listByStatus') {
      if (!userEmail || !status) {
        return Response.json({ error: 'userEmail and status required' }, { status: 400 });
      }

      const prayers = await base44.entities.PrayerRequest.filter(
        { userEmail, status },
        '-created_date',
        100
      );
      return Response.json({ success: true, prayers });
    }

    // ── GET ONE ───────────────────────────────────────────────────────────
    if (action === 'get') {
      if (!prayerId) {
        return Response.json({ error: 'prayerId required' }, { status: 400 });
      }

      const prayers = await base44.entities.PrayerRequest.filter({ id: prayerId });
      if (prayers.length === 0) {
        return Response.json({ error: 'Prayer not found' }, { status: 404 });
      }

      return Response.json({ success: true, prayer: prayers[0] });
    }

    // ── UPDATE ────────────────────────────────────────────────────────────
    if (action === 'update') {
      if (!prayerId) {
        return Response.json({ error: 'prayerId required' }, { status: 400 });
      }

      const prayer = await base44.entities.PrayerRequest.update(prayerId, {
        title: title || undefined,
        body: body || undefined,
        status: status || undefined,
        reminderFrequency: reminderFrequency || undefined,
        reminderTime: reminderTime || undefined,
        reminderDaysOfWeek: reminderDaysOfWeek || undefined,
        reminderEnabled: reminderEnabled !== undefined ? reminderEnabled : undefined,
        answerNotes: answerNotes || undefined,
        answerDate: status === 'answered' ? new Date().toISOString() : undefined,
      });

      console.log(`[prayerCRUD] updated: ${prayerId}`);
      return Response.json({ success: true, prayer });
    }

    // ── DELETE ────────────────────────────────────────────────────────────
    if (action === 'delete') {
      if (!prayerId) {
        return Response.json({ error: 'prayerId required' }, { status: 400 });
      }

      await base44.entities.PrayerRequest.delete(prayerId);
      console.log(`[prayerCRUD] deleted: ${prayerId}`);
      return Response.json({ success: true, message: 'Prayer deleted' });
    }

    // ── MARK ANSWERED ─────────────────────────────────────────────────────
    if (action === 'markAnswered') {
      if (!prayerId) {
        return Response.json({ error: 'prayerId required' }, { status: 400 });
      }

      const prayer = await base44.entities.PrayerRequest.update(prayerId, {
        status: 'answered',
        answerDate: new Date().toISOString(),
        answerNotes: answerNotes || '',
      });

      console.log(`[prayerCRUD] marked answered: ${prayerId}`);
      return Response.json({ success: true, prayer });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[prayerCRUD] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});