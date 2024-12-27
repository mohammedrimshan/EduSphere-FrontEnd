import React, { useState, useEffect } from 'react';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';
import axiosInterceptor from "@/axiosInstance";
import { toast } from "sonner";
import axios from 'axios';

const CourseCard = ({ course }) => {
  // Calculate offer price
  const offerPrice = course.price - (course.price * (course.offer_percentage || 0) / 100);
  
  return (
    <div className="flex-none w-[300px] h-[350px] border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col">
      <img
        alt={course.title}
        className="w-full h-40 object-cover"
        src={course.course_thumbnail || "/placeholder.svg?height=160&width=300"}
      />
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
          <div className="flex items-center gap-2">
            <img
              alt={course.tutor?.full_name || "Tutor"}
              className="w-8 h-8 rounded-full"
              src={course.tutor?.profile_image || "/placeholder.svg?height=32&width=32"}
            />
            <p className="text-sm text-gray-600 truncate">{course.tutor?.full_name || "Unknown Tutor"}</p>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${star <= (course.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
              />
            ))}
            <span className="text-sm text-gray-600">({course.reviews?.length || 0})</span>
          </div>
        </div>
        <div className="mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-green-500 font-semibold">₹{Math.round(offerPrice)}</span>
            {course.offer_percentage > 0 && (
              <>
                <span className="text-gray-400 line-through text-sm">₹{course.price}</span>
                <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                  {course.offer_percentage}% OFF
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScrollableSection = ({ title, courses, showAll, onToggle }) => (
  <section className="container mx-auto px-4 py-12">
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          onClick={onToggle}
          className="text-green-500 hover:underline flex items-center gap-1"
        >
          {showAll ? "Show Less" : "See All"}
        </button>
      </div>
      <div className={`
        ${showAll 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" 
          : "flex overflow-x-auto gap-6 pb-4 hide-scrollbar"
        }
      `}>
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  </section>
);

const CourseSections = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllTopCourses, setShowAllTopCourses] = useState(false);
  const [showAllHighRated, setShowAllHighRated] = useState(false);
  const [showAllNewCourses, setShowAllNewCourses] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`https://edusphere-backend.rimshan.in/user/coursesland`, {
        withCredentials: true
      });
      
      if (response.data && response.data.courses) {
        const filteredCourses = response.data.courses.filter(
          course => !course.isBanned
        );
        setCourses(filteredCourses);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  // Sort courses by different criteria
  const topRatedCourses = [...courses]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 8);

  const highRatedCourses = courses
    .filter(course => (course.rating || 0) >= 4)
    .slice(0, 8);

  const newCourses = [...courses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  return (
    <div className="space-y-12">
      <ScrollableSection
        title="Top Rated Courses"
        courses={topRatedCourses}
        showAll={showAllTopCourses}
        onToggle={() => setShowAllTopCourses(!showAllTopCourses)}
      />
  
      
      <ScrollableSection
        title="New Courses"
        courses={newCourses}
        showAll={showAllNewCourses}
        onToggle={() => setShowAllNewCourses(!showAllNewCourses)}
      />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CourseSections;

