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

    const { event_id, success_url, cancel_url } = await req.json();

    // Fetch event
    const events = await base44.entities.LiveRoom.filter({ id: event_id }, '', 1);
    const event = events[0];
    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    const priceInCents = Math.round((event.ticket_price || 0) * 100);
    if (priceInCents <= 0) {
      return Response.json({ error: 'Event is free' }, { status: 400 });
    }

    // Check if ticket already exists
    const existing = await base44.entities.EventTicket.filter({ event_id, user_id: user.id, status: 'paid' }, '', 1);
    if (existing.length > 0) {
      return Response.json({ already_purchased: true });
    }

    // Create pending ticket record
    const ticket = await base44.entities.EventTicket.create({
      event_id,
      user_id: user.id,
      user_email: user.email,
      amount_paid: event.ticket_price,
      status: 'pending',
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: priceInCents,
          product_data: {
            name: event.title,
            description: event.description || 'Live event ticket',
          },
        },
        quantity: 1,
      }],
      customer_email: user.email,
      success_url: success_url || `${req.headers.get('origin')}/LiveEvents`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/LiveEvents`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        event_id,
        user_id: user.id,
        ticket_id: ticket.id,
      },
    });

    return Response.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createEventTicketCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});