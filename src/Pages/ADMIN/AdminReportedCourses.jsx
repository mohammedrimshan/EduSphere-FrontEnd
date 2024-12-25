import React, { useState, useEffect, useCallback } from "react";
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
  FaBars,
  FaMoon,
  FaSync,
  FaEye,
} from "react-icons/fa";
import Sidebar from "./Common/AdminSideBar";
import ReportStatusModal from "./Common/ReportStatusModal";
import { logoutAdmin } from "@/Redux/Slices/adminSlice";

const AdminReportedCourses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reportedCourses, setReportedCourses] = useState({
    courses: [],
    totalCourses: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const coursesPerPage = 10;

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const fetchReportedCourses = useCallback(async (page = 1, status = null) => {
    try {
      setLoading(true);
      const response = await axiosInterceptor.get("/admin/reported-courses", {
        params: { page, limit: coursesPerPage, status }
      });
      
      if (response.data.success) {
        setReportedCourses(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch reported courses");
      }
    } catch (error) {
      console.error("Error fetching reported courses:", error);
      toast.error(error.message || "Failed to fetch reported courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportedCourses();
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [fetchReportedCourses]);

  const filteredCourses = reportedCourses.courses.filter(
    (course) =>
      course.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchReportedCourses(page);
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

  const handleViewCourse = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleUpdateStatus = async (course) => {
    try {
      const response = await axiosInterceptor.get(`/admin/courses/${course._id}/reports`);
      if (response.data.success && response.data.data.reports.length > 0) {
        const report = response.data.data.reports[0];
        setSelectedReport({
          id: report._id,
          courseId: course._id,
          courseTitle: course.title,
          reason: report.reason,
          description: report.description,
          status: report.status
        });
        setIsModalOpen(true);
      } else {
        toast.error("No reports found for this course");
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error(error.message || "Failed to fetch report data");
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const validStatuses = ['reviewed', 'resolved', 'dismissed', 'banned'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid status: ${newStatus}`);
      }

      const reportResponse = await axiosInterceptor.patch(
        `/admin/reportstate/${reportId}`,
        { status: newStatus }
      );
  
      if (!reportResponse.data.success) {
        throw new Error(reportResponse.data.message || "Failed to update report status");
      }
  
      if (newStatus === 'banned' && selectedReport) {
        const banResponse = await axiosInterceptor.patch(
          `/admin/courses/${selectedReport.courseId}/ban`,
          { 
            banned: true,
            reason: selectedReport.reason,
            reportId: reportId
          }
        );
        if (!banResponse.data.success) {
          throw new Error(banResponse.data.message || "Failed to ban course");
        }
      }
  
      toast.success(newStatus === 'banned' ? "Course has been banned successfully" : "Report status updated successfully");
      fetchReportedCourses(currentPage);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsModalOpen(false);
    }
  };

 
  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    dispatch(logoutAdmin());
    setIsLogoutModalOpen(false);
    toast.success('Logged out successfully!', {
      duration: 3000,
      onAutoClose: () => navigate('/admin/adminlogin')
    });
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
        <Sidebar isDarkMode={isDarkMode} onLogout={handleLogout}/>
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
              Reported Courses
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchReportedCourses(currentPage)}
              className={`p-2 rounded-full ${
                isDarkMode
                  ? "bg-gray-700 text-blue-400"
                  : "bg-gray-100 text-blue-600"
              }`}
              title="Refresh reported courses list"
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
              placeholder="Search Reported Courses"
              className={`w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border border-gray-300 text-gray-900"
              }`}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          {/* <button
            className={`w-full sm:w-auto px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              isDarkMode
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <FaFilter className="inline-block mr-2" />
            Filter
          </button> */}
        </div>

        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <tr className="hidden sm:table-row">
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Course Title</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Report Count</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Reported Reasons</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Last Report Date</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "bg-gray-800 divide-gray-700 text-gray-300" : "bg-white divide-gray-200"}`}>
                  {filteredCourses.map((course) => (
                    <tr key={course._id} className={`${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} flex flex-col mb-4 sm:table-row`}>
                      <td className={`px-3 py-2 sm:py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                        <span className="font-bold sm:hidden mr-2">Course Title:</span>
                        {course.title}
                      </td>
                      <td className={`px-3 py-2 sm:py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        <span className="font-bold sm:hidden mr-2">Report Count:</span>
                        {course.reportCount}
                      </td>
                      <td className={`px-3 py-2 sm:py-4 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        <span className="font-bold sm:hidden mr-2">Reported Reasons:</span>
                        {course.reportedReasons?.join(", ") || "N/A"}
                      </td>
                      <td className={`px-3 py-2 sm:py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        <span className="font-bold sm:hidden mr-2">Last Report Date:</span>
                        {new Date(course.lastReportDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className="font-bold sm:hidden mr-2">Actions:</span>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <button
                            onClick={() => handleViewCourse(course._id)}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                              isDarkMode
                                ? "bg-blue-900 text-blue-200 hover:bg-blue-800"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            <FaEye className="mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(course)}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                              isDarkMode
                                ? "bg-yellow-900 text-yellow-200 hover:bg-yellow-800"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            }`}
                          >
                            Update Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Showing {(currentPage - 1) * coursesPerPage + 1} to{" "}
            {Math.min(currentPage * coursesPerPage, reportedCourses.totalCourses)} of{" "}
            {reportedCourses.totalCourses} entries
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
            {Array.from({ length: reportedCourses.totalPages }, (_, i) => i + 1).map((page) => (
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
              disabled={currentPage === reportedCourses.totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      <ReportStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateStatus={handleStatusUpdate}
        report={selectedReport}
      />
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-lg shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to log out? You will be redirected to the login page.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className={`px-4 py-2 rounded ${
                  isDarkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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

export default AdminReportedCourses;

