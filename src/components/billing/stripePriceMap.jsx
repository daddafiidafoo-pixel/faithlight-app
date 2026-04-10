// Stripe price map - update with your actual price IDs from Stripe dashboard
export const STRIPE_PRICE_MAP = {
  BASIC_MONTHLY: null,
  PREMIUM_MONTHLY: null,
  PREMIUM_YEARLY: null,
};

export const PLAN_KEYS = {
  FREE: "FREE",
  BASIC: "BASIC",
  PREMIUM: "PREMIUM",
};

export function getStripePriceId({ planKey, interval }) {
  if (planKey === PLAN_KEYS.BASIC && interval === "month") return STRIPE_PRICE_MAP.BASIC_MONTHLY;
  if (planKey === PLAN_KEYS.PREMIUM && interval === "month") return STRIPE_PRICE_MAP.PREMIUM_MONTHLY;
  if (planKey === PLAN_KEYS.PREMIUM && interval === "year") return STRIPE_PRICE_MAP.PREMIUM_YEARLY;
  return null;
}

export function isStripeConfigured() {
  return !!STRIPE_PRICE_MAP.BASIC_MONTHLY && !!STRIPE_PRICE_MAP.PREMIUM_MONTHLY && !!STRIPE_PRICE_MAP.PREMIUM_YEARLY;
}

function isInIframe() {
  try { return window.self !== window.top; } catch { return true; }
}

export async function startCheckout(planKey, interval, base44Ref) {
  if (isInIframe()) {
    alert("Checkout is not available in embedded views. Please open the app in a full browser window to subscribe.");
    return;
  }

  const priceId = getStripePriceId({ planKey, interval });
  if (!priceId) {
    alert("Payments are not configured yet. Please contact support to enable premium features.");
    return;
  }
  
  try {
    const { data } = await base44Ref.functions.invoke('createCheckoutSession', {
      price_id: priceId,
      plan_key: planKey,
      interval,
      success_url: `${window.location.origin}/BillingSuccess`,
      cancel_url: `${window.location.origin}/BillingCancel`,
    });
    
    if (data?.session_url) {
      window.location.href = data.session_url;
    } else if (data?.url) {
      window.location.href = data.url;
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert('Failed to start checkout. Please try again.');
  }
}