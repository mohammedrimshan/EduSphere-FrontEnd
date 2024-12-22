import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Dashboard from '@/Pages/ADMIN/AdminDashboard';
import Students from '@/Pages/ADMIN/Students';
import AdminLogin from '@/Pages/ADMIN/AdminLogin';
import AdminForgetPassword from '@/Pages/ADMIN/AdminForgetPassword';
import AdminResetPassword from '@/Pages/ADMIN/AdminResetPassword';
import Tutors from '@/Pages/ADMIN/Tutors';
import ProtectAdminRoute from '@/Component/ProtectAdminRoute';
import CategoryManager from '@/Pages/ADMIN/CategoryManagement';
import Courses from '@/Pages/ADMIN/CourseManagement';
import AdminReportedCourses from '@/Pages/ADMIN/AdminReportedCourses';
import PaymentStatus from '@/Pages/ADMIN/PaymentStatus';
import AdminRefunds from '@/Pages/ADMIN/AdminRefunds';
import AdminCourseDetails from '@/Pages/ADMIN/AdminViewCourseDetials';
function AdminRoute() {
  const adminDatas = useSelector((state) => state.admin.adminDatas);

  const PublicRoute = ({ children }) => {
    return adminDatas ? <Navigate to="/admin/dashboard" replace /> : children;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="adminlogin" 
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        } 
      />
      <Route 
        path="admin-forgetpassword" 
        element={
          <PublicRoute>
            <AdminForgetPassword />
          </PublicRoute>
        } 
      />
      <Route 
        path="adminreset-password/:token" 
        element={
          <PublicRoute>
            <AdminResetPassword />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route
        path="dashboard"
        element={
          <ProtectAdminRoute>
            <Dashboard />
          </ProtectAdminRoute>
        }
      />
      <Route
        path="students"
        element={
          <ProtectAdminRoute>
            <Students />
          </ProtectAdminRoute>
        }
      />
      <Route
        path="tutors"
        element={
          <ProtectAdminRoute>
            <Tutors />
          </ProtectAdminRoute>
        }
      />
      <Route
        path="category"
        element={
          <ProtectAdminRoute>
            <CategoryManager />
          </ProtectAdminRoute>
        }
      />
      <Route
        path="courses"
        element={
          <ProtectAdminRoute>
            <Courses />
          </ProtectAdminRoute>
        }
      />
      <Route
        path="reportedcourses"
        element={
          <ProtectAdminRoute>
            <AdminReportedCourses />
          </ProtectAdminRoute>
        }
      />
      <Route
        path="refund"
        element={
          <ProtectAdminRoute>
            <AdminRefunds />
          </ProtectAdminRoute>
        }
      />
      
      <Route
        path="payments"
        element={
          <ProtectAdminRoute>
            <PaymentStatus />
          </ProtectAdminRoute>
        }
      />
      <Route
        path="courses/:courseId"
        element={
          <ProtectAdminRoute>
            <AdminCourseDetails />
          </ProtectAdminRoute>
        }
      />

      {/* Default Routes */}
      <Route 
        path="" 
        element={
          adminDatas ? <Navigate to="dashboard" replace /> : <Navigate to="adminlogin" replace />
        } 
      />
      <Route path="*" element={<Navigate to={adminDatas ? "dashboard" : "adminlogin"} replace />} />
    </Routes>
  );
}

export default AdminRoute;

