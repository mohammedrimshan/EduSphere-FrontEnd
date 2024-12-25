import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  CircleDollarSign,
  Clock,
  Receipt,
  MoreHorizontal,
  BadgeIndianRupee,
} from "lucide-react";
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
import Sidebar from "../../ui/sideBar";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import LogoutModal from "../../ui/LogOutModal";
import { logoutUser } from "../../Redux/Slices/userSlice";
import { toast, Toaster } from "sonner";

const WalletDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const { user } = useAuth();

  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
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

  const fetchWalletDetails = async () => {
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
      });

      const response = await axiosInterceptor(`/user/wallet?${queryParams}`);
      const data = response.data;

      if (data.success) {
        setWalletData(data.data);
        setPagination({
          currentPage: data.data.pagination.currentPage,
          totalPages: data.data.pagination.totalPages,
          totalTransactions: data.data.pagination.totalTransactions,
        });
      }
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      toast.error("Failed to fetch wallet details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, [user, pagination.currentPage, searchTerm, dateRange]);

  const getTransactionIcon = (type) => {
    return type === "credit" ? (
      <ArrowUpCircle className="w-5 h-5 text-green-500" />
    ) : (
      <ArrowDownCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getTransactionTypeClass = (type) => {
    const baseClasses =
      "px-2 py-1 rounded-full text-sm font-medium flex items-center gap-2";
    return type === "credit"
      ? `${baseClasses} bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100`
      : `${baseClasses} bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 scrollbar-hide">
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

      <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
        <Toaster position="top-left" richColors />

        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogoutClick={handleLogoutClick}
        />

        <div className="flex-1 p-6 space-y-6 bg-white dark:bg-gray-900 scrollbar-hide">
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <CircleDollarSign className="h-8 w-8 text-green-500" />
            Wallet Details
          </h1>

          {/* Wallet Balance Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold dark:text-white">
                Available Balance
              </h2>
              <CircleDollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <BadgeIndianRupee className="h-6 w-6 text-green-500" />
              <p className="text-3xl font-bold text-green-500">
                {walletData?.user?.wallet_balance?.toFixed(2) || "0.00"}
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {walletData?.user?.full_name}
            </p>
          </div>

          {/* Filters Section */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search transactions"
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

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
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      Transaction
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <BadgeIndianRupee className="w-4 h-4" />
                      Amount
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MoreHorizontal className="w-4 h-4" />
                      Description
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Date
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 whitespace-nowrap text-center dark:text-white"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : walletData?.transactions?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 whitespace-nowrap text-center dark:text-white"
                    >
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  walletData?.transactions?.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={getTransactionTypeClass(transaction.type)}
                        >
                          {getTransactionIcon(transaction.type)}
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <div className="flex items-center gap-2">
                          <BadgeIndianRupee className="w-4 h-4 text-gray-400" />
                          {transaction.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap dark:text-white">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {walletData?.transactions?.length || 0} of{" "}
                {pagination.totalTransactions} results
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
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
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
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
        <Footer className="w-full" />
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default WalletDetails;
