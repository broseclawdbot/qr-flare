import React, { createContext, useContext, useState } from 'react';

const PremiumContext = createContext({
  isPremium: false,
  unlockPremium: () => {},
  lockPremium: () => {},
});

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(false);

  const unlockPremium = () => setIsPremium(true);
  const lockPremium = () => setIsPremium(false);

  return (
    <PremiumContext.Provider value={{ isPremium, unlockPremium, lockPremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  return useContext(PremiumContext);
}
