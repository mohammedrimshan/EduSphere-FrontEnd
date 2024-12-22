import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosInterceptor from '@/axiosInstance';
import { format } from 'date-fns';
import { Bell, BellOff } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const NotificationsPage = () => {
  const theme = useSelector((state) => state.theme.theme);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (pageNum = 1) => {
    try {
      const response = await axiosInterceptor.get(`/user/notifications?page=${pageNum}&limit=10`);
      const newNotifications = response.data;
      
      if (pageNum === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      
      setHasMore(newNotifications.length === 10);
      setLoading(false);

      // Mark notifications as read
      await Promise.all(newNotifications.map(notification => 
        axiosInterceptor.put(`/user/notifications/${notification._id}/read`)
      ));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  };

  if (loading) {
    return (
      <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'}`}>
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-4`}>
              <Skeleton className={`h-6 w-3/4 mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <Skeleton className={`h-4 w-full mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <Skeleton className={`h-3 w-1/4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'}`}>
        <div className="text-center py-8">
          <div className="mb-4">
            <BellOff className="w-12 h-12 mx-auto text-red-500" />
          </div>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <Bell className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>

        {notifications.length === 0 ? (
          <div className={`text-center py-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
            <BellOff className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              You have no notifications.
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {notifications.map(notification => (
                <li 
                  key={notification._id} 
                  className={`${
                    theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                  } shadow rounded-lg p-4 transition-colors duration-200`}
                >
                  <h2 className="font-semibold">{notification.title}</h2>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                    {notification.body}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                    {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </li>
              ))}
            </ul>

            {hasMore && (
              <button
                onClick={loadMore}
                className={`mt-6 w-full py-3 text-center rounded-lg border ${
                  theme === 'dark'
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                } transition-colors duration-200`}
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

