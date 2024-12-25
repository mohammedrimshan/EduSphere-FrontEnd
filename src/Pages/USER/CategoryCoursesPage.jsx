import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MdStar,
  MdStarHalf,
  MdStarOutline,
  MdFilterList,
  MdClose,
  MdFavoriteBorder,
  MdFavorite,
  MdOutlineHome,
  MdAccountBalanceWallet,
} from "react-icons/md";
import axiosInterceptor from "@/axiosInstance";
import { toast } from "sonner";
import Sidebar from "@/ui/sideBar";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
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

// Star Rating Component
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

// Price Display Component
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

const CategoryCoursesPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.theme);

  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState({});

  // Filtering and Pagination States
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    rating: "",
    sort: "createdAt",
    order: "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategoryCourses();
  }, [categoryId, filters, pagination.currentPage]);

  const fetchCategoryCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInterceptor.get(
        `/user/category/${categoryId}/courses`,
        {
          params: {
            page: pagination.currentPage,
            limit: 9,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            rating: filters.rating,
            sort: filters.sort,
            order: filters.order,
          },
        }
      );
      console.log(response);

      if (!response.data) {
        throw new Error("No data received from server");
      }

      const { courses, totalCourses, totalPages, currentPage } = response.data;

      // Filter out banned courses
      const filteredCourses = courses.filter((course) => !course.isBanned);

      // Set courses with populated data
      setCourses(filteredCourses);

      // Set category from the first course's populated category field
      if (filteredCourses.length > 0 && filteredCourses[0].category) {
        setCategory(filteredCourses[0].category);
      }

      // Update pagination
      setPagination({
        currentPage: currentPage,
        totalPages: Math.ceil(filteredCourses.length / 9) || 1,
      });

      if (filteredCourses.length === 0) {
        toast.info("No available courses found in this category.");
      }
    } catch (error) {
      console.error("Error fetching category courses:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch courses";
      toast.error(errorMessage);

      // Reset states on error
      setCourses([]);
      setCategory(null);
      setPagination({
        currentPage: 1,
        totalPages: 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const renderFilterSection = () => (
    <div
      className={`fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 shadow-lg z-50 p-6 overflow-y-auto transform ${
        showFilters ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Filter Courses</h2>
        <button onClick={() => setShowFilters(false)}>
          <MdClose className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Minimum Rating</label>
          <select
            name="rating"
            value={filters.rating}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
          >
            <option value="">All Ratings</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Sort By</label>
          <select
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded"
          >
            <option value="createdAt">Most Recent</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
          </select>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="radio"
              name="order"
              value="desc"
              checked={filters.order === "desc"}
              onChange={handleFilterChange}
              id="descOrder"
            />
            <label htmlFor="descOrder">Descending</label>
            <input
              type="radio"
              name="order"
              value="asc"
              checked={filters.order === "asc"}
              onChange={handleFilterChange}
              id="ascOrder"
            />
            <label htmlFor="ascOrder">Ascending</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourseCard = (course) => (
    <div
      key={course._id}
      onClick={() => navigate(`/user/courseview/${course._id}`)}
      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative"
    >
      <img
        src={course.course_thumbnail || "/placeholder.svg?height=200&width=400"}
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
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() =>
          setPagination((prev) => ({
            ...prev,
            currentPage: prev.currentPage - 1,
          }))
        }
        disabled={pagination.currentPage === 1}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      {[...Array(pagination.totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() =>
            setPagination((prev) => ({ ...prev, currentPage: index + 1 }))
          }
          className={`px-4 py-2 border rounded ${
            pagination.currentPage === index + 1
              ? "bg-green-500 text-white"
              : ""
          }`}
        >
          {index + 1}
        </button>
      ))}
      <button
        onClick={() =>
          setPagination((prev) => ({
            ...prev,
            currentPage: prev.currentPage + 1,
          }))
        }
        disabled={pagination.currentPage === pagination.totalPages}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={`${theme === "dark" ? "dark" : ""} flex flex-col min-h-screen`}
    >
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex-grow">
        <Sidebar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          theme={theme}
          menuItems={menuItems}
        />
        <Header isOpen={isOpen} setIsOpen={setIsOpen} />

        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              {category?.title || "Category"} Courses
            </h1>
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              <MdFilterList />
              Filter
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No courses found in this category.
              </p>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Try adjusting your filters or check back later for new courses.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(renderCourseCard)}
              </div>
              {renderPagination()}
            </>
          )}
        </div>

        {renderFilterSection()}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryCoursesPage;
