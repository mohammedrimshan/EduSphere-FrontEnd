import React from 'react';
import { LogOut } from 'lucide-react';
import Modal from './Modal';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <LogOut className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <span>Confirm Logout</span>
        </div>
      </Modal.Header>

      <Modal.Body>
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to logout from EduSphere? Your session will be ended.
        </p>
      </Modal.Body>

      <Modal.Footer>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          Logout
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default LogoutModal;