// TutorsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdStar } from "react-icons/md";
import {
  FaUsers,
  FaBook,
  FaChalkboardTeacher,
  FaStar as FaStar2,
  FaGraduationCap,
  FaClock,
  FaEnvelope,
} from "react-icons/fa";
import { toast } from "sonner";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import Sidebar from "@/ui/sideBar";
import LogoutModal from "../../ui/LogOutModal";
import axiosInterceptor from "@/axiosInstance";
import {
  MdOutlineHome,
  MdOutlinePerson,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdOutlineFavoriteBorder,
  MdOutlineReceiptLong,
  MdAccountBalanceWallet,
} from "react-icons/md";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";
import { data } from "autoprefixer";

const TutorDetailsPage = () => {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.theme);

  const menuItems = [
    { icon: MdOutlineHome, label: "Home", path: "/user/home" },
    { icon: MdOutlinePerson, label: "Profile", path: "/user/profile" },
    { icon: MdLibraryBooks, label: "My Courses", path: "/user/my-courses" },
    { icon: BsPeopleFill, label: "Teachers", path: "/user/mytutors" },
    {
      icon: MdOutlineShoppingCart,
      label: "My Orders",
      path: "/user/payments/status",
    },
    {
      icon: MdOutlineFavoriteBorder,
      label: "Wishlist",
      path: "/user/wishlist",
    },
    {
      icon: BsFillAwardFill,
      label: "Certificates",
      path: "/user/certificates",
    },
    {
      icon: MdOutlineReceiptLong,
      label: "Refund History",
      path: "/user/refund-history",
    },
    { icon: MdAccountBalanceWallet, label: "Wallet", path: "/user/wallet" },
  ];

  useEffect(() => {
    fetchTutorDetails();
  }, [tutorId]);

  const fetchTutorDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInterceptor.get(`/user/tutors/${tutorId}`);
      console.log(response.data);
      setTutor(response.data.data);
    } catch (error) {
      console.error("Error fetching tutor details:", error);
      toast.error("Failed to fetch tutor details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutConfirm = () => {
    toast.success("Logout Successful");
    setTimeout(() => {
      dispatch(logoutUser());
      navigate("/user/login");
    }, 1000);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const calculateDiscountedPrice = (price, offerPercentage) => {
    return Math.round(price - (price * offerPercentage) / 100);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tutor) {
    return <div>Tutor not found</div>;
  }

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
        <Sidebar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          theme={theme}
          handleLogout={handleLogoutClick}
          menuItems={menuItems}
        />

        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogoutClick={handleLogoutClick}
        />

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tutor Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <img
                src={
                  tutor.profile_image || "/placeholder.svg?height=200&width=200"
                }
                alt={tutor.full_name}
                className="w-40 h-40 rounded-full object-cover border-4 border-green-500"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{tutor.full_name}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  {tutor.subject}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {tutor.bio}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  <FaEnvelope className="inline mr-2" />
                  {tutor.email}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <FaGraduationCap className="text-3xl text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-500">
                      {tutor.totalStudents}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Students
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <FaChalkboardTeacher className="text-3xl text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-500">
                      {tutor.totalCourses}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Courses
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <FaStar2 className="text-3xl text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-400">
                      {tutor.averageRating?.toFixed(1) || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Rating
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <h2 className="text-2xl font-bold mb-6">
            Courses by {tutor.full_name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutor.courses.map((course) => (
              <div
                key={course._id}
                onClick={() => navigate(`/user/courseview/${course._id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              >
                <img
                  src={
                    course.course_thumbnail ||
                    "/placeholder.svg?height=200&width=400"
                  }
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1">
                      <FaStar2 className="text-yellow-400" />
                      <span>{course.average_rating?.toFixed(1) || "N/A"}</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {course.level}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-green-500 font-bold">
                      ₹
                      {calculateDiscountedPrice(
                        course.price,
                        course.offer_percentage
                      )}
                      {course.offer_percentage > 0 && (
                        <span className="text-gray-400 line-through text-sm ml-2">
                          ₹{Math.round(course.price)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <FaClock className="mr-1" />
                      {course.duration} weeks
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
        />
      </div>
    </div>
  );
};

export default TutorDetailsPage;
