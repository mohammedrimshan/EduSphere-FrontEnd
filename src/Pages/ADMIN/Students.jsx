import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInterceptor from "@/axiosInstance";
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaLock,
  FaBars,
  FaMoon,
  FaLockOpen,
  FaSync,
} from "react-icons/fa";
import avatar from "@/assets/avt.webp";
import Sidebar from "./Common/AdminSideBar";
import { logoutAdmin } from "@/Redux/Slices/adminSlice";

const Students = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const studentsPerPage = 5;

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    dispatch(logoutAdmin());
    setIsLogoutModalOpen(false);
    toast.success("Logged out successfully!", {
      duration: 3000,
      onAutoClose: () => navigate("/admin/adminlogin"),
    });
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const fetchCourses = async () => {
    try {
      const response = await axiosInterceptor.get('/admin/courses', {
        withCredentials: true
      });
      if (response.data.success && Array.isArray(response.data.courses)) {
        setCourses(response.data.courses);
      } else {
        console.error("Unexpected courses data structure:", response.data);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
      setCourses([]);
    }
  }

  const getCourseName = useCallback((courseId) => {
    if (!Array.isArray(courses) || courses.length === 0) {
      return 'Unknown Course';
    }
    const course = courses.find(c => c._id === courseId);
    return course ? course.title : 'Unknown Course';
  }, [courses]);
  
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInterceptor.get(`/admin/users`, {
        withCredentials: true,
      });
      const transformedData = response.data.map((user) => ({
        id: user.user_id,
        name: user.full_name || "N/A",
        avatar: user.profileImage || avatar,
        courses: user.courses || [],
        status: user.status ? "Active" : "Inactive",
        isBlocked: !user.status,
      }));
      setStudents(transformedData);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBlockStatus = async (userId) => {
    try {
      const response = await axiosInterceptor.patch(
        `/admin/users/${userId}/toggle-status`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.id === userId
              ? {
                  ...student,
                  isBlocked: !student.isBlocked,
                  status: student.isBlocked ? "Active" : "Inactive",
                }
              : student
          )
        );
        toast.success(response.data.message);
      } else {
        throw new Error(
          response.data.message || "Failed to update student status"
        );
      }
    } catch (error) {
      console.error("Error toggling student status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update student status"
      );
    }
  };
 
  useEffect(() => {
    fetchStudents();
    fetchCourses();
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        student.id.includes(debouncedSearchQuery) ||
        (student.course && student.course.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    );
  }, [students, debouncedSearchQuery]);

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const renderTableBody = () => {
    if (!Array.isArray(currentStudents)) {
      return null;
    }
    return currentStudents.map((student, index) => (
      <tr key={student.id} className={`${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} flex flex-col mb-4 sm:table-row`}>
        <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
          <span className="font-bold sm:hidden mr-2">S1:</span>
          {indexOfFirstStudent + index + 1}
        </td>
        <td className="px-3 py-2 sm:py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <img className="h-10 w-10 rounded-full" src={student.avatar} alt="" />
            </div>
            <div className="ml-4">
              <div className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>
                <span className="font-bold sm:hidden mr-2">Name:</span>
                {student.name}
              </div>
            </div>
          </div>
        </td>
        <td className={`px-3 py-2 sm:py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
          <span className="font-bold sm:hidden mr-2">ID:</span>
          {student.id}
        </td>
        <td className={`px-3 py-2 sm:py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
          <span className="font-bold sm:hidden mr-2">Courses:</span>
          {Array.isArray(student.courses) && student.courses.length > 0 ? (
            student.courses.map((courseInfo, idx) => (
              <div key={idx}>{getCourseName(courseInfo.course)}</div>
            ))
          ) : (
            <div>No courses</div>
          )}
        </td>
        <td className="px-3 py-2 sm:py-4 whitespace-nowrap">
          <span className="font-bold sm:hidden mr-2">Status:</span>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            student.status === "Active"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}>
            {student.status}
          </span>
        </td>
        <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
          <span className="font-bold sm:hidden mr-2">Action:</span>
          <button
            onClick={() => toggleBlockStatus(student.id)}
            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
              student.isBlocked
                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
            }`}
          >
            {student.isBlocked ? (
              <>
                <FaLockOpen className="mr-1" />
                Unblock
              </>
            ) : (
              <>
                <FaLock className="mr-1" />
                Block
              </>
            )}
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div
        className={`fixed lg:relative sidebar z-20 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg transition-transform duration-300 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:w-64`}
      >
        <Sidebar isDarkMode={isDarkMode} onLogout={handleLogout} />
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
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Students
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchStudents}
              className={`p-2 rounded-full ${
                isDarkMode
                  ? "bg-gray-700 text-blue-400"
                  : "bg-gray-100 text-blue-600"
              }`}
              title="Refresh student list"
            >
              <FaSync size={20} />
            </button>
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
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full sm:w-72">
            <FaSearch
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search Students"
              className={`w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border border-gray-300 text-gray-900"
              }`}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <button
            className={`w-full sm:w-auto px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isDarkMode
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FaFilter className="inline-block mr-2" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <tr className="hidden sm:table-row">
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">S1</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Student Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Student ID</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Courses Purchased</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Status</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "bg-gray-800 divide-gray-700 text-gray-300" : "bg-white divide-gray-200"}`}>
                  {renderTableBody()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Showing {indexOfFirstStudent + 1} to {Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} entries
          </div>
          <div className="flex justify-center gap-2">
            <button
              className={`px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  currentPage === page
                    ? "bg-green-500 text-white"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={`px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} p-6 rounded-lg shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-6">
              Are you sure you want to log out? You will be redirected to the
              login page.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className={`px-4 py-2 rounded ${
                  isDarkMode
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;

