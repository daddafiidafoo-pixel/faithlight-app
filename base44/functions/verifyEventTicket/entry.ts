import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, ticket_id } = await req.json();

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      await base44.entities.EventTicket.update(ticket_id, {
        status: 'paid',
        stripe_session_id: session_id,
        stripe_payment_intent: session.payment_intent,
      });
      return Response.json({ success: true });
    }

    return Response.json({ success: false, payment_status: session.payment_status });
  } catch (error) {
    console.error('verifyEventTicket error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});