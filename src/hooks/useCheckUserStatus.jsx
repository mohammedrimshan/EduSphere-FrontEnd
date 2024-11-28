// hooks/useCheckUserStatus.js
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../Context/AuthContext';

const useCheckUserStatus = () => {
  const { user, logout } = useAuth();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user) return; 
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/status-check`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        
        if (response.data.isBlocked) {
          logout("Your account has been blocked by admin. Please contact support.");
        }
      } catch (error) {
        if (error.response?.status === 403) {
          logout("Your account has been blocked by admin. Please contact support.");
        } else {
          console.error('Error checking user status:', error);
        }
      }
    };

    checkStatus();
    intervalRef.current = setInterval(checkStatus, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, logout]); 

};

export default useCheckUserStatus;
