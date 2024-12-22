import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../src/Context/AuthContext";
import Register from "../src/Pages/USER/Register";
import Login from "../src/Pages/USER/Login";
import ForgetPassword from "../src/Pages/USER/ForgetPassword";
import ResetPassword from "../src/Pages/USER/ResetPassword";
import Home from "../src/Pages/USER/Home";
import Profile from "@/Pages/USER/Profile";
import CoursePage from "@/Pages/USER/CoursePage";
import CourseDetails from "@/Pages/USER/UserCoursePreview";
import Cart from "@/Pages/USER/Cart";
import PreviewLesson from "@/Pages/USER/PreviewLesson";
import CheckoutPage from "@/Pages/USER/CheckOut";
import EnrolledCourses from "@/Pages/USER/EnrolledCourse";
import EnrolledCourseLessons from "@/Pages/USER/EnrolledCourseLessons";
import EnrolledTutors from "@/Pages/USER/EnrolledTutors";
import NotificationsPage from "@/Pages/USER/Notification";
import PreviewQuiz from "@/Pages/USER/AttendQuiz";
import NotificationHandler from "@/ui/NotificationHandler";
import CertificatesPage from "@/Pages/USER/CertificateCollection";
import CategoryCoursesPage from "@/Pages/USER/CategoryCoursesPage";
import { SocketProvider } from "@/lib/socketConfig";
import PaymentStatusTable from "@/Pages/USER/PaymentStatus";
import Wishlist from "@/Pages/USER/WishlistPage";
import UserChatPage from "@/Pages/USER/UserChatPage";
import RefundHistory from "@/Pages/USER/RefundHistory";
import AboutPage from "@/Pages/USER/Common/AboutUs";
import ContactPage from "@/Pages/USER/Common/Contact";
import WalletDetails from "@/Pages/USER/WalletDetials";
import TutorsPage from "@/Pages/USER/AllTutor";
import TutorDetailsPage from "@/Pages/USER/TutorProfile";
const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/user/login" replace />;
  }
  return children;
};

const UserRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <NotificationHandler />
      <Routes>
        {/* Public Routes */}
        <Route path="register" element={<Register />} />
        <Route
          path="login"
    
          element={user ? <Navigate to="/user/home" replace /> : <Login />}
        />
        <Route path="forgetpassword" element={<ForgetPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="aboutus" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        {/* Protected Routes */}
        <Route
          path="profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="fullcourse"
          element={
            <RequireAuth>
              <CoursePage />
            </RequireAuth>
          }
        />
        <Route
          path="courseview/:courseId"
          element={
            <RequireAuth>
              <CourseDetails />
            </RequireAuth>
          }
        />
        <Route
          path="cart"
          element={
            <RequireAuth>
              <Cart />
            </RequireAuth>
          }
        />
        <Route
          path="checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="my-courses"
          element={
            <RequireAuth>
              <EnrolledCourses />
            </RequireAuth>
          }
        />
        <Route
          path="preview"
          element={
            <RequireAuth>
              <PreviewLesson />
            </RequireAuth>
          }
        />
        <Route
          path="mytutors"
          element={
            <RequireAuth>
              <EnrolledTutors />
            </RequireAuth>
          }
        />
        <Route
          path="notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />
        <Route
          path="quizpreview/:courseId"
          element={
            <RequireAuth>
              <PreviewQuiz />
            </RequireAuth>
          }
        />
        <Route
          path="category/:categoryId/courses"
          element={
            <RequireAuth>
              <CategoryCoursesPage />
            </RequireAuth>
          }
        />
        <Route
          path="payments/status"
          element={
            <RequireAuth>
              <PaymentStatusTable />
            </RequireAuth>
          }
        />
        <Route
          path="wishlist"
          element={
            <RequireAuth>
              <Wishlist />
            </RequireAuth>
          }
        />
        <Route
          path="certificates"
          element={
            <RequireAuth>
              <CertificatesPage />
            </RequireAuth>
          }
        />
        <Route
          path="wallet"
          element={
            <RequireAuth>
              <WalletDetails />
            </RequireAuth>
          }
        />

        <Route
          path="alltutor"
          element={
            <RequireAuth>
              <TutorsPage />
            </RequireAuth>
          }
        />
        <Route
          path="tutor/:tutorId"
          element={
            <RequireAuth>
              <TutorDetailsPage />
            </RequireAuth>
          }
        />

        <Route
          path="course/:courseId/lessons"
          element={
            <RequireAuth>
              <SocketProvider url="http://localhost:5000">
                <EnrolledCourseLessons />
              </SocketProvider>
            </RequireAuth>
          }
        />
        <Route
          path="chat"
          element={
            <RequireAuth>
              <SocketProvider url="http://localhost:5000">
                <UserChatPage />
              </SocketProvider>
            </RequireAuth>
          }
        />
        <Route
          path="refund-history"
          element={
            <RequireAuth>
              <RefundHistory />
            </RequireAuth>
          }
        />
        {/* Default Routes */}
        <Route
          path=""
          element={
            user ? (
              <Navigate to="home" replace />
            ) : (
              <Navigate to="login" replace />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={user ? "home" : "login"} replace />}
        />
      </Routes>
    </>
  );
};

export default UserRoutes;
