import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Toast = ({ message, type = 'info', duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-300 text-green-900';
      case 'error':
        return 'bg-red-300 text-red-900';
      case 'warning':
        return 'bg-yellow-300 text-yellow-900';
      default:
        return 'bg-green-200 text-green-900';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 p-4 rounded-lg 
        ${getBackgroundColor()} 
        shadow-md max-w-md
        border border-green-300
        transition-all duration-500 ease-in-out
        animate-slide-in-right
      `}
    >
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{message}</p>
        <button 
          onClick={() => setIsVisible(false)}
          className="ml-4 text-green-700 hover:text-green-900 transition-colors duration-200 hover:bg-green-300 rounded-full p-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// Optional wrapper component to manage multiple toasts
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
          />
        ))}
      </div>
    </>
  );
};

export default Toast;