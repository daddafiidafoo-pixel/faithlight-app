import Stripe from 'npm:stripe@14.0.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return Response.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify user owns this session (optional but recommended for security)
    if (session.customer_email !== user.email) {
      console.warn(
        `Email mismatch for session ${sessionId}: ${session.customer_email} vs ${user.email}`
      );
    }

    // Check payment status
    const paymentStatus = session.payment_status;
    const fulfillmentStatus = session.fulfillment_status;

    return Response.json({
      success: true,
      sessionId: session.id,
      paymentStatus,
      fulfillmentStatus,
      customerEmail: session.customer_email,
      metadata: session.metadata || {},
      amountTotal: session.amount_total,
      currency: session.currency,
      createdAt: new Date(session.created * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return Response.json(
      { error: error.message || 'Failed to verify session' },
      { status: 500 }
    );
  }
});