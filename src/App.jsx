import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './Redux/Store';
import { AuthProvider, useAuth } from "./Context/AuthContext";
import { TutorAuthProvider, useTutorAuth } from "./Context/TutorAuthContext";
import { AdminAuthProvider, useAdminAuth } from "./Context/AdminAuthContext";
import { ToastProvider } from "./Context/ToastContext";
import { SocketProvider } from "./lib/socketConfig";
// import { CallProvider } from "./lib/callProvider"; // Import CallProvider
import NotificationHandler from "./ui/NotificationHandler";
import LandingPage from "./Landing/LandingPage";
import UserRoutes from "../Routes/userRoute";
import TutorRoutes from "../Routes/tutorRoute";
import AdminRoutes from "../Routes/adminRoutes";
import NotFoundPage from "./ui/404";
import { Toaster } from 'sonner';
import './lib/cryptoPolyfill';

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
        <Router>
          <GoogleOAuthProvider clientId="962246975579-6d7ophndj0l3v6knjtov419598mujber.apps.googleusercontent.com">
            <AdminAuthProvider>
              <TutorAuthProvider>
                <AuthProvider>
                  <SocketProvider>
                    {/* <CallProvider> Add CallProvider here */}
                      <Toaster position='top-left' richColors/>
                      <ToastProvider>
                        <NotificationHandler />
                        <Routes>
                          <Route 
                            path="/" 
                            element={
                              <PublicRoute>
                                <LandingPage />
                              </PublicRoute>
                            } 
                          />
                          <Route path="/user/*" element={<UserRoutes />} />
                          <Route path="/tutor/*" element={<TutorRoutes />} />
                          <Route path="/admin/*" element={<AdminRoutes />} />
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </ToastProvider>
                    {/* </CallProvider> */}
                  </SocketProvider>
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

