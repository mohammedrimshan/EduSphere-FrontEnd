import React, { createContext, useContext, useState, useRef } from 'react';
import Toast from '@/ui/Toast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastCount = useRef(0); // Counter for ensuring unique IDs

  const addToast = (message, type = 'info') => {
    const id = `${Date.now()}-${toastCount.current++}`; // Combine timestamp with counter
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};