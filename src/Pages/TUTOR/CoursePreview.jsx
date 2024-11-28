import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaReact, FaClock, FaUser, FaCheckCircle, FaGraduationCap, 
  FaPlay, FaEdit, FaPencilAlt, FaImage, FaCalendarAlt, FaBook, FaStar, FaFilePdf
} from 'react-icons/fa';
import Sidebar from '@/ui/sideBar';
import TutorHeader from './Common/Header';
import { logoutTutor } from "../../Redux/Slices/tutorSlice";
import { BsCameraVideo, BsClipboardCheck } from "react-icons/bs";
import {
  MdDashboard,
  MdOutlinePerson,
  MdLibraryBooks,
  MdAttachMoney,
} from "react-icons/md";
import LogoutModal from "@/ui/LogOutModal";
import { toast } from "sonner";
import {
  setCourses,
  addCourse,
  updateCourse,
  setOfferPrice,
} from "@/Redux/Slices/courseSlice";
import Footer from "../USER/Common/Footer";
import { Clock, User } from 'lucide-react';
const CoursePreview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const currentCourse = useSelector((state) =>
    state.course.courseDatas.find((course) => course._id === courseId)
  );
  console.log("currentCourse", currentCourse);
  const lessonData = useSelector((state) => state.course.lessons);
  console.log("lessonData", lessonData);
  const offerPrice = useSelector((state) => state.course.offerPrices[courseId]);
  console.log("offerPrice", offerPrice);
  const [activeTab, setActiveTab] = useState("structure");
  const theme = useSelector((state) => state.theme.theme);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setError(null);

        const response = await axios.get(
          `${API_BASE_URL}/tutor/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("tutorToken")}`,
            },
          }
        );

        if (!response.data) {
          throw new Error("No data received from server");
        }

        const { course, lessons } = response.data;

        dispatch(setCourses({courses:[course],isTuor:true}));
        if (lessons?.length) {
          dispatch(
            setLessonsForCourse({
              courseId: course._id,
              lessons: lessons,
            })
          );
        }

        // Calculate and set offer price
        const regularPrice = Number(course.price) || 0;
        const offerPercentage = Number(course.offer_percentage) || 0;
        const discount = (regularPrice * offerPercentage) / 100;
        const calculatedOfferPrice = regularPrice - discount;
        dispatch(
          setOfferPrice({
            courseId: course._id,
            offerPrice: calculatedOfferPrice.toFixed(2),
          })
        );
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch course details";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    fetchCourseData();
  }, [courseId, dispatch]);

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

  const courseLessons = useMemo(() => {
    if (!currentCourse?.lessons) return [];

    return currentCourse.lessons
      .map((lessonId) => {
        const lesson =
          typeof lessonId === "string" ? lessonData[lessonId] : lessonId;
        return lesson || null;
      })
      .filter(Boolean);
  }, [currentCourse?.lessons, lessonData]);

  console.log("courseLessons", courseLessons);

  const menuItem2 = [
    { icon: MdDashboard, label: "Dashboard", path: "/tutor/dashboard" },
    { icon: MdOutlinePerson, label: "Profile", path: "/tutor/tutor-profile" },
    { icon: MdLibraryBooks, label: "Courses", path: "/tutor/courses" },
    { icon: MdAttachMoney, label: "Revenues", path: "/revenues" },
    { icon: BsCameraVideo, label: "Chat & Video", path: "/chat-video" },
    { icon: BsClipboardCheck, label: "Quiz", path: "/quiz" },
  ];

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
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
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Error Loading Course
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
            <button
              onClick={() => navigate("/tutor/courses")}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCourse) {
    return null;
  }

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                <FaGraduationCap className="mr-2" />
                {currentCourse.enrolled_count || 0} Students Enrolled
              </span>
              
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {currentCourse.title}
              </h1>

              <p className="text-gray-600 dark:text-gray-300">{currentCourse.description}</p>

              <div className="flex items-center space-x-4">
                <span className="flex items-center text-gray-600 dark:text-gray-300">
                  <FaBook className="mr-2" />
                  {currentCourse.category.title}
                </span>
                <span className="flex items-center text-gray-600 dark:text-gray-300">
                  <FaClock className="mr-2" />
                  {currentCourse.duration} hours
                </span>
                <span className="flex items-center text-gray-600 dark:text-gray-300">
                  <FaStar className="mr-2" />
                  {currentCourse.rating || 0}
                </span>
                <span className="flex items-center text-gray-600 dark:text-gray-300">
                  <FaCalendarAlt className="mr-2" />
                  {new Date(currentCourse.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Course Content Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Course Content</h2>
                <button 
                  onClick={() => navigate(`/tutor/${courseId}/addlesson`)}
                  className="text-green-600 hover:text-green-700 flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Add Lesson
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                  <button
                    className={`pb-2 ${
                      activeTab === 'structure'
                        ? 'border-b-2 border-green-600 text-green-600'
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('structure')}
                  >
                    Structure
                  </button>
                  <button
                    className={`pb-2 ${
                      activeTab === 'lessons'
                        ? 'border-b-2 border-green-600 text-green-600'
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('lessons')}
                  >
                    Lessons
                  </button>
                </div>

                {activeTab === 'structure' && (
                  <div className="space-y-4">
                    {courseLessons?.map((lesson, index) => (
                      <div key={lesson._id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-100 rounded-lg font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{lesson.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{lesson.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
                            <FaClock />
                            <span>{lesson.duration} mins</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'lessons' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courseLessons?.map((lesson) => (
                      <div
                        key={lesson._id}
                        className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600"
                      >
                        <div className="relative">
                          <video
                            src={lesson.video || "/api/placeholder/video.mp4"}
                            poster={lesson.video_thumbnail || "/api/placeholder/400/200"}
                            controls
                            className="w-full h-48 object-cover"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>

                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lesson.description}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <FaUser />
                              <span>For {currentCourse.level}s</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaClock />
                              <span>{lesson.duration} mins</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaFilePdf className="text-red-500" />
                            <a 
                              href={lesson.pdf_note}
                              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View PDF Notes
                            </a>
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <FaCalendarAlt />
                            <span>Created: {new Date(lesson.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top
-4">
              <div className="p-6 space-y-6">
                <div className="relative">
                  <img
                    src={currentCourse.course_thumbnail || "/api/placeholder/600/400"}
                    alt="Course Thumbnail"
                    className="w-full aspect-video rounded-lg object-cover"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                    <img src={currentCourse.tutor?.profile_image} className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white font-bold"></img>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instructor</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{currentCourse.tutor?.full_name}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{offerPrice}</span>
                    <span className="text-gray-500 line-through">₹{currentCourse.price}</span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      {currentCourse.offer_percentage}% off
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/tutor/edit-course/${courseId}`)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition duration-300"
                >
                  EDIT COURSE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {showLogoutModal && (
      <LogoutModal
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    )}
    <Footer />
  </>
);
};

export default CoursePreview;

