// useAxiosInterceptors.jsx
import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const useAxiosInterceptors = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout("Your session has expired. Please login again.");
        } else if (error.response?.status === 403) {
          logout("Your account has been blocked by admin. Please contact support.");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);
};

export default useAxiosInterceptors;