import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearUser } from '../Redux/Slices/userSlice'; 
import { toast } from 'sonner';

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const user = useSelector((state) => state.user.userDatas);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const logout = (message) => {
    dispatch(clearUser());
    navigate('/user/login', { replace: true });
    if (message) {
      toast.error(message);
    }
  };

  useEffect(() => {
    if (user) {
      if (location.pathname === '/') {
        navigate('/user/home', { replace: true });
      }

      window.history.pushState(null, '', window.location.href);
      const handlePopstate = () => {
        window.history.pushState(null, '', window.location.href);
      };

      window.addEventListener('popstate', handlePopstate);
      return () => window.removeEventListener('popstate', handlePopstate);
    }
  }, [user, location.pathname, navigate]);
  
  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, useAuth };