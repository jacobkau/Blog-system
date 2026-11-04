import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context';  
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Home from './pages/Home';
import CreateCategory from './pages/categories/CreateCategory';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Posts from './pages/posts/Posts';
import SinglePost from './pages/posts/SinglePost';
import CreatePost from './pages/posts/CreatePost';
import EditPost from './pages/posts/EditPost';
import Categories from './pages/categories/Categories';
import EditCategory from './pages/categories/EditCategory';
import CategoryPosts from './pages/categories/CategoryPosts.jsx';
import Profile from './pages/user/Profile';
import NotFound from './pages/NotFound';

//  protect admin-only routes
const AdminRoute = ({ children }) => {
  const { user } = useAuthContext();
  
  // If user is not an admin, redirect to home
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <>
      <AuthProvider> 
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/posts" element={<Posts />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/posts/:id" element={<SinglePost />} />
              <Route path="/edit-post/:id" element={<EditPost />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/edit/:id" element={<EditCategory />} />
              <Route path="/category/:slugOrId" element={<CategoryPosts />} />
              <Route path="/create-category" element={<CreateCategory />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Admin Dashboard Route */}
              <Route 
                path="/dashboard" 
                element={
                  <AdminRoute>
                    <Dashboard />
                  </AdminRoute>
                } 
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
