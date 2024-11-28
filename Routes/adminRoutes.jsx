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
function AdminRoute() {
  const adminDatas = useSelector((state) => state.admin.adminDatas);

  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="adminlogin" element={<AdminLogin />} />
        <Route path="admin-forgetpassword" element={<AdminForgetPassword />} />
        <Route path="adminreset-password/:token" element={<AdminResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            adminDatas ? (
              <ProtectAdminRoute>
                <Dashboard />
              </ProtectAdminRoute>
            ) : (
              <Navigate to="/admin/adminlogin" replace />
            )
          }
        />
        <Route
          path="students"
          element={
            adminDatas ? (
              <ProtectAdminRoute>
                <Students />
              </ProtectAdminRoute>
            ) : (
              <Navigate to="/admin/adminlogin" replace />
            )
          }
        />
        <Route
          path="tutors"
          element={
            adminDatas ? (
              <ProtectAdminRoute>
                <Tutors />
              </ProtectAdminRoute>
            ) : (
              <Navigate to="/admin/adminlogin" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path='category' element={<CategoryManager />}/>
        <Route path='courses' element={<Courses />}/>
      </Routes>
    </div>
  );
}

export default AdminRoute;