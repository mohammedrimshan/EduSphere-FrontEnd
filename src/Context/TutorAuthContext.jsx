import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearTutor } from '../Redux/Slices/tutorSlice';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const useTutorAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useTutorAuth must be used within a TutorAuthProvider');
  }
  return context;
};

export const TutorAuthProvider = ({ children }) => {
  const tutor = useSelector((state) => state.tutor.tutorData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const logout = (message) => {
    dispatch(clearTutor());
    navigate('/tutor/tutor-login', { replace: true });
    if (message) {
      toast.error(message);
    }
  };

  useEffect(() => {
    if (tutor) {
      if (location.pathname === '/') {
        navigate('/tutor/tutorhome', { replace: true });
      }
    }
  }, [tutor, location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ tutor, logout }}>
      {children}
    </AuthContext.Provider>
  );
};