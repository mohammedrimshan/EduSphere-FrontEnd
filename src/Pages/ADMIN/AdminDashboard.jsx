import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FaSearch, FaBell, FaDollarSign, FaUserGraduate, FaChalkboardTeacher, FaBook, FaBars, FaSun, FaMoon, FaUser } from 'react-icons/fa';
import Sidebar from './Common/AdminSideBar';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster, toast } from 'sonner';
import { logoutAdmin } from '../../Redux/Slices/adminSlice';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminData = useSelector((state) => state?.admin?.adminDatas || {});

  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    dispatch(logoutAdmin());
    setIsLogoutModalOpen(false);
    
    
    toast.success('Logged out successfully!', {
      duration: 3000,
      onAutoClose: () => navigate('/admin/adminlogin')
    });
  };

  
  const ProfileImage = () => {
    const handleImageError = () => {
      setImageError(true);
    };

    if (imageError || !adminData?.profileImage) {
      return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <FaUser className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
      );
    }

    return (
      <img 
        src={adminData.profileImage} 
        alt={adminData.fullName || 'Profile'} 
        className="w-10 h-10 rounded-full object-cover"
        onError={handleImageError}
      />
    );
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isSidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.toggle-sidebar')) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isSidebarOpen]);

  
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income',
        data: [30, 35, 45, 40, 50, 45, 40, 45, 35, 40, 35, 30],
        borderColor: '#22c55e',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Profit',
        data: [20, 25, 35, 30, 40, 35, 30, 35, 25, 30, 25, 20],
        borderColor: '#fbbf24',
        tension: 0.4,
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#fff' : '#000'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#000'
        }
      },
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#000'
        }
      }
    }
  };

  const stats = [
    { label: 'Total Revenue', value: '$200.00', icon: FaDollarSign },
    { label: 'Total Students', value: '551', icon: FaUserGraduate },
    { label: 'Total Tutors', value: '120', icon: FaChalkboardTeacher },
    { label: 'Courses', value: '23', icon: FaBook }
  ];

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div
        className={`fixed lg:relative sidebar z-20 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-lg transition-transform duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:w-64`}
      >
        <Sidebar isDarkMode={isDarkMode} onLogout={handleLogout} />
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 lg:hidden z-10"
          onClick={toggleSidebar}
        ></div>
      )}

      <main className="flex-1 p-4 lg:p-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center w-full sm:w-auto">
            <button
              onClick={toggleSidebar}
              className="toggle-sidebar lg:hidden text-gray-600 dark:text-gray-300 text-2xl p-2 mr-2"
            >
              <FaBars />
            </button>
            <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <input
                type="search"
                placeholder="Search courses"
                className={`w-full sm:w-64 px-4 py-2 pl-10 rounded-md border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-800'
                } focus:outline-none focus:ring-1 focus:ring-green-500`}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>

            {/* Notifications */}
            <button className="relative p-2">
              <FaBell className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Profile Section */}
            <div className="relative group">
              <ProfileImage />
              {adminData?.fullName && (
                <div className={`absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20 hidden group-hover:block
                  ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                  <div className="px-4 py-2 text-sm">
                    <div className="font-medium">{adminData.fullName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {adminData.email}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {stats.map((stat) => (
            <div 
              key={stat.label} 
              className={`${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              } p-4 lg:p-6 rounded-lg shadow-sm flex items-center`}
            >
              <div className="mr-4 p-3 bg-green-100 rounded-full">
                <stat.icon className="text-2xl text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  {stat.label}
                </p>
                <p className="text-xl lg:text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } p-4 lg:p-6 rounded-lg shadow-sm`}>
          <h2 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Income & Expense
          </h2>
          <div className="h-[300px] lg:h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {isLogoutModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-lg shadow-lg`}>
              <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
              <p className="mb-6">Are you sure you want to log out? You will be redirected to the login page.</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className={`px-4 py-2 rounded ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}