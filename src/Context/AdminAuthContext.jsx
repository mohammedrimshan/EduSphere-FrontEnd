import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearAdmin } from '../Redux/Slices/adminSlice';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const admin = useSelector((state) => state.admin.adminDatas);
  console.log(admin)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const logout = (message) => {
    dispatch(clearAdmin());
    
    window.history.replaceState(null, "", "/");
    window.history.pushState(null, "", "/admin/adminlogin");
    
    navigate('/admin/adminlogin', { replace: true });
    
    if (message) {
      toast.error(message);
    }
  };
  useEffect(() => {
    console.log("Admin state in AdminAuthProvider:", admin);
  }, [admin]);

  useEffect(() => {
    if (admin) {
      if (location.pathname === '/') {
        navigate('/admin/dashboard', { replace: true });
      }
  
      window.history.pushState(null, '', window.location.href);
      const handlePopstate = () => {
        window.history.pushState(null, '', window.location.href);
      };
  
      window.addEventListener('popstate', handlePopstate);
      return () => window.removeEventListener('popstate', handlePopstate);
    }
  }, [admin, location.pathname, navigate]);

  return (
    <AuthContext.Provider value={{ admin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
