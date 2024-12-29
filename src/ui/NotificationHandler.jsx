import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { useToast } from '@/Context/ToastContext';
import { useSelector } from 'react-redux';
import { refreshToken } from '@/lib/tokenRefresh';

const NotificationHandler = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [hasShownTokenError, setHasShownTokenError] = useState(false);
  const MAX_RETRIES = 3;
  const lastNotificationRef = useRef(null);
  const eventSourceRef = useRef(null);
  
  // Get both user and tutor data from Redux
  const userData = useSelector(state => state.user.userDatas);
  const tutorData = useSelector(state => state.tutor.tutorData);

  useEffect(() => {
    // Reset connection attempts when authentication changes
    if (userData || tutorData) {
      setConnectionAttempts(0);
      setHasShownTokenError(false);
    }
  }, [userData, tutorData]);

  useEffect(() => {
    // Early return if no authentication or if max retries exceeded
    if ((!userData && !tutorData) || connectionAttempts >= MAX_RETRIES) {
      return;
    }

    const connectSSE = () => {
      const userToken = userData?.accessToken || localStorage.getItem('token');
      const tutorToken = tutorData?.accessToken || localStorage.getItem('tutorToken');
      const token = userToken || tutorToken;
      
      // Only show token error once and prevent further connection attempts
      if (!token) {
        if (!hasShownTokenError) {
          console.error('No authentication token available');
          addToast('Please log in to receive notifications', 'info');
          setHasShownTokenError(true);
        }
        return null;
      }

      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Determine the role for the notification endpoint
      const role = userData ? 'user' : 'tutor';
      
      const eventSource = new EventSource(
        `https://edusphere-backend.rimshan.in/${role}/notifications/stream?token=${token}`,
        { withCredentials: true }
      );
      
      eventSourceRef.current = eventSource;

      const handleNotification = (data) => {
        if (JSON.stringify(data) !== JSON.stringify(lastNotificationRef.current)) {
          lastNotificationRef.current = data;
          
          switch (data.type) {
            case 'NOTIFICATION_UPDATE':
              data.notifications.forEach(notification => {
                addToast(notification.message, 'info', {
                  title: notification.title,
                  duration: 5000
                });
              });
              break;

            case 'COURSE_OFFER':
              addToast(
                `${data.message} (${data.offerPercentage}% off)`,
                'success',
                {
                  title: data.title,
                  duration: 7000
                }
              );
              break;

            case 'TUTOR_BOOKING':
              addToast(
                data.message,
                'success',
                {
                  title: 'New Booking',
                  duration: 7000
                }
              );
              break;

            case 'COURSE_UPDATE':
              addToast(
                data.message,
                'info',
                {
                  title: 'Course Update',
                  duration: 5000
                }
              );
              break;

            case 'ERROR':
              addToast(data.message, 'error');
              break;

            default:
              if (data.title && data.message) {
                addToast(data.message, 'info', {
                  title: data.title
                });
              }
          }
        }
      };

      eventSource.onopen = () => {
        console.log('SSE connection established');
        setConnectionAttempts(0);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleNotification(data);
        } catch (error) {
          console.error('Error processing notification:', error);
        }
      };

      eventSource.addEventListener('notification', (event) => {
        try {
          const data = JSON.parse(event.data);
          handleNotification(data);
        } catch (error) {
          console.error('Error processing notification event:', error);
        }
      });

      eventSource.addEventListener('error', (event) => {
        console.error('SSE error event:', event);
        eventSource.close();

        if (connectionAttempts < MAX_RETRIES) {
          setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connectSSE();
          }, 5000 * (connectionAttempts + 1)); // Exponential backoff
        } else {
          addToast('Connection to notification service lost', 'error');
        }
      });

      return () => {
        eventSource.close();
      };
    };

    const cleanup = connectSSE();
    return () => {
      if (cleanup) cleanup();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [userData, tutorData, addToast, connectionAttempts, hasShownTokenError]);

  return null;
};

export default NotificationHandler;