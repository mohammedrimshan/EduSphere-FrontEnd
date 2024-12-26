import React, { useState, useEffect } from "react";
import { Search, Calendar, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MdOutlinePerson,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdOutlineFavoriteBorder,
  MdOutlineHome,
  MdOutlineReceiptLong,
  MdAccountBalanceWallet,
} from "react-icons/md";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";
import axiosInterceptor from "@/axiosInstance";
import { useAuth } from "@/Context/AuthContext";
import Sidebar from "@/ui/sideBar";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import LogoutModal from "@/ui/LogOutModal";
import { logoutUser } from "@/Redux/Slices/userSlice";
import { toast, Toaster } from "sonner";

const PaymentStatus = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const { user } = useAuth();
  console.log(user);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [status, setStatus] = useState("");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  const menuItems = [
    { icon: MdOutlineHome, label: "Home", path: "/user/home" },
    { icon: MdOutlinePerson, label: "Profile", path: "/user/profile" },
    { icon: MdLibraryBooks, label: "My Courses", path: "/user/my-courses" },
    { icon: BsPeopleFill, label: "Teachers", path: "/user/mytutors" },
    {
      icon: MdOutlineShoppingCart,
      label: "My Orders",
      path: "/user/payments/status",
    },
    {
      icon: MdOutlineFavoriteBorder,
      label: "Wishlist",
      path: "/user/wishlist",
    },
    {
      icon: BsFillAwardFill,
      label: "Certificates",
      path: "/user/certificates",
    },
    {
      icon: MdOutlineReceiptLong,
      label: "Refund History",
      path: "/user/refund-history",
    },
    { icon: MdAccountBalanceWallet, label: "Wallet", path: "/user/wallet" },
  ];

  const handleLogoutConfirm = () => {
    toast.success("Logout Successful");
    setTimeout(() => {
      dispatch(logoutUser());
      navigate("/user/login");
    }, 1000);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const fetchPayments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "10",
        search: searchTerm,
        startDate: dateRange.start,
        endDate: dateRange.end,
        status,
        userId: user.id,
      });
      console.log(queryParams);
      const response = await axiosInterceptor(
        `/user/payments/status?${queryParams}`
      );
      const data = response.data ? response.data : response;
      console.log(data);

      if (data.success) {
        setPayments(data.data);
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.pages,
          total: data.pagination.total,
        });
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user, pagination.currentPage, searchTerm, dateRange, status]);

  const getStatusBadgeClass = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-sm font-medium";
    switch (status.toLowerCase()) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100`;
      case "in-progress":
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100`;
    }
  };

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "completed", label: "Completed" },
    { value: "in-progress", label: "In Progress" },
    { value: "rejected", label: "Rejected" },
  ];

  // If user is null, show loading or redirect
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Please log in to continue
          </h2>
          <button
            onClick={() => navigate("/user/login")}
            className="px-6 py-2 bg-green-500 text-white rounded-full transition-colors duration-300 hover:bg-green-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        handleLogout={handleLogoutClick}
        menuItems={menuItems}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Toaster position="top-left" richColors />

        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogoutClick={handleLogoutClick}
        />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6 bg-white dark:bg-gray-900">
          <h1 className="text-2xl font-bold dark:text-white">Payment Status</h1>
          {/* Filters Section */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search Order ID"
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <div className="flex gap-2 items-center">
                <Calendar size={20} className="text-gray-400" />
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                />
                <span className="dark:text-white">to</span>
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                />
              </div>

              <div className="relative">
                <button
                  className="flex items-center justify-between w-[180px] px-3 py-2 text-left bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:text-white"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  <span className="block truncate">
                    {status
                      ? statusOptions.find((option) => option.value === status)
                          ?.label
                      : "Filter by status"}
                  </span>
                  <ChevronDown className="w-5 h-5 ml-2 -mr-1" />
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg dark:border-gray-700">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none dark:text-white"
                        onClick={() => {
                          setStatus(option.value);
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ORDER_ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ORDER AMOUNT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    PHONE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 whitespace-nowrap text-center dark:text-white"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 whitespace-nowrap text-center dark:text-white"
                    >
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.ORDER_ID}>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {payment.ORDER_ID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        ₹{payment.ORDER_AMOUNT.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {payment.PHONE}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {new Date(payment.Date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadgeClass(payment.Status)}>
                          {payment.Status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {payments.length} of {pagination.total} results
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white"
                  disabled={pagination.currentPage === 1}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage - 1,
                    }))
                  }
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default PaymentStatus;
