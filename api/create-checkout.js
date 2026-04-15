const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { deviceId, plan } = req.body || {};

  if (!deviceId) return res.status(400).json({ error: 'Missing deviceId' });

  const PRICES = {
    lifetime: process.env.STRIPE_PRICE_LIFETIME,
    monthly: process.env.STRIPE_PRICE_MONTHLY,
  };

  const priceId = PRICES[plan];
  if (!priceId) return res.status(400).json({ error: 'Invalid plan. Use "lifetime" or "monthly".' });

  const baseUrl = process.env.APP_URL || 'https://www.qrflare.app';

  try {
    const sessionParams = {
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan === 'monthly' ? 'subscription' : 'payment',
      success_url: `${baseUrl}/?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?payment_status=cancelled`,
      metadata: { deviceId, plan },
      client_reference_id: deviceId,
    };

    // For subscriptions, also add metadata to subscription
    if (plan === 'monthly') {
      sessionParams.subscription_data = { metadata: { deviceId, plan } };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};
