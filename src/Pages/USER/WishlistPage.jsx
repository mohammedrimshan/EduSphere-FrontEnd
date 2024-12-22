import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FaStar } from 'react-icons/fa';
import Header from '@/Pages/USER/Common/Header';
import Footer from './Common/Footer';
import Sidebar from '@/ui/sideBar';
import LogoutModal from '@/ui/LogOutModal';
import { logoutUser } from '@/Redux/Slices/userSlice';
import { addToCart, fetchCart } from '@/Redux/Slices/cartSlice';
import axiosInterceptor from '@/axiosInstance';
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
const Wishlist = () => {
  const [wishlistCourses, setWishlistCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.user.userDatas);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchWishlist = async (pageNum = 1) => {
    if (!user?.id) {
      setError("User not logged in");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInterceptor.get('/user/fullwishlist', {
        params: { page: pageNum, limit: 9, search: searchTerm, sort: sortBy }
      });
      console.log(response)
      setWishlistCourses(response.data.wishlist);
      setTotalPages(response.data.totalPages);
      setPage(response.data.page);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to fetch wishlist. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user?.id, searchTerm, sortBy]);

  const handleRemoveFromWishlist = async (courseId) => {
    try {
      await axiosInterceptor.delete(`/user/removewishlist/${courseId}`);
      setWishlistCourses(prevCourses => 
        prevCourses.filter(course => course.id !== courseId)
      );
      toast.success("Course removed from wishlist");
    } catch (err) {
      console.error("Error removing course from wishlist:", err);
      toast.error("Failed to remove course from wishlist");
    }
  };

  const handleAddToCart = async (course) => {
    if (!user?.id) {
      toast.error("Please log in to manage your cart");
      localStorage.setItem("pendingCartItem", course.id);
      navigate("/user/login");
      return;
    }
  
    try {
      const result = await dispatch(
        addToCart({
          userId: user.id,
          courseId: course.id,
          price: course.originalPrice || course.price,
          offer_percentage: course.offerPercentage || 0,
        })
      ).unwrap();
  
      if (result.success) {
        toast.success("Course added to cart successfully");
        // Optionally remove the course from wishlist after adding to cart
        await handleRemoveFromWishlist(course.id);
      } else {
        throw new Error(result.message || "Failed to add course to cart");
      }
    } catch (error) {
      console.error("Add to Cart Error:", error);
      toast.error(error.message || "Failed to add course to cart");
    }
  };

  const handleCourseClick = (courseId) => {
    navigate(`/user/course/${courseId}/details`);
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

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setIsLoading(true);
      fetchWishlist(newPage);
    }
  };

  const renderCourseCard = (course) => (
    <div key={course.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-shrink-0 w-full sm:w-24 h-40 sm:h-24 mb-4 sm:mb-0">
            <img
              src={course.thumbnail || "/placeholder.svg"}
              alt={course.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-grow sm:ml-6">
            <div className="flex flex-col sm:flex-row justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">By {course.tutor}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end mt-2 sm:mt-0">
                {course.offerPercentage > 0 ? (
                  <div className="flex items-center">
                    <span className="line-through text-gray-500 mr-2">
                      ₹{Number(course.originalPrice || course.price).toFixed(2)}
                    </span>
                    <span className="text-green-600 font-semibold">
                      {course.offerPercentage}% OFF
                    </span>
                  </div>
                ) : null}
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{Number(course.offerPrice || course.price).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center mt-2 space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`w-4 h-4 ${
                      index < Math.floor(course.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  ({course.totalReviews} rating)
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
              Total {course.duration}  Weeks, {course.lesson} Lectures, {course.level}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => handleAddToCart(course)}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto"
              >
                Add To Cart
              </button>
              <button
                onClick={() => handleRemoveFromWishlist(course.id)}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors w-full sm:w-auto"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isOpen={isOpen} setIsOpen={setIsOpen} handleLogoutClick={handleLogoutClick} />
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        handleLogout={handleLogoutClick}
        menuItems ={ [
            { icon: MdOutlineHome, label: "Home", path: "/user/home" },
            { icon: MdOutlinePerson, label: "Profile", path: "/user/profile" },
            { icon: MdLibraryBooks, label: "My Courses", path: "/user/my-courses" },
            { icon: BsPeopleFill, label: "Teachers", path: "/user/mytutors" },
            { icon: MdOutlineShoppingCart, label: "My Orders", path: "/user/payments/status" },
            { icon: MdOutlineFavoriteBorder, label: "Wishlist", path: "/user/wishlist" },
            { icon: BsFillAwardFill, label: "Certificates", path: "/user/certificates" },
            { icon: MdOutlineReceiptLong, label: "Refund History", path: "/user/refund-history" },
            { icon: MdAccountBalanceWallet , label: "Wallet", path: "/user/wallet" }  
        ]}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wishlist</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search wishlist"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-auto"
            />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-auto"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">Loading...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : wishlistCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xl mb-4 text-gray-600">Your wishlist is empty.</p>
              <button
                onClick={() => navigate('/user/fullcourse')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            wishlistCourses.map(course => renderCourseCard(course))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-4 py-2 rounded ${
                page === 1 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-200 rounded">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded ${
                page === totalPages 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </main>
      
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default Wishlist;

