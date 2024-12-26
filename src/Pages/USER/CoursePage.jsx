import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  MdStar,
  MdStarHalf,
  MdStarOutline,
  MdFavoriteBorder,
  MdFavorite,
} from "react-icons/md";
import { FaBook, FaClock } from "react-icons/fa";
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
  MdOutlineHome,
  MdAccountBalanceWallet,
  MdOutlineReceiptLong,
} from "react-icons/md";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";
import { toast, Toaster } from "sonner";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import Sidebar from "@/ui/sideBar";
import LogoutModal from "@/ui/LogOutModal";
import { setCourses } from "@/Redux/Slices/courseSlice";
import { setCategories } from "@/Redux/Slices/categorySlice";
import { logoutUser } from "@/Redux/Slices/userSlice";
import dummy1 from "@/assets/dummy1.avif";
import dummy2 from "@/assets/dummy2.jpg";
import dummy3 from "@/assets/dummy3.jpg";
import axiosInterceptor from "@/axiosInstance";

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
  const offerPrice = Math.round(
    originalPrice - originalPrice * (offerPercentage / 100)
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-green-500 font-semibold">₹{offerPrice}</span>
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
  const theme = useSelector((state) => state.theme.theme);
  const courses = useSelector((state) => state.course.courseDatas) || [];
  const categories = useSelector((state) => state.category.categoryDatas) || [];

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showAllHighOfferCourses, setShowAllHighOfferCourses] = useState(false);
  const [showAllEnrolledCourses, setShowAllEnrolledCourses] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
    fetchEnrolledCourses();
  }, [user?.id]);

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
      } else {
        throw new Error("Invalid response format");
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
      // Add a query parameter to request all categories
      const response = await axiosInterceptor.get(
        `/user/categories?limit=1000`,
        { withCredentials: true }
      );
      console.log(response);
      if (!response.data) {
        throw new Error("No category data received");
      }

      const categories = Array.isArray(response.data.categories)
        ? response.data.categories.filter((category) => category.isVisible)
        : (response.data || []).filter((category) => category.isVisible);

      dispatch(setCategories(categories));
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
      dispatch(setCategories([])); // Ensure categories is always an array
    }
  };

  const fetchEnrolledCourses = async () => {
    if (!user?.id) return;

    try {
      const response = await axiosInterceptor.get(
        `/user/${user.id}/purchased-courses`
      );
      const coursesData = response.data?.courses || response.data || [];

      const validatedCourses = Array.isArray(coursesData)
        ? coursesData.map((course) => ({
            ...course,
            lessons: course?.lessons || [],
            duration: course?.duration || 0,
            description: course?.description || "",
            title: course?.title || "Untitled Course",
            _id: course?._id || String(Math.random()),
            course_thumbnail: course?.course_thumbnail || null,
          }))
        : [];

      setEnrolledCourses(validatedCourses);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      toast.error("Failed to fetch enrolled courses");
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
      video:
        "https://res.cloudinary.com/dbair2ulh/video/upload/v1734721777/jlwgjdr3l7vyv8rm8d2h.mp4",
      title: "Welcome back, ready for your next lesson?",
    },
    {
      video:
        "https://res.cloudinary.com/dbair2ulh/video/upload/v1734721749/c0dt575vfziizc4x3j13.mp4",
      title: "Web Development Basics",
    },
    {
      video:
        "https://res.cloudinary.com/dbair2ulh/video/upload/v1734719719/uqdqd6vaxhyoheicncv4.mp4",
      title: "Learn Software Architecture",
    },
  ];

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

  const toggleFavorite = async (courseId) => {
    try {
      const isFavorite = favorites[courseId];

      if (isFavorite) {
        // Use DELETE route for removing from wishlist
        await axiosInterceptor.delete(`/user/removewishlist/${courseId}`);
      } else {
        // Use POST route for adding to wishlist
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

  const renderCourseCard = (course, isEnrolled = false) => (
    <div
      onClick={() =>
        isEnrolled
          ? navigate(`/user/course/${course._id}/lessons`)
          : navigate(`/user/courseview/${course._id}`)
      }
      className={`h-full border scrollbar-hide rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative ${
        course.isBanned ? "opacity-50" : ""
      }`}
    >
      <img
        src={course.course_thumbnail || "/placeholder.svg?height=200&width=400"}
        alt={course.title}
        className="w-full h-40 object-cover"
      />
      {!isEnrolled && (
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
      )}
      <div className="p-4">
        <h3 className="font-medium mb-2">{course.title}</h3>
        {course.isBanned && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-2"
            role="alert"
          >
            <p className="font-bold">Course Unavailable</p>
            <p>This course is currently unavailable.</p>
          </div>
        )}
        {isEnrolled ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {course.description.substring(0, 100)}...
            </p>
            <div className="flex justify-between text-sm text-gray-500 mb-4">
              <span className="flex items-center">
                <FaClock className="mr-1" /> {course.duration} weeks
              </span>
              <span className="flex items-center">
                <FaBook className="mr-1" /> {course.lessons.length} lessons
              </span>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );

  const renderScrollableSection = (
    title,
    courses,
    showAll,
    setShowAll,
    limit = 4,
    isEnrolled = false
  ) => (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-green-500 hover:underline"
        >
          {showAll ? "Show Less" : "See All"}
        </button>
      </div>
      <div
        className={`
          ${
            showAll
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              : "flex overflow-x-auto gap-4 pb-4 no-scrollbar"
          }
        `}
        style={
          !showAll
            ? {
                "-ms-overflow-style": "none" /* IE and Edge */,
                scrollbarWidth: "none" /* Firefox */,
              }
            : {}
        }
      >
        {(showAll ? courses : courses).map((course) => (
          <div
            key={course._id}
            className={!showAll ? "flex-none w-[300px]" : ""}
          >
            {renderCourseCard(course, isEnrolled)}
          </div>
        ))}
      </div>
    </section>
  );

  const styles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const highOfferCourses = courses
    .filter((course) => course.offer_percentage > 20)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
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
                <video
                  src={carouselSlides[currentSlide].video}
                  className="w-full h-[400px] object-cover"
                  autoPlay
                  muted
                  loop
                  disablePictureInPicture
                >
                  <source
                    src={carouselSlides[currentSlide].video}
                    type="video/mp4"
                  />
                </video>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60">
                  <h3 className="text-white text-xl font-semibold">
                    {carouselSlides[currentSlide].title}
                  </h3>
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
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow flex flex-col items-center cursor-pointer"
                    onClick={() =>
                      navigate(`/user/category/${category._id}/courses`)
                    }
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

          {/* Enrolled Courses */}
          {enrolledCourses.length > 0 &&
            renderScrollableSection(
              "Your Enrolled Courses",
              enrolledCourses,
              showAllEnrolledCourses,
              setShowAllEnrolledCourses,
              4,
              true
            )}

          {/* All Courses */}
          {renderScrollableSection(
            "All Courses",
            courses,
            showAllCourses,
            setShowAllCourses
          )}

          {/* Recent High Offer Courses */}
          {renderScrollableSection(
            "Recent High Offer Courses",
            highOfferCourses,
            showAllHighOfferCourses,
            setShowAllHighOfferCourses
          )}
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

export default CoursePage;
