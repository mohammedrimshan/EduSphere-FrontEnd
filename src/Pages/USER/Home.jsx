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
import {
  fetchCart,
  clearCart,
} from "../../Redux/Slices/cartSlice";
export default function UserHomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userDatas);
  console.log(user)
  const theme = useSelector((state) => state.theme.theme);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  // Course data
  const courses = [
    {
      title: "Beginner's Guide to Design",
      image: Graphics,
      price: "$149.9",
      instructor: "Ronald Richards",
      duration: "22 Total Hours, 155 Lectures, Beginner",
      ratings: 1200,
    },
    {
      title: "Beginner's Guide to HTML",
      image: HTML,
      price: "$149.9",
      instructor: "Ronald Richards",
      duration: "22 Total Hours, 155 Lectures, Beginner",
      ratings: 1200,
    },
    {
      title: "MongoDB Essentials",
      image: MONGO,
      price: "$149.9",
      instructor: "Ronald Richards",
      duration: "22 Total Hours, 155 Lectures, Beginner",
      ratings: 1200,
    },
    {
      title: "SQL Masterclass",
      image: SQL,
      price: "$149.9",
      instructor: "Ronald Richards",
      duration: "22 Total Hours, 155 Lectures, Beginner",
      ratings: 1200,
    },
  ];

  // Categories data
  const categories = [
    { title: "Design", icon: Palette, color: "green", courses: 11 },
    { title: "Development", icon: Monitor, color: "blue", courses: 11 },
    { title: "Data Science", icon: Database, color: "purple", courses: 11 },
    { title: "Business", icon: Briefcase, color: "orange", courses: 11 },
  ];

  const menuItems = [
    { icon: MdOutlinePerson, label: "Profile", path: "/user/profile" },
    { icon: MdLibraryBooks, label: "My Courses", path: "/my-courses" },
    { icon: BsPeopleFill, label: "Teachers", path: "/teachers" },
    { icon: MdOutlineShoppingCart, label: "My Orders", path: "/my-orders" },
    { icon: MdOutlineFavoriteBorder, label: "Wishlist", path: "/wishlist" },
    { icon: BsFillAwardFill, label: "Certificates", path: "/certificates" },
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
        <Toaster position="top-left" richColors />
        
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogoutClick={handleLogoutClick}
        />
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Welcome Section */}
          <section className="container mx-auto px-4 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                  Welcome,{" "}
                  <span className="text-green-500">{user?.full_name || "Guest"}</span>
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
          <section className="container mx-auto px-4 py-20">
            <div className="space-y-12">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold dark:text-white">
                  Recommended Courses
                </h2>
                <a href="#" className="text-green-500 hover:underline">
                  See All
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {courses.map((course, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden bg-white dark:bg-gray-800"
                  >
                    <img
                      alt={course.title}
                      className="w-full h-48 object-cover"
                      src={course.image}
                    />
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold dark:text-white">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        by {course.instructor}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <span className="text-sm text-gray-600">
                          ({course.ratings})
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {course.duration}
                      </p>
                      <p className="font-bold text-green-500">{course.price}</p>
                    </div>
                  </Card>
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
