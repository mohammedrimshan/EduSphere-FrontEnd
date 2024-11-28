import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Star,
  BookOpen,
  DollarSign,
  Users,
  Plus,
  Edit,
  Eye,
  Calendar,
  Home,
  Info,
  Phone,
} from "lucide-react";
import {
  MdDashboard,
  MdOutlinePerson,
  MdLibraryBooks,
  MdAttachMoney,
} from "react-icons/md";
import {
  FaComments,
  FaChalkboardTeacher,
  FaRegQuestionCircle,
} from "react-icons/fa";
import { BsCameraVideo, BsClipboardCheck } from "react-icons/bs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faStar,
  faChalkboardTeacher,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import TutorHeader from "./Common/Header";
import Sidebar from "../../ui/sideBar";
import LogoutModal from "@/ui/LogOutModal";
import { logoutTutor } from "../../Redux/Slices/tutorSlice";
import { toast, Toaster } from "sonner";
import Footer from "../USER/Common/Footer";
const TutorHome = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tutorData = useSelector((state) => state.tutor.tutorData);
  console.log(
    "Redux State:",
    useSelector((state) => state)
  );
  console.log("Tutor Data from Redux:", tutorData);
  console.log(
    "LocalStorage tutorData:",
    JSON.parse(localStorage.getItem("tutorData"))
  );
  const theme = useSelector((state) => state.theme.theme);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogoutConfirm = () => {
    toast.success("Tutor Logout Successful");

    setTimeout(() => {
      dispatch(logoutTutor());

      navigate("/tutor/tutor-login");
    }, 1000);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const tutor = {
    full_name: "Dr. Jane Smith",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 4.8,
    totalStudents: 3500,
    totalCourses: 12,
    totalEarnings: 75000,
    revenueData: [
      { month: "Jan", revenue: 4000 },
      { month: "Feb", revenue: 5000 },
      { month: "Mar", revenue: 6000 },
      { month: "Apr", revenue: 5500 },
      { month: "May", revenue: 7000 },
      { month: "Jun", revenue: 7500 },
    ],
  };

  const upcomingClasses = [
    {
      id: 1,
      title: "Advanced React Patterns",
      time: "10:00 AM",
      date: "2023-06-15",
      students: 25,
    },
    {
      id: 2,
      title: "Data Structures in Python",
      time: "2:00 PM",
      date: "2023-06-16",
      students: 30,
    },
    {
      id: 3,
      title: "Machine Learning Basics",
      time: "11:00 AM",
      date: "2023-06-17",
      students: 20,
    },
  ];

  const topCourses = [
    {
      id: 1,
      title: "Advanced Machine Learning",
      students: 1200,
      rating: 4.9,
      earnings: 25000,
      progress: 80,
    },
    {
      id: 2,
      title: "Web Development Bootcamp",
      students: 950,
      rating: 4.8,
      earnings: 20000,
      progress: 75,
    },
    {
      id: 3,
      title: "Data Science Fundamentals",
      students: 800,
      rating: 4.7,
      earnings: 18000,
      progress: 70,
    },
  ];

  const recentEnrollments = [
    {
      id: 1,
      student: "Alex Johnson",
      course: "Advanced Machine Learning",
      date: "2023-06-10",
    },
    {
      id: 2,
      student: "Emma Davis",
      course: "Web Development Bootcamp",
      date: "2023-06-09",
    },
    {
      id: 3,
      student: "Michael Brown",
      course: "Data Science Fundamentals",
      date: "2023-06-08",
    },
    {
      id: 4,
      student: "Sophia Wilson",
      course: "Advanced Machine Learning",
      date: "2023-06-07",
    },
    {
      id: 5,
      student: "Daniel Lee",
      course: "Web Development Bootcamp",
      date: "2023-06-06",
    },
  ];

  const menuItem2 = [
    { icon: MdDashboard, label: "Dashboard", path: "/tutor/dashboard" },
    { icon: MdOutlinePerson, label: "Profile", path: "/tutor/tutor-profile" },
    { icon: MdLibraryBooks, label: "Courses", path: "/tutor/courses" },
    { icon: MdAttachMoney, label: "Revenues", path: "/revenues" },
    { icon: BsCameraVideo, label: "Chat & Video", path: "/chat-video" },
    { icon: BsClipboardCheck, label: "Quiz", path: "/quiz" },
  ];

  const handleAddNewCourse = () => { 
    navigate('/tutor/createcourse');
  };


  return (
    <>
      <Toaster position="top-left" richColors />
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        handleLogout={handleLogoutClick}
        menuItems={menuItem2}
      />
      <TutorHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleLogoutClick={handleLogoutClick}
      />
      <div
        className={`flex flex-col min-h-screen ${
          theme === "dark"
            ? "bg-gray-900 text-green-100"
            : "bg-green-50 text-green-800"
        }`}
      >
        <header
          className={`${
            theme === "dark" ? "bg-gray-800" : "bg-green-100"
          } shadow`}
        >
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1
              className={`text-3xl font-bold ${
                theme === "dark" ? "text-green-100" : "text-green-800"
              }`}
            >
              Tutor Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button
              onClick={handleAddNewCourse}
                className={`px-4 py-2 rounded-md ${
                  theme === "dark"
                    ? "bg-green-700 hover:bg-green-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white flex items-center`}
              >
                <Plus size={18} className="mr-2" /> Create New Course
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className={`p-6 rounded-lg shadow-md ${
              theme === "dark"
                ? "bg-gray-800 border-green-700"
                : "bg-white border-green-200"
            } border`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Tutor Profile</h2>
              <button
                className={`p-2 rounded-md ${
                  theme === "dark" ? "hover:bg-gray-700" : "hover:bg-green-100"
                }`}
              >
                <Link to="/tutor/tutor-profile">
                  <Edit size={16} />
                </Link>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <img
                src={tutorData.profileImage || tutor.avatar}
                alt={tutor.full_name}
                className="w-20 h-20 rounded-full"
              />
              <div>
                {tutorData ? (
                  <h2 className="text-2xl font-bold">{tutorData.full_name}</h2>
                ) : (
                  <p className="text-red-500">Tutor data not available</p>
                )}
                <p
                  className={
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }
                >
                  Expert in Machine Learning and Web Development
                </p>
                <div className="flex items-center mt-2">
                  <Star size={16} className="text-yellow-400 mr-1" />
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    {tutor.rating} Instructor Rating
                  </span>
                </div>
              </div>
            </div>
          </div>
          <br></br>
          <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Total Students",
                icon: faGraduationCap,
                value: tutor.totalStudents,
                subtext: "+20% from last month",
              },
              {
                title: "Total Courses",
                icon: faChalkboardTeacher,
                value: tutor.totalCourses,
                subtext: "+2 new this month",
              },
              {
                title: "Total Earnings",
                icon: faMoneyBillWave,
                value: `₹${tutor.totalEarnings}`,
                subtext: "+15% from last month",
              },
              {
                title: "Average Rating",
                icon: faStar,
                value: tutor.rating,
                subtext: "Based on 500+ reviews",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg shadow-md ${
                  theme === "dark"
                    ? "bg-gray-800 border-green-700"
                    : "bg-white border-green-200"
                } border`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium">{item.title}</h2>
                  <FontAwesomeIcon icon={item.icon} className="text-2xl" />
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {item.subtext}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 mb-8 md:grid-cols-2">
            <div
              className={`p-6 rounded-lg shadow-md ${
                theme === "dark"
                  ? "bg-gray-800 border-green-700"
                  : "bg-white border-green-200"
              } border`}
            >
              <h2 className="text-xl font-bold mb-4">Revenue Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tutor.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill={theme === "dark" ? "#4ade80" : "#22c55e"}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div
              className={`p-6 rounded-lg shadow-md ${
                theme === "dark"
                  ? "bg-gray-800 border-green-700"
                  : "bg-white border-green-200"
              } border`}
            >
              <h2 className="text-xl font-bold mb-4">Top Performing Courses</h2>
              {topCourses.map((course) => (
                <div key={course.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{course.title}</span>
                    <span className="text-sm">${course.earnings}</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2.5 dark:bg-green-700">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span>{course.students} students</span>
                    <span>{course.rating} rating</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 mb-8 md:grid-cols-2">
            <div
              className={`p-6 rounded-lg shadow-md ${
                theme === "dark"
                  ? "bg-gray-800 border-green-700"
                  : "bg-white border-green-200"
              } border`}
            >
              <h2 className="text-xl font-bold mb-4">Upcoming Classes</h2>
              <div className="grid gap-4">
                {upcomingClasses.map((class_) => (
                  <div
                    key={class_.id}
                    className={`p-4 rounded-lg ${
                      theme === "dark" ? "bg-gray-700" : "bg-green-100"
                    }`}
                  >
                    <h3 className="text-lg font-semibold">{class_.title}</h3>
                    <div className="mt-2 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      {class_.date} at {class_.time}
                    </div>
                    <div className="mt-2 flex items-center">
                      <Users size={16} className="mr-2" />
                      {class_.students} students enrolled
                    </div>
                    <button
                      className={`mt-4 w-full px-4 py-2 rounded-md ${
                        theme === "dark"
                          ? "bg-green-700 hover:bg-green-600"
                          : "bg-green-500 hover:bg-green-600"
                      } text-white`}
                    >
                      Start Class
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`p-6 rounded-lg shadow-md ${
                theme === "dark"
                  ? "bg-gray-800 border-green-700"
                  : "bg-white border-green-200"
              } border`}
            >
              <h2 className="text-xl font-bold mb-4">Recent Enrollments</h2>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Student</th>
                    <th className="text-left">Course</th>
                    <th className="text-left">Date</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="py-2">{enrollment.student}</td>
                      <td className="py-2">{enrollment.course}</td>
                      <td className="py-2">{enrollment.date}</td>
                      <td className="py-2">
                        <button
                          className={`p-1 rounded-md ${
                            theme === "dark"
                              ? "hover:bg-gray-700"
                              : "hover:bg-green-100"
                          }`}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default TutorHome;
