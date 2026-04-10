import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Manage Offline Audio Bible Downloads
 * 
 * Handles:
 * - Bible book/testament audio pack downloads
 * - Audio metadata & playback tracking
 * - Storage quota integration
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    // POST - Start audio download
    if (action === 'download') {
      const { pack_type, pack_id, pack_title, book_name, language, chapters, estimated_size_bytes } = body;

      if (!pack_type || !pack_id || !pack_title) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Check storage quota
      const userStorage = await base44.entities.UserOfflineStorage.filter(
        { user_id: user.id }
      );

      let storage = userStorage[0];
      if (!storage) {
        storage = await base44.entities.UserOfflineStorage.create({
          user_id: user.id,
          total_storage_bytes: 0,
          max_storage_bytes: calculateStorageQuota(user),
          content_downloaded: [],
        });
      }

      const fileSize = estimated_size_bytes || calculateAudioSize(pack_type, chapters?.length || 1);
      const availableSpace = storage.max_storage_bytes - storage.total_storage_bytes;

      if (fileSize > availableSpace) {
        return Response.json(
          {
            error: 'Insufficient storage',
            available_bytes: availableSpace,
            required_bytes: fileSize,
          },
          { status: 400 }
        );
      }

      // Create audio download record
      const download = await base44.entities.OfflineDownload.create({
        user_id: user.id,
        content_type: 'audio_bible',
        content_id: pack_id,
        content_title: pack_title,
        file_size_bytes: fileSize,
        downloaded_at: new Date().toISOString(),
        expires_at: calculateExpirationDate(),
        is_pinned: true, // Audio packs default to pinned
        metadata: {
          pack_type, // 'book', 'testament', 'nt'
          book_name,
          language,
          chapters: chapters || [],
        },
      });

      // Update storage
      await base44.entities.UserOfflineStorage.update(storage.id, {
        total_storage_bytes: storage.total_storage_bytes + fileSize,
        content_downloaded: [
          ...(storage.content_downloaded || []),
          {
            download_id: download.id,
            content_id: pack_id,
            file_size: fileSize,
          },
        ],
      });

      return Response.json({
        success: true,
        download_id: download.id,
        status: 'downloading',
        file_size_bytes: fileSize,
        expires_at: download.expires_at,
      });
    }

    // List available audio packs
    if (action === 'available-packs') {
      const { language = 'en' } = body;

      // Get Bible books
      const bibleBooks = getBibleBooks();

      const packs = [
        {
          id: `nt-${language}`,
          type: 'testament',
          title: `New Testament (${language === 'en' ? 'English' : 'Afaan Oromoo'})`,
          description: '27 books, ~12 hours',
          chapters: 260,
          estimated_size_mb: 850,
          language,
        },
        {
          id: `ot-${language}`,
          type: 'testament',
          title: `Old Testament (${language === 'en' ? 'English' : 'Afaan Oromoo'})`,
          description: '39 books, ~60 hours',
          chapters: 929,
          estimated_size_mb: 4200,
          language,
        },
        ...bibleBooks.map(book => ({
          id: `book-${book.abbr}-${language}`,
          type: 'book',
          title: `${book.name}`,
          description: `${book.chapters} chapters, ~${Math.round(book.chapters * 0.5)} hours`,
          chapters: book.chapters,
          estimated_size_mb: book.chapters * 30, // ~30MB per chapter
          language,
          book_abbr: book.abbr,
        })),
      ];

      return Response.json({
        success: true,
        packs: packs.slice(0, 50), // Paginate in real app
      });
    }

    // List user's audio downloads
    if (action === 'list') {
      const downloads = await base44.entities.OfflineDownload.filter(
        { user_id: user.id, content_type: 'audio_bible' },
        '-downloaded_at'
      );

      return Response.json({
        success: true,
        audio_downloads: downloads.map(d => ({
          id: d.id,
          title: d.content_title,
          pack_type: d.metadata?.pack_type,
          book_name: d.metadata?.book_name,
          language: d.metadata?.language,
          file_size_mb: (d.file_size_bytes / (1024 ** 2)).toFixed(1),
          downloaded_at: d.downloaded_at,
          is_pinned: d.is_pinned,
        })),
      });
    }

    // Delete audio download
    if (action === 'delete') {
      const { download_id } = body;

      const downloads = await base44.entities.OfflineDownload.filter({ id: download_id });
      if (!downloads || downloads[0].user_id !== user.id) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      const fileSize = downloads[0].file_size_bytes;
      await base44.entities.OfflineDownload.delete(download_id);

      // Update storage
      const storage = await base44.entities.UserOfflineStorage.filter({
        user_id: user.id,
      });
      if (storage[0]) {
        await base44.entities.UserOfflineStorage.update(storage[0].id, {
          total_storage_bytes: Math.max(0, storage[0].total_storage_bytes - fileSize),
        });
      }

      return Response.json({ success: true, freed_mb: (fileSize / (1024 ** 2)).toFixed(1) });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Offline audio error:', error);
    return Response.json(
      { error: 'Failed to manage offline audio', details: error.message },
      { status: 500 }
    );
  }
});

function calculateStorageQuota(user) {
  const quotas = {
    free: 1 * 1024 * 1024 * 1024, // 1GB
    premium: 5 * 1024 * 1024 * 1024, // 5GB
    church: 10 * 1024 * 1024 * 1024, // 10GB
  };
  const tier = user.subscription_active ? 'premium' : 'free';
  return quotas[tier] || quotas.free;
}

function calculateAudioSize(packType, chapterCount) {
  // Rough estimate: ~30MB per chapter of audio
  return chapterCount * 30 * 1024 * 1024;
}

function calculateExpirationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 365); // Audio packs expire yearly
  return date.toISOString();
}

function getBibleBooks() {
  return [
    // NT
    { name: 'Matthew', abbr: 'Matt', chapters: 28 },
    { name: 'Mark', abbr: 'Mark', chapters: 16 },
    { name: 'Luke', abbr: 'Luke', chapters: 24 },
    { name: 'John', abbr: 'John', chapters: 21 },
    { name: 'Acts', abbr: 'Acts', chapters: 28 },
    { name: 'Romans', abbr: 'Rom', chapters: 16 },
    { name: '1 Corinthians', abbr: '1Cor', chapters: 16 },
    { name: '2 Corinthians', abbr: '2Cor', chapters: 13 },
    { name: 'Galatians', abbr: 'Gal', chapters: 6 },
    { name: 'Ephesians', abbr: 'Eph', chapters: 6 },
    { name: 'Philippians', abbr: 'Phil', chapters: 4 },
    { name: 'Colossians', abbr: 'Col', chapters: 4 },
    { name: '1 Thessalonians', abbr: '1Thes', chapters: 5 },
    { name: '2 Thessalonians', abbr: '2Thes', chapters: 3 },
    { name: '1 Timothy', abbr: '1Tim', chapters: 6 },
    { name: '2 Timothy', abbr: '2Tim', chapters: 4 },
    { name: 'Titus', abbr: 'Titus', chapters: 3 },
    { name: 'Philemon', abbr: 'Phlm', chapters: 1 },
    { name: 'Hebrews', abbr: 'Heb', chapters: 13 },
    { name: 'James', abbr: 'James', chapters: 5 },
    { name: '1 Peter', abbr: '1Pet', chapters: 5 },
    { name: '2 Peter', abbr: '2Pet', chapters: 3 },
    { name: '1 John', abbr: '1John', chapters: 5 },
    { name: '2 John', abbr: '2John', chapters: 1 },
    { name: '3 John', abbr: '3John', chapters: 1 },
    { name: 'Jude', abbr: 'Jude', chapters: 1 },
    { name: 'Revelation', abbr: 'Rev', chapters: 22 },
    // OT Sampler
    { name: 'Genesis', abbr: 'Gen', chapters: 50 },
    { name: 'Psalms', abbr: 'Ps', chapters: 150 },
    { name: 'Proverbs', abbr: 'Prov', chapters: 31 },
    { name: 'Isaiah', abbr: 'Isa', chapters: 66 },
  ];
}