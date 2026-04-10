import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useEntitlement(userId) {
  const [entitlement, setEntitlement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    base44.entities.UserEntitlement.filter({ user_id: userId }, '', 1)
      .then(res => setEntitlement(res[0] || { plan: 'basic', status: 'active' }))
      .catch(() => setEntitlement({ plan: 'basic', status: 'active' }))
      .finally(() => setLoading(false));
  }, [userId]);

  const isPremium = entitlement?.plan === 'premium' && entitlement?.status !== 'expired';
  const isTrialing = entitlement?.status === 'trialing';

  return { entitlement, isPremium, isTrialing, loading };
}