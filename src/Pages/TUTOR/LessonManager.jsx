import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { X } from "lucide-react";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiVideo,
  FiClock,
  FiBook,
  FiFileText,
  FiImage,
  FiCheck,
  FiX,
} from "react-icons/fi";
import TutorHeader from "./Common/Header";
import Footer from "../USER/Common/Footer";
import { logoutTutor } from "@/Redux/Slices/tutorSlice";
import { BsCameraVideo, BsClipboardCheck } from "react-icons/bs";
import {
  MdDashboard,
  MdOutlinePerson,
  MdLibraryBooks,
  MdAttachMoney,
  MdReport,
} from "react-icons/md";
import LogoutModal from "@/ui/LogOutModal";
import { toast } from "sonner";
import Sidebar from "@/ui/sideBar";
import "./Common/Main.css";
import {
  setCourses,
  setError,
  setLoading,
  addLessonToCourse,
  updateLesson,
  deleteLesson,
} from "@/Redux/Slices/courseSlice";
import DeleteConfirmationModal from "./Common/DeleteModal";
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

const LessonManager = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const tutorData = useSelector((state) => state.tutor.tutorData);
  const theme = useSelector((state) => state.theme.theme);
  const courseDatas = useSelector((state) => state.course.courseDatas);
  const [course, setCourse] = useState(() =>
    courseDatas?.find((c) => c._id === courseId)
  );
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const API_BASE_URL =  "https://edusphere-backend.rimshan.in";

  const videoRef = useRef(null);
  const thumbnailRef = useRef(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    if (courseId) {
      fetchLessons(courseId);
      const currentCourse = courseDatas?.find((c) => c._id === courseId);
      if (currentCourse) {
        setCourse(currentCourse);
      }
    }
  }, [courseId, courseDatas]);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInterceptor.get(`/tutor/lessons/${courseId}`);
      const fetchedLessons = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setLessons(fetchedLessons);
      setCourse((prevCourse) => ({
        ...prevCourse,
        lessons: fetchedLessons,
      }));
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to fetch lessons");
      setLessons([]);
      setCourse((prevCourse) => ({
        ...prevCourse,
        lessons: [],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video file size should be less than 100MB");
        return;
      }
      setVideoFile(file);
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
    } else {
      setVideoPreview(null);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Thumbnail size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCropperImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add handler for cropped image
  const handleCroppedImage = (blob) => {
    setVideoThumbnail(blob);
    setThumbnailPreview(URL.createObjectURL(blob));
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("PDF file size should be less than 10MB");
        return;
      }
      setPdfFile(file);
    }
  };

  const uploadFile = async (file, uploadType) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "edusphere");
    formData.append("cloud_name", "edusphere");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/edusphere/${uploadType}/upload`
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error("Upload failed"));
        }
      };

      xhr.onerror = function () {
        reject(new Error("Upload failed"));
      };

      xhr.send(formData);
    });
  };

  const addLesson = async (e) => {
    e.preventDefault();

    if (
      !title.trim() ||
      !duration ||
      !description.trim() ||
      !videoFile ||
      !videoThumbnail ||
      !pdfFile
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    dispatch(setLoading(true));
    setUploadProgress(0);

    try {
      const uploadToast = toast.loading("Uploading files...");

      const [videoUrl, thumbnailUrl, pdfUrl] = await Promise.all([
        uploadFile(videoFile, "video"),
        uploadFile(videoThumbnail, "image"),
        uploadFile(pdfFile, "raw"),
      ]);

      if (!videoUrl || !thumbnailUrl || !pdfUrl) {
        throw new Error("File upload failed");
      }

      toast.loading("Creating lesson...", { id: uploadToast });

      const lessonData = {
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
        video: videoUrl,
        video_thumbnail: thumbnailUrl,
        pdf_note: pdfUrl,
        tutor: tutorData?.id,
      };

      const response = await axiosInterceptor.post(
        `/tutor/addlesson/${courseId}`,
        lessonData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        const newLesson = response.data.data.lesson;
        toast.success("Lesson added successfully!", { id: uploadToast });

        dispatch(addLessonToCourse({ courseId, lesson: newLesson }));

        setLessons((prevLessons) => [...prevLessons, newLesson]);

        setCourse((prevCourse) => ({
          ...prevCourse,
          lessons: [...(prevCourse.lessons || []), newLesson],
        }));

        resetForm();
      } else {
        throw new Error(response.data.message || "Failed to add lesson");
      }
    } catch (error) {
      console.error("Error adding lesson:", error);
      const errorMessage = error.response?.data?.message || error.message;
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
      setUploadProgress(0);
    }
  };

  const handleCourseSubmit = async () => {
    if (!course?.lessons?.length) {
      toast.error(
        "Please add at least one lesson before submitting the course"
      );
      return;
    }

    setIsSubmittingCourse(true);
    try {
      const response = await axiosInterceptor.post(
        `/tutor/submit-course/${courseId}`,
        {
          lessons: course.lessons.map((lesson) => lesson._id),
        }
      );

      if (response.data.success) {
        toast.success("Course submitted successfully!");
        navigate("/tutor/courses");
      } else {
        throw new Error(response.data.message || "Failed to submit course");
      }
    } catch (error) {
      console.error("Error submitting course:", error);
      toast.error(error.message);
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDuration("");
    setDescription("");
    setVideoFile(null);
    setVideoThumbnail(null);
    setPdfFile(null);
    setVideoPreview(null);
    setThumbnailPreview(null);
    setPdfPreview(null);
    if (videoRef.current) videoRef.current.value = "";
    if (thumbnailRef.current) thumbnailRef.current.value = "";
    if (pdfRef.current) pdfRef.current.value = "";
    setUploadProgress(0);

    // Reset editing states
    setIsEditing(false);
    setEditingLessonId(null);
  };

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

  const handleEditClick = (lesson) => {
    setEditingLessonId(lesson._id);
    setIsEditing(true);
    setTitle(lesson.title);
    setDuration(lesson.duration);
    setDescription(lesson.description);
    setVideoPreview(lesson.video);
    setThumbnailPreview(lesson.video_thumbnail);
    setPdfPreview(lesson.pdf_note);
    setVideoFile(null);
    setVideoThumbnail(null);
    setPdfFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingLessonId(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !duration || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    dispatch(setLoading(true));
    setUploadProgress(0);

    try {
      const uploadToast = toast.loading(
        isEditing ? "Updating lesson..." : "Uploading files..."
      );

      let videoUrl, thumbnailUrl, pdfUrl;

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, "video");
      }
      if (videoThumbnail) {
        thumbnailUrl = await uploadFile(videoThumbnail, "image");
      }
      if (pdfFile) {
        pdfUrl = await uploadFile(pdfFile, "raw");
      }

      if (isEditing) {
        const currentLesson = course.lessons.find(
          (l) => l._id === editingLessonId
        );
        if (!videoUrl) videoUrl = currentLesson.video;
        if (!thumbnailUrl) thumbnailUrl = currentLesson.video_thumbnail;
        if (!pdfUrl) pdfUrl = currentLesson.pdf_note;
      }

      const lessonData = {
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
        video: videoUrl,
        video_thumbnail: thumbnailUrl,
        pdf_note: pdfUrl,
        tutor: tutorData?.id,
      };

      let response;
      if (isEditing) {
        response = await axiosInterceptor.put(
          `/tutor/lessons/${editingLessonId}`,
          lessonData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        response = await axiosInterceptor.post(
          `/tutor/addlesson/${courseId}`,
          lessonData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (response.data.success) {
        toast.success(
          isEditing
            ? "Lesson updated successfully!"
            : "Lesson added successfully!",
          { id: uploadToast }
        );

        if (isEditing) {
          dispatch(
            updateLesson({
              courseId,
              lessonId: editingLessonId,
              updatedLesson: response.data.data.lesson,
            })
          );
          setCourse((prevCourse) => ({
            ...prevCourse,
            lessons: prevCourse.lessons.map((lesson) =>
              lesson._id === editingLessonId
                ? response.data.data.lesson
                : lesson
            ),
          }));
        } else {
          dispatch(
            addLessonToCourse({ courseId, lesson: response.data.data.lesson })
          );
          setCourse((prevCourse) => ({
            ...prevCourse,
            lessons: [...(prevCourse.lessons || []), response.data.data.lesson],
          }));
        }

        resetForm();
        setIsEditing(false);
        setEditingLessonId(null);
      } else {
        throw new Error(
          response.data.message ||
            `Failed to ${isEditing ? "update" : "add"} lesson`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "adding"} lesson:`,
        error
      );
      const errorMessage = error.response?.data?.message || error.message;
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
      setUploadProgress(0);
    }
  };

  const handleDeleteClick = (lesson) => {
    setLessonToDelete(lesson);
    setDeleteModalOpen(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      if (!lessonId) return;

      console.log("Deleting lesson with ID:", lessonId);

      const response = await axiosInterceptor.delete(
        `/tutor/lessons/${lessonId}`
      );

      if (response.data.success) {
        toast.success("Lesson deleted successfully");

        dispatch(deleteLesson({ courseId, lessonId }));

        setLessons((prevLessons) =>
          prevLessons.filter((lesson) => lesson._id !== lessonId)
        );

        setCourse((prevCourse) => ({
          ...prevCourse,
          lessons: prevCourse.lessons.filter(
            (lesson) => lesson._id !== lessonId
          ),
        }));
      } else {
        throw new Error(response.data.message || "Failed to delete lesson");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      let errorMessage = "Failed to delete lesson";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Error ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }
      toast.error(errorMessage);
    } finally {
      setDeleteModalOpen(false);
      setLessonToDelete(null);
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

  const bgClass =
    theme === "dark"
      ? "min-h-screen bg-gray-900 text-gray-100"
      : "min-h-screen bg-green-50 text-gray-900";
  const cardClass =
    theme === "dark"
      ? "bg-gray-800 shadow rounded-lg p-6 mb-8 text-gray-100 border border-gray-700"
      : "bg-white shadow rounded-lg p-6 mb-8";
  const inputClass =
    theme === "dark"
      ? "block w-full pl-10 border-gray-700 p-3 rounded-md bg-gray-700 text-gray-100 focus:ring-green-500 focus:border-green-500"
      : "block w-full pl-10 border-green-300 p-3 rounded-md focus:ring-green-500 focus:border-green-500";
  const textColorClass = theme === "dark" ? "text-green-400" : "text-green-800";
  const labelColorClass =
    theme === "dark" ? "text-green-300" : "text-green-700";
  const iconColorClass = theme === "dark" ? "text-green-500" : "text-green-400";

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
      <div className={bgClass}>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className={cardClass}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-semibold ${textColorClass}`}>
                  {isEditing ? "Edit Lesson" : "Add New Lesson"}
                </h2>
                {isEditing && (
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center text-red-500 hover:text-red-700"
                  >
                    <FiX className="mr-2" /> Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <label
                    htmlFor="title"
                    className={`block text-sm font-medium ${labelColorClass}`}
                  >
                    Lesson Title
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBook className={`h-5 w-5 ${iconColorClass}`} />
                    </div>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={inputClass}
                      placeholder="Enter lesson title"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="duration"
                    className={`block text-sm font-medium ${labelColorClass}`}
                  >
                    Lesson Duration (in minutes)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className={`h-5 w-5 ${iconColorClass}`} />
                    </div>
                    <input
                      type="number"
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={inputClass}
                      placeholder="Enter lesson duration"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label
                    htmlFor="description"
                    className={`block text-sm font-medium ${labelColorClass}`}
                  >
                    Lesson Description
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none">
                      <FiFileText className={`h-5 w-5 ${iconColorClass}`} />
                    </div>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`${inputClass} h-24 pl-10 pt-3 resize-none`}
                      placeholder="Enter lesson description"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium ${labelColorClass} mb-2`}
                    >
                      Upload Video
                    </label>
                    <div
                      className={`flex items-center justify-center px-6 pt-5 pb-6 border-2 ${
                        theme === "dark"
                          ? "border-gray-700"
                          : "border-green-300"
                      } border-dashed rounded-md ${
                        videoPreview ? "hidden" : ""
                      }`}
                    >
                      <div className="space-y-1 text-center">
                        <FiVideo
                          className={`mx-auto h-12 w-12 ${iconColorClass}`}
                        />
                        <div
                          className={`flex text-sm ${
                            theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        >
                          <label
                            htmlFor="video-upload"
                            className="relative cursor-pointer rounded-md font-medium"
                          >
                            <span>Upload a video</span>
                            <input
                              id="video-upload"
                              name="video-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleVideoChange}
                              accept="video/*"
                              ref={videoRef}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    {videoPreview && (
                      <div className="mt-4">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full h-auto rounded-md"
                        >
                          Your browser does not support the video tag.
                        </video>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoPreview(null);
                            setVideoFile(null);
                            if (videoRef.current) videoRef.current.value = "";
                          }}
                          className="mt-2 text-red-500 hover:text-red-700"
                        >
                          Remove Video
                        </button>
                      </div>
                    )}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Uploading: {Math.round(uploadProgress)}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${labelColorClass} mb-2`}
                    >
                      Upload Video Thumbnail
                    </label>
                    <div
                      className={`flex items-center justify-center px-6 pt-5 pb-6 border-2 ${
                        theme === "dark"
                          ? "border-gray-700"
                          : "border-green-300"
                      } border-dashed rounded-md ${
                        videoThumbnail ? "hidden" : ""
                      }`}
                    >
                      <div className="space-y-1 text-center">
                        <FiImage
                          className={`mx-auto h-12 w-12 ${iconColorClass}`}
                        />
                        <div
                          className={`flex text-sm ${
                            theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        >
                          <label
                            htmlFor="thumbnail-upload"
                            className={`relative cursor-pointer rounded-md font-medium 
                              ${
                                theme === "dark"
                                  ? "text-green-400 hover:text-green-300"
                                  : "text-green-600 hover:text-green-500"
                              } 
                              focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500`}
                          >
                            <span>Upload a thumbnail</span>
                            <input
                              id="thumbnail-upload"
                              name="thumbnail-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleThumbnailChange}
                              accept="image/*"
                              ref={thumbnailRef}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    {videoThumbnail && (
                      <div className="mt-4">
                        <img
                          src={URL.createObjectURL(videoThumbnail)}
                          alt="Video Thumbnail"
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${labelColorClass} mb-2`}
                    >
                      Upload PDF notes
                    </label>
                    <div
                      className={`flex items-center justify-center px-6 pt-5 pb-6 border-2 ${
                        theme === "dark"
                          ? "border-gray-700"
                          : "border-green-300"
                      } border-dashed rounded-md ${pdfFile ? "hidden" : ""}`}
                    >
                      <div className="space-y-1 text-center">
                        <FiFileText
                          className={`mx-auto h-12 w-12 ${iconColorClass}`}
                        />
                        <div
                          className={`flex text-sm ${
                            theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        >
                          <label
                            htmlFor="pdf-upload"
                            className={`relative cursor-pointer rounded-md font-medium 
                              ${
                                theme === "dark"
                                  ? "text-green-400 hover:text-green-300"
                                  : "text-green-600 hover:text-green-500"
                              } 
                              focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-ring-green-500`}
                          >
                            <span>Upload PDF notes</span>
                            <input
                              id="pdf-upload"
                              name="pdf-upload"
                              type="file"
                              className="sr-only"
                              onChange={handlePdfChange}
                              accept="application/pdf"
                              ref={pdfRef}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    {pdfFile && (
                      <p className="mt-2 text-sm text-green-600">
                        PDF uploaded: {pdfFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                      theme === "dark"
                        ? "bg-green-700 text-white hover:bg-green-600"
                        : "bg-green-600 text-white hover:bg-green-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      isEditing ? (
                        "Updating Lesson..."
                      ) : (
                        "Adding Lesson..."
                      )
                    ) : (
                      <>
                        <FiPlus className="mr-2" />{" "}
                        {isEditing ? "Update Lesson" : "Add Lesson"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className={cardClass}>
              <h2 className={`text-2xl font-semibold ${textColorClass} mb-6`}>
                Lessons ({course?.lessons?.length || 0})
              </h2>
              {!course?.lessons || course.lessons.length === 0 ? (
                <p
                  className={`${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}
                >
                  No lessons added yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {course?.lessons?.map((lesson) => (
                    <li
                      key={lesson._id}
                      className={`${
                        theme === "dark" ? "bg-gray-700" : "bg-green-50"
                      } rounded-lg p-4 flex justify-between items-start`}
                    >
                      <div className="flex-grow">
                        <h3
                          className={`text-lg font-medium ${
                            theme === "dark"
                              ? "text-green-300"
                              : "text-green-800"
                          }`}
                        >
                          {lesson.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        >
                          Duration: {lesson.duration} minutes
                        </p>
                        <p
                          className={`text-sm ${
                            theme === "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          } mt-2`}
                        >
                          Description: {lesson.description}
                        </p>
                        <div className="mt-4 flex space-x-4">
                          <video
                            src={lesson.video}
                            controls
                            className="w-48 h-auto rounded-md"
                          >
                            Your browser does not support the video tag.
                          </video>
                          <img
                            src={lesson.video_thumbnail}
                            alt="Video Thumbnail"
                            className="w-48 h-auto rounded-md"
                          />
                          {lesson.pdf_note && (
                            <a
                              href={lesson.pdf_note}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              View PDF
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteClick(lesson)}
                          className={`p-2 ${
                            theme === "dark"
                              ? "text-red-400 hover:bg-red-900"
                              : "text-red-600 hover:bg-red-100"
                          } rounded-full transition duration-300`}
                          aria-label="Delete lesson"
                        >
                          <FiTrash2 />
                        </button>
                        <button
                          onClick={() => handleEditClick(lesson)}
                          className={`p-2 ${
                            theme === "dark"
                              ? "text-blue-400 hover:bg-blue-900"
                              : "text-blue-600 hover:bg-blue-100"
                          } rounded-full transition duration-300`}
                          aria-label="Edit lesson"
                        >
                          <FiEdit2 />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleCourseSubmit}
              disabled={isSubmittingCourse || !course?.lessons?.length}
              className={`flex items-center px-4 py-2 rounded-md ${
                theme === "dark"
                  ? "bg-green-700 text-white hover:bg-green-600"
                  : "bg-green-600 text-white hover:bg-green-700"
              } ${
                isSubmittingCourse || !course?.lessons?.length
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <FiCheck className="mr-2" />
              {isSubmittingCourse ? "Submitting..." : "Submit Course"}
            </button>
          </div>
        </main>
      </div>
      <CropperModal
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        image={cropperImage}
        onCropComplete={handleCroppedImage}
        theme={theme}
      />
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => handleDeleteLesson(lessonToDelete?._id)}
        theme={theme}
      />
      <Footer />
    </>
  );
};

export default LessonManager;
