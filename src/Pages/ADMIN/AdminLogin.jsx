import React,{ useState } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import AdminBanner from "@/assets/AdminLogin.jpg";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { loginAdmin } from "@/Redux/Slices/adminSlice";
import axiosInterceptor from "@/axiosInstance";
const API_BASE_URL =
   "https://edusphere-backend.rimshan.in/admin";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin/dashboard";

  const validateEmail = (inputEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inputEmail) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(inputEmail)) {
      setEmailError("Invalid email format");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  // Password validation function
  const validatePassword = (inputPassword) => {
    if (!inputPassword) {
      setPasswordError("Password is required");
      return false;
    } else if (inputPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    validateEmail(inputEmail);
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    validatePassword(inputPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateEmail(email) || !validatePassword(password)) {
      toast.error("Please correct the errors before submitting");
      return;
    }
  
    try {
      const response = await axiosInterceptor.post(
        `admin/login`,
        { email, password },
        { withCredentials: true }
      );
  
      if (response.data.admin) {
        dispatch(loginAdmin({
          email: response.data.admin.email,
          fullName: response.data.admin.fullName || "Admin Name",
          profileImage: response.data.admin.profileImage || "default-image.jpg",
        }));
  
        toast.success("Login successful");
        navigate(from || "/admin/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    }
  };


  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axiosInterceptor.post(
        `/auth/admin/google`,
        { token: credentialResponse.credential },
        { withCredentials: true }
      );

      if (response.data && response.data.admin) {
        const adminData = {
          email: response.data.admin.email,
          fullName: response.data.admin.fullName,
          profileImage: response.data.admin.profileImage,
        };

        dispatch(loginAdmin(adminData));

        localStorage.setItem("adminDatas", JSON.stringify(adminData));
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userType", "admin");

        toast.success("Admin Login successful");
        setTimeout(() => navigate("/admin/dashboard"), 1000);
      } else {
        throw new Error("Invalid admin data received");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Google login failed: " + error.message
      );
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google login was unsuccessful");
  };
  return (
    <div className="min-h-screen flex">
      <Toaster position="top-left" richColors />
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-100 relative">
        <img
          src={AdminBanner}
          alt="Student learning online"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 relative">
        <div className="absolute top-4 right-4 hidden lg:block">
          <h1 className="text-2xl font-bold text-green-500">EduSphere</h1>
        </div>

        <div className="flex justify-between items-center mb-8 lg:hidden">
          <h1 className="text-2xl font-bold text-green-500">EduSphere</h1>
        </div>
        <div className="flex flex-col lg:flex-row lg:justify-center items-center gap-2 mb-8">
          <div className="flex gap-2 p-1 bg-green-100 rounded-full">
            <button className="px-6 py-2 bg-green-500 text-white rounded-full transition-colors duration-300">
              Login
            </button>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 whitespace-nowrap animate-fadeIn">
              <span className="text-gray-900 dark:text-white">
                Welcome Back to{" "}
              </span>
              <span className="text-green-500 animate-pulse"> EduSphere</span>
            </h2>

            <p className="text-gray-600">EduSphere makes you perfect</p>
          </div>
          <Toaster position="top-left" richColors />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Admin name
              </label>
              <input
                type="text"
                id="username"
                name="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  emailError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:ring-green-500"
                } focus:outline-none focus:ring-2 focus:border-green-500 transition-all duration-300`}
                placeholder="Enter your User name"
                required
              />
              {emailError && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertTriangle size={16} className="mr-2" />
                  {emailError}
                </div>
              )}
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  passwordError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:ring-green-500"
                } focus:outline-none focus:ring-2 focus:border-green-500 transition-all duration-300`}
                placeholder="Enter your Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {passwordError && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertTriangle size={16} className="mr-2" />
                  {passwordError}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a
                href="/admin/admin-forgetpassword"
                className="text-sm text-gray-600 hover:text-green-500"
              >
                Forgot Password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors duration-300"
            >
              Login
            </button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Sign up with
                </span>
              </div>
            </div>
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
          </form>
        </div>
      </div>
    </div>
  );
}
