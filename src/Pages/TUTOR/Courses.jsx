import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Edit2, Trash2, Clock, BookOpen, Users, AlertTriangle } from 'lucide-react';
import TutorHeader from "./Common/Header";
import { logoutTutor } from "@/Redux/Slices/tutorSlice";
import Footer from "../USER/Common/Footer";
import Sidebar from "@/ui/sideBar";
import { BsCameraVideo, BsClipboardCheck } from "react-icons/bs";
import {
  MdDashboard,
  MdOutlinePerson,
  MdLibraryBooks,
  MdAttachMoney,
  MdReport,
} from "react-icons/md";
import { toast } from "sonner";
import LogoutModal from "@/ui/LogOutModal";
import { setCourses, deleteCourse } from "@/Redux/Slices/courseSlice";
import axios from "axios";
import axiosInterceptor from "@/axiosInstance";
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`rounded-lg shadow-xl p-6 w-96 ${
          theme === "dark"
            ? "bg-gray-800 text-gray-200"
            : "bg-white text-gray-800"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {title}
        </h2>
        <p
          className={`mb-6 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {message}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded ${
              theme === "dark"
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded ${
              theme === "dark"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// const ListToggleButton = ({ isListed, onToggle, theme }) => (
//   <div
//     className={`w-24 h-10 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
//       isListed
//         ? 'bg-green-500 text-white'
//         : theme === 'dark'
//           ? 'bg-gray-700 text-gray-300'
//           : 'bg-gray-300 text-gray-700'
//     }`}
//     onClick={onToggle}
//   >
//     <div className="flex w-full justify-center items-center text-sm font-medium">
//       {isListed ? 'Listed' : 'Unlisted'}
//     </div>
//   </div>
// );


const CourseCard = ({
  course,
  onToggle,
  onEdit,
  onDelete,
  theme = "light",
}) => {
  const navigate = useNavigate();
  const [updatingCourseId, setUpdatingCourseId] = useState(null);
  const handleCardClick = (e) => {
    const isButton = e.target.closest('button');
    if (!isButton && !course.isBlocked && !course.isBanned && course.listed) {
      navigate(`/tutor/coursepreview/${course._id}`);
    } else if (course.isBlocked || course.isBanned) {
      toast.error('This course is currently unavailable and cannot be accessed.');
    }
  };

  return (
    <div
      className={`
        rounded-lg 
        shadow-lg 
        overflow-hidden
        mb-4 
        w-full 
        max-w-full 
        lg:max-w-[1200px] 
        mx-auto 
        ${theme === "dark" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"}
        ${!course.listed || course.isBlocked || course.isBanned ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${!course.isBlocked && !course.isBanned ? "transition-transform duration-200 hover:scale-[1.02]" : ""}
      `}
      onClick={handleCardClick}
      style={{
        pointerEvents: course.isBlocked || course.isBanned ? "none" : "auto",
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Reduced image container */}
        <div className="sm:w-64 min-w-64 relative">
          <div className="w-full h-48">
            <img
              src={course.thumbnail || course.course_thumbnail}
              alt={course.title}
              className={`w-full h-full object-cover ${course.isBlocked ? "grayscale" : ""}`}
            />
          </div>
          <div
            className={`absolute top-0 left-0 m-2 px-2 py-0.5 rounded ${
              theme === "dark" ? "bg-blue-600" : "bg-blue-500"
            } text-white text-xs font-semibold`}
          >
            {course.level || "All Levels"}
          </div>
          {(course.isBanned || course.isBlocked) && (
            <div className="absolute top-0 right-0 m-2 px-2 py-0.5 rounded bg-red-500 text-white text-xs font-semibold flex items-center">
              <AlertTriangle size={14} className="mr-1" />
              {course.isBanned ? "Banned" : "Blocked"}
            </div>
          )}
        </div>

        {/* Compact content section */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
          <div>
            <h3
              className={`text-lg sm:text-xl font-bold mb-1 ${
                theme === "dark" ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {course.title}
            </h3>
            <p
              className={`text-sm mb-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              By {course?.tutor?.full_name || "Unknown Author"}
            </p>
            <p
              className={`text-sm mb-2 line-clamp-2 ${
                theme === "dark" ? "text-gray-500" : "text-gray-600"
              }`}
            >
              {course.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-1">
            <div className="flex flex-wrap items-center gap-3 mb-2 sm:mb-0">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span className="text-xs">{course.duration || "N/A"} Weeks</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-3 h-3 mr-1" />
                <span className="text-xs">{course.lessons?.length || 0} lessons</span>
              </div>
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                <span className="text-xs">{course.enrolled_count || 0} students</span>
              </div>
            </div>
            
            <div
              className="flex items-center space-x-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`px-2 py-0.5 rounded-full text-xs ${
                  course.listed ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                }`}
              >
                {course.listed ? "Listed" : "Unlisted"}
              </div>
              {!course.isBlocked && !course.isBanned && (
  <>
    <button
      onClick={() => onToggle(course._id)}
      disabled={updatingCourseId === course._id}
      className={`p-1.5 rounded-full ${
        updatingCourseId === course._id 
          ? "opacity-50 cursor-not-allowed"
          : theme === "dark"
          ? "bg-gray-700 hover:bg-gray-600"
          : "bg-gray-100 hover:bg-gray-200"
      } transition-colors duration-300`}
    >
      {updatingCourseId === course._id 
        ? "Updating..." 
        : course.listed 
        ? "Unlist" 
        : "List"}
    </button>
                  <button
                    onClick={() => onEdit(course._id)}
                    className={`p-1.5 rounded-full ${
                      theme === "dark"
                        ? "bg-gray-700 text-blue-400 hover:bg-blue-900 hover:text-blue-300"
                        : "bg-gray-100 text-blue-500 hover:bg-blue-100 hover:text-blue-700"
                    } transition-colors duration-300`}
                    aria-label="Edit course"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(course._id)}
                    className={`p-1.5 rounded-full ${
                      theme === "dark"
                        ? "bg-gray-700 text-red-400 hover:bg-red-900 hover:text-red-300"
                        : "bg-gray-100 text-red-500 hover:bg-red-100 hover:text-red-700"
                    } transition-colors duration-300`}
                    aria-label="Delete course"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const CourseManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tutorData = useSelector((state) => state.tutor.tutorData);
  const theme = useSelector((state) => state.theme.theme);
  const courses = useSelector((state) => state.course.courseDatas);
  console.log("Data", courses);
  const [currentPage, setCurrentPage] = useState(1);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [updatingCourseId, setUpdatingCourseId] = useState(null);
  const coursesPerPage = 3;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  const handleAddNewCourse = () => {
    navigate("/tutor/createcourse");
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosInterceptor.get(
        `/tutor/courses?tutorId=${tutorData.id}`
      );
      console.log(response);
      if (response.data.success) {
        dispatch(
          setCourses({
            courses: response.data.courses,
            isTutor: true,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error(error.response?.data?.message || "Error fetching courses");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCourses();
  }, []);

  const handleToggle = async (id) => {
    try {
      setUpdatingCourseId(id); // Track which course is being updated
      
      // Find the course and update local state immediately
      const course = courses.find((c) => c._id === id);
      const updatedCourses = courses.map((c) => 
        c._id === id ? { ...c, listed: !c.listed } : c
      );
      
      // Update Redux state immediately for instant UI feedback
      dispatch(setCourses({
        courses: updatedCourses,
        isTutor: true,
      }));
  
      // Make API call in background
      const response = await axiosInterceptor.patch(`/tutor/courses/${id}`, {
        listed: !course.listed,
      });
  
      if (response.data.success) {
        toast.success(`Course ${course.listed ? "unlisted" : "listed"} successfully`);
      } else {
        // If API call fails, revert the change
        dispatch(setCourses({
          courses: courses,
          isTutor: true,
        }));
        toast.error("Failed to update course status");
      }
    } catch (error) {
      // Revert changes on error
      dispatch(setCourses({
        courses: courses,
        isTutor: true,
      }));
      toast.error("Error updating course status");
    } finally {
      setUpdatingCourseId(null);
    }
  };

  const handleEditClick = (id) => {
    setSelectedCourseId(id);
    setShowEditModal(true);
  };

  const handleEditConfirm = () => {
    console.log(`Confirmed edit for course with id: ${selectedCourseId}`);
    navigate(`/tutor/edit-course/${selectedCourseId}`);
    setShowEditModal(false);
    setSelectedCourseId(null);
  };

  const handleDeleteClick = (id) => {
    setSelectedCourseId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await axiosInterceptor.delete(
        `/tutor/courses/${selectedCourseId}`
      );

      if (response.data.success) {
        dispatch(deleteCourse(selectedCourseId));
        toast.success("Course deleted successfully");
      }
    } catch (error) {
      toast.error("Error deleting course");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSelectedCourseId(null);
    }
  };

  // Ensure courses is an array
  const validCourses = Array.isArray(courses) ? courses : [];

  // Calculate indices
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;

  // Get current page's courses
  const currentCourses = validCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse
  );

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(validCourses.length / coursesPerPage); i++) {
    pageNumbers.push(i);
  }

  const menuItem2 = [
    { icon: MdDashboard, label: "Dashboard", path: "/tutor/dashboard" },
    { icon: MdOutlinePerson, label: "Profile", path: "/tutor/tutor-profile" },
    { icon: MdLibraryBooks, label: "Courses", path: "/tutor/courses" },
    { icon: MdAttachMoney, label: "Revenues", path: "/tutor/revenue" },
    { icon: BsCameraVideo, label: "Chat & Video", path: "/tutor/chat" },
    { icon: BsClipboardCheck, label: "Quiz", path: "/tutor/quizmanage" },
    { icon: MdReport, label: "Course Reports", path: "/tutor/courselist" },
  ];

  return (
    <>
      <div
        className={`min-h-screen flex flex-col min-w-full ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Course"
          message="Are you sure you want to delete this course? This action cannot be undone."
          confirmText="Delete"
          theme={theme}
        />

        <ConfirmationModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onConfirm={handleEditConfirm}
          title="Edit Course"
          message="Are you ready to edit this course?"
          confirmText="Edit"
          theme={theme}
        />

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
        <div className="flex-grow max-w-4xl mx-auto px-4 py-8 flex flex-col">
          <h1
            className={`text-3xl font-bold mb-6 ${
              theme === "dark" ? "text-gray-100" : "text-gray-800"
            }`}
          >
            My Courses ({courses.length})
          </h1>
          <div className="flex-grow w-full max-w-7xl mx-auto">
            {currentCourses.map((course) => (
              <CourseCard
                course={{
                  ...course,
                  isBlocked: course.status === "blocked", // or whatever logic determines blocking
                  thumbnail: course.course_thumbnail,
                  author: course.tutor?.name || "Unknown Author",
                }}
                onToggle={handleToggle}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                theme={theme}
              />
            ))}
          </div>

          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FaChevronLeft size={14} />
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`w-8 h-8 rounded-full ${
                  currentPage === number
                    ? "bg-blue-500 text-white"
                    : theme === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, pageNumbers.length))
              }
              disabled={currentPage === pageNumbers.length}
              className={`p-2 rounded-full ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
          <button
            onClick={handleAddNewCourse}
            className={`mt-8 w-full py-2 px-4 rounded-md transition-colors duration-300 ${
              theme === "dark"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            Add New Course
          </button>
        </div>

        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
        />
      </div>
      <Footer />
    </>
  );
};

export default CourseManagement;
