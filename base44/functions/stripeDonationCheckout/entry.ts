import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Donation price IDs
const DONATION_PRICES = {
  3:  'price_1TG7JgCbIJ45iaATIbZg35d6',
  5:  'price_1TG7JgCbIJ45iaATk5B6vMKC',
  10: 'price_1TG7JgCbIJ45iaATRR03QVa1',
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { amount, customAmount, email, origin } = await req.json();

    // Determine price — either a preset or a custom ad-hoc amount
    let lineItem;
    if (customAmount && customAmount > 0) {
      // Custom amount: use price_data
      lineItem = {
        price_data: {
          currency: 'usd',
          product: 'prod_U8y23n9pHpk32X',
          unit_amount: Math.round(customAmount * 100),
        },
        quantity: 1,
      };
    } else if (DONATION_PRICES[amount]) {
      lineItem = { price: DONATION_PRICES[amount], quantity: 1 };
    } else {
      return Response.json({ error: 'Invalid donation amount' }, { status: 400 });
    }

    const successUrl = `${origin || 'https://app.base44.com'}/DonationSuccess`;
    const cancelUrl = `${origin || 'https://app.base44.com'}/SupportFaithLight`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [lineItem],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(email ? { customer_email: email } : {}),
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        type: 'donation',
        amount: String(customAmount || amount),
      },
    });

    console.log(`[stripeDonationCheckout] Session created: ${session.id} amount: ${customAmount || amount}`);
    return Response.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error('[stripeDonationCheckout] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});