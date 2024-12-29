import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/Context/AuthContext';
import { useTutorAuth } from '@/Context/TutorAuthContext';
import { useToast } from '@/Context/ToastContext';
import { useSelector } from 'react-redux';

const NotificationHandler = () => {
  const { user } = useAuth();
  const { tutor } = useTutorAuth();
  const { addToast } = useToast();
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [hasShownTokenError, setHasShownTokenError] = useState(false);
  const MAX_RETRIES = 3;
  const lastNotificationRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Reset connection attempts when auth changes
    if (user || tutor) {
      setConnectionAttempts(0);
      setHasShownTokenError(false);
    }
  }, [user, tutor]);

  useEffect(() => {
    // Early return if no authentication or if max retries exceeded
    if ((!user && !tutor) || connectionAttempts >= MAX_RETRIES) {
      return;
    }

    const connectSSE = () => {
      const userToken = localStorage.getItem('accessToken');
      const tutorToken = localStorage.getItem('tutorToken');
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
      const role = user ? 'user' : 'tutor';
      
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
              // Only show for tutors
              if (tutor) {
                addToast(
                  data.message,
                  'success',
                  {
                    title: 'New Booking',
                    duration: 7000
                  }
                );
              }
              break;

            case 'COURSE_UPDATE':
              // Show different messages for tutors and users
              addToast(
                data.message,
                'info',
                {
                  title: tutor ? 'Your Course Update' : 'Course Update',
                  duration: 5000
                }
              );
              break;

            case 'SESSION_REMINDER':
              addToast(
                data.message,
                'info',
                {
                  title: tutor ? 'Upcoming Session' : 'Class Reminder',
                  duration: 6000
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
  }, [user, tutor, addToast, connectionAttempts, hasShownTokenError]);

  return null;
};

export default NotificationHandler;