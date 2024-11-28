import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './Redux/Store';
import LandingPage from "./Landing/LandingPage";
import UserRoutes from "../Routes/userRoute";
import TutorRoutes from "../Routes/tutorRoute";
import AdminRoutes from "../Routes/adminRoutes";
import NotFoundPage from "./ui/404";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import { TutorAuthProvider, useTutorAuth } from "./Context/TutorAuthContext";
import { AdminAuthProvider, useAdminAuth } from "./Context/AdminAuthContext";
import { Toaster } from "sonner";

// Public route handler
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  const { tutor } = useTutorAuth();
  const { admin } = useAdminAuth();

  if (user) return <Navigate to="/user/home" replace />;
  if (tutor) return <Navigate to="/tutor/tutorhome" replace />;
  if (admin) return <Navigate to="/admin/dashboard" replace />;
  
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router><GoogleOAuthProvider clientId={process.env.VITE_GOOGLE_CLIENT_ID}>
          
            <AdminAuthProvider>
              <TutorAuthProvider>
                <AuthProvider>
                  <Toaster position="top-left" richColors />
                  <Routes>
                    {/* Public Landing Page */}
                    <Route 
                      path="/" 
                      element={
                        <PublicRoute>
                          <LandingPage />
                        </PublicRoute>
                      } 
                    />
                    
                    {/* User Routes */}
                    <Route path="/user/*" element={<UserRoutes />} />
                    
                    {/* Tutor Routes */}
                    <Route path="/tutor/*" element={<TutorRoutes />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/*" element={<AdminRoutes />} />
                
                    
                    {/* Catch-All Route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </AuthProvider>
              </TutorAuthProvider>
            </AdminAuthProvider>
          </GoogleOAuthProvider>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;