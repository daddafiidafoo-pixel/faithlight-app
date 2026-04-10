/**
 * Reader-mode billing guard.
 *
 * Set HAS_REAL_MOBILE_IAP = true once StoreKit / Google Play Billing is wired.
 * Until then, all purchase UI is hidden inside the native wrapper.
 */
import { isNativeWrapper } from '@/components/lib/platform/nativeWrapper';

export const HAS_REAL_MOBILE_IAP = false;

/** Should any payment / pricing UI be shown? */
export function shouldShowPaymentsUI() {
  if (isNativeWrapper() && !HAS_REAL_MOBILE_IAP) return false;
  return true;
}

/** Should upsell modals be triggered? */
export function shouldShowUpsells() {
  return shouldShowPaymentsUI();
}