import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
  MdStar,
  MdSchool,
  MdLanguage
} from "react-icons/md";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";
import { FaUsers, FaBook, FaChalkboardTeacher } from "react-icons/fa";

const TutorsPage = () => {
  const [tutors, setTutors] = useState([]);
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
    { icon: MdOutlineShoppingCart, label: "My Orders", path: "/user/payments/status" },
    { icon: MdOutlineFavoriteBorder, label: "Wishlist", path: "/user/wishlist" },
    { icon: BsFillAwardFill, label: "Certificates", path: "/user/certificates" },
    { icon: MdOutlineReceiptLong, label: "Refund History", path: "/user/refund-history" },
    { icon: MdAccountBalanceWallet, label: "Wallet", path: "/user/wallet" }
  ];

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInterceptor.get('/user/alltutors');
      if (response.data && response.data.data) {
        setTutors(response.data.data);
      } else {
        console.error('Invalid response structure:', response.data);
        toast.error('Invalid data received from server');
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch tutors');
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
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
          <h1 className="text-4xl font-bold mb-8 text-center">Our Expert Tutors</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tutors.map((tutor) => (
              <div
                key={tutor._id}
                onClick={() => navigate(`/user/tutor/${tutor._id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer p-6 transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center mb-4">
                  <img
                    src={tutor.profile_image || "/placeholder.svg?height=100&width=100"}
                    alt={tutor.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-green-500"
                  />
                  <h2 className="text-xl font-semibold mt-2">{tutor.full_name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                    <MdSchool className="mr-1" /> {tutor.subject || "Various Subjects"}
                  </p>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 text-center">
                  {tutor.bio}
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex flex-col items-center">
                    <FaUsers className="text-blue-500 text-xl mb-1" />
                    <span>{tutor.totalStudents} students</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FaBook className="text-green-500 text-xl mb-1" />
                    <span>{tutor.totalCourses} courses</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MdStar className="text-yellow-400 text-xl mb-1" />
                    <span>{tutor.averageRating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
       
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
        />
      </div>
      <Footer />
    </div>
  );
};

export default TutorsPage;
