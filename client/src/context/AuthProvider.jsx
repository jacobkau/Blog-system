import { createContext } from 'react';
import { useAuth } from './useAuth';

export const AuthContext = createContext(); // 👈 this must be exported

export default function AuthProvider({ children }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}
