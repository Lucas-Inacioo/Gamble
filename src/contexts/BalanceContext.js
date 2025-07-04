import { createContext, useContext, useState } from 'react';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(1000);

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);
