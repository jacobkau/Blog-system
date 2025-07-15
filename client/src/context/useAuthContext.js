import { useContext } from 'react';
import { AuthContext } from './AuthProvider'; // ✅ named import

export default function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
