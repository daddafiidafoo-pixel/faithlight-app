import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export const useEntitlementStatus = (userId, shouldFetch = true) => {
  const [status, setStatus] = useState({
    isPremium: false,
    source: null,
    current_period_end: null,
    status: null,
  });

  useEffect(() => {
    if (!userId || !shouldFetch) return;

    const fetchEntitlement = async () => {
      try {
        const entitlements = await base44.entities.Entitlement.filter(
          { user_id: userId, product: 'faithlight_premium' },
          '-created_date',
          1
        );

        if (entitlements && entitlements.length > 0) {
          const ent = entitlements[0];
          const isPremium = ent.status === 'active';

          // Check if not expired
          if (isPremium && ent.current_period_end) {
            const expiryDate = new Date(ent.current_period_end);
            if (expiryDate < new Date()) {
              // Expired, mark as inactive
              setStatus({
                isPremium: false,
                source: ent.source,
                current_period_end: ent.current_period_end,
                status: 'expired',
              });
              return;
            }
          }

          setStatus({
            isPremium,
            source: ent.source,
            current_period_end: ent.current_period_end,
            status: ent.status,
          });
        } else {
          setStatus({
            isPremium: false,
            source: null,
            current_period_end: null,
            status: null,
          });
        }
      } catch (error) {
        console.error('Error fetching entitlement:', error);
      }
    };

    fetchEntitlement();

    // Poll every 30 seconds to check subscription status
    const interval = setInterval(fetchEntitlement, 30000);
    return () => clearInterval(interval);
  }, [userId, shouldFetch]);

  return status;
};