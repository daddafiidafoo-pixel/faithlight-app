import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { package_name, subscription_id, purchase_token, user_id } = await req.json();

    if (!package_name || !subscription_id || !purchase_token || !user_id) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify with Google Play
    const googleResponse = await verifyWithGoogle(
      package_name,
      subscription_id,
      purchase_token
    );

    if (!googleResponse.valid) {
      console.error('Google receipt verification failed:', googleResponse.error);
      return Response.json(
        { error: 'Invalid purchase token' },
        { status: 401 }
      );
    }

    console.log(`Google receipt verified for user ${user_id}`);

    // Check subscription is active
    const subscriptionStatus = googleResponse.subscriptionState;
    const isActive = subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'PENDING';

    if (!isActive) {
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

    const expiryTime = parseInt(googleResponse.expiryTimeMillis);
    const expiryDate = new Date(expiryTime).toISOString();

    const entitlementData = {
      user_id,
      product: 'faithlight_premium',
      status: isActive ? 'active' : 'inactive',
      source: 'google_iap',
      current_period_end: expiryDate,
      provider_customer_id: package_name,
      provider_subscription_id: googleResponse.orderId,
      last_event: 'google_receipt_verified',
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
      expiry_date: expiryDate,
      subscription_state: subscriptionStatus,
    });
  } catch (error) {
    console.error('Google verification error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});

async function verifyWithGoogle(packageName, subscriptionId, purchaseToken) {
  try {
    const accessToken = await getGoogleAccessToken();

    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/subscriptions/${subscriptionId}/purchases/tokens/${purchaseToken}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Google API error: ${response.status}`);
      return { valid: false, error: 'Google API request failed' };
    }

    const data = await response.json();

    // Check if purchase is valid (not canceled, not pending cancellation)
    const isValid =
      data.paymentState === 1 && // Payment received (0 = pending, 1 = received)
      (!data.cancelReason || data.cancelReason === null);

    return {
      valid: isValid,
      subscriptionState: data.subscriptionState,
      expiryTimeMillis: data.expiryTimeMillis,
      orderId: data.orderId,
      error: !isValid ? 'Invalid payment state or canceled' : null,
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function getGoogleAccessToken() {
  const privateKeyId = Deno.env.get('GOOGLE_PRIVATE_KEY_ID');
  const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY');
  const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL');
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');

  if (!privateKey || !clientEmail) {
    throw new Error('Missing Google service account credentials');
  }

  // Create JWT
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: privateKeyId,
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Encode JWT (simplified - use a proper JWT library in production)
  const headerEncoded = btoa(JSON.stringify(header));
  const payloadEncoded = btoa(JSON.stringify(payload));

  // For proper implementation, sign the JWT with RS256
  // This is a simplified placeholder - use crypto in production
  const signature = await signJWT(
    `${headerEncoded}.${payloadEncoded}`,
    privateKey
  );

  const jwt = `${headerEncoded}.${payloadEncoded}.${signature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    throw new Error(`Google token error: ${tokenData.error}`);
  }

  return tokenData.access_token;
}

async function signJWT(message, privateKey) {
  // Use Web Crypto API (async) instead of Node crypto (sync)
  // This is required for Deno
  const encoder = new TextEncoder();
  const msgBuffer = encoder.encode(message);

  // Import private key (PEM format)
  const keyData = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    msgBuffer
  );

  // Convert signature to base64url
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}