/**
 * Returns current UserBilling record + last 25 BillingInvoices from DB.
 * No live Stripe calls — data is kept fresh by webhooks.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const db = base44.asServiceRole;

    const billingRows = await db.entities.UserBilling.filter({ user_id: user.id }).catch(e => {
      console.warn('UserBilling fetch failed:', e.message);
      return [];
    });

    const invoiceRows = await db.entities.BillingInvoice.filter({ user_id: user.id }).catch(e => {
      console.warn('BillingInvoice fetch failed:', e.message);
      return [];
    });

    const entitlementRows = await db.entities.UserEntitlement.filter({ user_id: user.id }).catch(e => {
      console.warn('UserEntitlement fetch failed:', e.message);
      return [];
    });

    const billing = billingRows?.[0] || null;
    const entitlement = entitlementRows?.find(e => e.entitlement_key === 'premium') || null;

    // Sort invoices newest first
    const invoices = (invoiceRows || []).sort(
      (a, b) => new Date(b.invoice_created_at) - new Date(a.invoice_created_at)
    ).slice(0, 25);

    const isPremium = entitlement?.is_active === true || entitlement?.status === 'active';

    return Response.json({
      plan: billing?.plan_key || 'FREE',
      billing,
      entitlement,
      is_premium: isPremium,
      invoices,
    });
  } catch (err) {
    console.error('❌ getSubscriptionDetails error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});