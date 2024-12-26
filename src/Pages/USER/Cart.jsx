import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeFromCart,
  clearCart,
} from "@/Redux/Slices/cartSlice";
import { useAuth } from "@/Context/AuthContext";
import Header from "./Common/Header";
import Sidebar from "@/ui/sideBar";
import { toggleTheme } from "@/Redux/Slices/themeSlice";
import { logoutUser } from "@/Redux/Slices/userSlice";
import LogoutModal from "@/ui/LogOutModal";
import { toast } from "sonner";
import {
  MdOutlinePerson,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdOutlineFavoriteBorder,
  MdOutlineHome,
  MdOutlineReceiptLong,
  MdAccountBalanceWallet,
} from "react-icons/md";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";
const CartItemImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setImageError(false);
  }, [src]);

  const handleImageError = () => {
    if (!imageError) {
      setImageSrc("/placeholder.svg");
      setImageError(true);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="w-48 h-32 object-cover rounded"
      onError={handleImageError}
    />
  );
};

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useSelector((state) => state.theme.theme);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const {
    items = [],
    status,
    error,
    removeStatus,
  } = useSelector((state) => state.cart);

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

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
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

  const fetchCartData = useCallback(() => {
    if (user?.id) {
      dispatch(fetchCart(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  const handleSingleItemCheckout = (item) => {
    const formattedItem = {
      courseId: {
        _id: item.courseId._id,
        title: item.courseId.title,
        tutor: item.courseId.tutor,
        price: item.price,
        offerPrice: item.offerPrice,
      },
      price: item.price,
      offerPrice: item.offerPrice,
    };

    navigate("/user/checkout", {
      state: {
        items: [formattedItem],
        isSingleItemCheckout: true,
        totalAmount: Math.round(item.offerPrice || item.price || 0),
        directPurchase: false,
        singleItem: true,
      },
    });
  };

  const handleFullCartCheckout = () => {
    const formattedItems = items.map((item) => ({
      courseId: {
        _id: item.courseId._id,
        title: item.courseId.title,
        tutor: item.courseId.tutor,
      },
      price: item.price,
      offerPrice: item.offerPrice,
    }));

    navigate("/user/checkout", {
      state: {
        items: formattedItems,
        isSingleItemCheckout: false,
        totalAmount: orderSummary.totalOfferPrice,
        directPurchase: false,
      },
    });
  };

  const orderSummary = useMemo(() => {
    let totalOriginalPrice = 0;
    let totalOfferPrice = 0;

    items.forEach((item) => {
      totalOriginalPrice += Math.round(item.price || 0);
      totalOfferPrice += Math.round(item.offerPrice || item.price || 0);
    });

    const offerPercentage =
      totalOriginalPrice > 0
        ? Math.round(
            ((totalOriginalPrice - totalOfferPrice) / totalOriginalPrice) * 100
          )
        : 0;

    return {
      totalOriginalPrice,
      totalOfferPrice,
      offerPercentage,
    };
  }, [items]);

  const handleRemoveItem = async (courseId) => {
    if (user?.id) {
      try {
        await dispatch(
          removeFromCart({
            userId: user.id,
            courseId,
          })
        ).unwrap();

        fetchCartData();
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    }
  };

  const handleClearCart = async () => {
    if (user?.id) {
      try {
        await dispatch(clearCart(user.id)).unwrap();
        await dispatch(fetchCart(user.id));
        fetchCartData();
      } catch (error) {
        console.error("Failed to clear cart:", error);
        toast.error("An error occurred while clearing the cart.");
      }
    } else {
      toast.error("User is not authenticated.");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">Please log in to view your cart</div>
    );
  }

  if (status === "loading") {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div
      className={`flex h-screen ${
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogoutClick={handleLogoutClick}
          theme={theme}
          onToggleTheme={handleThemeToggle}
        />

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items Section */}
              <div className="lg:w-2/3">
                <div className="flex justify-between items-center mb-6">
                  <h1
                    className={`text-2xl font-bold ${
                      theme === "dark" ? "text-white" : "text-black"
                    }`}
                  >
                    Shopping Cart
                  </h1>
                  {items.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-800"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                {error ? (
                  <div className="text-center py-10 text-red-500">{error}</div>
                ) : !Array.isArray(items) || items.length === 0 ? (
                  <div
                    className={`p-6 rounded-lg shadow ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Your cart is empty
                    </p>
                    <Link
                      to="/user/fullcourse"
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Browse Courses →
                    </Link>
                  </div>
                ) : (
                  <>
                    <p
                      className={`${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      } mb-6`}
                    >
                      {items.length} Course{items.length !== 1 ? "s" : ""} in
                      cart
                    </p>
                    <div className="space-y-6">
                      {items.map((item, index) => {
                        const uniqueKey = `${
                          item.courseId?._id || "unknown"
                        }-${index}`;
                        if (!item?.courseId) return null;

                        return (
                          <div
                            key={uniqueKey}
                            className={`flex gap-4 p-4 rounded-lg shadow ${
                              theme === "dark" ? "bg-gray-800" : "bg-white"
                            }`}
                          >
                            <CartItemImage
                              src={
                                item.courseId.course_thumbnail ||
                                "/placeholder.svg"
                              }
                              alt={item.courseId.title || "Course thumbnail"}
                            />

                            <div className="flex-1">
                              <h3
                                className={`text-lg font-semibold ${
                                  theme === "dark" ? "text-white" : "text-black"
                                }`}
                              >
                                {item.courseId.title || "Untitled Course"}
                              </h3>
                              <p
                                className={`${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-600"
                                }`}
                              >
                                by{" "}
                                {item.courseId.tutor?.full_name ||
                                  "Unknown Tutor"}
                              </p>

                              <div className="flex items-center mt-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, starIndex) => (
                                    <svg
                                      key={`${uniqueKey}-star-${starIndex}`}
                                      className={`h-5 w-5 ${
                                        starIndex <
                                        Math.floor(item.courseId.rating || 0)
                                          ? "text-yellow-400"
                                          : theme === "dark"
                                          ? "text-gray-600"
                                          : "text-gray-300"
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span
                                  className={`ml-2 text-sm ${
                                    theme === "dark"
                                      ? "text-gray-300"
                                      : "text-gray-600"
                                  }`}
                                >
                                  ({item.courseId.ratingCount || 0} ratings)
                                </span>
                              </div>

                              <div
                                className={`mt-2 text-sm ${
                                  theme === "dark"
                                    ? "text-gray-300"
                                    : "text-gray-600"
                                }`}
                              >
                                Total {item.courseId.duration || 0} Weeks,
                                {(item.courseId.lessons || []).length} Lectures,
                                {item.courseId.level || "Beginner"} level
                              </div>

                              <div className="mt-4 flex items-center justify-between">
                                <div
                                  className={`text-xl font-bold ${
                                    theme === "dark"
                                      ? "text-white"
                                      : "text-black"
                                  }`}
                                >
                                  ₹
                                  {Math.round(
                                    item.offerPrice || item.price || 0
                                  )}
                                </div>
                                <div className="space-x-4">
                                  <button
                                    onClick={() =>
                                      handleSingleItemCheckout(item)
                                    }
                                    className="text-blue-600 hover:underline"
                                  >
                                    Buy Now
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRemoveItem(item.courseId._id)
                                    }
                                    disabled={removeStatus === "loading"}
                                    className={`text-red-600 hover:underline ${
                                      removeStatus === "loading"
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    {removeStatus === "loading"
                                      ? "Removing..."
                                      : "Remove"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Order Summary Section */}
              <div className="lg:w-1/3">
                <div
                  className={`p-6 rounded-lg shadow ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <h2
                    className={`text-xl font-bold mb-4 ${
                      theme === "dark" ? "text-white" : "text-black"
                    }`}
                  >
                    Order Details
                  </h2>

                  <div className="space-y-3">
                    <div
                      className={`flex justify-between ${
                        theme === "dark" ? "text-gray-300" : ""
                      }`}
                    >
                      <span>Original Price</span>
                      <span>₹{orderSummary.totalOriginalPrice}</span>
                    </div>

                    <div
                      className={`flex justify-between ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      <span>Offer Percentage</span>
                      <span>{orderSummary.offerPercentage}%</span>
                    </div>
                    <div
                      className={`flex justify-between ${
                        theme === "dark" ? "text-gray-300" : ""
                      }`}
                    >
                      <span>Total Price</span>
                      <span>₹{orderSummary.totalOfferPrice}</span>
                    </div>

                    <div
                      className={`border-t pt-3 mt-3 ${
                        theme === "dark" ? "border-gray-700" : ""
                      }`}
                    >
                      <div
                        className={`flex justify-between font-bold ${
                          theme === "dark" ? "text-white" : ""
                        }`}
                      >
                        <span>Total</span>
                        <span>₹{orderSummary.totalOfferPrice}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleFullCartCheckout}
                    className={`w-full mt-6 py-2 px-4 rounded-md transition-colors ${
                      items.length > 0
                        ? `${
                            theme === "dark"
                              ? "bg-green-700 hover:bg-green-800 text-white"
                              : "bg-green-600 hover:bg-blue-700 text-white"
                          }`
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                    disabled={items.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default Cart;
