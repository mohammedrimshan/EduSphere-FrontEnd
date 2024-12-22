import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axiosInterceptor from "@/axiosInstance";
import { toast } from "sonner";
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
import { logoutAdmin } from "@/Redux/Slices/adminSlice";

const AdminRefunds = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refundRequests, setRefundRequests] = useState({
    refunds: [],
    totalRefunds: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const refundsPerPage = 10;

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const fetchRefundRequests = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await axiosInterceptor.get("/admin/refunds", {
        params: { page, limit: refundsPerPage }
      });
      
      if (response.data.success) {
        setRefundRequests(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch refund requests");
      }
    } catch (error) {
      console.error("Error fetching refund requests:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to fetch refund requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRefundRequests();
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [fetchRefundRequests]);

  const filteredRefunds = refundRequests.refunds.filter(
    (refund) =>
      refund.userId.full_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      refund.courseId.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchRefundRequests(page);
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

  const handleViewRefund = async (refundId) => {
    try {
      const response = await axiosInterceptor.get(`/admin/refund/${refundId}`);
      if (response.data && response.data.refund) {
        setSelectedRefund(response.data.refund);
        setIsRefundModalOpen(true);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching refund details:", error);
      toast.error("Failed to fetch refund details");
    }
  };

  const handleProcessRefund = async (refundId, status, adminNote) => {
    try {
      setLoading(true);
      
      if (!refundId || !status) {
        throw new Error('Missing required parameters');
      }
  
      if (!['approved', 'rejected'].includes(status)) {
        throw new Error('Invalid status');
      }
  
      const response = await axiosInterceptor.post(`/admin/refund/${refundId}/process`, {
        status,
        adminNote: adminNote || ''
      });
      
      if (response.data?.success) {
        toast.success(`Refund ${status} successfully`);
        await fetchRefundRequests(currentPage);
        setIsRefundModalOpen(false);
        setSelectedRefund(null);
      } else {
        throw new Error(response.data?.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "An error occurred while processing the refund"
      );
    } finally {
      setLoading(false);
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
              Refund Requests
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchRefundRequests(currentPage)}
              className={`p-2 rounded-full ${
                isDarkMode
                  ? "bg-gray-700 text-blue-400"
                  : "bg-gray-100 text-blue-600"
              }`}
              title="Refresh refund requests list"
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
              placeholder="Search Refund Requests"
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
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Student</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Course</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Amount</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Request Date</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "bg-gray-800 divide-gray-700 text-gray-300" : "bg-white divide-gray-200"}`}>
                  {filteredRefunds.map((refund) => (
                    <tr key={refund._id} className={`${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} flex flex-col mb-4 sm:table-row`}>
                      <td className={`px-3 py-2 sm:py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                        <span className="font-bold sm:hidden mr-2">Student:</span>
                        {refund.userId.full_name}
                      </td>
                      <td className={`px-3 py-2 sm:py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        <span className="font-bold sm:hidden mr-2">Course:</span>
                        {refund.courseId.title}
                      </td>
                      <td className={`px-3 py-2 sm:py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        <span className="font-bold sm:hidden mr-2">Amount:</span>
                        ₹{refund.amount}
                      </td>
                      <td className={`px-3 py-2 sm:py-4 whitespace-nowrap text-sm`}>
                        <span className="font-bold sm:hidden mr-2">Status:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          refund.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : refund.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {refund.status}
                        </span>
                      </td>
                      <td className={`px-3 py-2 sm:py-4 whitespace-nowrap text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                        <span className="font-bold sm:hidden mr-2">Request Date:</span>
                        {new Date(refund.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className="font-bold sm:hidden mr-2">Actions:</span>
                        <button
                          onClick={() => handleViewRefund(refund._id)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                            isDarkMode
                              ? "bg-blue-900 text-blue-200 hover:bg-blue-800"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }`}
                        >
                          <FaEye className="mr-1" />
                          View Details
                        </button>
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
            Showing {(currentPage - 1) * refundsPerPage + 1} to{" "}
            {Math.min(currentPage * refundsPerPage, refundRequests.totalRefunds)} of{" "}
            {refundRequests.totalRefunds} entries
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
            {Array.from({ length: refundRequests.totalPages }, (_, i) => i + 1).map((page) => (
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
              disabled={currentPage === refundRequests.totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {isRefundModalOpen && selectedRefund && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
              <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>
                <h3 className="text-lg leading-6 font-medium mb-2">Refund Details</h3>
                <p><strong>Student:</strong> {selectedRefund.userId.full_name}</p>
                <p><strong>Course:</strong> {selectedRefund.courseId.title}</p>
                <p><strong>Amount:</strong> ₹{selectedRefund.amount}</p>
                <p><strong>Status:</strong> {selectedRefund.status}</p>
                <p><strong>Request Date:</strong> {new Date(selectedRefund.createdAt).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> {selectedRefund.reason}</p>
                {selectedRefund.adminNote && <p><strong>Admin Note:</strong> {selectedRefund.adminNote}</p>}
              </div>
              <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleProcessRefund(selectedRefund._id, 'approved', '')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleProcessRefund(selectedRefund._id, 'rejected', '')}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    isDarkMode
                      ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsRefundModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default AdminRefunds;

