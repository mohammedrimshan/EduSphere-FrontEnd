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
  const theme = useSelector((state) => state.theme.theme);
  
  const fetchCourses = async () => {
    if (!tutorData?.id) return;
    
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
  }, [tutorData?.id]);

  const handleAddQuiz = (courseId) => {
    if (courseId) navigate(`/tutor/quizadd/${courseId}`);
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
      <div className={`w-full min-h-screen flex justify-center items-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto p-6">
          <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Quiz</h1>
          <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No courses available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Quiz
          </h1>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Sort By
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`border rounded-md p-2 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {getSortedCourses().map((course, index) => (
            <div 
              key={course._id || `course-${index}`} 
              className={`${
                theme === 'dark' 
                  ? 'bg-gray-800 shadow-dark' 
                  : 'bg-white shadow-md'
              } rounded-lg p-6`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {typeof course.title === 'string' ? course.title : 'Untitled Course'}
                    </h3>
                    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold mt-1 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {typeof course.category.title === 'string' ? course.category?.title : 'No Category'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddQuiz(course._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Add Quiz
                  </button>
                  <button
                    onClick={() => navigateToQuiz(course._id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors"
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
    </div>
  );
}