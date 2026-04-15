const crypto = require('crypto');
const Stripe = require('stripe');

function signToken(data, secret) {
  const payload = JSON.stringify(data);
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const secret = process.env.TOKEN_SECRET;
  const { sessionId, deviceId } = req.body || {};

  if (!sessionId || !deviceId) {
    return res.status(400).json({ error: 'Missing sessionId or deviceId' });
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed', status: session.payment_status });
    }

    // Verify this session belongs to this device
    if (session.client_reference_id !== deviceId && session.metadata?.deviceId !== deviceId) {
      return res.status(403).json({ error: 'Device mismatch' });
    }

    // Determine plan type
    const plan = session.mode === 'subscription' ? 'monthly' : 'lifetime';

    // Create a signed token that proves premium status
    const tokenData = {
      deviceId,
      plan,
      sessionId: session.id,
      paidAt: Date.now(),
      expiresAt: plan === 'monthly'
        ? Date.now() + (35 * 24 * 60 * 60 * 1000) // 35 days for monthly (5 day grace)
        : Date.now() + (100 * 365 * 24 * 60 * 60 * 1000), // ~100 years for lifetime
    };

    const token = signToken(tokenData, secret);

    return res.status(200).json({
      premium: true,
      plan,
      token,
      expiresAt: tokenData.expiresAt,
    });
  } catch (err) {
    console.error('Verify error:', err.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
};
