import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const DONATION_AMOUNTS = {
  3:  { label: 'Support the mission',           cents: 300  },
  10: { label: 'Help translate Scripture tools', cents: 1000 },
  25: { label: 'Help expand FaithLight worldwide', cents: 2500 },
};

Deno.serve(async (req) => {
  try {
    const { amount, customAmount } = await req.json();

    // Determine cents
    let cents;
    let description;
    if (customAmount && customAmount >= 1) {
      cents = Math.round(customAmount * 100);
      description = 'Custom donation – FaithLight';
    } else if (DONATION_AMOUNTS[amount]) {
      cents = DONATION_AMOUNTS[amount].cents;
      description = DONATION_AMOUNTS[amount].label + ' – FaithLight';
    } else {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (cents < 100) {
      return Response.json({ error: 'Minimum donation is $1' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://app.base44.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: '❤️ Support FaithLight',
            description,
            images: [],
          },
          unit_amount: cents,
        },
        quantity: 1,
      }],
      success_url: `${origin}/SupportFaithLight?success=1&amount=${cents / 100}`,
      cancel_url: `${origin}/SupportFaithLight?cancelled=1`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        donation_amount_usd: String(cents / 100),
        type: 'donation',
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error('createDonationCheckout error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});