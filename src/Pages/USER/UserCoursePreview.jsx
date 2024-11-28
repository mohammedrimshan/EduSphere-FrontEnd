import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  setCourses,
  setLoading,
  setError,
} from "../../Redux/Slices/courseSlice";
import { logoutUser } from "../../Redux/Slices/userSlice";
import { ShareButtons } from "../USER/Common/ShareButtons";
import Sidebar from "@/ui/sideBar";
import LogoutModal from "../../ui/LogOutModal";
import { toast, Toaster } from "sonner";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
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
} from "react-icons/md";
import { 
  addToCart, 
  removeFromCart, 
  fetchCart 
} from "../../Redux/Slices/cartSlice";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

  // Update isInCart whenever cartItems changes
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
      const response = await axios.get(
        `${API_BASE_URL}/user/courses/${courseId}`
      );
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
          toast.success("Course removed from cart", {
            style: { background: '#059669', color: 'white' }
          });
        } else {
          throw new Error(removeResult.message || "Failed to remove course from cart");
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
          toast.success("Course added to cart successfully", {
            style: { background: '#059669', color: 'white' }
          });
          // Update local cart state immediately
          setIsInCart(true);
        } else {
          throw new Error(addResult.message || "Failed to add course to cart");
        }
      }
      
      // Refresh cart data
      await dispatch(fetchCart(user.id));
    } catch (error) {
      console.error('Cart Action Error:', error);
      toast.success( ` ${isInCart ? 'remove course from' : 'add course to'} cart`);
    } finally {
      setIsProcessing(false);
    }
  };

  const menuItems = [
    { icon: MdOutlinePerson, label: "Profile", path: "/user/profile" },
    { icon: MdLibraryBooks, label: "My Courses", path: "/my-courses" },
    { icon: BsPeopleFill, label: "Teachers", path: "/teachers" },
    { icon: MdOutlineShoppingCart, label: "My Orders", path: "/my-orders" },
    { icon: MdOutlineFavoriteBorder, label: "Wishlist", path: "/wishlist" },
    { icon: BsFillAwardFill, label: "Certificates", path: "/certificates" },
  ];

  if (!currentCourse) {
    return <div>No course data available</div>;
  }

  const originalPrice = currentCourse.price || 0;
  const discountedPrice = currentCourse.offer_percentage
    ? originalPrice * (1 - currentCourse.offer_percentage / 100)
    : originalPrice;
  const discountPercentage = currentCourse.offer_percentage || 0;

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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Course Info */}
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-4">{currentCourse.title}</h1>
            <p className="text-gray-600 mb-4">{currentCourse.description}</p>
            <div className="flex flex-wrap items-center mb-4">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <span className="text-gray-600 mr-4">(83,165 ratings)</span>
              <span className="text-gray-600 mr-4 flex items-center">
                <FaClock className="mr-1" /> {currentCourse.duration} Total
                Weeks
              </span>
              <span className="text-gray-600 mr-4 flex items-center">
                <FaBook className="mr-1" />{" "}
                {(currentCourse.lessons || []).length} Lectures
              </span>
              <span className="text-gray-600 flex items-center">
                <FaGraduationCap className="mr-1" /> {currentCourse.level}
              </span>
            </div>
            <div className="flex items-center">
              <img
                src={
                  currentCourse.tutor?.profile_image ||
                  "/placeholder.svg?height=40&width=40"
                }
                alt={currentCourse.tutor?.full_name || "Tutor"}
                className="rounded-full mr-2 w-10 h-10"
              />
              <span>
                Created by {currentCourse.tutor?.full_name || "Unknown Tutor"}
              </span>
            </div>

            {/* Course Description */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Course Description</h2>
              <p className="text-gray-600">{currentCourse.description}</p>
            </div>

            {/* Instructor */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Instructor</h2>
              <div className="flex items-start">
                <img
                  src={
                    currentCourse.tutor?.profile_image ||
                    "/placeholder.svg?height=100&width=100"
                  }
                  alt={currentCourse.tutor?.full_name || "Tutor"}
                  className="rounded-full mr-4 w-24 h-24"
                />
                <div>
                  <h3 className="font-semibold mb-1">
                    {currentCourse.tutor?.full_name || "Unknown"}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {currentCourse.tutor?.email || "No email"}
                  </p>
                </div>
              </div>
            </div>

            {/* Syllabus */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Syllabus</h2>
              {(currentCourse.lessons || []).map((lesson, index) => (
                <div key={lesson._id || index} className="border-t py-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{lesson.title}</h3>
                    <button
                      className="text-green-700"
                      onClick={() => toggleExpand(index)}
                      aria-expanded={isExpanded[index]}
                    >
                      {isExpanded[index] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                  </div>
                  <div className="text-gray-600 mt-1">
                    Duration: {lesson.duration} minutes
                  </div>
                  {isExpanded[index] && (
                    <div className="mt-2 pl-4">
                      <p>{lesson.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Course Card */}
          <div className="md:w-1/3">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <img
                src={
                  currentCourse.course_thumbnail ||
                  "/placeholder.svg?height=200&width=400"
                }
                alt="Course thumbnail"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-3xl font-bold text-green-700 mr-4">
                    ₹{discountedPrice.toFixed(2)}
                  </div>
                  {discountPercentage > 0 && (
                    <>
                      <div className="text-lg font-normal line-through text-gray-500 mr-4">
                        ₹{originalPrice.toFixed(2)}
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                        {discountPercentage}% Off
                      </div>
                    </>
                  )}
                </div>
                <button
                  className={`w-full py-2 px-4 mb-5 rounded-lg ${
                    isProcessing
                      ? "bg-gray-500 text-white cursor-not-allowed"
                      : isInCart
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  onClick={handleCartAction}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? "Processing..."
                    : isInCart
                    ? "Remove from Cart"
                    : "Add to Cart"}
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
                  Buy Now
                </button>
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-2">
                    Share this course:
                  </p>
                  <ShareButtons
                    url={`https://example.com/course/${courseId}`}
                    title={currentCourse.title}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default UserCoursePreview;