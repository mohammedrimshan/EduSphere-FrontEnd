import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEye } from 'react-icons/fa';
import axiosInterceptor from '@/axiosInstance';
import { toast } from 'sonner';
import { setCourses } from '@/Redux/Slices/courseSlice';

export default function QuizPage() {
  const [sortBy, setSortBy] = useState('relevance');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tutorData = useSelector((state) => state.tutor.tutorData);
  const courses = useSelector((state) => state.course.courseDatas);
  
  console.log(courses)
  const fetchCourses = async () => {
    if (!tutorData?.id) return; // Guard clause for tutorData
    
    try {
      setLoading(true);
      const response = await axiosInterceptor.get(`/tutor/courses?tutorId=${tutorData.id}`);
      
      if (response.data.success) {
        dispatch(setCourses({
          courses: response.data.courses,
          isTutor: true
        }));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(error.response?.data?.message || 'Error fetching courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [tutorData?.id]); // More specific dependency

  const handleAddQuiz = (courseId) => {
    if (courseId) navigate(`/tutor/quizadd/${courseId}`);
  };

  const handlePreviewQuiz = (courseId) => {
    if (courseId) navigate(`/tutor/courses/${courseId}/quiz`);
  };
  const navigateToQuiz = (courseId) => {
    if (courseId) {
      navigate(`/tutor/courses/${courseId}/quiz`);
    } else {
      console.error("courseId is undefined.");
    }
  };
  
  const getSortedCourses = () => {
    if (!Array.isArray(courses)) return [];
    
    const sortedCourses = [...courses];
    switch (sortBy) {
      case 'newest':
        return sortedCourses.sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      case 'oldest':
        return sortedCourses.sort((a, b) => 
          new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      default:
        return sortedCourses;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If no courses are available, show a message
  if (!courses.length) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Quiz</h1>
        <div className="text-center text-gray-500">No courses available</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quiz</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {getSortedCourses().map((course, index) => (
          <div key={course._id || `course-${index}`} className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-400">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {typeof course.title === 'string' ? course.title : 'Untitled Course'}
                  </h3>
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mt-1">
                    {typeof course.category.title === 'string' ? course.category?.title : 'No Category'}
                  </span>
                </div>
                {/* <div className="text-sm text-gray-500">
                  {(course.lessons || []).reduce((total, lesson) => {
                    return total + (lesson?.quiz?.questions?.length || 0);
                  }, 0)} Questions
                </div> */}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddQuiz(course._id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Add Quiz
                </button>
                <button
                  onClick={() => navigateToQuiz(course._id)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  <FaEye className="mr-2" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}