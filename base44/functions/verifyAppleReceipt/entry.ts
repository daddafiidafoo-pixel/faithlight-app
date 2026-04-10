import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { receipt_data, user_id } = await req.json();

    if (!receipt_data || !user_id) {
      return Response.json(
        { error: 'Missing receipt_data or user_id' },
        { status: 400 }
      );
    }

    // Verify receipt with Apple App Store
    const appleResponse = await verifyWithApple(receipt_data);

    if (!appleResponse.valid) {
      console.error('Apple receipt verification failed:', appleResponse.error);
      return Response.json(
        { error: 'Invalid receipt' },
        { status: 401 }
      );
    }

    console.log(`Apple receipt verified for user ${user_id}`);

    // Extract subscription info from Apple response
    const subscriptionInfo = extractAppleSubscriptionInfo(appleResponse);

    if (!subscriptionInfo.isActive) {
      return Response.json(
        { error: 'Subscription not active' },
        { status: 400 }
      );
    }

    // Upsert entitlement
    const existing = await base44.asServiceRole.entities.Entitlement.filter(
      { user_id, product: 'faithlight_premium' },
      '-created_date',
      1
    );

    const entitlementData = {
      user_id,
      product: 'faithlight_premium',
      status: 'active',
      source: 'apple_iap',
      current_period_end: new Date(subscriptionInfo.expiryDate).toISOString(),
      provider_customer_id: subscriptionInfo.appUserId,
      provider_subscription_id: subscriptionInfo.transactionId,
      last_event: 'apple_receipt_verified',
    };

    if (existing && existing.length > 0) {
      await base44.asServiceRole.entities.Entitlement.update(
        existing[0].id,
        entitlementData
      );
      console.log(`Updated entitlement ${existing[0].id}`);
    } else {
      await base44.asServiceRole.entities.Entitlement.create(entitlementData);
      console.log(`Created entitlement for user ${user_id}`);
    }

    return Response.json({
      valid: true,
      expiry_date: subscriptionInfo.expiryDate,
      bundle_id: subscriptionInfo.bundleId,
    });
  } catch (error) {
    console.error('Apple verification error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});

async function verifyWithApple(receiptData) {
  // Use sandbox or production URL based on environment
  const isSandbox = Deno.env.get('ENVIRONMENT') === 'development';
  const url = isSandbox
    ? 'https://sandbox.itunes.apple.com/verifyReceipt'
    : 'https://buy.itunes.apple.com/verifyReceipt';

  const payload = {
    'receipt-data': receiptData,
    password: Deno.env.get('APPLE_APP_SHARED_SECRET'),
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Apple status codes: 0 = valid, 21007/21008 = sandbox/production mismatch
    if (data.status === 0) {
      return { valid: true, receipt: data.receipt };
    } else if (data.status === 21007 && isSandbox) {
      // Try production
      return verifyWithAppleProduction(receiptData);
    } else {
      return { valid: false, error: `Apple status code: ${data.status}` };
    }
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function verifyWithAppleProduction(receiptData) {
  const url = 'https://buy.itunes.apple.com/verifyReceipt';
  const payload = {
    'receipt-data': receiptData,
    password: Deno.env.get('APPLE_APP_SHARED_SECRET'),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (data.status === 0) {
    return { valid: true, receipt: data.receipt };
  }
  return { valid: false, error: `Production status code: ${data.status}` };
}

function extractAppleSubscriptionInfo(appleResponse) {
  const receipt = appleResponse.receipt;
  const inApp = receipt.in_app || [];

  // Get latest subscription
  const latestSub = inApp
    .filter(
      (sub) => sub.bundle_id === Deno.env.get('APPLE_BUNDLE_ID')
    )
    .sort(
      (a, b) =>
        new Date(b.purchase_date_ms) - new Date(a.purchase_date_ms)
    )[0];

  if (!latestSub) {
    return { isActive: false };
  }

  const expiryDate = new Date(parseInt(latestSub.expires_date_ms));
  const now = new Date();
  const isActive = expiryDate > now;

  return {
    isActive,
    expiryDate: expiryDate.toISOString(),
    bundleId: latestSub.bundle_id,
    transactionId: latestSub.transaction_id,
    appUserId: latestSub.app_user_id,
  };
}