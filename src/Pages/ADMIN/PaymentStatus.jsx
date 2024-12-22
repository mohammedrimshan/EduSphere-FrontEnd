import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInterceptor from "@/axiosInstance";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSun,
  FaBars,
  FaMoon,
  FaSync,
  FaCalendar,
} from "react-icons/fa";
import Sidebar from "./Common/AdminSideBar";
import { logoutAdmin } from "@/Redux/Slices/adminSlice";

const PaymentStatus = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [paymentStatus, setPaymentStatus] = useState("");
  const paymentsPerPage = 10;

  const validPaymentStatuses = ['created', 'success', 'failed', 'pending'];

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

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        search: debouncedSearchQuery,
        page: currentPage.toString(),
        limit: paymentsPerPage.toString(),
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        status: paymentStatus,
      });

      const response = await axiosInterceptor.get(`/admin/payments?${queryParams}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setPayments(response.data.data);
      } else {
        throw new Error("Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, dateRange, paymentStatus]);

  useEffect(() => {
    fetchPayments();
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.ORDER_ID.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        payment.USERNAME.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        payment.USER_EMAIL.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [payments, debouncedSearchQuery]);

  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

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

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setPaymentStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const renderTableBody = () => {
    if (!Array.isArray(currentPayments)) {
      return null;
    }
    return currentPayments.map((payment, index) => (
      <tr key={payment.ORDER_ID} className={`${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} flex flex-col mb-4 sm:table-row`}>
        <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
          <span className="font-bold sm:hidden mr-2">S.No:</span>
          {indexOfFirstPayment + index + 1}
        </td>
        <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          <span className="font-bold sm:hidden mr-2">Order ID:</span>
          {payment.ORDER_ID}
        </td>
        <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          <span className="font-bold sm:hidden mr-2">Student Name:</span>
          {payment.USERNAME}
        </td>
        <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          <span className="font-bold sm:hidden mr-2">Email:</span>
          {payment.USER_EMAIL}
        </td>
        <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          <span className="font-bold sm:hidden mr-2">Phone:</span>
          {payment.PHONE}
        </td>
        <td className="px-3 py-2 sm:py-4 text-sm text-gray-500 dark:text-gray-300">
          <span className="font-bold sm:hidden mr-2">Courses:</span>
          {payment.COURSES.join(", ")}
        </td>
        <td className="px-3 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
          <span className="font-bold sm:hidden mr-2">Status:</span>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            payment.PAYMENT_STATUS === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : payment.PAYMENT_STATUS === "failed"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : payment.PAYMENT_STATUS === "pending"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          }`}>
            {payment.PAYMENT_STATUS.toUpperCase()}
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <div
      className={`flex min-h-screen overflow-hidden ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
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
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Payment Status
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchPayments}
              className={`p-2 rounded-full ${
                isDarkMode
                  ? "bg-gray-700 text-blue-400"
                  : "bg-gray-100 text-blue-600"
              }`}
              title="Refresh payment list"
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
              placeholder="Search Payments"
              className={`w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border border-gray-300 text-gray-900"
              }`}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <FaCalendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`} />
              <input
                type="date"
                name="startDate"
                placeholder="Start Date"
                className={`w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border border-gray-300 text-gray-900"
                }`}
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
              />
            </div>
            <div className="relative flex-1 sm:flex-none">
              <FaCalendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`} />
              <input
                type="date"
                name="endDate"
                placeholder="End Date"
                className={`w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border border-gray-300 text-gray-900"
                }`}
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
              />
            </div>
            <select
              value={paymentStatus}
              onChange={handleStatusChange}
              className={`w-full sm:w-auto px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDarkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <option value="">All Statuses</option>
              {validPaymentStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          <div className="w-full">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                  <tr className="hidden sm:table-row">
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-200">S.No</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Order ID</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Student Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Email</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Phone</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Courses</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">Status</th>
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
          <div
            className={`text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Showing {indexOfFirstPayment + 1} to{" "}
            {Math.min(indexOfLastPayment, filteredPayments.length)} of{" "}
            {filteredPayments.length} entries
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
          <div
            className={`${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            } p-6 rounded-lg shadow-lg`}
          >
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

export default PaymentStatus;

