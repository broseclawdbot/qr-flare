const crypto = require('crypto');

function verifyToken(token, secret) {
  try {
    const [encoded, sig] = token.split('.');
    if (!encoded || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
    if (sig !== expectedSig) return null; // Signature mismatch — tampered
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (payload.expiresAt && Date.now() > payload.expiresAt) return null; // Expired
    return payload;
  } catch (e) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.TOKEN_SECRET;
  const { token, deviceId } = req.body || {};

  if (!token || !deviceId) {
    return res.status(200).json({ premium: false, reason: 'No token' });
  }

  const payload = verifyToken(token, secret);

  if (!payload) {
    return res.status(200).json({ premium: false, reason: 'Invalid or expired token' });
  }

  if (payload.deviceId !== deviceId) {
    return res.status(200).json({ premium: false, reason: 'Device mismatch' });
  }

  return res.status(200).json({
    premium: true,
    plan: payload.plan,
    expiresAt: payload.expiresAt,
  });
};
