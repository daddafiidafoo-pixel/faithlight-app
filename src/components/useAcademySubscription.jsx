/**
 * Hook: useAcademySubscription
 * 
 * Checks if current user has active Academy Premium subscription
 * Useful for protecting content & showing paywalls
 * 
 * Usage:
 * const { isSubscribed, loading, error } = useAcademySubscription();
 * 
 * if (!isSubscribed) {
 *   return <AcademyPaywall contentTitle="Course Name" />;
 * }
 */

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useAcademySubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Get current user
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (!currentUser) {
          setIsSubscribed(false);
          setLoading(false);
          return;
        }

        // Check if user has UserEntitlement for 'academy_premium'
        // (This assumes a UserEntitlement entity tracks subscriptions)
        try {
          const entitlements = await base44.entities.UserEntitlement.filter({
            user_id: currentUser.id,
            entitlement_type: 'academy_premium',
            status: 'active',
          });

          setIsSubscribed(entitlements && entitlements.length > 0);
        } catch {
          // If UserEntitlement doesn't exist yet, check user custom fields
          setIsSubscribed(currentUser.academy_premium_subscribed === true);
        }

        setError(null);
      } catch (err) {
        console.error('Error checking subscription:', err);
        setError(err.message);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return {
    isSubscribed,
    loading,
    error,
    user,
  };
}