import axios from 'axios';
import { toast } from 'sonner';

import { logoutUser } from '@/Redux/Slices/userSlice'; // Import logout action

const axiosInterceptor = axios.create({
  baseURL:  'https://edusphere-backend.rimshan.in',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add request interceptor to always include access token
axiosInterceptor.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInterceptor.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for unauthorized error and prevent infinite refresh loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInterceptor(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Ensure refresh token exists
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axiosInterceptor.post('/auth/refresh', { refreshToken });
        
        // Update tokens in localStorage
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        // Update default headers
        axiosInterceptor.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        
        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        
        // Resolve queued requests
        processQueue(null, data.accessToken);
        
        return axiosInterceptor(originalRequest);
      } catch (refreshError) {
        // Clear tokens and logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        
        // Show logout toast
        toast.error('Session expired. Please log in again.');
        
        // Reject with error
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Add a method to get a valid token for SSE connections
axiosInterceptor.getValidToken = async () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token available');
  }

  try {
    // Attempt to make a request with the current token
    await axiosInterceptor.get('/auth/refreshtoken');
    return accessToken;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token is invalid, attempt to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await axiosInterceptor.post('/auth/refresh', { refreshToken });
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      return data.accessToken;
    }
    throw error;
  }
};

export default axiosInterceptor;