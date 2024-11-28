import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Info, Phone, BookOpen, Users, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, theme, handleLogout, menuItems }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out z-50 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-green-500">EduSphere</h2>
            <button
              className="text-gray-600 dark:text-gray-400 hover:text-green-500"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x h-6 w-6"
              >
                <path d="M18 6L6 18"></path>
                <path d="M6 6L18 18"></path>
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-800 text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 ease-in-out w-full"
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Bottom Section: Logout Button */}
          <div className="mt-auto border-t pt-4">
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 ease-in-out w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
