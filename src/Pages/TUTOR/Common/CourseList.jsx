import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInterceptor from "@/axiosInstance";
import { toast } from "sonner";
import { useSelector } from "react-redux";
const TutorCourseList = () => {
  const tutorData = useSelector((state) => state.tutor.tutorData);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInterceptor.get(`/tutor/courses?tutorId=${tutorData.id}`);
        console.log(response);
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
    return <div className="text-center py-10">Loading courses...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!courses || courses.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            No courses found
          </div>
        ) : (
          courses.map((course) => (
            <Link
              key={course._id}
              to={`/tutor/courses/${course._id}/reports`}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={
                  course.course_thumbnail ||
                  "/placeholder.svg?height=200&width=400"
                }
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
                <p className="text-gray-600 mb-2">
                  {course.description?.substring(0, 100) || "No description"}...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {course?.enrolled_count || 0} students
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    ₹{course.price || "N/A"}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default TutorCourseList;
