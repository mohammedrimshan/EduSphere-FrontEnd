import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdStar, MdStarHalf, MdStarOutline } from "react-icons/md";
import {
  MdDesignServices,
  MdDeveloperMode,
  MdComputer,
  MdBusiness,
  MdCameraAlt,
  MdCampaign,
  MdBusinessCenter,
  MdOutlinePerson,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdOutlineFavoriteBorder,
  MdCode,
  MdLanguage,
  MdMusicNote,
  MdPalette,
  MdScience,
  MdSportsBasketball,
} from "react-icons/md";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";
import { toast, Toaster } from "sonner";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import Sidebar from "@/ui/sideBar";
import LogoutModal from "../../ui/LogOutModal";
import { setCourses } from "../../Redux/Slices/courseSlice";
import { setCategories } from "../../Redux/Slices/categorySlice";
import dummy1 from "../../assets/dummy1.avif";
import dummy2 from "../../assets/dummy2.jpg";
import dummy3 from "../../assets/dummy3.jpg";
// Helper component for star rating
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex text-yellow-400">
      {[...Array(fullStars)].map((_, i) => (
        <MdStar key={`full-${i}`} className="w-4 h-4" />
      ))}
      {hasHalfStar && <MdStarHalf className="w-4 h-4" />}
      {[...Array(emptyStars)].map((_, i) => (
        <MdStarOutline key={`empty-${i}`} className="w-4 h-4" />
      ))}
    </div>
  );
};

// Price display component with offer
const PriceDisplay = ({ originalPrice, offerPercentage }) => {
  const offerPrice = originalPrice - originalPrice * (offerPercentage / 100);

  return (
    <div className="flex items-center gap-2">
      <span className="text-green-500 font-semibold">
        ₹{offerPrice.toFixed(2)}
      </span>
      {offerPercentage > 0 && (
        <>
          <span className="text-gray-400 line-through text-sm">
            ₹{originalPrice}
          </span>
          <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
            {offerPercentage}% OFF
          </span>
        </>
      )}
    </div>
  );
};

const CoursePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userDatas);
  console.log("user detials", user);
  const theme = useSelector((state) => state.theme.theme);
  const courses = useSelector((state) => state.course.courseDatas) || [];
  console.log("courses in userside", courses);
  const categories = useSelector((state) => state.category.categoryDatas) || [];
  console.log("categories in userside", categories);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tutor/courses`);
      // Add safety check before dispatching
      if (response.data && response.data.courses) {
        dispatch(setCourses({courses:response.data.courses,isTutor:false}));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/categories`);
      dispatch(
        setCategories(response.data.filter((category) => category.isVisible))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      Design: MdDesignServices,
      Development: MdDeveloperMode,
      "IT & Software": MdComputer,
      Business: MdBusiness,
      Marketing: MdCampaign,
      Photography: MdCameraAlt,
      Music: MdMusicNote,
      "Health & Fitness": MdSportsBasketball,
      Language: MdLanguage,
      "Art & Crafts": MdPalette,
      Science: MdScience,
      Programming: MdCode,
    };
    return iconMap[categoryName] || MdBusinessCenter; // Default icon
  };

  const carouselSlides = [
    {
      image: dummy1,
      title: "Welcome back, ready for your next lesson?",
    },
    {
      image: dummy2,
      title: "Web Development Basics",
    },
    {
      image: dummy3,
      title: "Learn Software Architecture",
    },
  ];

  const handleLogoutConfirm = () => {
    toast.success("Logout Successful");
    setTimeout(() => {
      // Assuming you have a logoutUser action
      dispatch(logoutUser());
      navigate("/user/login");
    }, 1000);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const menuItems = [
    { icon: MdOutlinePerson, label: "Profile", path: "/user/profile" },
    { icon: MdLibraryBooks, label: "My Courses", path: "/my-courses" },
    { icon: BsPeopleFill, label: "Teachers", path: "/teachers" },
    { icon: MdOutlineShoppingCart, label: "My Orders", path: "/my-orders" },
    { icon: MdOutlineFavoriteBorder, label: "Wishlist", path: "/wishlist" },
    { icon: BsFillAwardFill, label: "Certificates", path: "/certificates" },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        handleLogout={handleLogoutClick}
        menuItems={menuItems}
      />
      <Toaster position="top-left" richColors />
      <Header
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleLogoutClick={handleLogoutClick}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Carousel */}
        <div className="relative mb-12">
          <div className="overflow-hidden rounded-lg">
            <div className="relative">
              <img
                src={carouselSlides[currentSlide].image}
                alt={carouselSlides[currentSlide].title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60">
                <h3 className="text-white text-xl font-semibold">
                  {carouselSlides[currentSlide].title}
                </h3>
                <p className="text-white/80">
                  {carouselSlides[currentSlide].instructor}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              setCurrentSlide((prev) =>
                prev === 0 ? carouselSlides.length - 1 : prev - 1
              )
            }
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() =>
              setCurrentSlide((prev) =>
                prev === carouselSlides.length - 1 ? 0 : prev + 1
              )
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 right-4 flex gap-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full ${
                  currentSlide === index ? "bg-green-500" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Choose favorite course from top category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.title);
              return (
                <div
                  key={category._id || category.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow flex flex-col items-center"
                >
                  <IconComponent className="w-8 h-8 text-green-500 mb-2" />
                  <h3 className="font-medium text-center">
                    {category.title || "Unnamed Category"}
                  </h3>
                </div>
              );
            })}
          </div>
        </section>

        {/* All Courses */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">All Courses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course) => (
              <div 
              key={course._id}
              onClick={() => navigate(`/user/courseview/${course._id}`)}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
                <img
                  src={course.course_thumbnail}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium mb-2">{course.title}</h3>
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
                    <StarRating rating={course.rating || 0} />
                    <span className="text-sm text-gray-600">
                      ({course.reviews?.length || 0} reviews)
                    </span>
                  </div>
                  <PriceDisplay
                    originalPrice={course.price}
                    offerPercentage={course.offer_percentage || 0}
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {course.lessons?.length || 0} lessons •{" "}
                    {course.duration || 0} weeks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default CoursePage;
