/**
 * Stripe Webhook Handler
 * Events: checkout.session.completed, customer.subscription.created/updated/deleted,
 *         invoice.paid, invoice.payment_failed
 * Security: signature verification via constructEventAsync
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = (await import('npm:stripe@15.0.0')).default(
  Deno.env.get('STRIPE_SECRET_KEY'),
  { apiVersion: '2024-06-20' }
);

const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    console.error('❌ Missing stripe-signature header');
    return new Response('Missing stripe-signature', { status: 400 });
  }

  const body = await req.arrayBuffer();
  const bodyText = new TextDecoder().decode(body);

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(bodyText, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`📨 Stripe event: ${event.type} [${event.id}]`);

  try {
    // Use service role — no user auth needed for webhooks
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, db);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpsert(event.data.object, db);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, db);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object, db);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, db);
        break;
      default:
        break;
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error(`❌ Handler error for ${event.type}:`, err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
});

// ── helpers ──────────────────────────────────────────────────────────────────

function normalizePlanKey(raw) {
  const x = String(raw || '').toUpperCase();
  if (x.includes('PREMIUM')) return 'PREMIUM';
  if (x.includes('BASIC')) return 'BASIC';
  return 'FREE';
}

function isActiveStatus(status) {
  return status === 'active' || status === 'trialing';
}

async function upsertUserBilling(db, userId, patch) {
  const rows = await db.entities.UserBilling.filter({ user_id: userId });
  const now = new Date().toISOString();
  if (rows.length > 0) {
    await db.entities.UserBilling.update(rows[0].id, { ...patch, updated_at: now });
  } else {
    await db.entities.UserBilling.create({ user_id: userId, updated_at: now, ...patch });
  }
}

async function upsertEntitlement(db, userId, status, planKey) {
  const active = isActiveStatus(status);
  const rows = await db.entities.Entitlement.filter({ user_id: userId, product: 'faithlight_premium' });
  const data = {
    user_id: userId,
    product: 'faithlight_premium',
    status: active ? 'active' : 'inactive',
    source: 'stripe_web',
    last_event: status,
  };
  if (rows.length > 0) {
    await db.entities.Entitlement.update(rows[0].id, data);
  } else {
    await db.entities.Entitlement.create(data);
  }
  console.log(`✅ Entitlement → user=${userId} plan=${planKey} active=${active}`);
}

async function resolveUserIdByCustomer(db, stripeCustomerId) {
  const rows = await db.entities.UserBilling.filter({ stripe_customer_id: stripeCustomerId });
  return rows?.[0]?.user_id || null;
}

// ── event handlers ────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session, db) {
  if (session.mode !== 'subscription') return;

  const userId = session.metadata?.userId || session.client_reference_id;
  const planKey = normalizePlanKey(session.metadata?.planKey || 'PREMIUM');
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  if (!userId) {
    console.error('❌ checkout.session.completed: missing userId in metadata');
    return;
  }

  const sub = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
  const status = sub?.status || 'active';

  await upsertUserBilling(db, userId, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan_key: planKey,
    status,
    current_period_end: sub?.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: !!sub?.cancel_at_period_end,
  });

  await upsertEntitlement(db, userId, status, planKey);
}

async function handleSubscriptionUpsert(sub, db) {
  const userId = sub.metadata?.userId || await resolveUserIdByCustomer(db, sub.customer);
  if (!userId) {
    console.warn(`⚠️ subscription.updated: cannot resolve user for customer ${sub.customer}`);
    return;
  }

  const planKey = normalizePlanKey(sub.metadata?.planKey || '');

  await upsertUserBilling(db, userId, {
    stripe_customer_id: sub.customer,
    stripe_subscription_id: sub.id,
    plan_key: planKey,
    status: sub.status,
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: !!sub.cancel_at_period_end,
  });

  await upsertEntitlement(db, userId, sub.status, planKey);
}

async function handleSubscriptionDeleted(sub, db) {
  const userId = sub.metadata?.userId || await resolveUserIdByCustomer(db, sub.customer);
  if (!userId) {
    console.warn(`⚠️ subscription.deleted: cannot resolve user for customer ${sub.customer}`);
    return;
  }

  await upsertUserBilling(db, userId, {
    stripe_customer_id: sub.customer,
    stripe_subscription_id: sub.id,
    status: 'canceled',
    cancel_at_period_end: false,
  });

  await upsertEntitlement(db, userId, 'canceled', 'FREE');
}

async function handleInvoicePaid(invoice, db) {
  const userId = await resolveUserIdByCustomer(db, invoice.customer);
  if (!userId) return;

  // Idempotent upsert by stripe_invoice_id
  const existing = await db.entities.BillingInvoice.filter({ stripe_invoice_id: invoice.id });
  const invoiceData = {
    user_id: userId,
    stripe_customer_id: invoice.customer,
    stripe_invoice_id: invoice.id,
    amount_paid: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status,
    hosted_invoice_url: invoice.hosted_invoice_url || null,
    invoice_pdf: invoice.invoice_pdf || null,
    period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
    period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
    invoice_created_at: invoice.created ? new Date(invoice.created * 1000).toISOString() : new Date().toISOString(),
  };

  if (existing.length > 0) {
    await db.entities.BillingInvoice.update(existing[0].id, invoiceData);
  } else {
    await db.entities.BillingInvoice.create(invoiceData);
  }

  console.log(`🧾 Invoice recorded for user ${userId}: ${invoice.id}`);

  // Ensure entitlement is active on successful payment
  const billing = (await db.entities.UserBilling.filter({ user_id: userId }))?.[0];
  await upsertEntitlement(db, userId, 'active', billing?.plan_key || 'PREMIUM');
}

async function handlePaymentFailed(invoice, db) {
  const userId = await resolveUserIdByCustomer(db, invoice.customer);
  if (!userId) return;
  console.warn(`⚠️ Payment failed for user ${userId}`);
  await upsertUserBilling(db, userId, { status: 'past_due' });
  // Don't immediately revoke — let subscription.updated handle grace period
}