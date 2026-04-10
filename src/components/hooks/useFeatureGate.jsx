/**
 * useFeatureGate Hook
 * 
 * Frontend hook that checks feature access and triggers upgrade modal if blocked.
 * Usage:
 * 
 * const { allowed, isPending } = useFeatureGate('academy.diploma');
 * 
 * if (isPending) return <div>Loading...</div>;
 * if (!allowed) return null; // Modal shown automatically
 * 
 * // Feature is allowed, render component
 */

import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { FEATURE_LABELS } from '../featureKeys';

export function useFeatureGate(featureKey, onBlock = null) {
  const [allowed, setAllowed] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [checkResult, setCheckResult] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const checkAccess = useCallback(async () => {
    setIsPending(true);
    try {
      const isAuth = await base44.auth.isAuthenticated().catch(() => false);
      if (!isAuth) {
        setAllowed(false);
        setIsPending(false);
        return;
      }
      const result = await base44.functions.invoke('checkFeatureAccess', {
        featureKey,
      });

      const data = result.data;
      setCheckResult(data);
      setAllowed(data.allowed);

      if (!data.allowed && data.reason === 'premium_required') {
        setShowUpgradeModal(true);
        if (onBlock) onBlock(data);
      }
    } catch (error) {
      console.error('useFeatureGate error:', error);
      setAllowed(false);
      setShowUpgradeModal(true);
    } finally {
      setIsPending(false);
    }
  }, [featureKey, onBlock]);

  return {
    allowed,
    isPending,
    checkResult,
    checkAccess,
    showUpgradeModal,
    closeUpgradeModal: () => setShowUpgradeModal(false),
    featureName: FEATURE_LABELS[featureKey] || featureKey,
  };
}

/**
 * requireFeatureAccess (Higher-order hook)
 * 
 * Call this when user clicks a button to trigger a premium feature.
 * If not allowed, modal opens automatically.
 * If allowed, callback runs.
 * 
 * Usage:
 * 
 * const requireDiploma = useRequireFeatureAccess('academy.diploma');
 * 
 * <Button onClick={() => requireDiploma(() => handleEnrollDiploma())}>
 *   Enroll in Diploma
 * </Button>
 */

export function useRequireFeatureAccess(featureKey) {
  const {
    checkResult,
    showUpgradeModal,
    closeUpgradeModal,
    checkAccess,
    featureName,
  } = useFeatureGate(featureKey);

  const require = useCallback(
    (callback) => {
      (async () => {
        const isAuth = await base44.auth.isAuthenticated().catch(() => false);
        if (!isAuth) return;

        const result = await base44.functions.invoke('checkFeatureAccess', { featureKey }).catch(() => ({ data: { allowed: false } }));
        if (result.data?.allowed) {
          callback();
        }
      })();
    },
    [featureKey]
  );

  return {
    require,
    showUpgradeModal,
    closeUpgradeModal,
    checkResult,
    featureName,
  };
}