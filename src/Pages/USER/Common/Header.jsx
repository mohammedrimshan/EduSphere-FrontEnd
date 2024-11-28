import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Search, X, ShoppingCart } from "lucide-react";
import Button from "../../../ui/Button";
import ThemeToggle from "../../../ui/themeToggle";
import { toggleTheme } from "../../../Redux/Slices/themeSlice";
import { fetchCart } from "../../../Redux/Slices/cartSlice";
import avatar from "../../../assets/avt.webp";

export default function Header({ isOpen, setIsOpen, handleLogoutClick }) {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.user.userDatas);
  const { items = [], status } = useSelector((state) => state.cart);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const cartItemCount = useMemo(() => items.length, [items]);

  useEffect(() => {
    if (user?.id && status === 'idle') {
      dispatch(fetchCart(user.id)); 
    }
  }, [dispatch, user, status]);

  return (
    <header className="border-b dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 p-4 md:hidden">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <Search className="h-5 w-5" />
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(false)}
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
            placeholder="Search..."
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <Search className="h-5 w-5" />
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-6 items-center">
        <Link
            to="/user/home"
            className="text-sm font-medium hover:text-green-500 dark:text-white"
          >
            Home
          </Link>
          <a
            className="text-sm font-medium hover:text-green-500 dark:text-white"
            href="#"
          >
            About Us
          </a>
          <a
            className="text-sm font-medium hover:text-green-500 dark:text-white"
            href="#"
          >
            Contact
          </a>
          <Link
            to="/user/fullcourse"
            className="text-sm font-medium hover:text-green-500 dark:text-white"
          >
            Courses
          </Link>
          <a
            className="text-sm font-medium pr-4 hover:text-green-500 dark:text-white"
            href="#"
          >
            Tutors
          </a>
        </nav>

        {/* Right Section: Search Toggle, Cart, Profile, and Theme */}
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

          {/* Cart Button with Counter */}
          <Link to="/user/cart" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-gray-100  dark:hover:bg-gray-800"
            >
              <ShoppingCart className="h-5  w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500  text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
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
        </div>
      </div>
    </header>
  );
}