import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInterceptor from "@/axiosInstance";
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
import { Star, BookOpen, DollarSign, Users, Plus, Edit, Eye, Calendar, Home, Info, Phone } from 'lucide-react';
import {
  MdDashboard,
  MdOutlinePerson,
  MdLibraryBooks,
  MdAttachMoney,
  MdReport,
  MdSavings,
} from "react-icons/md";
import {
  FaComments,
  FaChalkboardTeacher,
  FaRegQuestionCircle,
} from "react-icons/fa";
import RevenueOverview from "./Common/RevenueOverview";
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
  const theme = useSelector((state) => state.theme.theme);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInterceptor.get("/tutor/dashboard");
        console.log(response, "DASA");
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to fetch dashboard data");
      }
    };

    fetchDashboardData();
  }, []);

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

  const handleAddNewCourse = () => {
    navigate("/tutor/createcourse");
  };

  const menuItem2 = [
    { icon: MdDashboard, label: "Dashboard", path: "/tutor/dashboard" },
    { icon: MdOutlinePerson, label: "Profile", path: "/tutor/tutor-profile" },
    { icon: MdLibraryBooks, label: "Courses", path: "/tutor/courses" },
    { icon: MdAttachMoney, label: "Revenues", path: "/tutor/revenue" },
    { icon: BsCameraVideo, label: "Chat & Video", path: "/tutor/chat" },
    { icon: BsClipboardCheck, label: "Quiz", path: "/tutor/quizmanage" },
    { icon: MdReport, label: "Course Reports", path: "/tutor/courselist" },
  ];

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  const {
    tutor = {},
    totalStudents = 0,
    totalCourses = 0,
    totalEarnings = 0,
    averageRating = 0,
    revenueData = [],
    topCourses = [],
    recentEnrollments = [],
    latestCourses = [],
  } = dashboardData;

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
                src={
                  tutor.profile_image ||
                  tutor.profileImage ||
                  "/placeholder.svg"
                }
                alt={tutor.full_name || "Tutor"}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold">
                  {tutor.full_name || "Tutor Name"}
                </h2>
                <p
                  className={
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }
                >
                  {tutor.bio || "Expert Tutor"}
                </p>
                <div className="flex items-center mt-2">
                  <Star size={16} className="text-yellow-400 mr-1" />
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    {averageRating.toFixed(1)} Instructor Rating
                  </span>
                </div>
              </div>
            </div>
          </div>
          <br></br>
          <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4 mt-8">
            {[
              {
                title: "Total Students",
                icon: faGraduationCap,
                value: totalStudents,
                subtext: "Unique enrolled students",
              },
              {
                title: "Total Courses",
                icon: faChalkboardTeacher,
                value: totalCourses,
                subtext: "+2 new this month",
              },
              {
                title: "Total Earnings",
                icon: faMoneyBillWave,
                value: `₹${totalEarnings.toFixed(2)}`,
                subtext: "After applying discounts",
              },
              {
                title: "Average Rating",
                icon: faStar,
                value: averageRating.toFixed(1),
                subtext: "Based on all courses",
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
                <RevenueOverview revenueData={revenueData} theme={theme} />
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
                <div key={course._id} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{course.title}</span>
                    <span className="text-sm">₹{course.earnings}</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2.5 dark:bg-green-700">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{
                        width: `${(course.students / totalStudents) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span>{course.students} students</span>
                    <span>
                      {course.rating ? course.rating.toFixed(1) : "0"} rating
                    </span>
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
              <h2 className="text-xl font-bold mb-4">Latest Courses</h2>
              <div className="grid gap-4">
                {latestCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`p-4 rounded-lg ${
                      theme === "dark" ? "bg-gray-700" : "bg-green-100"
                    }`}
                  >
                    <h3 className="text-lg font-semibold">{course.title}</h3>
                    <div className="mt-2 flex items-center">
                      <BookOpen size={16} className="mr-2" />
                      {course.lessons} lessons
                    </div>
                    <div className="mt-2 flex items-center">
                      <Users size={16} className="mr-2" />
                      {course.students} students enrolled
                    </div>
                    <button
                      className={`mt-4 w-full px-4 py-2 rounded-md ${
                        theme === "dark"
                          ? "bg-green-700 hover:bg-green-600"
                          : "bg-green-500 hover:bg-green-600"
                      } text-white`}
                    >
                      View Course
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
                    <tr key={enrollment._id}>
                      <td className="py-2">{enrollment.student}</td>
                      <td className="py-2">{enrollment.course}</td>
                      <td className="py-2">
                        {new Date(enrollment.date).toLocaleDateString()}
                      </td>
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

