import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  removeFromCart,
  clearCart,
} from "../../Redux/Slices/cartSlice";
import { useAuth } from "../../Context/AuthContext";
import Header from "./Common/Header";

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
    const { user } = useAuth();
    const {
      items = [],
      totalCartPrice = 0,
      status,
      error,
      removeStatus
    } = useSelector((state) => state.cart);
  console.log("items",items)
    // Enhanced cart data fetching
    const fetchCartData = useCallback(() => {
      if (user?.id) {
        // Remove the 'idle' status check to ensure consistent fetching
        dispatch(fetchCart(user.id));
      }
    }, [dispatch, user]);
  
    // Initial and periodic cart data fetch
    useEffect(() => {
      fetchCartData();

      // Set up periodic refresh
      const intervalId = setInterval(fetchCartData, 30000); // Every 30 seconds

      // Cleanup interval on unmount
      return () => clearInterval(intervalId);
    }, [fetchCartData]);

    // Automatic refetch on user change
    useEffect(() => {
      fetchCartData();
    }, [user?.id, fetchCartData]);

    const orderSummary = useMemo(() => {
      let totalOriginalPrice = 0;
      let totalOfferPrice = 0;

      items.forEach(item => {
        totalOriginalPrice += item.price || 0;
        totalOfferPrice += item.offerPrice || item.price || 0;
      });

      const offerPercentage = totalOriginalPrice > 0 
        ? ((totalOriginalPrice - totalOfferPrice) / totalOriginalPrice * 100).toFixed(2)
        : 0;

      return {
        totalOriginalPrice,
        totalOfferPrice,
        offerPercentage
      };
    }, [items]);

    const handleRemoveItem = async (courseId) => {
      if (user?.id) {
        try {
          await dispatch(removeFromCart({ 
            userId: user.id, 
            courseId 
          })).unwrap();
          
          // Immediate refetch to ensure updated state
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
          
          // Immediate refetch to ensure cart is cleared
          fetchCartData();
        } catch (error) {
          console.error("Failed to clear cart:", error);
        }
      }
    };

    // Render logic remains the same as in the original component
    if (!user) {
      return (
        <div className="text-center py-10">Please log in to view your cart</div>
      );
    }

    if (status === "loading") {
      return <div className="text-center py-10">Loading...</div>;
    }


    return (
        <>
         <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Shopping Cart</h1>
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
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Your cart is empty</p>
                <Link
                  to="/user/courses"
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Browse Courses →
                </Link>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  {items.length} Course{items.length !== 1 ? "s" : ""} in cart
                </p>
                <div className="space-y-6">
                  {items.map((item, index) => {
                    // Create a more robust unique key
                    const uniqueKey = `${item.courseId?._id || 'unknown'}-${index}`;
                    
                    if (!item?.courseId) return null;

                    return (
                      <div
                        key={uniqueKey}
                        className="flex gap-4 p-4 bg-white rounded-lg shadow"
                      >
                        <CartItemImage 
                          src={item.courseId.course_thumbnail || "/placeholder.svg"}
                          alt={item.courseId.title || "Course thumbnail"}
                        />

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">
                            {item.courseId.title || "Untitled Course"}
                          </h3>
                          <p className="text-gray-600">
                            by {item.courseId.tutor?.full_name || "Unknown Tutor"}
                          </p>

                          <div className="flex items-center mt-2">
                            <div className="flex">
                              {[...Array(5)].map((_, starIndex) => (
                                <svg
                                  key={`${uniqueKey}-star-${starIndex}`}
                                  className={`h-5 w-5 ${
                                    starIndex < Math.floor(item.courseId.rating || 0)
                                      ? "text-yellow-400"
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
                            <span className="ml-2 text-sm text-gray-600">
                              ({item.courseId.ratingCount || 0} ratings)
                            </span>
                          </div>

                          <div className="mt-2 text-sm text-gray-600">
                            Total {item.courseId.duration || 0} Weeks,
                            {(item.courseId.lessons || []).length} Lectures,
                            {item.courseId.level || "Beginner"} level
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-xl font-bold">
                              ₹{item.offerPrice || item.price || 0}
                            </div>
                            <div className="space-x-4">
                              <button className="text-blue-600 hover:underline">
                                Buy Now
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.courseId._id)}
                                disabled={removeStatus === "loading"}
                                className={`text-red-600 hover:underline ${
                                  removeStatus === "loading"
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                {removeStatus === "loading" ? "Removing..." : "Remove"}
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
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Order Details</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Price</span>
                  <span>₹{orderSummary.totalOfferPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Original Price</span>
                  <span>₹{orderSummary.totalOriginalPrice}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Offer Percentage</span>
                  <span>{orderSummary.offerPercentage}%</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{orderSummary.totalOfferPrice}</span>
                  </div>
                </div>
              </div>

              <button
                className={`w-full mt-6 py-2 px-4 rounded-md transition-colors ${
                  items.length > 0
                    ? "bg-green-600 hover:bg-blue-700 text-white"
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
      </>
    );
};

export default Cart;