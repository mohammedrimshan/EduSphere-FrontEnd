import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaPlay,
  FaPause,
  FaExpand,
  FaCompress,
  FaBookmark,
  FaClock,
  FaCheckCircle,
  FaLock,
  FaVolumeMute,
  FaVolumeUp,
  FaDownload,
  FaInfoCircle,
  FaFilePdf,
  FaQuestionCircle,
  FaBars,
  FaEllipsisV,
} from "react-icons/fa";
import { DiReact, DiJavascript1, DiCss3Full, DiHtml5 } from "react-icons/di";
import axiosInterceptor from "@/axiosInstance";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import {
  updateLessonProgress,
  loadUserProgress,
} from "../../Redux/Slices/courseSlice";
import FloatingChatBot from "./Chat/FloatingChatBot";

const EnrolledCourseLessons = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userDatas);
  const reduxLessonProgress = useSelector(
    (state) => state.course.lessonProgress[user?.id] || {}
  );
  const theme = useSelector((state) => state.theme.theme);
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [courseCompletionProgress, setCourseCompletionProgress] = useState(0);
  const [allLessonsCompleted, setAllLessonsCompleted] = useState(false);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axiosInterceptor.get(
          `/user/${user.id}/enrolled-courses/${courseId}`
        );
        setCourse(response.data);
        if (response.data.lessons.length > 0) {
          setCurrentLesson(response.data.lessons[0]);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      }
    };

    if (user && courseId) {
      fetchCourse();
      dispatch(loadUserProgress(user.id));
    }
  }, [user, courseId, dispatch]);

  useEffect(() => {
    const calculateCourseProgress = () => {
      if (course && course.lessons) {
        const totalProgress = course.lessons.reduce((acc, lesson) => {
          return acc + (reduxLessonProgress[lesson._id] || 0);
        }, 0);
        const averageProgress = totalProgress / course.lessons.length;
        setCourseCompletionProgress(Math.round(averageProgress));
      }
    };

    calculateCourseProgress();
  }, [course, reduxLessonProgress]);

  useEffect(() => {
    if (course && course.lessons) {
      console.log("Course lessons:", course.lessons);
      console.log("Redux lesson progress:", reduxLessonProgress);

      const allCompleted = course.lessons.every((lesson) => {
        const progress = reduxLessonProgress[lesson._id] || 0;
        console.log(`Lesson ${lesson._id} progress:`, progress);
        return progress >= 98;
      });

      console.log("All lessons completed:", allCompleted);
      setAllLessonsCompleted(allCompleted);
    }
  }, [course, reduxLessonProgress]);

  const handleLessonClick = async (lesson) => {
    try {
      const response = await axiosInterceptor.get(
        `/user/video-progress/${user.id}/${courseId}/${lesson._id}`
      );

      setCurrentLesson(lesson);
      setIsPlaying(true);

      // Set video to saved position
      if (videoRef.current && response.data.currentTime) {
        videoRef.current.currentTime = response.data.currentTime;
      }

      setProgress(response.data.progress || 0);
    } catch (error) {
      console.error("Error loading video progress:", error);
      setCurrentLesson(lesson);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const downloadPDF = async (pdfUrl, lessonTitle) => {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = `Lesson-${lessonTitle || "Document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };
  const handleProgress = useCallback(async () => {
    if (videoRef.current && currentLesson) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const currentProgress = (currentTime / duration) * 100;

      // Update local state
      setProgress(currentProgress);

      // Only update backend if progress change is significant (e.g., every 1%)
      if (
        Math.abs(
          currentProgress - (reduxLessonProgress[currentLesson._id] || 0)
        ) >= 1
      ) {
        try {
          await axiosInterceptor.post("/user/video-progress/update", {
            userId: user.id,
            courseId: courseId,
            lessonId: currentLesson._id,
            currentTime,
            duration,
            progress: currentProgress,
          });

          // Update Redux store
          dispatch(
            updateLessonProgress({
              lessonId: currentLesson._id,
              progress: currentProgress,
              userId: user.id,
            })
          );
        } catch (error) {
          console.error("Error updating video progress:", error);
        }
      }
    }
  }, [currentLesson, dispatch, user.id, reduxLessonProgress, courseId]);

  const handleDuration = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const seekTo = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const saveProgress = useCallback(() => {
    if (currentLesson && reduxLessonProgress[currentLesson._id]) {
      console.log(
        `Saving progress for lesson ${currentLesson._id}: ${
          reduxLessonProgress[currentLesson._id]
        }%`
      );
    }
  }, [currentLesson, reduxLessonProgress]);

  useEffect(() => {
    return () => {
      saveProgress();
    };
  }, [saveProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener("timeupdate", handleProgress);
      return () => {
        if (video) {
          video.removeEventListener("timeupdate", handleProgress);
        }
      };
    }
  }, [handleProgress]);

  const getIconForLesson = (lesson) => {
    switch (lesson.type) {
      case "react":
        return <DiReact className="text-blue-500" size={24} />;
      case "javascript":
        return <DiJavascript1 className="text-yellow-500" size={24} />;
      case "css":
        return <DiCss3Full className="text-blue-600" size={24} />;
      case "html":
        return <DiHtml5 className="text-red-500" size={24} />;
      default:
        return <FaInfoCircle className="text-gray-500" size={24} />;
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <Header />
      <div className="flex-grow flex">
        {/* Main content with video player */}
        <div className="flex-grow flex flex-col">
          <div
            className="relative bg-black w-full"
            style={{ height: "60vh" }}
            ref={playerRef}
          >
            <video
              ref={videoRef}
              src={currentLesson?.video}
              className="w-full h-full object-contain"
              onTimeUpdate={handleProgress}
              onLoadedMetadata={handleDuration}
              poster={currentLesson?.video_thumbnail}
            />

            {/* Video controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="space-y-2">
                <div
                  className="h-1 bg-gray-600 rounded cursor-pointer group"
                  onClick={seekTo}
                >
                  <div
                    className="h-full bg-green-500 rounded group-hover:bg-green-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="hover:text-gray-300 transition-colors"
                    >
                      {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} />}
                    </button>
                    <button
                      onClick={toggleMute}
                      className="hover:text-gray-300 transition-colors"
                    >
                      {isMuted ? (
                        <FaVolumeMute size={18} />
                      ) : (
                        <FaVolumeUp size={18} />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 accent-green-500"
                    />
                    <span className="text-sm">
                      {formatTime(
                        videoRef.current ? videoRef.current.currentTime : 0
                      )}{" "}
                      / {formatTime(duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleFullscreen}
                      className="hover:text-gray-300 transition-colors"
                    >
                      {isFullscreen ? (
                        <FaCompress size={18} />
                      ) : (
                        <FaExpand size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video info section */}
          <div
            className={`p-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-green-50"
            }`}
          >
            <h1 className="text-xl font-bold mb-2">
              {currentLesson?.title || "Select a lesson to begin"}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {formatTime(duration)} minutes
                  </span>
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    •
                  </span>
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-green-100 hover:bg-green-200"
                  }`}
                >
                  <FaBookmark size={16} />
                  <span>Save</span>
                </button>
                <button
                  className={`p-2 rounded-full ${
                    theme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-green-100"
                  }`}
                >
                  <FaEllipsisV size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* PDF and Quiz section */}
          <div
            className={`p-4 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } border-t ${
              theme === "dark" ? "border-gray-700" : "border-green-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="space-x-4">
                {currentLesson?.pdf_note && (
                  <>
                    <a
                      href={currentLesson.pdf_note}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center px-4 py-2 rounded-md ${
                        theme === "dark"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-green-100 hover:bg-green-200 text-green-800"
                      } transition-colors`}
                    >
                      <FaFilePdf className="mr-2" />
                      View PDF
                    </a>
                    <button
                      onClick={() =>
                        downloadPDF(currentLesson.pdf_note, currentLesson.title)
                      }
                      className={`inline-flex items-center px-4 py-2 rounded-md ${
                        theme === "dark"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                      } transition-colors`}
                    >
                      <FaDownload className="mr-2" />
                      Download PDF
                    </button>
                  </>
                )}
              </div>
              {allLessonsCompleted && (
                <Link
                  to={`/user/quizpreview/${courseId}`}
                  className={`inline-flex items-center px-4 py-2 rounded-md ${
                    theme === "dark"
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                  } transition-colors`}
                >
                  <FaQuestionCircle className="mr-2" />
                  Attend Quiz
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Playlist sidebar */}
        <div
          className={`w-[400px] ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-green-200"
          } border-l overflow-y-auto`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`${
                  theme === "dark" ? "text-white" : "text-gray-800"
                } font-medium`}
              >
                Course Content
              </h2>
              <div
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {courseCompletionProgress}% completed
              </div>
            </div>

            {/* Progress bar */}
            <div
              className={`w-full ${
                theme === "dark" ? "bg-gray-700" : "bg-green-100"
              } rounded-full h-2.5 mb-6`}
            >
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${courseCompletionProgress}%` }}
              />
            </div>

            {/* Lesson list */}
            <div className="space-y-2">
              {course?.lessons.map((lesson, index) => (
                <button
                  key={lesson._id}
                  onClick={() => handleLessonClick(lesson)}
                  className={`w-full flex items-start gap-3 p-2 rounded-lg transition-colors ${
                    currentLesson?._id === lesson._id
                      ? theme === "dark"
                        ? "bg-gray-700"
                        : "bg-green-100"
                      : theme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-green-50"
                  }`}
                >
                  {/* Thumbnail with duration */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        lesson.video_thumbnail ||
                        "/placeholder.svg?height=90&width=160"
                      }
                      alt=""
                      className="w-40 h-24 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
                      {lesson.duration}:00
                    </div>
                    {reduxLessonProgress[lesson._id] >= 100 && (
                      <div className="absolute top-1 right-1">
                        <FaCheckCircle className="text-green-500" size={16} />
                      </div>
                    )}
                  </div>

                  {/* Lesson info */}
                  <div className="flex-grow min-w-0">
                    <h3
                      className={`${
                        theme === "dark" ? "text-white" : "text-gray-800"
                      } text-sm font-medium truncate`}
                    >
                      {index + 1}. {lesson.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getIconForLesson(lesson)}
                      <span
                        className={`${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        } text-xs`}
                      >
                        {lesson.duration} min
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div
                      className={`mt-2 w-full ${
                        theme === "dark" ? "bg-gray-700" : "bg-green-100"
                      } rounded-full h-1`}
                    >
                      <div
                        className="bg-green-500 h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${reduxLessonProgress[lesson._id] || 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <FloatingChatBot courseId={courseId} />
      <Footer />
    </div>
  );
};

export default EnrolledCourseLessons;
