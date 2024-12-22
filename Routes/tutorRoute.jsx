import { Routes, Route, Navigate } from 'react-router-dom';
import { useTutorAuth } from '@/Context/TutorAuthContext';
import TutorRegister from '../src/Pages/TUTOR/TutorRegister';
import TutorLogin from '../src/Pages/TUTOR/TutorLogin';
import TutorForgetPassword from '../src/Pages/TUTOR/TutorForgetPassword';
import TutorResetPassword from '../src/Pages/TUTOR/TutorResetPassword';
import TutorHome from '../src/Pages/TUTOR/TutorHome';
import TutorProfile from '@/Pages/TUTOR/TutorProfile';
import CourseManagement from '@/Pages/TUTOR/Courses';
import AddCoursePage from '@/Pages/TUTOR/CreateCourse';
import LessonManager from '@/Pages/TUTOR/LessonManager';
import EditCoursePage from '@/Pages/TUTOR/EditCourse';
import CoursePreview from '@/Pages/TUTOR/CoursePreview';
import QuizPage from '@/Pages/TUTOR/QuizManage';
import QuizCreator from '@/Pages/TUTOR/AddQuiz';
import QuizManagement from '@/Pages/TUTOR/QuizDetials';
import TutorCourseReports from '@/Pages/TUTOR/TutorCourseReport';
import TutorCourseList from '@/Pages/TUTOR/Common/CourseList';
import TutorChatPage from '@/Pages/TUTOR/TutorChatPage';
import RevenueDashboard from '@/Pages/TUTOR/Revenue';
import { SocketProvider } from "@/lib/socketConfig";

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
      {/* Public Routes */}
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

      {/* Protected Routes */}
      <Route
        path="tutor-profile"
        element={
          <RequireAuth>
            <TutorProfile />
          </RequireAuth>
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
        path="courses"
        element={
          <RequireAuth>
            <CourseManagement />
          </RequireAuth>
        }
      />
      <Route
        path="createcourse"
        element={
          <RequireAuth>
            <AddCoursePage />
          </RequireAuth>
        }
      />
      <Route
        path=":courseId/addlesson"
        element={
          <RequireAuth>
            <LessonManager />
          </RequireAuth>
        }
      />
      <Route
        path="edit-course/:courseId"
        element={
          <RequireAuth>
            <EditCoursePage />
          </RequireAuth>
        }
      />
      <Route
        path="coursepreview/:courseId"
        element={
          <RequireAuth>
            <CoursePreview />
          </RequireAuth>
        }
      />
      <Route
        path="quizmanage"
        element={
          <RequireAuth>
            <QuizPage />
          </RequireAuth>
        }
      />
      <Route
        path="quizadd/:courseId"
        element={
          <RequireAuth>
            <QuizCreator />
          </RequireAuth>
        }
      />
      <Route
        path="courses/:courseId/quiz"
        element={
          <RequireAuth>
            <QuizManagement />
          </RequireAuth>
        }
      />
      <Route
        path="courses/:courseId/reports"
        element={
          <RequireAuth>
            <TutorCourseReports />
          </RequireAuth>
        }
      />
      <Route
        path="courselist"
        element={
          <RequireAuth>
            <TutorCourseList />
          </RequireAuth>
        }
      />
      <Route
        path="revenue"
        element={
          <RequireAuth>
            <RevenueDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="chat"
        element={
          <RequireAuth>
            <SocketProvider url="http://localhost:5000">
              <TutorChatPage />
            </SocketProvider>
          </RequireAuth>
        }
      />

      {/* Default Routes */}
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
    </Routes>
  );
};

export default TutorRoutes;

