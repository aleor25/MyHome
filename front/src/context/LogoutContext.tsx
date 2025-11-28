import React, { createContext, useContext } from 'react';

interface LogoutContextType {
  logout: () => Promise<void>;
}

export const LogoutContext = createContext<LogoutContextType | undefined>(undefined);

export const useLogout = () => {
  const context = useContext(LogoutContext);
  if (!context) {
    throw new Error('useLogout debe usarse dentro de LogoutProvider');
  }
  return context;
};

export const LogoutProvider: React.FC<{
  children: React.ReactNode;
  onLogout: () => Promise<void>;
}> = ({ children, onLogout }) => {
  return (
    <LogoutContext.Provider value={{ logout: onLogout }}>
      {children}
    </LogoutContext.Provider>
  );
};