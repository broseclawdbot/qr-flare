import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

const FREE_LIMIT = 3;    // Full free generations
const GRACE_LIMIT = 4;   // One extra after dismissing $4.99 offer
const STORAGE_KEY = 'qrflare_gen_count';
const PREMIUM_KEY = 'qrflare_premium';
const DEVICE_ID_KEY = 'qrflare_device_id';
const DISMISSED_OFFER_KEY = 'qrflare_dismissed_offer';

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
  const [isPremium, setIsPremium] = useState(() => storage.get(PREMIUM_KEY) === 'true');
  const [generationCount, setGenerationCount] = useState(() => {
    const saved = storage.get(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [dismissedFirstOffer, setDismissedFirstOffer] = useState(() => storage.get(DISMISSED_OFFER_KEY) === 'true');
  const [deviceId] = useState(() => getDeviceId());

  useEffect(() => { storage.set(STORAGE_KEY, generationCount); }, [generationCount]);
  useEffect(() => { storage.set(PREMIUM_KEY, isPremium ? 'true' : 'false'); }, [isPremium]);
  useEffect(() => { storage.set(DISMISSED_OFFER_KEY, dismissedFirstOffer ? 'true' : 'false'); }, [dismissedFirstOffer]);

  const unlockPremium = () => setIsPremium(true);
  const lockPremium = () => { setIsPremium(false); storage.set(PREMIUM_KEY, 'false'); };
  const incrementGeneration = () => setGenerationCount((c) => c + 1);
  const dismissOffer = () => setDismissedFirstOffer(true);

  // Determine what the user can do
  const maxAllowed = dismissedFirstOffer ? GRACE_LIMIT : FREE_LIMIT;
  const canGenerate = isPremium || generationCount < maxAllowed;
  const remainingGenerations = isPremium ? 999 : Math.max(0, maxAllowed - generationCount);

  // Which prompt to show
  // 'none' = no prompt needed
  // 'onetimeoffer' = hit 3, show $4.99 one-time
  // 'subscription' = hit 4 (after dismissing), show $0.99/mo
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
        unlockPremium,
        lockPremium,
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
