import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all duration-200 scale-95 hover:scale-100"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close Modal"
        >
          ✕
        </button>
        <div className="flex flex-col">{children}</div>
      </div>
    </div>
  );
};

// Modal Header Component
Modal.Header = ({ children }) => (
  <div className="p-6 border-b dark:border-gray-700">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{children}</h3>
  </div>
);

// Modal Body Component
Modal.Body = ({ children }) => <div className="p-6">{children}</div>;

// Modal Footer Component
Modal.Footer = ({ children }) => (
  <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
    {children}
  </div>
);

export default Modal;