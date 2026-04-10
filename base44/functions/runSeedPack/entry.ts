import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Admin-only seed runner.
 * Accepts: { pack: "ui_v1" | "training_v1" | "leadership_v1" | "home_v1" }
 * Uses SeedLock entity as a distributed lock — safe across users/devices/sessions.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { pack } = await req.json();
    if (!pack) return Response.json({ error: 'Missing pack name' }, { status: 400 });

    const lockName = `translations_${pack}`;

    // Check if lock already exists (already seeded)
    const existing = await base44.asServiceRole.entities.SeedLock.filter({ name: lockName }, '', 1);
    if (existing.length > 0) {
      return Response.json({ success: true, skipped: true, reason: `Already seeded (${lockName})` });
    }

    // Acquire the lock immediately
    await base44.asServiceRole.entities.SeedLock.create({
      name: lockName,
      locked_by: user.email,
      completed_at: new Date().toISOString(),
      record_count: 0,
    });

    // Get seed data for the requested pack
    const records = getSeedData(pack);
    if (!records) {
      return Response.json({ error: `Unknown pack: ${pack}` }, { status: 400 });
    }

    // Filter out already-existing records (idempotency per record)
    let seeded = 0;
    for (const record of records) {
      const existing = await base44.asServiceRole.entities.Translation.filter(
        { key: record.key, language_code: record.language_code, category: record.category },
        '', 1
      );
      if (existing.length === 0) {
        await base44.asServiceRole.entities.Translation.create(record);
        seeded++;
      } else {
        // Update value if changed (upsert behavior)
        if (existing[0].value !== record.value) {
          await base44.asServiceRole.entities.Translation.update(existing[0].id, { value: record.value });
        }
      }
    }

    // Update lock with final count
    await base44.asServiceRole.entities.SeedLock.update(existing[0]?.id || '', { record_count: seeded }).catch(() => {});

    return Response.json({ success: true, pack: lockName, seeded, total: records.length });

  } catch (error) {
    console.error('[runSeedPack] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getSeedData(pack) {
  const EN_UI = [
    { key: 'nav.home', language_code: 'en', value: 'Home', category: 'ui', status: 'published' },
    { key: 'nav.community', language_code: 'en', value: 'Groups', category: 'ui', status: 'published' },
    { key: 'nav.login', language_code: 'en', value: 'Login', category: 'ui', status: 'published' },
    { key: 'home.title', language_code: 'en', value: 'FaithLight', category: 'ui', status: 'published' },
    { key: 'home.tagline', language_code: 'en', value: 'Scripture lights your way', category: 'ui', status: 'published' },
    { key: 'home.welcome', language_code: 'en', value: 'Welcome', category: 'ui', status: 'published' },
  ];
  const OM_UI = [
    { key: 'nav.home', language_code: 'om', value: 'Mana', category: 'ui', status: 'published' },
    { key: 'nav.community', language_code: 'om', value: 'Garee', category: 'ui', status: 'published' },
    { key: 'nav.login', language_code: 'om', value: 'Seeni', category: 'ui', status: 'published' },
    { key: 'home.title', language_code: 'om', value: 'FaithLight', category: 'ui', status: 'published' },
    { key: 'home.tagline', language_code: 'om', value: 'Ifti Dubbiin Waaqayyoo karaa jireenya kee ibsu', category: 'ui', status: 'published' },
    { key: 'home.welcome', language_code: 'om', value: 'Baga nagaan dhuftan', category: 'ui', status: 'published' },
  ];
  const AM_UI = [
    { key: 'nav.home', language_code: 'am', value: 'ቤት', category: 'ui', status: 'published' },
    { key: 'nav.community', language_code: 'am', value: 'ቡድን', category: 'ui', status: 'published' },
    { key: 'nav.login', language_code: 'am', value: 'ግባ', category: 'ui', status: 'published' },
    { key: 'home.title', language_code: 'am', value: 'FaithLight', category: 'ui', status: 'published' },
    { key: 'home.tagline', language_code: 'am', value: 'ቃል እግዚአብሔር መንገድህን ያብራ', category: 'ui', status: 'published' },
    { key: 'home.welcome', language_code: 'am', value: 'እንኳን በደህና መጡ', category: 'ui', status: 'published' },
  ];
  const AR_UI = [
    { key: 'nav.home', language_code: 'ar', value: 'الرئيسية', category: 'ui', status: 'published' },
    { key: 'nav.community', language_code: 'ar', value: 'المجموعات', category: 'ui', status: 'published' },
    { key: 'nav.login', language_code: 'ar', value: 'تسجيل الدخول', category: 'ui', status: 'published' },
    { key: 'home.title', language_code: 'ar', value: 'FaithLight', category: 'ui', status: 'published' },
    { key: 'home.tagline', language_code: 'ar', value: 'كلام الله ينير طريقك', category: 'ui', status: 'published' },
    { key: 'home.welcome', language_code: 'ar', value: 'أهلاً وسهلاً', category: 'ui', status: 'published' },
  ];

  const packs = {
    ui_v1: [...EN_UI, ...OM_UI, ...AM_UI, ...AR_UI],
    training_v1: [
      { key: 'training.startCourse', language_code: 'en', value: 'Start Course', category: 'training', status: 'published' },
      { key: 'training.startCourse', language_code: 'om', value: 'Barnoota Jalqabi', category: 'training', status: 'published' },
      { key: 'training.startCourse', language_code: 'am', value: 'ኮርስ ጀምር', category: 'training', status: 'published' },
      { key: 'training.continueCourse', language_code: 'en', value: 'Continue', category: 'training', status: 'published' },
      { key: 'training.continueCourse', language_code: 'om', value: 'Itti Fufi', category: 'training', status: 'published' },
      { key: 'training.continueCourse', language_code: 'am', value: 'ቀጥል', category: 'training', status: 'published' },
    ],
    leadership_v1: [
      { key: 'leadership.applyNow', language_code: 'en', value: 'Apply Now', category: 'training', status: 'published' },
      { key: 'leadership.applyNow', language_code: 'om', value: 'Amma Galmaa\'i', category: 'training', status: 'published' },
      { key: 'leadership.applyNow', language_code: 'am', value: 'አሁን አመልክት', category: 'training', status: 'published' },
    ],
    home_v1: [
      { key: 'home.hero.cta', language_code: 'en', value: 'Start Learning Free', category: 'ui', status: 'published' },
      { key: 'home.hero.cta', language_code: 'om', value: 'Bilisaan Barachuutti Jalqabi', category: 'ui', status: 'published' },
      { key: 'home.hero.cta', language_code: 'am', value: 'ነጻ ትምህርት ጀምር', category: 'ui', status: 'published' },
    ],
  };

  return packs[pack] || null;
}