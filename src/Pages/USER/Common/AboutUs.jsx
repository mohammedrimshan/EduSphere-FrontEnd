import React from "react";
import { useSelector } from "react-redux";
import {
  GraduationCap,
  Users,
  Award,
  Clock,
  PlayCircle,
  CheckCircle
} from "lucide-react";
import {
    MdOutlinePerson,
    MdLibraryBooks,
    MdOutlineShoppingCart,
    MdOutlineFavoriteBorder,
    MdOutlineReceiptLong,
    MdOutlineHome,
    MdAccountBalanceWallet
  } from "react-icons/md";
  import {
    BsCameraVideo,
    BsClipboardCheck,
    BsPeopleFill,
    BsFillAwardFill,
  } from "react-icons/bs";
import Sidebar from "@/ui/sideBar";
import Header from "@/Pages/USER/Common/Header";
import Footer from "./Footer";

const AboutPage = () => {
  const theme = useSelector((state) => state.theme.theme);
  const [isOpen, setIsOpen] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const stats = [
    { icon: GraduationCap, label: "Active Students", value: "10,000+" },
    { icon: Users, label: "Expert Instructors", value: "200+" },
    { icon: Award, label: "Course Certificates", value: "15,000+" },
    { icon: Clock, label: "Hours of Content", value: "5,000+" },
  ];

  const features = [
    {
      title: "Expert-Led Instruction",
      description: "Learn from industry professionals with years of real-world experience"
    },
    {
      title: "Flexible Learning",
      description: "Study at your own pace with lifetime access to course content"
    },
    {
      title: "Interactive Projects",
      description: "Apply your knowledge through hands-on projects and assignments"
    },
    {
      title: "Career Support",
      description: "Get guidance on career paths and industry opportunities"
    }
  ];

  // Menu items (same as Home page)
  const menuItems = [
    { icon: MdOutlineHome, label: "Home", path: "/user/home" },
    { icon: MdOutlinePerson, label: "Profile", path: "/user/profile" },
    { icon: MdLibraryBooks, label: "My Courses", path: "/user/my-courses" },
    { icon: BsPeopleFill, label: "Teachers", path: "/user/mytutors" },
    { icon: MdOutlineShoppingCart, label: "My Orders", path: "/user/payments/status" },
    { icon: MdOutlineFavoriteBorder, label: "Wishlist", path: "/user/wishlist" },
    { icon: BsFillAwardFill, label: "Certificates", path: "/user/certificates" },
    { icon: MdOutlineReceiptLong, label: "Refund History", path: "/user/refund-history" },
    { icon: MdAccountBalanceWallet , label: "Wallet", path: "/user/wallet" }
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogoutClick={handleLogoutClick}
        />

<div className="flex-1 overflow-auto scrollbar-hide">
          {/* Hero Section with Video */}
          <section className="relative h-[500px] overflow-hidden">
            <video
              autoPlay
              muted
              loop
              className="absolute w-full h-full object-cover"
            >
              <source src="https://res.cloudinary.com/dbair2ulh/video/upload/v1734719719/uqdqd6vaxhyoheicncv4.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black bg-opacity-60">
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="max-w-2xl text-white">
                  <h1 className="text-5xl font-bold mb-6">Transforming Lives Through Education</h1>
                  <p className="text-xl mb-8">Empowering learners worldwide with quality education and innovative learning solutions.</p>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2">
                    <PlayCircle className="w-5 h-5" />
                    Watch Our Story
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold dark:text-white mb-2">{stat.value}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-8 dark:text-white">Our Mission</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  We're committed to making quality education accessible to everyone, everywhere. 
                  Our platform combines cutting-edge technology with expert instruction to create 
                  an engaging learning experience that helps students achieve their goals and unlock 
                  their full potential.
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Why Choose Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-3 dark:text-white">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AboutPage;