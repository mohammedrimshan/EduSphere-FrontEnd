import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInterceptor from "@/axiosInstance";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const TutorCourseList = () => {
  const tutorData = useSelector((state) => state.tutor.tutorData);
  const theme = useSelector((state) => state.theme.theme);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInterceptor.get(`/tutor/courses?tutorId=${tutorData.id}`);
        if (response.data.success) {
          setCourses(response.data.courses);
        } else {
          throw new Error(response.data.message || "Failed to fetch courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error(error.message || "Failed to fetch courses");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className={`w-full text-center py-10 ${theme === 'dark' ? 'text-gray-200 bg-gray-900' : 'text-gray-800 bg-gray-50'}`}>
        Loading courses...
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Your Courses
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!courses || courses.length === 0 ? (
            <div className={`col-span-full text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No courses found
            </div>
          ) : (
            courses.map((course) => (
              <Link
                key={course._id}
                to={`/tutor/courses/${course._id}/reports`}
                className={`${
                  theme === 'dark' 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-50'
                } shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300`}
              >
                <img
                  src={course.course_thumbnail || "/placeholder.svg?height=200&width=400"}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className={`text-xl font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {course.title}
                  </h2>
                  <p className={`mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {course.description?.substring(0, 100) || "No description"}...
                  </p>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {course?.enrolled_count || 0} students
                    </span>
                    <span className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      ₹{course.price || "N/A"}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorCourseList;