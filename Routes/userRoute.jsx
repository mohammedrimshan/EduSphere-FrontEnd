import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../src/Context/AuthContext';
import useAxiosInterceptors from '../src/hooks/useAxiosInterceptors';
import Register from '../src/Pages/USER/Register';
import Login from '../src/Pages/USER/Login';
import ForgetPassword from '../src/Pages/USER/ForgetPassword';
import ResetPassword from '../src/Pages/USER/ResetPassword';
import Home from '../src/Pages/USER/Home';
import Profile from '@/Pages/USER/Profile';
import CoursePage from '@/Pages/USER/CoursePage';
import CourseDetails from '@/Pages/USER/UserCoursePreview';
import Cart from '@/Pages/USER/Cart';
import PreviewLesson from '@/Pages/USER/PreviewLesson';
const UserRoutes = () => {
  const { user } = useAuth();
  // useAxiosInterceptors(); // Call the hook to set up interceptors

  const RequireAuth = ({ children }) => {
    if (!user) {
      return <Navigate to="/user/login" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="register" element={<Register />} />
      <Route path="login" element={
        user ? <Navigate to="/user/home" replace /> : <Login />
      } />
      <Route path="forgetpassword" element={<ForgetPassword />} />
      <Route path="reset-password/:token" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="profile" element={
        <RequireAuth>
          <Profile />
        </RequireAuth>
      }/>
      <Route path="home" element={
        <RequireAuth>
          <Home />
        </RequireAuth>
      } />
      <Route path='fullcourse' element={
        <RequireAuth>
          <CoursePage />
        </RequireAuth>
      }/>
      <Route path='courseview/:courseId' element={
        <RequireAuth>
          <CourseDetails />
        </RequireAuth>
      }/>
      <Route path="cart" element={
        <RequireAuth>
          <Cart />
        </RequireAuth>
      } />
<Route path="preview" element={<PreviewLesson />}/>
      {/* Default Routes */}
      <Route path="" element={
        user ? <Navigate to="home" replace /> : <Navigate to="login" replace />
      } />
      <Route path="*" element={<Navigate to={user ? "home" : "login"} replace />} />
    </Routes>
  );
};

export default UserRoutes;