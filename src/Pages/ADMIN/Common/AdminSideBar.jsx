import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaHome, FaList, FaUsers, FaShoppingCart, FaChalkboardTeacher, FaBook, FaSignOutAlt } from 'react-icons/fa';
import { setActiveItem, initializeFromPath, selectActiveItem } from '../../../Redux/Slices/sidebarSlice';
import { logoutAdmin } from '../../../Redux/Slices/adminSlice';

const Sidebar = ({ isDarkMode,onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const activeItem = useSelector(selectActiveItem);
  
  const adminData = useSelector((state) => state?.admin?.adminDatas || {});

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: FaHome, path: '/admin/dashboard' },
    { name: 'Category', icon: FaList, path: '/admin/category' },
    { name: 'Students', icon: FaUsers, path: '/admin/students' },
    { name: 'Orders', icon: FaShoppingCart, path: '/admin/orders' },
    { name: 'Tutors', icon: FaChalkboardTeacher, path: '/admin/tutors' },
    { name: 'Courses', icon: FaBook, path: '/admin/courses' },
    { name: 'Logout', icon: FaSignOutAlt, action: onLogout },
  ];

  useEffect(() => {
    dispatch(initializeFromPath(location.pathname));
  }, [location.pathname, dispatch]);

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      dispatch(setActiveItem(item.name));
      navigate(item.path);
    }
  };

  return (
    <div className={`w-64 min-h-screen border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="w-24 h-24 relative">
          <img 
            src={adminData?.profileImage || '/placeholder.svg?height=200&width=200'} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover" 
          />
        </div>
        <h2 className={`mt-4 text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-500'}`}>
          {adminData?.fullName || 'Admin'}
        </h2>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center px-6 py-3 text-sm transition-colors duration-200 ${
              item.name === activeItem
                ? 'bg-green-500 text-white'
                : isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon className={`mr-3 text-lg ${item.name === activeItem ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;