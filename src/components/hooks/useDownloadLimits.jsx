import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

// Download limits per plan
const PLAN_LIMITS = {
  free: 3,
  basic: 15,
  premium: Infinity,
};

export function useDownloadLimits(userId, isPremium, plan = 'free') {
  const [downloadsUsed, setDownloadsUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = isPremium ? Infinity : PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;

  const fetchUsed = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const records = await base44.entities.OfflineLibrary.filter(
        { user_id: userId, content_type: 'bible_book' },
        '-created_date',
        200
      ).catch(() => []);
      setDownloadsUsed(records.length);
    } catch {
      setDownloadsUsed(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchUsed(); }, [fetchUsed]);

  const canDownload = isPremium || downloadsUsed < limit;
  const nearLimit = !isPremium && limit !== Infinity && downloadsUsed >= Math.floor(limit * 0.8);
  const atLimit = !isPremium && limit !== Infinity && downloadsUsed >= limit;
  const pct = limit === Infinity ? 0 : Math.min((downloadsUsed / limit) * 100, 100);

  return { downloadsUsed, limit, canDownload, nearLimit, atLimit, pct, loading, refetch: fetchUsed };
}