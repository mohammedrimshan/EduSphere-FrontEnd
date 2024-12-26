import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Upload,
  Save,
  CheckCircle,
  Edit,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
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
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import Sidebar from "@/ui/sideBar";
import LogoutModal from "@/ui/LogOutModal";
import { toggleTheme } from "@/redux/slices/themeSlice";
import { updateUser, logoutUser } from "@/Redux/Slices/userSlice";
import axios from "axios";
import { toast } from "sonner";
import OtpModal from "@/ui/OTP";
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/user";
import axiosInterceptor from "@/axiosInstance";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation for exactly 10 digits
const validatePhone = (phone) => {
  // Remove all non-numeric characters
  const cleanedPhone = phone.replace(/\D/g, "");

  // Check if it's exactly 10 digits
  return cleanedPhone.length === 10 && /^\d{10}$/.test(cleanedPhone);
};
const validateName = (name) => {
  return name.length >= 2 && name.length <= 50;
};

export default function Profile() {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    image: null,
  });
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingEmailUpdate, setPendingEmailUpdate] = useState(null);

  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const userData = useSelector((state) => state.user.userDatas);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    if (userData) {
      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        email: userData.email || "",
        image: null,
      });
      setPreviewImage(userData.profileImage || null);
    }
  }, [userData]);

  const handleEdit = (field, value) => {
    setEditField(field);
    setEditValue(value);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editValue.trim()) {
      toast.error("Field cannot be empty");
      return;
    }

    let isValid = true;
    if (editField === "email") {
      isValid = validateEmail(editValue);
      if (!isValid) {
        toast.error("Please enter a valid email address");
        return;
      }
    } else if (editField === "phone") {
      isValid = validatePhone(editValue);
      if (!isValid) {
        toast.error("Please enter a valid phone number");
        return;
      }
    } else if (editField === "name") {
      isValid = validateName(editValue);
      if (!isValid) {
        toast.error("Name should be between 2 and 50 characters");
        return;
      }
    }

    if (editField === "email") {
      try {
        const response = await axiosInterceptor.post("/user/send-otp", {
          email: editValue.trim(),
        });

        if (response.data.message === "OTP sent successfully") {
          setPendingEmailUpdate(editValue.trim());
          setShowOtpModal(true);
          toast.success("Please verify your new email address");
        }
      } catch (err) {
        console.error("Error sending OTP:", err);
        toast.error(err.response?.data?.message || "Failed to send OTP");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const fieldMapping = {
        name: "full_name",
        phone: "phone",
        email: "email",
      };

      const apiField = fieldMapping[editField] || editField;

      const updatedData = {
        _id: userData.id,
        [apiField]: editValue.trim(),
      };

      const response = await axiosInterceptor.put("/user/update", updatedData);

      setFormData((prev) => ({
        ...prev,
        [apiField]: editValue.trim(),
      }));

      dispatch(
        updateUser({
          ...userData,
          [apiField]: editValue.trim(),
        })
      );

      setEditField(null);
      setEditValue("");
      toast.success(response.data.message || "Updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage =
        err.response?.data?.message || "An error occurred while updating";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otpValue) => {
    if (!otpValue || !pendingEmailUpdate) {
      toast.error("Missing OTP or email information");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, verify the OTP
      const verifyResponse = await axiosInterceptor.post("/user/verify-otp", {
        email: pendingEmailUpdate,
        otp: otpValue,
      });

      if (verifyResponse.data.message === "OTP verified successfully") {
        // If OTP is verified, proceed with email update
        const updateResponse = await axiosInterceptor.put("/user/update", {
          _id: userData.id,
          email: pendingEmailUpdate,
        });

        setFormData((prev) => ({
          ...prev,
          email: pendingEmailUpdate,
        }));

        dispatch(
          updateUser({
            ...userData,
            email: pendingEmailUpdate,
          })
        );

        setShowOtpModal(false);
        setEditField(null);
        setEditValue("");
        setPendingEmailUpdate(null);

        toast.success("Email updated successfully");
      } else {
        toast.error("OTP verification failed");
      }
    } catch (error) {
      console.error("Error verifying OTP or updating email:", error);
      toast.error(
        error.response?.data?.message || "Failed to verify OTP or update email"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Allowed image types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, WEBP)");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "edusphere");
      formData.append("cloud_name", "edusphere");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/edusphere/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        const updatedUser = {
          ...userData,
          _id: userData._id,
          profileImage: data.secure_url,
        };

        const updateResponse = await axiosInterceptor.put(
          "/user/update",
          updatedUser
        );

        dispatch(updateUser(updatedUser));
        setPreviewImage(data.secure_url);
        toast.success("Profile image updated successfully");
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to update profile image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    // Implement logout logic here
    toast.success("Logout Successful");
    setTimeout(() => {
      dispatch(logoutUser());
      navigate("/user/login");
    }, 1000);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
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

  return (
    <div
      className={`flex h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        handleLogout={handleLogoutClick}
        menuItems={menuItems}
      />

      <div className="flex-1 overflow-auto">
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogoutClick={handleLogoutClick}
          handleThemeToggle={handleThemeToggle}
          theme={theme}
        />

        <main
          className={`${
            theme === "dark"
              ? "bg-gray-800"
              : "bg-gradient-to-br from-green-50 to-green-100"
          }`}
        >
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div
              className={`rounded-3xl shadow-xl overflow-hidden ${
                theme === "dark" ? "bg-gray-700" : "bg-white"
              }`}
            >
              <div className="md:flex">
                <div className="md:w-1/2 p-6 md:p-8">
                  <h2
                    className={`text-2xl md:text-3xl font-bold mb-6 ${
                      theme === "dark" ? "text-green-400" : "text-green-800"
                    }`}
                  >
                    Profile Management
                  </h2>
                  <div className="space-y-6">
                    {[
                      { key: "name", value: formData.full_name },
                      { key: "phone", value: formData.phone },
                      { key: "email", value: formData.email },
                    ].map(({ key, value }) => (
                      <div key={key}>
                        <label
                          htmlFor={key}
                          className={`block text-sm font-medium mb-1 ${
                            theme === "dark"
                              ? "text-green-300"
                              : "text-green-700"
                          }`}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {key === "name" && (
                              <User
                                className={`h-5 w-5 ${
                                  theme === "dark"
                                    ? "text-green-500"
                                    : "text-green-400"
                                }`}
                              />
                            )}
                            {key === "phone" && (
                              <Phone
                                className={`h-5 w-5 ${
                                  theme === "dark"
                                    ? "text-green-500"
                                    : "text-green-400"
                                }`}
                              />
                            )}
                            {key === "email" && (
                              <Mail
                                className={`h-5 w-5 ${
                                  theme === "dark"
                                    ? "text-green-500"
                                    : "text-green-400"
                                }`}
                              />
                            )}
                          </div>
                          {editField === key ? (
                            <form onSubmit={handleUpdate} className="flex">
                              <input
                                type={key === "email" ? "email" : "text"}
                                name={key}
                                id={key}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className={`block w-full pl-10 pr-12 py-2 md:py-3 text-base rounded-md focus:ring-green-500 focus:border-green-500 ${
                                  theme === "dark"
                                    ? "bg-gray-600 border-gray-500 text-white"
                                    : "bg-white border-green-300 text-gray-900"
                                }`}
                                placeholder={`Enter your ${key}`}
                                disabled={isSubmitting}
                              />
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                                  isSubmitting
                                    ? "bg-gray-400"
                                    : "bg-green-600 hover:bg-green-700"
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                              >
                                {isSubmitting ? "Saving..." : "Save"}
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center">
                              <input
                                type={key === "email" ? "email" : "text"}
                                name={key}
                                id={key}
                                value={value}
                                readOnly
                                className={`block w-full pl-10 pr-12 py-2 md:py-3 text-base rounded-md ${
                                  theme === "dark"
                                    ? "bg-gray-600 border-gray-500 text-white"
                                    : "bg-white border-green-300 text-gray-900"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleEdit(key, value)}
                                className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className={`md:w-1/2 p-6 md:p-8 ${
                    theme === "dark" ? "bg-gray-600" : "bg-green-50"
                  }`}
                >
                  <h3
                    className={`text-xl md:text-2xl font-semibold mb-6 ${
                      theme === "dark" ? "text-green-400" : "text-green-800"
                    }`}
                  >
                    Profile Picture
                  </h3>
                  <div
                    className={`rounded-2xl p-4 mb-6 aspect-square flex items-center justify-center overflow-hidden border-2 ${
                      theme === "dark"
                        ? "bg-gray-700 border-gray-500"
                        : "bg-white border-green-200"
                    }`}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile Preview"
                        className="max-w-full max-h-full object-cover rounded-xl"
                      />
                    ) : (
                      <User
                        className={`w-1/3 h-1/3 ${
                          theme === "dark" ? "text-gray-500" : "text-green-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("imageUpload").click()
                      }
                      disabled={isUploading}
                      className={`w-full flex items-center justify-center px-4 md:px-6 py-2 md:py-3 border border-transparent text-sm md:text-base font-medium rounded-md transition-colors ${
                        isUploading
                          ? "bg-gray-400 cursor-not-allowed"
                          : theme === "dark"
                          ? "text-green-200 bg-gray-700 hover:bg-gray-600"
                          : "text-green-700 bg-green-100 hover:bg-green-200"
                      }`}
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      {isUploading ? "Uploading..." : "Upload New Picture"}
                    </button>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer theme={theme} />
      </div>
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setPendingEmailUpdate(null);
        }}
        onVerify={handleVerifyOtp}
        email={pendingEmailUpdate}
        theme={theme}
      />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        theme={theme}
      />
    </div>
  );
}
