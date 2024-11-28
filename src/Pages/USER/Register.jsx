import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from "sonner";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import OtpModal from "../../ui/OTP";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Banner from "../../assets/Register.jpg";
import DotDotDotSpinner from "../../ui/Spinner/DotDotDotSpinner";
import { loginUser } from "../../Redux/Slices/userSlice";
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/user";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Initialize form data from localStorage if available
  useEffect(() => {
    const savedFormData = localStorage.getItem("registerFormData");
    const savedOtpState = localStorage.getItem("otpModalState");

    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }

    if (savedOtpState === "true") {
      setShowOtpModal(true);
    }
  }, []);

  // Save form data and OTP modal state to localStorage whenever they change
  useEffect(() => {
    if (Object.values(formData).some((value) => value !== "")) {
      localStorage.setItem("registerFormData", JSON.stringify(formData));
    }
    localStorage.setItem("otpModalState", showOtpModal.toString());
  }, [formData, showOtpModal]);

  const [errors, setErrors] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const validationRules = {
    full_name: {
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      required: true,
      pattern: /^\d{10}$/,
    },
    password: {
      required: true,
      minLength: 8,
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    },
  };

  const validateField = (name, value) => {
    let error = "";
    const rules = validationRules[name];

    if (rules) {
      if (rules.required && !value) {
        error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
      } else if (rules.pattern && !rules.pattern.test(value)) {
        switch (name) {
          case "full_name":
            error = "Full name can only contain letters and spaces";
            break;
          case "email":
            error = "Please enter a valid email address";
            break;
          case "phone":
            error = "Please enter a valid 10-digit phone number";
            break;
          case "password":
            error =
              "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character";
            break;
          default:
            error = "Invalid format";
        }
      } else if (rules.minLength && value.length < rules.minLength) {
        error = `Minimum ${rules.minLength} characters required`;
      } else if (rules.maxLength && value.length > rules.maxLength) {
        error = `Maximum ${rules.maxLength} characters allowed`;
      }
    }

    if (name === "confirmPassword" && value !== formData.password) {
      error = "Passwords do not match";
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      return toast.error("Please accept Terms and Conditions");
    }

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      newErrors[key] = validateField(key, formData[key]);
    });
    if (Object.values(newErrors).some((err) => err)) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/send-otp`, {
        email: formData.email,
      });
      if (response.data.message === "OTP sent successfully") {
        toast.success("OTP sent to your email!");
        setShowOtpModal(true);
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (otp) => {
    try {
      setIsSubmitting(true);
      const verifyResponse = await axios.post(`${API_BASE_URL}/verify-otp`, {
        email: formData.email,
        otp: otp,
      });

      if (verifyResponse.data.message === "OTP verified successfully") {
        const registerResponse = await axios.post(`${API_BASE_URL}/signup`, {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });

        if (registerResponse.data.message === "User registered successfully") {
          const userData ={
            ...registerResponse.data.user,
            phone:formData.phone
          }
          dispatch(loginUser(userData));
          
          if(registerResponse.data.user){
            localStorage.setItem("token",registerResponse.data.token)
          }

          toast.success("Registration successful!");
          // Clear localStorage after successful registration
          localStorage.removeItem("registerFormData");
          localStorage.removeItem("otpModalState");

          setTimeout(() => {
            setShowOtpModal(false);
            navigate("/user/login");
          }, 1500);
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error(
        "Verification or registration error:",
        error.response?.data
      );
      if (
        error.response?.status === 400 &&
        error.response?.data?.message === "Invalid or expired OTP"
      ) {
        toast.error("OTP has expired. Please request a new one.");
        setOtp(["", "", "", "", "", ""]);
      } else {
        toast.error(
          error.response?.data?.message ||
            "Verification failed. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowOtpModal(false);
    localStorage.removeItem("otpModalState");
    localStorage.removeItem("registerFormData");
  };
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        { token: credentialResponse.credential }
      );
      dispatch(loginUser(response.data.user));
      toast.success("Login successful");
      localStorage.setItem("token", response.data.token);
      setTimeout(() => navigate("/user/home"), 1000);
    } catch (error) {
      toast.error("Google login failed");
      console.error(error);
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google login was unsuccessful");
  };

  return (
    <div className="min-h-screen flex relative">
      <Toaster position="top-left" richColors />
      <div className="hidden lg:flex lg:w-1/2 bg-gray-100 relative">
        <img
          src={Banner}
          alt="Student learning online"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-full lg:w-1/2 ml-auto flex flex-col p-8 lg:p-12">
        <div className="absolute top-4 right-6">
          <h1 className="text-2xl font-bold text-green-500">EduSphere</h1>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              Welcome to <span className="text-green-500">EduSphere...!</span>
            </h2>
            <p className="text-gray-600">
              Education is the passport to the future, for tomorrow belongs to
              those who prepare for it today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.full_name ? "border-red-500" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300`}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.full_name && (
                <p className="mt-1 text-xs text-red-500">{errors.full_name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300`}
                placeholder="Enter your Email Address"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.phone ? "border-red-500" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300`}
                placeholder="Enter your phone number"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </span>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:border-green-300`}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </span>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="w-4 h-4 text-green-500"
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-green-500 underline">
                  Terms and Conditions
                </a>
              </span>
            </div>
            <p className="text-center text-sm text-gray-600">
              Already have Account{" "}
              <a href="/user/login" className="text-green-500 hover:underline">
                Sign In !
              </a>
            </p>
            <div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-semibold text-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? <DotDotDotSpinner /> : "Register"}
              </button>
            </div>
          </form>
          {/* Google Login Button */}
          <div className="mt-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              theme="outline"
              size="large"
              width="100%"
            />
          </div>
          {showOtpModal && (
            <OtpModal
              isOpen={showOtpModal}
              onClose={handleModalClose}
              onVerify={handleVerify}
              email={formData.email}
            />
          )}
        </div>
      </div>
    </div>
  );
}
