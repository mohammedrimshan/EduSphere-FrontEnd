import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
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
import Sidebar from "./Common/AdminSideBar";
import tutorAvt from "../../assets/tutorAvt.png";

const Tutors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/admin";
  const tutorsPerPage = 5;

  const fetchTutors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tutors`, {
        withCredentials: true,
      });
      const transformedData = response.data.map((tutor) => ({
        id: tutor._id,
        name: tutor.full_name || "N/A",
        avatar: tutor.profileImage || tutorAvt,
        specialization: tutor.specialization || "N/A",
        experience: tutor.experience || "N/A",
        coursesCount: tutor.courses?.length || 0,
        status: tutor.status ? "Active" : "Inactive",
        isBlocked: !tutor.status,
      }));
      setTutors(transformedData);
    } catch (error) {
      console.error("Error fetching tutors:", error);
      toast.error("Failed to fetch tutors");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const toggleBlockStatus = async (tutorId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/tutors/${tutorId}/toggle-status`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.success) {
        setTutors((prevTutors) =>
          prevTutors.map((tutor) =>
            tutor.id === tutorId
              ? {
                  ...tutor,
                  isBlocked: !tutor.isBlocked,
                  status: tutor.isBlocked ? "Active" : "Inactive",
                }
              : tutor
          )
        );
        toast.success(response.data.message);
      } else {
        throw new Error(response.data.message || "Failed to update tutor status");
      }
    } catch (error) {
      console.error("Error toggling tutor status:", error);
      toast.error(error.response?.data?.message || "Failed to update tutor status");
    }
  };
 

  useEffect(() => {
    fetchTutors();
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [fetchTutors]);

  const filteredTutors = tutors.filter(
    (tutor) =>
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.id.includes(searchQuery) ||
      (tutor.specialization &&
        tutor.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const indexOfLastTutor = currentPage * tutorsPerPage;
  const indexOfFirstTutor = indexOfLastTutor - tutorsPerPage;
  const currentTutors = filteredTutors.slice(
    indexOfFirstTutor,
    indexOfLastTutor
  );
  const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
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

  return (
    <div className={`flex min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div className={`fixed lg:relative sidebar z-20 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } shadow-lg transition-transform duration-300 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:w-64`}>
        <Sidebar isDarkMode={isDarkMode} />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 lg:hidden z-10"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden mr-4 text-gray-600 dark:text-gray-300"
            >
              <FaBars size={24} />
            </button>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Tutors
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchTutors}
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-gray-700 text-blue-400" : "bg-gray-100 text-blue-600"
              }`}
              title="Refresh tutor list"
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
              placeholder="Search Tutors"
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
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  S1
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Tutor Name
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Tutor ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Specialization
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Experience
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Courses
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDarkMode
                ? "bg-gray-800 divide-gray-700 text-gray-300"
                : "bg-white divide-gray-200"
            }`}>
              {currentTutors.map((tutor, index) => (
                <tr key={tutor.id} className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    {indexOfFirstTutor + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-8 w-8 rounded-full" src={tutor.avatar} alt="" />
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}>
                          {tutor.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    {tutor.id}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    {tutor.specialization}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    {tutor.experience}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-500"
                  }`}>
                    {tutor.coursesCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tutor.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {tutor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleBlockStatus(tutor.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                        tutor.isBlocked
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
                          : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                      }`}
                    >
                      {tutor.isBlocked ? (
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            Showing {indexOfFirstTutor + 1} to {Math.min(indexOfLastTutor, filteredTutors.length)} of {filteredTutors.length} entries
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
    </div>
  );
};

export default Tutors;