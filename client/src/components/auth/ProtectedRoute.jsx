import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../context'; 

const ProtectedRoute = () => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;