import React,{ useState } from "react";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import TutorLoginBanner from "@/assets/TutorLogin.jpg";
import Goolge from "@/assets/Google.png";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast, Toaster } from "sonner";
import axios from "axios";
import { loginTutor } from "@/Redux/Slices/tutorSlice";
import axiosInterceptor from "@/axiosInstance";
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/tutor";

export default function TutorLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Email validation function
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

    // Validate email and password
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      toast.error("Please correct the errors before submitting");
      return;
    }

    // Prepare tutor data
    const tutorData = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    try {
      // Make API call to log in the tutor
      const response = await axios.post(`${API_BASE_URL}/login`, tutorData, {
        withCredentials: true,
      });

      console.log("Response:", response);

      // If login is successful
      if (response.status === 200 && response.data.accessToken) {
        const { tutor } = response.data;
        dispatch(loginTutor(response.data.tutor));
        localStorage.setItem("userType", "tutor");

        // Dispatch to Redux if necessary
        if (tutor) {
          dispatch(
            loginTutor({
              id: tutor.id,
              full_name: tutor.full_name,
              email: tutor.email,
              phone: tutor.phone,
              tutor_id: tutor.id,
              profile_image: tutor.profile_image,
              status: tutor.status,
              courses: tutor.courses,
              is_verified: tutor.is_verified,
              lastActive: tutor.lastActive,
              lastLogin: tutor.lastLogin,
            })
          );
        }

        // Display success message
        toast.success(response.data.message || "Login successful");

        // Redirect to tutor dashboard
        navigate("/tutor/dashboard");
      } else {
        // Handle invalid credentials or other response issues
        toast.error(response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Error:", error);

      // Handle errors
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong, please try again");
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log("Google credential received:", credentialResponse);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/tutor/google`,
        {
          token: credentialResponse.credential,
        },
        { withCredentials: true }
      );

      console.log("Full response from server:", response);

      if (response.data && response.data.tutor) {
        const tutorData = {
          ...response.data.tutor,
          full_name: response.data.tutor.full_name || response.data.tutor.name,
        };
        console.log("Dispatching to Redux:", tutorData);
        dispatch(loginTutor(tutorData));
        const storedData = localStorage.getItem("tutorData");
        console.log("Stored in localStorage:", storedData);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userType", "tutor");

        toast.success("Tutor Login successful");
        setTimeout(() => navigate("/tutor/tutorhome"), 1000);
      } else {
        throw new Error("Invalid tutor data received");
      }
    } catch (error) {
      console.error("Full error object:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Google login failed: " + error.message);
      }
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google login was unsuccessful");
  };

  const handleRegister = () => {
    navigate("/tutor/tutor-register");
  };

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-left" richColors />
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-100 relative">
        <img
          src={TutorLoginBanner}
          alt="Student learning online"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-12 relative">
        {/* EduSphere Logo for Large Screens */}
        <div className="absolute top-4 right-4 hidden lg:block">
          <h1 className="text-2xl font-bold text-green-500">EduSphere</h1>
        </div>

        {/* EduSphere Logo for Small Screens */}
        <div className="flex justify-between items-center mb-8 lg:hidden">
          <h1 className="text-2xl font-bold text-green-500">EduSphere</h1>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col lg:flex-row lg:justify-center items-center gap-2 mb-8">
          <div className="flex gap-2 p-1 bg-green-100 rounded-full">
            <button className="px-6 py-2 bg-green-500 text-white rounded-full transition-colors duration-300">
              Login
            </button>
            <button
              className="px-6 py-2 text-green-600 rounded-full hover:bg-green-200 transition-colors duration-300"
              onClick={handleRegister}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              Welcome to EduSphere...!
            </h2>
            <p className="text-gray-600">EduSphere makes you perfect</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tutorname Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tutor name
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
            {/* Password Input with Toggle */}
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
            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-gray-300 rounded text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a
                href="/tutor/tutor-forgetpassword"
                className="text-sm text-gray-600 hover:text-green-500"
              >
                Forgot Password?
              </a>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors duration-300"
            >
              Login
            </button>
            {/* Divider and Social Login Button */}
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
            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/tutor/tutor-register"
                className="text-green-500 hover:underline"
              >
                Sign up free!
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
