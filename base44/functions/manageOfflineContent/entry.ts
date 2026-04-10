import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Manage Offline Content Downloads
 * 
 * Handles:
 * - Tracking user's downloaded content
 * - Managing storage quota (5GB per tier)
 * - Deleting expired/old downloads
 * - Syncing download status across devices
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const method = req.method;
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // POST - Start/track a download
    if (method === 'POST') {
      const { content_type, content_id, content_title, file_size_bytes } = await req.json();

      // Validate input
      if (!content_type || !content_id || !file_size_bytes) {
        return Response.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
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

      const availableSpace = storage.max_storage_bytes - storage.total_storage_bytes;
      if (file_size_bytes > availableSpace) {
        return Response.json(
          {
            error: 'Insufficient storage',
            available_bytes: availableSpace,
            required_bytes: file_size_bytes,
          },
          { status: 400 }
        );
      }

      // Track the download
      const download = await base44.entities.OfflineDownload.create({
        user_id: user.id,
        content_type, // 'lesson', 'course', 'audio_chapter', 'bible_chapter'
        content_id,
        content_title,
        file_size_bytes,
        downloaded_at: new Date().toISOString(),
        expires_at: calculateExpirationDate(),
        is_pinned: false,
      });

      // Update storage usage
      await base44.entities.UserOfflineStorage.update(storage.id, {
        total_storage_bytes: storage.total_storage_bytes + file_size_bytes,
        content_downloaded: [
          ...storage.content_downloaded,
          {
            download_id: download.id,
            content_id,
            file_size: file_size_bytes,
          },
        ],
      });

      return Response.json({
        success: true,
        download: {
          id: download.id,
          status: 'downloading',
          file_size_bytes,
          expires_at: download.expires_at,
        },
      });
    }

    // GET - List downloaded content
    if (method === 'GET' && action === 'list') {
      const downloads = await base44.entities.OfflineDownload.filter(
        { user_id: user.id },
        '-downloaded_at'
      );

      const storage = await base44.entities.UserOfflineStorage.filter({
        user_id: user.id,
      });

      return Response.json({
        success: true,
        downloads: downloads.map(d => ({
          id: d.id,
          content_type: d.content_type,
          content_id: d.content_id,
          title: d.content_title,
          file_size_bytes: d.file_size_bytes,
          downloaded_at: d.downloaded_at,
          expires_at: d.expires_at,
          is_pinned: d.is_pinned,
          days_until_expiry: calculateDaysUntilExpiry(d.expires_at),
        })),
        storage: storage[0]
          ? {
              used_bytes: storage[0].total_storage_bytes,
              max_bytes: storage[0].max_storage_bytes,
              percent_used: Math.round(
                (storage[0].total_storage_bytes / storage[0].max_storage_bytes) * 100
              ),
            }
          : null,
      });
    }

    // DELETE - Remove downloaded content
    if (method === 'DELETE') {
      const { download_id } = await req.json();

      if (!download_id) {
        return Response.json({ error: 'Missing download_id' }, { status: 400 });
      }

      // Get download to find size
      const download = await base44.entities.OfflineDownload.filter({ id: download_id });
      if (!download || download[0].user_id !== user.id) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      const fileSize = download[0].file_size_bytes;

      // Delete download record
      await base44.entities.OfflineDownload.delete(download_id);

      // Update storage
      const storage = await base44.entities.UserOfflineStorage.filter({
        user_id: user.id,
      });
      if (storage[0]) {
        await base44.entities.UserOfflineStorage.update(storage[0].id, {
          total_storage_bytes: Math.max(
            0,
            storage[0].total_storage_bytes - fileSize
          ),
          content_downloaded: storage[0].content_downloaded.filter(
            c => c.download_id !== download_id
          ),
        });
      }

      return Response.json({ success: true, freed_bytes: fileSize });
    }

    // PUT - Pin/unpin content (prevent auto-deletion)
    if (method === 'PUT' && action === 'pin') {
      const { download_id, is_pinned } = await req.json();

      const downloads = await base44.entities.OfflineDownload.filter({
        id: download_id,
      });
      if (!downloads || downloads[0].user_id !== user.id) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      await base44.entities.OfflineDownload.update(download_id, {
        is_pinned,
      });

      return Response.json({ success: true, is_pinned });
    }

    // POST - Cleanup old downloads (auto-delete unpinned content after 30 days)
    if (method === 'POST' && action === 'cleanup') {
      const downloads = await base44.entities.OfflineDownload.filter({
        user_id: user.id,
      });

      let freedBytes = 0;
      const now = new Date();

      for (const download of downloads) {
        if (download.is_pinned) continue; // Don't delete pinned content

        const expiryDate = new Date(download.expires_at);
        if (now > expiryDate) {
          await base44.entities.OfflineDownload.delete(download.id);
          freedBytes += download.file_size_bytes;
        }
      }

      // Update storage
      if (freedBytes > 0) {
        const storage = await base44.entities.UserOfflineStorage.filter({
          user_id: user.id,
        });
        if (storage[0]) {
          await base44.entities.UserOfflineStorage.update(storage[0].id, {
            total_storage_bytes: Math.max(0, storage[0].total_storage_bytes - freedBytes),
          });
        }
      }

      return Response.json({
        success: true,
        cleaned_up_count: freedBytes > 0 ? 1 : 0,
        freed_bytes: freedBytes,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Offline content error:', error);
    return Response.json(
      { error: 'Failed to manage offline content', details: error.message },
      { status: 500 }
    );
  }
});

/**
 * Calculate storage quota based on subscription tier
 */
function calculateStorageQuota(user) {
  const quotas = {
    free: 1 * 1024 * 1024 * 1024, // 1GB
    premium: 5 * 1024 * 1024 * 1024, // 5GB
    church: 10 * 1024 * 1024 * 1024, // 10GB
  };

  const tier = user.subscription_active ? 'premium' : 'free';
  return quotas[tier] || quotas.free;
}

/**
 * Calculate expiration date (30 days from now)
 */
function calculateExpirationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}

/**
 * Calculate days remaining until expiry
 */
function calculateDaysUntilExpiry(expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}