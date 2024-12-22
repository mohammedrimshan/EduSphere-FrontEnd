import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axiosInterceptor from "@/axiosInstance";
import { setCourses, setLoading, setError } from "@/Redux/Slices/courseSlice";
import { logoutUser } from "@/Redux/Slices/userSlice";
import { ShareButtons } from "@/Pages/USER/Common/ShareButtons";
import Sidebar from "@/ui/sideBar";
import LogoutModal from "@//ui/LogOutModal";
import Header from "@/Pages/USER/Common/Header";
import Footer from "@/Pages/USER/Common/Footer";
import CourseReviews from "@/ui/Review";
import {
  FaStar,
  FaGraduationCap,
  FaClock,
  FaBook,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import {
  MdOutlinePerson,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdOutlineFavoriteBorder,
  MdOutlineHome,
  MdOutlineReceiptLong,
  MdAccountBalanceWallet
} from "react-icons/md";
import { 
  BsPeopleFill,
  BsFillAwardFill,
} from "react-icons/bs";
import { addToCart, removeFromCart, fetchCart } from "@/Redux/Slices/cartSlice";
import ReportCourseDialog from "@/Pages/USER/Common/ReportCourse";
import { toast } from "sonner";

const UserCoursePreview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Redux state
  const user = useSelector((state) => state.user.userDatas);
  const currentCourse = useSelector((state) =>
    state.course.courseDatas.find(
      (course) => course._id === courseId && course.listed
    )
  );
  const cartItems = useSelector((state) => state.cart.items);
  const theme = useSelector((state) => state.theme.theme);

  const [isExpanded, setIsExpanded] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  useEffect(() => {
    if (cartItems && courseId) {
      const courseInCart = cartItems.some(
        (item) => item.courseId?._id === courseId || item.courseId === courseId
      );
      setIsInCart(courseInCart);
    }
  }, [cartItems, courseId]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user]);

  const fetchCourseById = useCallback(async () => {
    if (!courseId) {
      console.error("No courseId provided");
      return;
    }
    try {
      dispatch(setLoading(true));
      const response = await axiosInterceptor.get(`/user/courses/${courseId}`);
      console.log(response.data);
      if (response.data.success) {
        dispatch(setCourses([response.data.course]));
      } else {
        dispatch(setCourses([]));
      }
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Failed to fetch course")
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [courseId, dispatch]);

  useEffect(() => {
    fetchCourseById();
  }, [fetchCourseById]);

  const toggleExpand = (index) => {
    setIsExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    toast.success("Logout Successful");
    setTimeout(() => {
      dispatch(logoutUser());
      navigate("/user/login");
    }, 1000);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleCheckout = () => {
    if (!user?.id) {
      toast.error("Please log in to proceed with checkout");
      localStorage.setItem("pendingCartItem", currentCourse._id);
      navigate("/user/login");
      return;
    }

    navigate("/user/checkout", {
      state: {
        directPurchase: true,
        course: {
          courseId: currentCourse,
          price: currentCourse.price,
          offerPrice: currentCourse.offer_percentage
            ? Math.round(
                currentCourse.price * (1 - currentCourse.offer_percentage / 100)
              )
            : currentCourse.price,
        },
      },
    });
  };

  const checkCourseOwnership = useCallback(async () => {
    if (!user?.id || !courseId) return;

    try {
      const response = await axiosInterceptor.get(
        `/user/check-course-ownership/${user.id}/${courseId}`
      );
      console.log(response, "WEEEEE");
      setIsOwned(response.data.owned);
    } catch (error) {
      console.error("Error checking course ownership:", error);
    }
  }, [user?.id, courseId]);

  useEffect(() => {
    checkCourseOwnership();

    const handleFocus = () => {
      checkCourseOwnership();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkCourseOwnership]);

  const handleCartAction = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      toast.error("Please log in to manage your cart");
      localStorage.setItem("pendingCartItem", currentCourse._id);
      navigate("/user/login");
      return;
    }

    setIsProcessing(true);

    try {
      if (isInCart) {
        const removeResult = await dispatch(
          removeFromCart({
            userId: user.id,
            courseId: currentCourse._id,
          })
        ).unwrap();

        if (removeResult.success) {
          toast.success("Item removed from cart successfully");
          setIsInCart(false);
        } else {
          throw new Error(
            removeResult.message || "Failed to remove course from cart"
          );
        }
      } else {
        const addResult = await dispatch(
          addToCart({
            userId: user.id,
            courseId: currentCourse._id,
            price: currentCourse.price,
            offer_percentage: currentCourse.offer_percentage,
          })
        ).unwrap();

        if (addResult.success) {
          toast.success("Course added to cart successfully");
          setIsInCart(true);
        } else {
          throw new Error(addResult.message || "Failed to add course to cart");
        }
      }

      await dispatch(fetchCart(user.id));
    } catch (error) {
      console.error("Cart Action Error:", error);
      toast.error(
        `Failed to ${isInCart ? "remove course from" : "add course to"} cart`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const goToCourse = () => {
    navigate(`/user/fullcourse/${courseId}`);
  };

  const handleReportCourse = () => {
    if (!user?.id) {
      toast.error("Please log in to report a course");
      navigate("/user/login");
      return;
    }
    setIsReportDialogOpen(true);
  };

  const menuItems = [
    { icon: MdOutlinePerson, label: "Profile", path: "/user/profile" },
    { icon: MdLibraryBooks, label: "My Courses", path: "/user/my-courses" },
    { icon: BsPeopleFill, label: "Teachers", path: "/user/mytutors" },
    {
      icon: MdOutlineShoppingCart,
      label: "My Orders",
      path: "/user/payments/status",
    },
    { icon: MdOutlineFavoriteBorder, label: "Wishlist", path: "/wishlist" },
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

  if (!currentCourse) {
    return <div>No course data available</div>;
  }

  const originalPrice = currentCourse.price || 0;
  const discountedPrice = currentCourse.offer_percentage
    ? Math.round(originalPrice * (1 - currentCourse.offer_percentage / 100))
    : originalPrice;
  const discountPercentage = currentCourse.offer_percentage || 0;
  return (
    <div
      className={`flex flex-col min-h-screen w-full ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white"
      }`}
    >
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

      <main className="flex-1 w-full">
        <div
          className={`w-full ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Course Info */}
              <div className="lg:w-2/3">
                <h1 className="text-3xl font-bold mb-4">
                  {currentCourse.title}
                </h1>
                <p
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  } mb-4`}
                >
                  {currentCourse.description}
                </p>

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    (83,165 ratings)
                  </span>
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    } flex items-center`}
                  >
                    <FaClock className="mr-2" /> {currentCourse.duration} Total
                    Weeks
                  </span>
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    } flex items-center`}
                  >
                    <FaBook className="mr-2" />{" "}
                    {(currentCourse.lessons || []).length} Lectures
                  </span>
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    } flex items-center`}
                  >
                    <FaGraduationCap className="mr-2" /> {currentCourse.level}
                  </span>
                </div>

                {/* Instructor Preview */}
                <div className="flex items-center mb-8 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <img
                    src={
                      currentCourse.tutor?.profile_image ||
                      "/placeholder.svg?height=40&width=40"
                    }
                    alt={currentCourse.tutor?.full_name || "Tutor"}
                    className="rounded-full w-12 h-12 mr-4"
                  />
                  <div>
                    <p className="font-medium">Created by</p>
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {currentCourse.tutor?.full_name || "Unknown Tutor"}
                    </p>
                  </div>
                </div>

                {/* Course Description */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    Course Description
                  </h2>
                  <div
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    } space-y-4`}
                  >
                    <p>{currentCourse.description}</p>
                  </div>
                </section>

                {/* Instructor Details */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Instructor</h2>
                  <div
                    className={`p-6 rounded-lg ${
                      theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <img
                        src={
                          currentCourse.tutor?.profile_image ||
                          "/placeholder.svg?height=100&width=100"
                        }
                        alt={currentCourse.tutor?.full_name || "Tutor"}
                        className="rounded-full w-24 h-24 mr-6"
                      />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {currentCourse.tutor?.full_name || "Unknown"}
                        </h3>
                        <p
                          className={`${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {currentCourse.tutor?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Syllabus */}
                <section>
                  <h2 className="text-xl font-semibold mb-4">Syllabus</h2>
                  <div
                    className={`rounded-lg ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    } divide-y ${
                      theme === "dark" ? "divide-gray-700" : "divide-gray-200"
                    }`}
                  >
                    {(currentCourse.lessons || []).map((lesson, index) => (
                      <div key={lesson._id || index} className="p-4">
                        <button
                          onClick={() => toggleExpand(index)}
                          className="w-full flex justify-between items-center"
                        >
                          <h3 className="font-semibold text-left">
                            {lesson.title}
                          </h3>
                          <span className="text-green-600">
                            {isExpanded[index] ? (
                              <FaChevronUp />
                            ) : (
                              <FaChevronDown />
                            )}
                          </span>
                        </button>
                        <div
                          className={`${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          } mt-2`}
                        >
                          Duration: {lesson.duration} minutes
                        </div>
                        {isExpanded[index] && (
                          <div
                            className={`mt-4 pl-4 ${
                              theme === "dark"
                                ? "text-gray-300"
                                : "text-gray-600"
                            }`}
                          >
                            <p>{lesson.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Course Card - Fixed Position on Desktop */}
              <div className="lg:w-1/3">
                <div
                  className={`sticky top-4 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  } rounded-xl shadow-lg overflow-hidden`}
                >
                  <img
                    src={
                      currentCourse.course_thumbnail ||
                      "/placeholder.svg?height=200&width=400"
                    }
                    alt="Course thumbnail"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center flex-wrap gap-2 mb-6">
                      <div className="text-3xl font-bold text-green-600">
                        ₹{discountedPrice.toFixed(2)}
                      </div>
                      {discountPercentage > 0 && (
                        <>
                          <div className="text-lg line-through text-gray-500">
                            ₹{originalPrice.toFixed(2)}
                          </div>
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {discountPercentage}% Off
                          </div>
                        </>
                      )}
                    </div>

                    {isOwned ? (
                      <>
                        <div
                          className={`w-full py-3 px-4 mb-3 text-center rounded-lg font-medium ${
                            theme === "dark"
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          Already Enrolled
                        </div>
                        <button
                          onClick={goToCourse}
                          className="w-full py-3 px-4 mb-4 text-center bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Go to Your Course
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className={`w-full py-3 px-4 mb-4 rounded-lg font-medium transition-colors ${
                            isProcessing
                              ? "bg-gray-500 text-white cursor-not-allowed"
                              : isInCart
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                          onClick={handleCartAction}
                          disabled={isProcessing || isOwned}
                        >
                          {isProcessing
                            ? "Processing..."
                            : isInCart
                            ? "Remove from Cart"
                            : "Add to Cart"}
                        </button>
                        <button
                          onClick={handleCheckout}
                          className={`w-full py-3 px-4 mb-4 rounded-lg font-medium border ${
                            theme === "dark"
                              ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          } transition-colors`}
                        >
                          Buy Now
                        </button>
                      </>
                    )}

                    <div className="mt-6">
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        } mb-3`}
                      >
                        Share this course:
                      </p>
                      <ShareButtons
                        url={`https://example.com/course/${courseId}`}
                        title={currentCourse.title}
                      />
                    </div>

                    {isOwned && (
                      <button
                        onClick={handleReportCourse}
                        className={`w-full mt-4 py-3 px-4 rounded-lg font-medium border ${
                          theme === "dark"
                            ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        } transition-colors`}
                      >
                        Report Course
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`w-full ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CourseReviews courseId={courseId} />
          </div>
        </div>
      </main>

      <Footer />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />

      <ReportCourseDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        courseId={courseId}
        isOwned={isOwned}
      />
    </div>
  );
};

export default UserCoursePreview;
