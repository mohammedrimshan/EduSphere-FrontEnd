import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { User, Book, Calendar, Mail, Menu, MessageCircle } from "lucide-react";
import axiosInterceptor from "@/axiosInstance";
import { logoutUser } from "@/Redux/Slices/userSlice";
import { toggleTheme } from "@/Redux/Slices/themeSlice";
import { toast, Toaster } from "sonner";
import Sidebar from "@/ui/sideBar";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import LogoutModal from "@/ui/LogOutModal";
import ChatComponent from "@/Pages/USER/UserChatPage";
import UserChatComponent from "@/Pages/USER/Common/UserChatComponent";
import {
  MdOutlinePerson,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdOutlineFavoriteBorder,
  MdOutlineHome,
  MdOutlineReceiptLong,
  MdAccountBalanceWallet,
} from "react-icons/md";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";
import { X } from "lucide-react";

const EnrolledTutors = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const user = useSelector((state) => state.user.userDatas);
  const theme = useSelector((state) => state.theme.theme);

  // If user is null, show loading or redirect
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Please log in to continue
          </h2>
          <button
            onClick={() => navigate("/user/login")}
            className="px-6 py-2 bg-green-500 text-white rounded-full transition-colors duration-300 hover:bg-green-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

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
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const response = await axiosInterceptor.get(
          `/user/enrolled-tutors/${user.id}`
        );
        console.log(response);
        if (response.data.success) {
          setTutors(response.data.tutors);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch tutors");
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [user.id]);

  const handleOpenChat = (tutor) => {
    console.log("Tutor data for chat:", {
      tutor,
      userId: tutor.user_id,
      tutorId: tutor._id,
    });

    navigate("/user/chat", {
      state: {
        tutorId: tutor.user_id || tutor._id,
      },
    });
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        handleLogout={handleLogoutClick}
        menuItems={menuItems}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Toaster position="top-left" richColors />

        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogoutClick={handleLogoutClick}
        />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto flex flex-col">
          <div className="flex-grow container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">
              My Course Tutors
            </h2>

            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4">Error: {error}</div>
            ) : tutors.length === 0 ? (
              <div className="text-center text-gray-500 p-8 dark:text-gray-400">
                No enrolled tutors found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutors.map((tutor) => (
                  <div
                    key={tutor._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                  >
                    {/* Tutor Header */}
                    <div className="p-4 border-b dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <img
                          src={tutor.profile_image || "/api/placeholder/64/64"}
                          alt={tutor.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-semibold dark:text-white">
                            {tutor.full_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {tutor.subject}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Mail className="w-4 h-4 mr-1" />
                            {tutor.email}
                          </div>
                        </div>
                      </div>

                      {/* Tutor Stats */}
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Book className="w-4 h-4 mr-1 text-blue-500" />
                          <span className="dark:text-gray-300">
                            {tutor.totalCourses} Total Courses
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-green-500" />
                          <span className="dark:text-gray-300">
                            Last Active:{" "}
                            {format(new Date(tutor.lastActive), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>

                      {/* Tutor Bio */}
                      {tutor.bio && (
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                          {tutor.bio.length > 150
                            ? `${tutor.bio.substring(0, 150)}...`
                            : tutor.bio}
                        </p>
                      )}

                      {/* Chat Button */}
                      <button
                        onClick={() => handleOpenChat(tutor)}
                        className="mt-4 flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Chat with Tutor
                      </button>
                    </div>

                    {/* Enrolled Courses */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900">
                      <h4 className="font-semibold mb-3 dark:text-white">
                        Enrolled Courses
                      </h4>
                      <div className="space-y-3">
                        {tutor.enrolledCourses.map((course) => (
                          <div
                            key={course._id}
                            className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-700"
                          >
                            <img
                              src={
                                course.course_thumbnail ||
                                "/api/placeholder/48/48"
                              }
                              alt={course.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div>
                              <h5 className="font-medium text-sm dark:text-white">
                                {course.title}
                              </h5>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Enrolled:{" "}
                                {format(
                                  new Date(course.enrollmentDate),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />

      {selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold dark:text-white">
                Chat with {selectedTutor.full_name}
              </h3>
              <button
                onClick={() => setSelectedTutor(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow overflow-hidden">
              <UserChatComponent tutorId={selectedTutor.user_id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrolledTutors;
