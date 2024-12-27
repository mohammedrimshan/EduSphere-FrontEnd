import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ShoppingCart, Tag, CreditCard } from "lucide-react";
import axiosInterceptor from "@/axiosInstance";
import Fireworks from "@/ui/Firework";
// Razorpay script loader
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutItems = location.state?.items || [];
  const isSingleItemCheckout = location.state?.isSingleItemCheckout || false;
  const isSingleItem = location.state?.singleItem || false;
  const totalAmount = Math.round(location.state?.totalAmount || 0);
  const directPurchaseCourse = location.state?.directPurchase
    ? [location.state.course]
    : null;

  const user = useSelector((state) => state.user.userDatas);
  const cartItems = useSelector((state) => state.cart.items);
  const theme = useSelector((state) => state.theme.theme);

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const itemsToCheckout = directPurchaseCourse
    ? [location.state.course]
    : isSingleItem
    ? checkoutItems
    : cartItems;

  const calculateTotals = () => {
    let totalOriginalPrice = 0;
    let totalDiscountedPrice = 0;

    itemsToCheckout.forEach((item) => {
      totalOriginalPrice += Math.round(item.price || 0);
      totalDiscountedPrice += Math.round(item.offerPrice || item.price || 0);
    });

    const totalDiscount = totalOriginalPrice - totalDiscountedPrice;
    const discountPercentage =
      totalOriginalPrice > 0
        ? Math.round((totalDiscount / totalOriginalPrice) * 100)
        : 0;

    return {
      totalOriginalPrice,
      totalDiscountedPrice,
      totalDiscount,
      discountPercentage,
    };
  };

  const {
    totalOriginalPrice,
    totalDiscountedPrice,
    totalDiscount,
    discountPercentage,
  } = calculateTotals();

  const createRazorpayOrder = async () => {
    try {
      const response = await axiosInterceptor.post(
        "/user/create-razorpay-order",
        {
          amount: totalDiscountedPrice,
        }
      );
      return response.data;
    } catch (error) {
      toast.error("Failed to create payment order");
      return null;
    }
  };

  const handlePayment = async () => {
    const razorpayLoaded = await loadRazorpay();
    if (!razorpayLoaded) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    const orderData = await createRazorpayOrder();
    if (!orderData) return;

    const courseIds = itemsToCheckout.map((item) =>
      directPurchaseCourse ? item.courseId._id : item.courseId?._id
    );
    const options = {
      key: import.meta.env.RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: "INR",
      name: "EduSphere",
      description: "Course Purchase",
      order_id: orderData.id,
      handler: async (response) => {
        try {
          setIsProcessing(true);
          const verifyResponse = await axiosInterceptor.post(
            "/user/purchase-courses",
            {
              userId: user.id,
              courseIds,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }
          );

          if (verifyResponse.status === 200) {
            if (!directPurchaseCourse) {
              await clearCartAfterPurchase(user.id);
            }
            setShowFireworks(true);
            toast.success("Payment successful! Redirecting to your courses...");
            setTimeout(() => {
              setShowFireworks(false);
              navigate("/user/fullcourse");
            }, 5000);
          }
        } catch (error) {
          toast.error("Payment verification failed");
        } finally {
          setIsProcessing(false);
        }
      },
      prefill: {
        name: user.full_name,
        email: user.email,
        contact: user.phone,
      },
      theme: {
        color: theme === "dark" ? "#22c55e" : "#22c55e",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  const clearCartAfterPurchase = async (userId) => {
    try {
      const response = await axiosInterceptor.delete(`/user/clear/${userId}`);
      if (response.status === 200) {
        toast.success("Your cart has been cleared");
      }
    } catch (error) {
      toast.error("Failed to clear the cart");
    }
  };

  if (!user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark"
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <div
          className={`${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } p-8 rounded-xl shadow-lg text-center`}
        >
          <p className="text-xl font-semibold">
            Please log in to proceed with checkout
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {showFireworks && <Fireworks />}
      <div className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        <div
          className={`${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } shadow-xl rounded-xl overflow-hidden`}
        >
          <div
            className={`${
              theme === "dark" ? "bg-green-700" : "bg-green-600"
            } text-white p-6 flex items-center`}
          >
            <ShoppingCart className="mr-4" size={32} />
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div>
              <div className="flex items-center mb-6">
                <Tag className="mr-3 text-green-600" />
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              <div className="space-y-4">
                {itemsToCheckout.map((item) => (
                  <div
                    key={
                      directPurchaseCourse
                        ? item.courseId._id
                        : item.courseId?._id
                    }
                    className={`${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    } p-4 rounded-lg flex justify-between items-center`}
                  >
                    <div>
                      <h3
                        className={`font-medium ${
                          theme === "dark" ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {directPurchaseCourse
                          ? item.courseId.title
                          : item.courseId?.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        by{" "}
                        {directPurchaseCourse
                          ? item.courseId.tutor?.full_name
                          : item.courseId?.tutor?.full_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">
                        ₹{Math.round(item.offerPrice || item.price)}
                      </span>
                      {item.offerPrice &&
                        item.price &&
                        item.offerPrice < item.price && (
                          <span
                            className={`ml-2 text-sm ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            } line-through`}
                          >
                            ₹{Math.round(item.price)}
                          </span>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center mb-6">
                <CreditCard className="mr-3 text-green-600" />
                <h2 className="text-xl font-semibold">Payment Details</h2>
              </div>
              <div
                className={`${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                } p-6 rounded-lg`}
              >
                <h3
                  className={`font-semibold mb-4 ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  Order Total
                </h3>
                <div className="space-y-2">
                  <div
                    className={`flex justify-between ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <span>Original Price:</span>
                    <span>₹{totalOriginalPrice}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountPercentage}%):</span>
                    <span>-₹{totalDiscount}</span>
                  </div>
                  <div
                    className={`flex justify-between font-bold text-green-600 mt-2 pt-2 border-t ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    <span>Total:</span>
                    <span>₹{totalDiscountedPrice}</span>
                  </div>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full mt-6 py-3 px-4 ${
                    theme === "dark"
                      ? "bg-green-700 hover:bg-green-800"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                >
                  {isProcessing ? "Processing..." : "Complete Purchase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
