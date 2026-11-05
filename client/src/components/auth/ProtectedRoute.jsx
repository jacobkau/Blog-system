import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../context'; 

const ProtectedRoute = () => {
  const { user, initialized } = useAuthContext(); 

  if (!initialized) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
