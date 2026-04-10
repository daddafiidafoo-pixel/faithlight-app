import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { support_type, amount, donor_name, success_url, cancel_url } = await req.json();

    if (!support_type || !amount || !donor_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const amountCents = Math.round(Number(amount) * 100);
    if (amountCents < 100) {
      return Response.json({ error: 'Minimum donation is $1' }, { status: 400 });
    }

    let mode = 'payment';
    let priceData = {
      currency: 'usd',
      unit_amount: amountCents,
      product_data: {
        name: support_type === 'monthly'
          ? 'FaithLight Monthly Support'
          : support_type === 'yearly'
          ? 'FaithLight Yearly Support'
          : 'FaithLight One-Time Support',
        description: "Supporting FaithLight mission to bring God's Word to everyone.",
      },
    };

    if (support_type === 'monthly') {
      mode = 'subscription';
      priceData.recurring = { interval: 'month' };
    } else if (support_type === 'yearly') {
      mode = 'subscription';
      priceData.recurring = { interval: 'year' };
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ['card'],
      line_items: [{ price_data: priceData, quantity: 1 }],
      success_url: success_url || `${req.headers.get('origin')}/BillingSuccess?type=support&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/SupportFaithLight`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        support_type,
        donor_name,
        amount: String(amount),
      },
    });

    console.log(`Support checkout created: ${session.id}, type=${support_type}, amount=${amount}`);
    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createSupportCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});