import { Routes, Route, Navigate } from 'react-router-dom';
import TutorRegister from '../src/Pages/TUTOR/TutorRegister';
import TutorLogin from '../src/Pages/TUTOR/TutorLogin';
import TutorForgetPassword from '../src/Pages/TUTOR/TutorForgetPassword';
import TutorResetPassword from '../src/Pages/TUTOR/TutorResetPassword';
import TutorHome from '../src/Pages/TUTOR/TutorHome';
import { useTutorAuth } from '@/Context/TutorAuthContext';
import TutorProfile from '@/Pages/TUTOR/TutorProfile';
import CourseManagement from '@/Pages/TUTOR/Courses';
import AddCoursePage from '@/Pages/TUTOR/CreateCourse';
import LessonManager from '@/Pages/TUTOR/LessonManager';
import EditCoursePage from '@/Pages/TUTOR/EditCourse';
import CoursePreview from '@/Pages/TUTOR/CoursePreview';


const TutorRoutes = () => {
  const { tutor } = useTutorAuth();

  const RequireAuth = ({ children }) => {
    if (!tutor) {

      return <Navigate to="/tutor/tutor-login" replace />;
    }
    return children;
  };

  const PublicRoute = ({ children }) => {
    if (tutor) {
      return <Navigate to="/tutor/tutorhome" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route
        path="tutor-register"
        element={
          <PublicRoute>
            <TutorRegister />
          </PublicRoute>
        }
      />
      <Route
        path="tutor-login"
        element={
          <PublicRoute>
            <TutorLogin />
          </PublicRoute>
        }
      />
      <Route 
      path='tutor-profile' 
      element={<TutorProfile />} />
      <Route
        path="tutor-forgetpassword"
        element={
          <PublicRoute>
            <TutorForgetPassword />
          </PublicRoute>
        }
      />
      <Route
        path="tutorreset-password/:token"
        element={
          <PublicRoute>
            <TutorResetPassword />
          </PublicRoute>
        }
      />

      <Route
        path="tutorhome"
        element={
          <RequireAuth>
            <TutorHome />
          </RequireAuth>
        }
      />
      <Route
        path=""
        element={
          tutor ? <Navigate to="tutorhome" replace /> : <Navigate to="/" replace />
        }
      />


      <Route
        path="*"
        element={
          tutor ? <Navigate to="tutorhome" replace /> : <Navigate to="/" replace />
        }
      />
      <Route path='courses' element={<CourseManagement />}/>
      <Route path='createcourse' element={<AddCoursePage />}/>
      <Route path=':courseId/addlesson' element={<LessonManager />}/>
      <Route path="edit-course/:courseId" element={<EditCoursePage /> } />
      <Route path='coursepreview/:courseId' element={<CoursePreview />}/>
    </Routes>
  );
};

export default TutorRoutes;