
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearUser, setUser } from '../Redux/Slices/userSlice';
import { toast } from 'sonner';
import axiosInterceptor from '@/axiosInstance';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const user = useSelector((state) => state.user.userDatas);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await axiosInterceptor.get('/user/profile');
          dispatch(setUser(response.data));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        dispatch(clearUser());
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      localStorage.setItem('accessToken', response.data.accessToken);
      dispatch(setUser(response.data.user));
      navigate('/user/home', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const logout = (message) => {
    localStorage.removeItem('accessToken');
    dispatch(clearUser());
    navigate('/user/login', { replace: true });
    if (message) {
      toast.error(message);
    }
  };

  useEffect(() => {
    if (user && !isLoading) {
      if (location.pathname === '/') {
        navigate('/user/home', { replace: true });
      }

      const handlePopstate = () => {
        if (location.pathname === '/user/login') {
          navigate('/user/home', { replace: true });
        }
      };

      window.addEventListener('popstate', handlePopstate);
      return () => window.removeEventListener('popstate', handlePopstate);
    }
  }, [user, isLoading, location.pathname, navigate]);

  const contextValue = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};