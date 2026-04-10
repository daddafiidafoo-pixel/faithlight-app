import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Sync Apple StoreKit 2 subscription with FaithLight backend.
 * Called after a verified purchase or restore on iOS.
 *
 * Accepts both StoreKit 2 (signedTransactionInfo) and legacy receipts.
 */
Deno.serve(async (req) => {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // StoreKit 2 fields
    const {
      productId,
      transactionId,
      originalTransactionId,
      purchaseDate,
      expiresDate,
      signedTransactionInfo,  // JWS from StoreKit 2 transaction.jsonRepresentation
      // Legacy fallback
      originalTransactionId: legacyOrigId,
      transactionDate,
    } = body;

    const productID = productId || body.apple_product_id;
    const origTxId = originalTransactionId || legacyOrigId;

    if (!productID || !origTxId) {
      return Response.json({ error: 'Missing required fields: productId + originalTransactionId' }, { status: 400 });
    }

    // Determine plan from product ID
    let planType = 'monthly';
    if (productID.includes('yearly') || productID.includes('annual')) {
      planType = 'yearly';
    }

    // Parse dates
    const periodStart = purchaseDate || transactionDate || new Date().toISOString();
    let periodEnd = expiresDate;
    if (!periodEnd) {
      // Fallback: monthly +31 days, yearly +366 days
      const ms = planType === 'yearly' ? 366 * 86400000 : 31 * 86400000;
      periodEnd = new Date(new Date(periodStart).getTime() + ms).toISOString();
    }

    // Upsert subscription record
    const existing = await base44.asServiceRole.entities.UserSubscription.filter(
      { user_id: user.id }, '-updated_date', 1
    );

    const subscriptionData = {
      user_id: user.id,
      plan_type: planType,
      is_active: true,
      provider: 'apple',
      apple_original_transaction_id: origTxId,
      apple_product_id: productID,
      current_period_start: new Date(periodStart).toISOString(),
      current_period_end: new Date(periodEnd).toISOString(),
      cancel_at_period_end: false,
    };

    if (existing[0]) {
      await base44.asServiceRole.entities.UserSubscription.update(existing[0].id, subscriptionData);
    } else {
      await base44.asServiceRole.entities.UserSubscription.create(subscriptionData);
    }

    console.log(`Apple IAP synced for user ${user.id}: ${productID} (${planType}), expires ${periodEnd}`);

    return Response.json({
      success: true,
      message: 'Subscription synced',
      plan_type: planType,
      expires: periodEnd,
    });

  } catch (error) {
    console.error('syncAppleSubscription error:', error);
    return Response.json({ error: error.message || 'Sync failed' }, { status: 500 });
  }
});