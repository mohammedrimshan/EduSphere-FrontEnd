import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Search, X, ShoppingCart, Bell, MoreVertical } from "lucide-react";
import Button from "@/ui/Button";
import ThemeToggle from "@/ui/themeToggle";
import { toggleTheme } from "@/Redux/Slices/themeSlice";
import { fetchCart } from "@/Redux/Slices/cartSlice";
import avatar from "@/assets/avt.webp";
import { useAuth } from "@/Context/AuthContext";
import axiosInterceptor from "@/axiosInstance";

const SearchResults = ({ results, onClose }) => {
  const navigate = useNavigate();

  if (results.length === 0) return null;

  const handleCourseClick = (courseId) => {
    onClose();
    navigate(`/user/courseview/${courseId}`);
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 max-h-96 overflow-y-auto z-50 scrollbar-hide">
      {results.map((course) => (
        <div
          key={course._id}
          onClick={() => handleCourseClick(course._id)}
          className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <img
            src={course.course_thumbnail}
            alt={course.title}
            className="h-16 w-24 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {course.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {course.tutor.full_name} • {course.category.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {course.average_rating.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ₹{course.price}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Header({ isOpen, setIsOpen, handleLogoutClick }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.user.userDatas);
  const { items = [], status } = useSelector((state) => state.cart);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // Example notification count
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const searchTimeoutRef = useRef(null);
  const eventSourceRef = useRef(null);
  const cartItemCount = items.length;

  const handleSearch = async (query) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Add debounce to avoid too many requests
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await axiosInterceptor.get(
          `/user/search?query=${query}`
        );
        console.log(response, "search");
        setSearchResults(response.data.courses);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  useEffect(() => {
    if (user?.id && status === "idle") {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user, status]);

  useEffect(() => {
    console.log("Cart updated:", items);
  }, [items]);

  const closeMobileNav = () => {
    setShowMobileNav(false);
  };

  const setupNotifications = useCallback(() => {
    if (!user) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `http://localhost:5000/user/notifications/stream`,
      {
        withCredentials: true,
      }
    );

    eventSource.onopen = () => {
      console.log("SSE connection opened");
    };

    // Listen specifically for notification events
    eventSource.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NOTIFICATION_UPDATE") {
          setNotificationCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Error parsing notification data:", error);
      }
    });

    // Listen for general messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NOTIFICATION_UPDATE") {
          setNotificationCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Error parsing message data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      eventSource.close();
      // Attempt to reconnect after 5 seconds
      setTimeout(() => setupNotifications(), 5000);
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
    };
  }, [user]);

  // Initial setup of notifications and cart count
  useEffect(() => {
    if (user) {
      return setupNotifications();
    }
  }, [user, setupNotifications]);

  return (
    <header className="border-b dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 p-4 md:hidden">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {isSearching ? (
                  <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </span>
              {searchResults.length > 0 && (
                <SearchResults
                  results={searchResults}
                  onClose={() => {
                    clearSearch();
                    setShowMobileSearch(false);
                  }}
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowMobileSearch(false);
                clearSearch();
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      {/* Main Header Content */}
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        {/* Left Section: Menu and Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:inline-block md:inline-block"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          <a
            className="flex items-center gap-2 font-bold text-xl md:text-2xl text-green-500"
            href="#"
          >
            EduSphere
          </a>
        </div>

        {/* Desktop Search Box */}
        <div className="hidden md:flex relative flex-1 max-w-lg mx-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {isSearching ? (
              <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </span>
          {searchResults.length > 0 && (
            <SearchResults results={searchResults} onClose={clearSearch} />
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-6 items-center">
          <Link
            to="/user/home"
            className="text-sm font-medium hover:text-green-500 dark:text-white"
          >
            Home
          </Link>
          <Link
            to="/user/aboutus"
            className="text-sm font-medium hover:text-green-500 dark:text-white"
          >
            About Us
          </Link>
          <Link
            to="/user/contact"
            className="text-sm font-medium hover:text-green-500 dark:text-white"
          >
            Contact
          </Link>
          <Link
            to="/user/fullcourse"
            className="text-sm font-medium hover:text-green-500 dark:text-white"
          >
            Courses
          </Link>
          <Link
            to="/user/alltutor"
            className="text-sm font-medium pr-4 hover:text-green-500 dark:text-white"
          >
            Tutors
          </Link>
        </nav>

        {/* Right Section: Search Toggle, Notifications, Cart, Profile, and Theme */}
        <div className="flex items-center gap-4">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMobileSearch(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Link to="/user/notifications" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {notificationCount}
                </span>
              )}
            </Button>
          </Link>
          {/* Cart Button with Counter */}
          <Link to="/user/cart" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>

          <img
            src={user?.profileImage || avatar}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
          />
          <ThemeToggle theme={theme} onToggle={() => dispatch(toggleTheme())} />
          <div className="relative lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="ml-2"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>

            {/* Mobile Navigation Dropdown */}
            {showMobileNav && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                <Link
                  to="/user/home"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={closeMobileNav}
                >
                  Home
                </Link>
                <Link
                  to="/user/aboutus"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={closeMobileNav}
                >
                  About Us
                </Link>
                <Link
                  to="/user/contact"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={closeMobileNav}
                >
                  Contact
                </Link>
                <Link
                  to="/user/fullcourse"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={closeMobileNav}
                >
                  Courses
                </Link>
                <Link
                  to="/user/alltutor"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={closeMobileNav}
                >
                  Tutors
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
