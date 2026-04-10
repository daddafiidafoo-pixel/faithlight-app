import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SubscriptionPaywall from '@/components/subscriptions/SubscriptionPaywall';

/**
 * Hook to check user subscription status
 * Returns subscription state and helper functions
 */
export function useSubscription() {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    getUser();
  }, []);

  // Fetch subscription
  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ['userSubscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const subs = await base44.entities.UserSubscription.filter({ user_id: user.id });
      return subs.length > 0 ? subs[0] : null;
    },
    enabled: !!user?.id && !isInitializing,
  });

  const isSubscribed = 
    subscription?.status === 'active' && 
    subscription?.subscription_type !== 'free';

  const canAccessAcademy = isSubscribed;

  const isExpired =
    subscription?.status === 'expired' ||
    (subscription?.expires_at && new Date(subscription.expires_at) < new Date());

  const getExpiryDate = () => {
    if (!subscription?.expires_at) return null;
    return new Date(subscription.expires_at);
  };

  return {
    user,
    subscription,
    isLoading: isLoading || isInitializing,
    isSubscribed,
    canAccessAcademy,
    isExpired,
    getExpiryDate,
    refetch,
  };
}

/**
 * HOC to protect Academy content
 * Returns component that checks subscription before rendering
 */
export function withSubscriptionCheck(Component, contentType = 'course') {
  return function ProtectedComponent(props) {
    const [showPaywall, setShowPaywall] = useState(false);
    const { canAccessAcademy, isLoading } = useSubscription();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      );
    }

    if (!canAccessAcademy) {
      return (
        <>
          <Component {...props} isLocked={true} />
          {showPaywall && (
            <SubscriptionPaywall
              isOpen={showPaywall}
              onClose={() => setShowPaywall(false)}
              contentType={contentType}
            />
          )}
        </>
      );
    }

    return <Component {...props} isLocked={false} />;
  };
}