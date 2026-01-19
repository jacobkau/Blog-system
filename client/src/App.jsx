import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Home from './pages/Home';
import CreateCategory from './pages/categories/CreateCategory';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Posts from './pages/posts/Posts';
import SinglePost from './pages/posts/SinglePost';
import CreatePost from './pages/posts/CreatePost';
import EditPost from './pages/posts/EditPost';
import Categories from './pages/categories/Categories';
import CategoryPosts from './pages/categories/CategoryPosts.jsx';
import Profile from './pages/user/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
   <>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
          <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<SinglePost />} />
            <Route path="/edit-post/:id" element={<EditPost />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:slugOrId" element={<CategoryPosts />} />
            <Route path="/create-category" element={<CreateCategory />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>

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
