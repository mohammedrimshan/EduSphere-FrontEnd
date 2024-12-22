import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInterceptor from "@/axiosInstance";
import {
  FaBars,
  FaSun,
  FaMoon,
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
  FaVideo,
  FaFile,
  FaQuestionCircle,
  FaDownload,
  FaPlay,
  FaPause,
} from "react-icons/fa";
import Sidebar from "./Common/AdminSideBar";

const AdminCourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInterceptor.get(`/admin/courses/${courseId}`);
        if (response.data.success) {
          setCourse(response.data.course);
        } else {
          throw new Error(response.data.message || "Failed to fetch course details");
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error(error.message || "Failed to fetch course details");
        navigate("/admin/reported-courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
  }, [courseId, navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
  };

  const handleBack = () => {
    navigate("/admin/reported-courses");
  };

  const handleVideoPlay = (videoUrl) => {
    setCurrentVideo(videoUrl);
    setIsPlaying(true);
  };

  const toggleVideoPlay = () => {
    const video = document.getElementById('lesson-video');
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownloadPdf = (pdfUrl, title) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title.replace(/\s+/g, '_')}_notes.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div
        className={`fixed lg:relative sidebar z-20 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-64`}
      >
        <Sidebar isDarkMode={isDarkMode} />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 lg:hidden z-10"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 p-4 lg:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden mr-4 text-gray-600 dark:text-gray-300"
            >
              <FaBars size={24} />
            </button>
            <button
              onClick={handleBack}
              className={`mr-4 flex items-center ${
                isDarkMode ? "text-gray-300 hover:text-gray-100" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FaArrowLeft size={20} className="mr-2" />
              Back
            </button>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              isDarkMode
                ? "bg-gray-700 text-yellow-400"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
        </div>

        {course && (
          <div className={`rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} p-6`}>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-6 mb-4">
                <div className="md:w-1/3">
                  <img
                    src={course.course_thumbnail}
                    alt={course.title}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
                <div className="md:w-2/3">
                  <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    {course.title}
                  </h1>
                  <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-2`}>
                    Category: {course.category?.title}
                  </div>
                  <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-2`}>
                    Duration: {course.duration} hours
                  </div>
                  {course.isBanned && (
                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                      <p className="font-semibold">Banned Course</p>
                      <p>Reason: {course.banReason}</p>
                      <p>Banned Date: {new Date(course.bannedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Tutor Information
                </h2>
                <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  <p>Name: {course.tutor?.full_name}</p>
                  <p>Email: {course.tutor?.email}</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Course Status
                </h2>
                <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  <p>Listed: {course.listed ? "Yes" : "No"}</p>
                  <p>Blocked: {course.isBlocked ? "Yes" : "No"}</p>
                  <p>Price: ${course.price}</p>
                  <p>Enrolled Count: {course.enrolled_count}</p>
                  <p>Average Rating: {course.average_rating}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Course Description
              </h2>
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                {course.description}
              </p>
            </div>

            {currentVideo && (
              <div className="mb-6">
                <div className="relative">
                  <video
                    id="lesson-video"
                    src={currentVideo}
                    className="w-full rounded-lg"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <button
                    onClick={toggleVideoPlay}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-4 text-white hover:bg-opacity-70"
                  >
                    {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Course Content
              </h2>
              <div className="space-y-4">
                {course.lessons?.map((lesson) => (
                  <div
                    key={lesson._id}
                    className={`rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <button
                      onClick={() => toggleLesson(lesson._id)}
                      className={`w-full p-4 flex items-center justify-between text-left ${
                        isDarkMode ? "text-white hover:bg-gray-600" : "text-gray-800 hover:bg-gray-100"
                      } rounded-lg transition-colors duration-200`}
                    >
                      <div className="flex items-center">
                        <FaVideo className="mr-2" />
                        <span>{lesson.title}</span>
                      </div>
                      {expandedLessons[lesson._id] ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    {expandedLessons[lesson._id] && (
                      <div className={`p-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        <p className="text-sm mb-4">{lesson.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <img
                              src={lesson.video_thumbnail}
                              alt={`${lesson.title} thumbnail`}
                              className="w-full h-48 object-cover rounded-lg cursor-pointer"
                              onClick={() => handleVideoPlay(lesson.video)}
                            />
                          </div>
                          {lesson.pdf_note && (
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleDownloadPdf(lesson.pdf_note, lesson.title)}
                                className={`flex items-center px-4 py-2 rounded-lg ${
                                  isDarkMode
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                }`}
                              >
                                <FaDownload className="mr-2" />
                                Download PDF Notes
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-sm">
                          <FaFile className="mr-1" />
                          <span>Duration: {lesson.duration} minutes</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {course.quiz && (
                  <div className={`rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"} p-4`}>
                    <div className="flex items-center">
                      <FaQuestionCircle className={`mr-2 ${isDarkMode ? "text-white" : "text-gray-800"}`} />
                      <span className={`${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        Course Quiz
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseDetails;