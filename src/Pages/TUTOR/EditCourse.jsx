import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { toast } from "sonner";
import {
  Book,
  DollarSign,
  BarChart,
  FileText,
  Upload,
  Layers,
  Clock,
  Edit,
  X,
} from "lucide-react";
import { BsCameraVideo, BsClipboardCheck } from "react-icons/bs";
import {
  MdDashboard,
  MdOutlinePerson,
  MdLibraryBooks,
  MdAttachMoney,
  MdReport
} from "react-icons/md";
import { FaGraduationCap, FaPercentage } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupeeSign } from "@fortawesome/free-solid-svg-icons";
import TutorHeader from "./Common/Header";
import Footer from "../USER/Common/Footer";
import Sidebar from "@/ui/sideBar";
import LogoutModal from "@/ui/LogOutModal";
import {
  updateCourse,
  setLoading,
  setError,
  setCourses,
} from "@/Redux/Slices/courseSlice";
import { logoutTutor } from "@/Redux/Slices/tutorSlice";
import axiosInterceptor from "@/axiosInstance";

const CropperModal = ({ isOpen, onClose, image, onCropComplete, theme }) => {
  const [cropper, setCropper] = useState(null);

  const handleCrop = () => {
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      croppedCanvas.toBlob((blob) => {
        onCropComplete(blob);
        onClose();
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className={`relative w-full max-w-2xl ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-xl`}
      >
        <div
          className={`p-4 border-b ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Crop Image
            </h3>
            <button
              onClick={onClose}
              className={`p-1 rounded-full hover:bg-gray-100 ${
                theme === "dark" ? "hover:bg-gray-700" : ""
              }`}
            >
              <X
                className={`w-5 h-5 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              />
            </button>
          </div>
        </div>
        <div className="p-4">
          <Cropper
            src={image}
            style={{ height: 400, width: "100%" }}
            aspectRatio={16 / 9}
            guides={true}
            onInitialized={(instance) => setCropper(instance)}
          />
        </div>
        <div
          className={`p-4 border-t ${
            theme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                theme === "dark"
                  ? "bg-green-700 hover:bg-green-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditCoursePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const tutorData = useSelector((state) => state.tutor.tutorData);
  const theme = useSelector((state) => state.theme.theme);
  const course = useSelector((state) => state.course.courseDatas);
  const currentCourse = useSelector((state) =>
    state.course.courseDatas.find((course) => course._id === courseId)
  );

  console.log("lessons", course);
  const [dragActive, setDragActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const [courseData, setCourseData] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    offer_percentage: 0,
    level: "Beginner",
    duration: "",
    course_thumbnail: null,
  });

  const API_BASE_URL =  "https://edusphere-backend.rimshan.in:5000";

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        dispatch(setLoading(true));
        const response = await axiosInterceptor.get(
          `/tutor/courses/${courseId}`
        );
        const fetchedCourse = response.data.course;

        // Update Redux store with the complete course data
        dispatch(setCourses([fetchedCourse])); // Wrap in array since setCourses expects an array

        // Update local state
        setCourseData({
          title: fetchedCourse.title || "",
          category: fetchedCourse.category || "",
          description: fetchedCourse.description || "",
          price: fetchedCourse.price || "",
          offer_percentage: fetchedCourse.offer_percentage || 0,
          level: fetchedCourse.level || "Beginner",
          duration: fetchedCourse.duration || "",
          course_thumbnail: fetchedCourse.course_thumbnail || null,
        });

        setImagePreview(fetchedCourse.course_thumbnail);
      } catch (error) {
        console.error("Error fetching course data:", error);
        toast.error("Failed to fetch course data");
        dispatch(setError(error.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    const fetchCategories = async () => {
      try {
        // Add all=true query parameter to get all categories
        const response = await axiosInterceptor.get(`/tutor/categories?all=true`);
        const categoriesData = response.data.categories;
        setCategories(categoriesData.filter((category) => category.isVisible));
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories");
      }
    };

    fetchCourseData();
    fetchCategories();
  }, [API_BASE_URL, courseId, dispatch]);

  useEffect(() => {
    if (courseId) {
      fetchLessons(courseId);
    }
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInterceptor.get(`/tutor/lessons/${courseId}`);
      const fetchedLessons = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setLessons(fetchedLessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to fetch lessons");
      setLessons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const RupeeIcon = () => (
    <div className="text-white-800 opacity-30">
      <FontAwesomeIcon icon={faIndianRupeeSign} />
    </div>
  );

  const handleLogoutConfirm = () => {
    toast.success("Tutor Logout Successful");
    setTimeout(() => {
      dispatch(logoutTutor());
      navigate("/tutor/tutor-login");
    }, 1000);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFiles(e.dataTransfer.files[0]);
      const previewURL = URL.createObjectURL(e.dataTransfer.files[0]);
      setImagePreview(previewURL);
    }
  };

  const handleFiles = (file) => {
    if (file) {
      setCourseData((prev) => ({ ...prev, course_thumbnail: file }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropperImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add this new function to handle the cropped image:
  const handleCroppedImage = (blob) => {
    const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
    const previewURL = URL.createObjectURL(blob);
    setImagePreview(previewURL);
    setCourseData((prevData) => ({
      ...prevData,
      course_thumbnail: file,
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file || typeof file === "string") return file;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "edusphere");
    formData.append("cloud_name", "edusphere");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/edusphere/image/upload",
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (!data.secure_url) throw new Error("Failed to upload image");
      return data.secure_url;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    dispatch(setLoading(true));

    try {
      if (
        !courseData.title ||
        !courseData.category ||
        !courseData.description ||
        !courseData.price ||
        !courseData.level ||
        !courseData.duration ||
        !courseData.course_thumbnail
      ) {
        throw new Error("Please fill in all required fields");
      }

      const thumbnailUrl = await handleImageUpload(courseData.course_thumbnail);

      const coursePayload = {
        title: courseData.title,
        category: courseData.category._id || courseData.category,
        description: courseData.description,
        price: parseFloat(courseData.price),
        offer_percentage: parseInt(courseData.offer_percentage) || 0,
        level: courseData.level,
        duration: parseInt(courseData.duration),
        course_thumbnail: thumbnailUrl,
        tutor: tutorData.id,
      };

      console.log("Updating course with payload:", coursePayload);
      const response = await axiosInterceptor.put(
        `/tutor/courses/${courseId}`,
        coursePayload
      );

      // Update Redux store with the complete course object from the API response
      dispatch(updateCourse(response.data.course));

      toast.success("Course updated successfully!");
      navigate("/tutor/courses");
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  const handleAddLessonClick = () => {
    if (currentCourse && currentCourse._id) {
      navigate(`/tutor/${currentCourse._id}/addlesson`);
    } else {
      toast.error(
        "Course data is not available. Please try reloading the page."
      );
    }
  };

  const menuItem2 = [
    { icon: MdDashboard, label: "Dashboard", path: "/tutor/dashboard" },
    { icon: MdOutlinePerson, label: "Profile", path: "/tutor/tutor-profile" },
    { icon: MdLibraryBooks, label: "Courses", path: "/tutor/courses" },
    { icon: MdAttachMoney, label: "Revenues", path: "/tutor/revenue" },
    { icon: BsCameraVideo, label: "Chat & Video", path: "/tutor/chat" },
    { icon: BsClipboardCheck, label: "Quiz", path: "/tutor/quizmanage" },
    { icon: MdReport, label: "Course Reports", path: "/tutor/courselist" }, 
  ];
  
  const themeClasses = {
    background:
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100"
        : "bg-gradient-to-br from-green-50 to-white",
    container:
      theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white",
    header: theme === "dark" ? "bg-green-800" : "bg-green-500",
    headerSubtext: theme === "dark" ? "text-green-200" : "text-green-100",
    label: theme === "dark" ? "text-gray-300" : "text-gray-700",
    iconColor: theme === "dark" ? "text-gray-500" : "text-gray-400",
    input:
      theme === "dark"
        ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-green-500 focus:border-green-500"
        : "border-gray-300 focus:ring-green-500 focus:border-green-500",
  };

  return (
    <>
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        handleLogout={handleLogoutClick}
        menuItems={menuItem2}
      />
      <TutorHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleLogoutClick={handleLogoutClick}
      />
      <div
        className={`min-h-screen ${themeClasses.background} py-12 px-4 sm:px-6 lg:px-8`}
      >
        <div
          className={`max-w-4xl mx-auto ${themeClasses.container} rounded-xl shadow-lg overflow-hidden`}
        >
          <div className={`${themeClasses.header} p-6 text-white`}>
            <h1 className="text-3xl font-bold flex items-center">
              <Book className="mr-2" />
              Edit Course
            </h1>
            <p className={`mt-2 ${themeClasses.headerSubtext}`}>
              Update your course information
            </p>
          </div>
          <div className="p-4 flex justify-end">
            <button
              type="button"
              onClick={handleAddLessonClick}
              className="flex items-center px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition-colors"
            >
              <Book className="w-4 h-4 mr-2" />
              Add & Edit Lesson
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`p-8 space-y-6 ${
              theme === "dark" ? "bg-gray-800 text-gray-100" : ""
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="title"
                  className={`block text-sm font-medium ${themeClasses.label}`}
                >
                  Course Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={courseData.title}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-2 rounded-md ${themeClasses.input}`}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className={`block text-sm font-medium ${themeClasses.label}`}
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={courseData.category?.title}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-2 vrounded-md ${themeClasses.input}`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="price"
                  className={`block text-sm font-medium ${themeClasses.label}`}
                >
                  Price
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <RupeeIcon />
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={courseData.price}
                    onChange={handleInputChange}
                    className={`block w-full pl-7 p-2 pr-12 ${themeClasses.input} rounded-md`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="offer_percentage"
                  className={`block text-sm font-medium ${themeClasses.label}`}
                >
                  Offer Percentage
                </label>
                <input
                  type="number"
                  id="offer_percentage"
                  name="offer_percentage"
                  value={courseData.offer_percentage}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-2 rounded-md ${themeClasses.input}`}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label
                  htmlFor="level"
                  className={`block text-sm font-medium ${themeClasses.label}`}
                >
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={courseData.level}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-2 rounded-md ${themeClasses.input}`}
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="duration"
                  className={`block text-sm font-medium ${themeClasses.label}`}
                >
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={courseData.duration}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full p-2 rounded-md ${themeClasses.input}`}
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="description"
                className={`block text-sm font-medium ${themeClasses.label}`}
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={courseData.description}
                onChange={handleInputChange}
                className={`mt-1 block w-full p-2 rounded-md ${themeClasses.input}`}
                required
              ></textarea>
            </div>
            <div>
              <label
                className={`block text-sm font-medium ${themeClasses.label}`}
              >
                Course Thumbnail
              </label>
              <div
                className={`mt-1 flex justify-center px-6 pt-
5 pb-6 border-2 ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                } border-dashed rounded-md`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Course Thumbnail"
                      className="mx-auto h-32 w-auto"
                    />
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className={`relative cursor-pointer ${
                        theme === "dark" ? "bg-gray-700" : "bg-white"
                      } rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500`}
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm 
                ${
                  theme === "dark"
                    ? "bg-green-700 text-white hover:bg-green-600"
                    : "bg-green-600 text-white hover:bg-green-700"
                } 
                ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {isSubmitting ? "Updating..." : "Update Course"}
              </button>
            </div>
          </form>
        </div>

        {/* Lessons List */}
        <div
          className={`mt-8 max-w-4xl mx-auto ${themeClasses.container} rounded-xl shadow-lg overflow-hidden`}
        >
          <div className={`${themeClasses.header} p-6 text-white`}>
            <h2 className="text-2xl font-bold flex items-center">
              <Book className="mr-2" />
              Course Lessons
            </h2>
          </div>
          <div
            className={`p-8 ${
              theme === "dark" ? "bg-gray-800 text-gray-100" : ""
            }`}
          >
            {currentCourse &&
            currentCourse.lessons &&
            currentCourse.lessons.length > 0 ? (
              <ul className="space-y-4">
                {currentCourse.lessons.map((lesson) => (
                  <li
                    key={lesson._id}
                    className={`flex items-center justify-between p-4 ${
                      theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    } rounded-lg`}
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{lesson.title}</h3>
                      <p className="text-sm text-gray-500">
                        Duration: {lesson.duration} minutes
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">
                No lessons added to this course yet.
              </p>
            )}
          </div>
        </div>
      </div>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
      <CropperModal
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        image={cropperImage}
        onCropComplete={handleCroppedImage}
        theme={theme}
      />
      <Footer />
    </>
  );
};

export default EditCoursePage;
