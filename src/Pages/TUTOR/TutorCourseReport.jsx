import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInterceptor from "@/axiosInstance";
import { toast } from "sonner";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const TutorCourseReports = () => {
  const { courseId } = useParams();
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
        const response = await axiosInterceptor.get(
          `/tutor/courses/${courseId}`
        );
        console.log(response);
        if (response.data.success) {
          setCourse(response.data.course);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch course details"
          );
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error(error.message || "Failed to fetch course details");
      }
    };

    const fetchReports = async () => {
      try {
        const response = await axiosInterceptor.get(
          `/tutor/courses/${courseId}/reports`,
          {
            params: { status, page: currentPage, limit: 10 },
          }
        );
        console.log(response,"report")
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
    return <div className="text-center py-10">Loading course details...</div>;
  }

  if (!course) {
    return <div className="text-center py-10">Course not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <img
          src={
            course.course_thumbnail || "/placeholder.svg?height=300&width=600"
          }
          alt={course.title}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Price:</h3>
            <p>₹{course.price}</p>
          </div>
          <div>
            <h3 className="font-semibold">Students Enrolled:</h3>
            <p>{course?.enrolled_count || 0}</p>
          </div>
          <div>
            <h3 className="font-semibold">Duration:</h3>
            <p>{course.duration} weeks</p>
          </div>
          <div>
            <h3 className="font-semibold">Level:</h3>
            <p>{course.level}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Course Reports</h2>
      <div className="mb-6">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Filter by Status:
        </label>
        <select
          id="status"
          value={status}
          onChange={handleStatusChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {report.reason}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {report.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
          className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <FaChevronLeft className="mr-2" />
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
          <FaChevronRight className="ml-2" />
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Report Statistics</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportStats.map((stat) => (
                <tr key={stat._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TutorCourseReports;
