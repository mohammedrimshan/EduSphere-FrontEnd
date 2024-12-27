import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInterceptor from "@/axiosInstance";
import { toast } from "sonner";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const TutorCourseReports = () => {
  const { courseId } = useParams();
  const theme = useSelector((state) => state.theme.theme);
  const [course, setCourse] = useState(null);
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reportStats, setReportStats] = useState([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axiosInterceptor.get(`/tutor/courses/${courseId}`);
        if (response.data.success) {
          setCourse(response.data.course);
        } else {
          throw new Error(response.data.message || "Failed to fetch course details");
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error(error.message || "Failed to fetch course details");
      }
    };

    const fetchReports = async () => {
      try {
        const response = await axiosInterceptor.get(`/tutor/courses/${courseId}/reports`, {
          params: { status, page: currentPage, limit: 10 },
        });
        if (response.data.success) {
          setReports(response.data.data.reports);
          setTotalPages(response.data.data.totalPages);
          setReportStats(response.data.data.reportStats);
        } else {
          throw new Error(response.data.message || "Failed to fetch reports");
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error(error.message || "Failed to fetch reports");
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCourseDetails(), fetchReports()]);
      setIsLoading(false);
    };

    fetchData();
  }, [courseId, currentPage, status]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setCurrentPage(1);
  };


  if (isLoading) {
    return (
      <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>
        <div className="text-center py-10">Loading course details...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>
        <div className="text-center py-10">Course not found</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-7xl mx-auto px-4 py-8 ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
        <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
        
        <div className={`rounded-lg p-6 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <img
            src={course.course_thumbnail || "/placeholder.svg?height=300&width=600"}
            alt={course.title}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{course.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Price:</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>₹{course.price}</p>
            </div>
            <div>
              <h3 className="font-semibold">Students Enrolled:</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{course?.enrolled_count || 0}</p>
            </div>
            <div>
              <h3 className="font-semibold">Duration:</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{course.duration} weeks</p>
            </div>
            <div>
              <h3 className="font-semibold">Level:</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{course.level}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Course Reports</h2>
        <div className="mb-6">
          <label
            htmlFor="status"
            className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Filter by Status:
          </label>
          <select
            id="status"
            value={status}
            onChange={handleStatusChange}
            className={`mt-1 block w-full py-2 px-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-200'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <div className={`shadow overflow-hidden sm:rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                {['Reason', 'Description', 'Status', 'Created At'].map((header) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    {report.reason}
                  </td>
                  <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {report.description}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {report.status}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            } disabled:opacity-50`}
          >
            <FaChevronLeft className="mr-2" />
            Previous
          </button>
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            } disabled:opacity-50`}
          >
            Next
            <FaChevronRight className="ml-2" />
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Report Statistics</h2>
          <div className={`shadow overflow-hidden sm:rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  {['Reason', 'Count'].map((header) => (
                    <th
                      key={header}
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                {reportStats.map((stat) => (
                  <tr key={stat._id}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {stat._id}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      {stat.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorCourseReports;