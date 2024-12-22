import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTutorAuth } from "../../../Context/TutorAuthContext";
import axiosInterceptor from "@/axiosInstance";
import { ChevronRight, UserCircle2 } from "lucide-react";

const EnrolledStudentsSidebar = ({ onStudentSelect }) => {
  const [studentList, setStudentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { tutor } = useTutorAuth();
  const theme = useSelector((state) => state.theme.theme);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axiosInterceptor.get(
          `/tutor/tutor/students/${tutor.id}`
        );
        console.log("Full response data:", response.data.unread_message_count);

        let processedStudentList = [];
        if (Array.isArray(response.data)) {
          processedStudentList = response.data;
        } else if (response.data && Array.isArray(response.data.users)) {
          processedStudentList = response.data.users;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data ||response.data )
        ) {
          processedStudentList = response.data.data;
        }

        // Add more detailed logging
        processedStudentList = processedStudentList.map((student) => {
          const processedStudent = {
            ...student,
            _id: student._id || student.id || null,
            full_name: student.full_name || student.name || "Unknown Student",
            profileImage: student.profileImage || student.profile_image || null,
            unreadCount: student.unread_message_count || student.unread_count || 0,
          };

          console.log("Processed student:", {
            original: student,
            processed: processedStudent
          });

          return processedStudent;
        });

        setStudentList(processedStudentList);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudentList([]);
        setIsLoading(false);
      }
    };

    if (tutor) {
      fetchStudents();
    }
  }, [tutor]);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student._id);
    onStudentSelect(student._id);
  };

  if (isLoading) {
    return (
      <div
        className={`p-4 ${
          theme === "dark"
            ? "bg-gray-800 text-gray-200"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        Loading students...
      </div>
    );
  }

  return (
    <div
      className={`w-72 h-full ${
        theme === "dark"
          ? "bg-gray-900 text-gray-200 border-r border-gray-700"
          : "bg-white text-gray-800 border-r border-gray-200"
      } overflow-y-auto transition-colors duration-300`}
    >
      <div
        className={`sticky top-0 z-10 ${
          theme === "dark"
            ? "bg-gray-800/80 backdrop-blur-sm"
            : "bg-white/80 backdrop-blur-sm"
        } px-4 py-3 border-b ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h2
          className={`text-xl font-bold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Enrolled Students
        </h2>
      </div>

      {studentList.length === 0 ? (
        <div
          className={`text-center p-6 ${
            theme === "dark" ? "text-gray-500" : "text-gray-400"
          }`}
        >
          No students enrolled yet
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {studentList.map((student) => (
            <li
              key={student._id || student.id}
              className={`relative px-4 py-3 cursor-pointer flex items-center justify-between transition-all duration-200 ease-in-out
                ${
                  selectedStudent === (student._id || student.id)
                    ? theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-green-50 text-green-800"
                    : theme === "dark"
                    ? "hover:bg-gray-800 text-gray-300"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              onClick={() => handleStudentSelect(student)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {student.profileImage ? (
                    <img
                      src={student.profileImage}
                      alt={student.full_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <UserCircle2
                      className={`w-10 h-10 ${
                        theme === "dark" ? "text-gray-600" : "text-gray-400"
                      }`}
                    />
                  )}
                  {/* Always show the notification badge with either actual count or dummy value */}
                  {/* <div
                    className={`absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center rounded-full px-1.5 text-xs font-bold 
                    ${
                      theme === "dark"
                        ? "bg-green-600 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {student.unreadCount}
                  </div> */}
                </div>
                <span className="font-medium truncate max-w-[150px]">
                  {student.full_name}
                </span>
              </div>
              <ChevronRight
                className={`w-5 h-5 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EnrolledStudentsSidebar;