import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

const CustomNotification = ({ notification, onMarkAsRead }) => {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Bell className="h-6 w-6 text-blue-500" />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notification.body}</p>
          <div className="mt-2 flex space-x-7">
            <button
              type="button"
              onClick={() => onMarkAsRead(notification._id)}
              className="bg-white dark:bg-gray-800 rounded-md text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Mark as read
            </button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </motion.li>
  );
};

export default CustomNotification;

