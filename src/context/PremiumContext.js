import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

const FREE_LIMIT = 3;
const GRACE_LIMIT = 4;
const STORAGE_KEY = 'qrflare_gen_count';
const TOKEN_KEY = 'qrflare_token';
const DEVICE_ID_KEY = 'qrflare_device_id';
const DISMISSED_OFFER_KEY = 'qrflare_dismissed_offer';
const API_BASE = '';  // Same origin — Vercel serves both app and API

const storage = {
  get: (key) => {
    if (Platform.OS === 'web') {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    return null;
  },
  set: (key, val) => {
    if (Platform.OS === 'web') {
      try { window.localStorage.setItem(key, String(val)); } catch (e) {}
    }
  },
  remove: (key) => {
    if (Platform.OS === 'web') {
      try { window.localStorage.removeItem(key); } catch (e) {}
    }
  },
};

const getDeviceId = () => {
  let id = storage.get(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    storage.set(DEVICE_ID_KEY, id);
  }
  return id;
};

const PremiumContext = createContext({});

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generationCount, setGenerationCount] = useState(() => {
    const saved = storage.get(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [dismissedFirstOffer, setDismissedFirstOffer] = useState(() => storage.get(DISMISSED_OFFER_KEY) === 'true');
  const [deviceId] = useState(() => getDeviceId());

  // Persist generation count
  useEffect(() => { storage.set(STORAGE_KEY, generationCount); }, [generationCount]);
  useEffect(() => { storage.set(DISMISSED_OFFER_KEY, dismissedFirstOffer ? 'true' : 'false'); }, [dismissedFirstOffer]);

  // On mount, check if there's a valid premium token
  useEffect(() => {
    const token = storage.get(TOKEN_KEY);
    if (token) {
      verifyTokenWithServer(token);
    }
    // Also check URL for payment success redirect
    if (Platform.OS === 'web') {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      const paymentStatus = params.get('payment_status');
      if (sessionId && paymentStatus === 'success') {
        verifyPayment(sessionId);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const verifyTokenWithServer = async (token) => {
    try {
      const resp = await fetch(`${API_BASE}/api/check-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, deviceId }),
      });
      const data = await resp.json();
      if (data.premium) {
        setIsPremium(true);
      } else {
        // Token invalid or expired — clear it
        storage.remove(TOKEN_KEY);
        setIsPremium(false);
      }
    } catch (e) {
      // If server is down, trust local token temporarily
      console.log('Token verification failed:', e);
    }
  };

  const verifyPayment = async (sessionId) => {
    setIsVerifying(true);
    try {
      const resp = await fetch(`${API_BASE}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, deviceId }),
      });
      const data = await resp.json();
      if (data.premium && data.token) {
        storage.set(TOKEN_KEY, data.token);
        setIsPremium(true);
      }
    } catch (e) {
      console.log('Payment verification failed:', e);
    }
    setIsVerifying(false);
  };

  // Create a Stripe Checkout Session via backend
  const startCheckout = useCallback(async (plan) => {
    try {
      const resp = await fetch(`${API_BASE}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, plan }),
      });
      const data = await resp.json();
      if (data.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url; // Redirect to Stripe
        } else {
          const { Linking } = require('react-native');
          Linking.openURL(data.url);
        }
      }
    } catch (e) {
      console.log('Checkout creation failed:', e);
    }
  }, [deviceId]);

  const incrementGeneration = () => setGenerationCount((c) => c + 1);
  const dismissOffer = () => setDismissedFirstOffer(true);

  const maxAllowed = dismissedFirstOffer ? GRACE_LIMIT : FREE_LIMIT;
  const canGenerate = isPremium || generationCount < maxAllowed;
  const remainingGenerations = isPremium ? 999 : Math.max(0, maxAllowed - generationCount);

  const getOfferType = () => {
    if (isPremium) return 'none';
    if (!dismissedFirstOffer && generationCount >= FREE_LIMIT) return 'onetimeoffer';
    if (dismissedFirstOffer && generationCount >= GRACE_LIMIT) return 'subscription';
    return 'none';
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isVerifying,
        startCheckout,
        generationCount,
        incrementGeneration,
        canGenerate,
        remainingGenerations,
        deviceId,
        dismissOffer,
        dismissedFirstOffer,
        getOfferType,
        FREE_LIMIT,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
