const Stripe = require('stripe');

// Vercel needs raw body for webhook signature verification
module.exports.config = { api: { bodyParser: false } };

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    if (!sig || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return res.status(400).json({ error: 'Missing signature' });
    }

    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log(`Payment completed for device: ${session.client_reference_id}, plan: ${session.metadata?.plan}`);
      // Payment verified by Stripe. Token is generated client-side via /api/verify.
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      console.log(`Subscription cancelled: ${subscription.id}, device: ${subscription.metadata?.deviceId}`);
      // When subscription ends, the token will naturally expire (35 day window)
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.log(`Payment failed for subscription: ${invoice.subscription}`);
      break;
    }
    default:
      // Unhandled event type
      break;
  }

  return res.status(200).json({ received: true });
};
