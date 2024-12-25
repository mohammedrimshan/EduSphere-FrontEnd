import React, { useEffect, useState, Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaBook, FaClock, FaExclamationCircle } from "react-icons/fa";
import { toast, Toaster } from "sonner";
import { Dialog, Transition } from "@headlessui/react";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import axiosInterceptor from "@/axiosInstance";
import Sidebar from "../../ui/sideBar";
import LogoutModal from "../../ui/LogOutModal";
import { logoutUser } from "../../Redux/Slices/userSlice";
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

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.user.userDatas);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user?.id) {
        setError("User not logged in");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axiosInterceptor.get(
          `/user/${user.id}/purchased-courses`
        );
        const coursesData = response.data?.courses || response.data || [];

        const validatedCourses = Array.isArray(coursesData)
          ? coursesData.map((course) => {
              const totalLessons = course?.lessons?.length || 0;

              // Calculate course progress where each lesson contributes equally
              let totalCourseProgress = 0;
              course?.lessons?.forEach((lesson) => {
                // Each lesson contributes equally to the total course progress
                const lessonWeight = 100 / totalLessons; // e.g., 25% for 4 lessons
                // If lesson has any progress, count it as completed
                const lessonContribution =
                  lesson.currentTime > 0 ? lessonWeight : 0;
                totalCourseProgress += lessonContribution;
              });

              // Count started lessons for display
              const startedLessons =
                course?.lessons?.filter((lesson) => lesson.currentTime > 0)
                  .length || 0;

              return {
                ...course,
                lessons: course?.lessons || [],
                duration: course?.duration || 0,
                description: course?.description || "",
                title: course?.title || "Untitled Course",
                _id: course?._id || String(Math.random()),
                course_thumbnail: course?.course_thumbnail || null,
                isBanned: course?.isBanned || false,
                progress: Math.round(totalCourseProgress), // Round to nearest integer
                totalLessons,
                startedLessons,
                enrollmentDate: course?.enrollmentDate || new Date(),
              };
            })
          : [];

        setCourses(validatedCourses);
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
        setError("Failed to fetch enrolled courses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnrolledCourses();
  }, [user?.id]);

  const handleCourseClick = (courseId) => {
    const course = courses.find((c) => c._id === courseId);
    if (course && course.isBanned) {
      toast.error("This course is currently unavailable.");
    } else {
      navigate(`/user/course/${courseId}/lessons`);
    }
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

  const handleReturnClick = (event, course) => {
    event.stopPropagation();
    setSelectedCourse(course);
    setShowReturnModal(true);
  };

  const handleReturnConfirm = async () => {
    if (!refundReason.trim()) {
      toast.error("Please provide a reason for the refund request.");
      return;
    }

    if (!selectedCourse?._id) {
      toast.error("Invalid course selected");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInterceptor.post("/user/request-refund", {
        courseId: selectedCourse._id,
        reason: refundReason.trim(),
      });

      if (response.status === 200) {
        toast.success("Refund request submitted successfully");
        setShowReturnModal(false);
        setRefundReason("");

        // Update the courses list to reflect the refund status
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === selectedCourse._id
              ? { ...course, refundRequested: true }
              : course
          )
        );
      }
    } catch (error) {
      console.error(
        "Refund request error:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit refund request. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }

    if (courses.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-xl mb-4 dark:text-white">
            You haven't enrolled in any courses yet.
          </p>
          <button
            onClick={() => navigate("/user/courses")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Browse Courses
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const enrollmentDate = new Date(course.enrollmentDate);
          const daysSinceEnrollment = Math.floor(
            (new Date() - enrollmentDate) / (1000 * 60 * 60 * 24)
          );
          const progressPercentage = course.progress;
          const isReturnEligible =
            daysSinceEnrollment <= 30 &&
            progressPercentage < 30 &&
            !course.refundRequested;
          return (
            <div
              key={course._id}
              className={`bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
                course.isBanned ? "opacity-50" : ""
              }`}
            >
              <div onClick={() => handleCourseClick(course._id)}>
                <img
                  src={
                    course.course_thumbnail ||
                    "/placeholder.svg?height=200&width=400"
                  }
                  alt={`${course.title} thumbnail`}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 dark:text-white">
                  {course.title}
                </h2>
                {course.isBanned && (
                  <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                    role="alert"
                  >
                    <p className="font-bold">Course Unavailable</p>
                    <p>
                      This course is currently unavailable. Please contact
                      support for more information.
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {course.description.substring(0, 100)}...
                </p>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center">
                    <FaClock className="mr-1" /> {course.duration} weeks
                  </span>
                  <span className="flex items-center">
                    <FaBook className="mr-1" /> {course.lessons.length} lessons
                  </span>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className={`w-3/4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ${
                      course.isBanned ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={course.isBanned}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course._id);
                    }}
                  >
                    {course.isBanned ? "Unavailable" : "Continue Learning"}
                  </button>
                  {isReturnEligible && (
                    <button
                      className="w-1/4 ml-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                      onClick={(e) => handleReturnClick(e, course)}
                    >
                      Return
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Header
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleLogoutClick={handleLogoutClick}
      />
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        handleLogout={handleLogoutClick}
        menuItems={menuItems}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">
          My Enrolled Courses
        </h1>
        {renderContent()}
      </main>
      <Footer />
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
      <Transition appear show={showReturnModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowReturnModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Confirm Course Return
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">
                      Please provide a reason for returning this course. This
                      action cannot be undone.
                    </p>
                    <textarea
                      className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                      rows="4"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Enter your reason for returning the course..."
                    ></textarea>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 mr-2"
                      onClick={handleReturnConfirm}
                    >
                      Confirm Return
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setShowReturnModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default EnrolledCourses;
