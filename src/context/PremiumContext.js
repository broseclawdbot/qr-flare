import React, { createContext, useContext, useState } from 'react';

const FREE_LIMIT = 3;

const PremiumContext = createContext({
  isPremium: false,
  unlockPremium: () => {},
  lockPremium: () => {},
  generationCount: 0,
  incrementGeneration: () => {},
  canGenerate: true,
  remainingGenerations: FREE_LIMIT,
});

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  const unlockPremium = () => setIsPremium(true);
  const lockPremium = () => setIsPremium(false);
  const incrementGeneration = () => setGenerationCount((c) => c + 1);
  const canGenerate = isPremium || generationCount < FREE_LIMIT;
  const remainingGenerations = Math.max(0, FREE_LIMIT - generationCount);

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
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
