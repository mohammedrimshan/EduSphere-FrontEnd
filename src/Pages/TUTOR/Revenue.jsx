import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';
import TutorHeader from './Common/Header';
import Footer from '../USER/Common/Footer';
import Sidebar from '@/ui/sideBar';
import axiosInterceptor from '@/axiosInstance';
import { 
  MdDashboard, 
  MdOutlinePerson, 
  MdLibraryBooks, 
  MdAttachMoney, 
  MdReport 
} from 'react-icons/md';
import { BsCameraVideo, BsClipboardCheck } from 'react-icons/bs';


const StatCard = ({ title, value, icon: Icon, trend, percentage, theme }) => (
  <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
        <h3 className="text-2xl font-bold mt-1">
          {typeof value === 'number' ? `${value.toLocaleString()}` : value}
        </h3>
      </div>
      <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'}`}>
        <Icon className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={24} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center mt-4">
        {trend === 'up' ? (
          <ArrowUpRight className="text-green-500" size={20} />
        ) : (
          <ArrowDownRight className="text-red-500" size={20} />
        )}
        <span className={`ml-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {percentage}%
        </span>
      </div>
    )}
  </div>
);


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const RevenueDashboard = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const theme = useSelector((state) => state.theme.theme);
  const tutorData = useSelector((state) => state.tutor.tutorData);

  const menuItems = [
    { icon: MdDashboard, label: 'Dashboard', path: '/tutor/dashboard' },
    { icon: MdOutlinePerson, label: 'Profile', path: '/tutor/tutor-profile' },
    { icon: MdLibraryBooks, label: 'Courses', path: '/tutor/courses' },
    { icon: MdAttachMoney, label: 'Revenues', path: '/revenues' },
    { icon: BsCameraVideo, label: 'Chat & Video', path: '/tutor/chat' },
    { icon: BsClipboardCheck, label: 'Quiz', path: '/tutor/quizmanage' },
    { icon: MdReport, label: 'Course Reports', path: '/tutor/courselist' },
  ];

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const response = await axiosInterceptor.get('/tutor/revenue-dashboard');
       console.log(response,"daa")
        // Extract revenue data from the nested structure
        const revenue = response.data.data.revenue;
        console.log(revenue)
        setRevenueData(revenue);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No revenue data available</p>
      </div>
    );
  }

  const chartData = revenueData.courses?.map(course => ({
    name: course.courseName,
    revenue: course.revenue,
    purchases: course.purchases
  })) || [];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        menuItems={menuItems}
      />
      <TutorHeader isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Revenue Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> {/* Updated grid layout */}
          <StatCard
            title="Total Revenue"
            value={revenueData.totalRevenue || 0}
            icon={DollarSign}
            trend="up"
            percentage="12.5"
            theme={theme}
          />
          <StatCard
            title="Total Purchases"
            value={revenueData.totalPurchases || 0}
            icon={Users}
            theme={theme}
          />
          <StatCard
            title="Average Revenue per Course"
            value={
              revenueData.courses?.length > 0
                ? (revenueData.totalRevenue / revenueData.courses.length).toFixed(2)
                : 0
            }
            icon={TrendingUp}
            theme={theme}
          />
        </div>

        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-4">Revenue by Course</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-4">Purchase Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="purchases"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No course data available to display charts</p>
          </div>
        )}

        <div className={`rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6`}>
          <h2 className="text-xl font-bold mb-4">Course Performance Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <th className="text-left p-3">Course Name</th>
                  <th className="text-right p-3">Price (₹)</th>
                  <th className="text-right p-3">Offer %</th>
                  <th className="text-right p-3">Purchases</th>
                  <th className="text-right p-3">Revenue (₹)</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.courses?.map((course, index) => (
                  <tr key={index} className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-t`}>
                    <td className="p-3">{course.courseName}</td>
                    <td className="text-right p-3">{course.coursePrice.toLocaleString()}</td>
                    <td className="text-right p-3">{course.offerPercentage}%</td>
                    <td className="text-right p-3">{course.purchases}</td>
                    <td className="text-right p-3">{course.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RevenueDashboard;

