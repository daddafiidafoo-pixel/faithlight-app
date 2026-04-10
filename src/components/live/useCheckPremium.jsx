import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useCheckPremium(userId) {
  const [isPremium, setIsPremium] = useState(false);
  const [isTrialing, setIsTrialing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntitlement = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Try to get entitlement
        const entitlements = await base44.entities.UserEntitlement.filter({
          user_id: userId
        });

        if (entitlements.length > 0) {
          const ent = entitlements[0];
          const isPremiumPlan = ent.plan === 'premium';
          const isActiveTrialing = ent.status === 'trialing';
          const isNotExpired = !ent.expires_at || new Date(ent.expires_at) > new Date();

          setIsPremium(isPremiumPlan && isNotExpired);
          setIsTrialing(isActiveTrialing && isNotExpired);
        }
      } catch (err) {
        console.error('Error fetching entitlement:', err);
        setIsPremium(false);
        setIsTrialing(false);
      } finally {
        setLoading(false);
      }
    };

    fetchEntitlement();
  }, [userId]);

  return {
    isPremium,
    isTrialing,
    isPremiumOrTrialing: isPremium || isTrialing,
    loading
  };
}