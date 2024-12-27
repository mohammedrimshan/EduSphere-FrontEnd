import React, { useState } from "react";
import axios from "axios";
import {
  FaLock,
  FaChevronLeft,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { toast, Toaster } from "sonner";
import Reset from "@/assets/Reset.jpg";
import axiosInterceptor from "@/axiosInstance";
// Modal Component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {children}
        <button
          onClick={onClose}
          className="mt-6 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
        >
          Back to Forgot Password
        </button>
      </div>
    </div>
  );
};

const API_BASE_URL =
   "https://edusphere-backend.rimshan.in:5000/admin";

const AdminForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [emailError, setEmailError] = useState("");

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

  // Handle email input change with validation
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    validateEmail(inputEmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email before submission
    const isEmailValid = validateEmail(email);

    if (!isEmailValid) {
      toast.error("Please correct the email error");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInterceptor.post(`/admin/forgot-password`, {
        email,
      });
      toast.success(response.data.message);
      setResetSent(true);
    } catch (error) {
      toast.error(error.response?.data.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-left" richColors />
      <div className="flex flex-1 lg:flex-row flex-col">
        <div className="hidden lg:flex lg:w-1/2 bg-gray-100 relative">
          <img
            src={Reset}
            alt="Student studying online"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center">
          <div className="w-full text-right p-4 lg:p-8">
            <h1 className="text-2xl font-bold text-green-500">EduSphere</h1>
          </div>

          <main className="flex-1 flex flex-col p-8 lg:p-12 mt-10 lg:mt-16">
            <div className="max-w-md w-full mx-auto space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  Reset Your Password
                </h1>
                <p className="mt-4 text-gray-600">
                  Forgot your password? No worries, we'll send you a reset code.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 mt-10">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your E-mail"
                      required
                      className={`w-full px-3 py-2 border ${
                        emailError
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-green-500"
                      } rounded-md shadow-sm focus:outline-none focus:border-green-500`}
                    />
                    {emailError && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <FaExclamationCircle className="text-red-500" />
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <FaExclamationCircle className="mr-2" /> {emailError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !!emailError}
                  className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading || emailError
                      ? "bg-green-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                >
                  {loading ? (
                    <FaSpinner className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <FaLock className="w-4 h-4 mr-2" />
                  )}
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>

              <a
                href="/admin/adminlogin"
                className="flex items-center justify-center text-green-500 hover:text-green-600 transition-colors duration-300 group mt-6"
              >
                <FaChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to login screen
              </a>
            </div>
          </main>
        </div>
      </div>

      {/* Modal for Reset Confirmation */}
      <Modal open={resetSent} onClose={() => setResetSent(false)}>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Check Your Email
        </h2>
        <p className="text-gray-600 text-center">
          We've sent a password reset link to your email. Please check your
          inbox and follow the instructions to reset your password.
        </p>
      </Modal>

      <footer className="bg-black p-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-white">EduSphere</span>
          <div className="flex gap-4">
            <a href="#" className="text-white hover:text-gray-400">
              <FaInstagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:text-gray-400">
              <FaTwitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:text-gray-400">
              <FaLinkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:text-gray-400">
              <FaFacebook className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminForgetPassword;
