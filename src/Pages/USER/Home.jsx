import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Menu,
  Monitor,
  Palette,
  Database,
  Briefcase,
  Home,
  Info,
  Phone,
  BookOpen,
  Users,
} from "lucide-react";
import {
  MdOutlinePerson,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdOutlineFavoriteBorder,
  MdOutlineReceiptLong,
  MdOutlineHome,
  MdAccountBalanceWallet,
} from "react-icons/md";
import {
  BsCameraVideo,
  BsClipboardCheck,
  BsPeopleFill,
  BsFillAwardFill,
} from "react-icons/bs";

import { logoutUser } from "../../Redux/Slices/userSlice";
import { toggleTheme } from "../../Redux/Slices/themeSlice";
import Banner from "../../assets/Banner.svg";
import Graphics from "../../assets/grapics.jpg";
import SQL from "../../assets/SQL.jpg";
import HTML from "../../assets/HTML.png";
import MONGO from "../../assets/MONGODB.png";
import Button from "../../ui/Button";
import Card from "../../ui/Card";
import Sidebar from "../../ui/sideBar";
import ThemeToggle from "../../ui/themeToggle";
import LogoutModal from "../../ui/LogOutModal";
import { toast, Toaster } from "sonner";
import avatar from "../../assets/avt.webp";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import { fetchCart, clearCart } from "../../Redux/Slices/cartSlice";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import axiosInterceptor from "@/axiosInstance";
import { setCourses } from "../../Redux/Slices/courseSlice";
export default function UserHomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userDatas);
  console.log(user, "darahjghfjgh");
  const theme = useSelector((state) => state.theme.theme);
  const courses = useSelector((state) => state.course.courseDatas) || [];
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [showAllCourses, setShowAllCourses] = useState(false);
  const cartItems = useSelector((state) => state.cart.items);
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInterceptor.get(`/user/courses`, {
        withCredentials: true,
      });
      if (response.data && response.data.courses) {
        const filteredCourses = response.data.courses.filter(
          (course) => !course.isBanned
        );
        dispatch(setCourses({ courses: filteredCourses, isTutor: false }));
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (courseId) => {
    try {
      const isFavorite = favorites[courseId];
      if (isFavorite) {
        await axiosInterceptor.delete(`/user/removewishlist/${courseId}`);
      } else {
        await axiosInterceptor.post("/user/addwishlist", { courseId });
      }
      setFavorites((prev) => ({
        ...prev,
        [courseId]: !isFavorite,
      }));
      toast.success(
        `Course ${isFavorite ? "removed from" : "added to"} wishlist`
      );
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error("Failed to update wishlist");
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

  // Categories data
  const categories = [
    { title: "Design", icon: Palette, color: "green", courses: 11 },
    { title: "Development", icon: Monitor, color: "blue", courses: 11 },
    { title: "Data Science", icon: Database, color: "purple", courses: 11 },
    { title: "Business", icon: Briefcase, color: "orange", courses: 11 },
  ];

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
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogoutClick={handleLogoutClick}
        />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          {/* Welcome Section */}
          <section className="container mx-auto px-4 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                  Welcome,{" "}
                  <span className="text-green-500">
                    {user?.full_name || "Guest"}
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Continue your learning journey with personalized courses and
                  activities.
                </p>

                <h1 className="text-5xl font-bold leading-tight dark:text-white">
                  You bring the{" "}
                  <span className="text-green-500">expertise</span>, we'll make
                  it unforgettable.
                </h1>
                <p className="text-gray-600 text-lg max-w-md dark:text-gray-300">
                  Using highly personalised activities, videos and animations
                  you can energize your students and motivate them to achieve
                  their learning goals as they progress through a journey.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full filter blur-3xl opacity-20"></div>
                <img
                  alt="Learning illustration"
                  className="relative rounded-3xl w-full max-w-md mx-auto"
                  src={Banner}
                />
              </div>
            </div>
          </section>
          {/* Course Cards */}
          {/* Course Cards */}
          <section className="container mx-auto px-4 py-20">
            <div className="space-y-12">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">
                  All Courses
                </h2>
                <button
                  onClick={() => setShowAllCourses(!showAllCourses)}
                  className="text-green-500 hover:underline"
                >
                  {showAllCourses ? "Show Less" : "See All"}
                </button>
              </div>
              <div
                className={`
        ${
          showAllCourses
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            : "flex overflow-x-auto gap-4 pb-4 no-scrollbar"
        }
      `}
                style={
                  !showAllCourses
                    ? {
                        "-ms-overflow-style": "none",
                        scrollbarWidth: "none",
                      }
                    : {}
                }
              >
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className={!showAllCourses ? "flex-none w-[300px]" : ""}
                    onClick={() => navigate(`/user/courseview/${course._id}`)}
                  >
                    <div className="h-full border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative">
                      <img
                        src={
                          course.course_thumbnail ||
                          "/placeholder.svg?height=200&width=400"
                        }
                        alt={course.title}
                        className="w-full h-40 object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(course._id);
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1"
                      >
                        {favorites[course._id] ? (
                          <MdFavorite className="text-red-500 w-6 h-6" />
                        ) : (
                          <MdFavoriteBorder className="w-6 h-6" />
                        )}
                      </button>
                      <div className="p-4">
                        <h3 className="font-medium mb-2  dark:text-white">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={
                              course.tutor?.profile_image ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={course.tutor?.full_name || "Tutor"}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm text-gray-600">
                            {course.tutor?.full_name || "Unknown Tutor"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(course.rating || 0)
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({course.reviews?.length || 0} reviews)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500 font-semibold">
                            ₹
                            {Math.round(
                              course.price -
                                course.price *
                                  ((course.offer_percentage || 0) / 100)
                            )}
                          </span>
                          {course.offer_percentage > 0 && (
                            <>
                              <span className="text-gray-400 line-through text-sm">
                                ₹{course.price}
                              </span>
                              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                                {course.offer_percentage}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Categories Grid */}
          <section className="container mx-auto px-4 py-20">
            <div className="space-y-12">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">
                  Explore Categories
                </h2>
                <a href="#" className="text-green-500 hover:underline">
                  See All
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                  <Card
                    key={index}
                    className="p-6 space-y-4 flex flex-col items-center justify-center bg-white dark:bg-gray-800"
                  >
                    <div
                      className={`h-12 w-12 bg-${category.color}-100 rounded-lg flex items-center justify-center`}
                    >
                      <category.icon
                        className={`h-6 w-6 text-${category.color}-500`}
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold dark:text-white">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.courses} Courses
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <LogoutModal
              isOpen={showLogoutModal}
              onClose={() => setShowLogoutModal(false)}
              onConfirm={handleLogoutConfirm}
            />
          </section>
          <Footer />
        </div>
      </div>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
}
