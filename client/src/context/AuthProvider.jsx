import { createContext } from 'react';
import { useAuth } from './useAuth';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}
