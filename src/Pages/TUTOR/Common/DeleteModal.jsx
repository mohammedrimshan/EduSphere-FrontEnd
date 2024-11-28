import React from 'react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, theme }) => {
  if (!isOpen) return null;

  const overlayClass = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  const modalClass = `${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-6 rounded-lg shadow-xl max-w-sm w-full mx-4`;
  const buttonClass = "px-4 py-2 rounded-md text-white font-medium";

  return (
    <div className={overlayClass}>
      <div className={modalClass}>
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-6">Are you sure you want to delete this lesson? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className={`${buttonClass} bg-gray-500 hover:bg-gray-600`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`${buttonClass} bg-red-500 hover:bg-red-600`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;

