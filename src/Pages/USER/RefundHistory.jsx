import React, { useState, useEffect, Fragment } from "react";
import { useSelector } from "react-redux";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "sonner";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import Sidebar from "@/ui/sideBar";
import LogoutModal from "@/ui/LogOutModal";
import axiosInterceptor from "@/axiosInstance";
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
const RefundHistory = () => {
  const [refunds, setRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const theme = useSelector((state) => state.theme.theme);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchRefunds();
  }, [currentPage, filterStatus]);

  const fetchRefunds = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInterceptor.get(
        `/user/myrefunds?page=${currentPage}&status=${filterStatus}`
      );
      console.log(response.data);
      setRefunds(response.data.refunds);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      setError("Failed to fetch refund history");
      toast.error("Error loading refund history");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRefundDetails = async (refundId) => {
    try {
      const response = await axiosInterceptor.get(`/user/myrefund/${refundId}`);
      console.log(response, "data");
      setSelectedRefund(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Error loading refund details");
    }
  };

  const handleLogoutConfirm = () => {
    navigate("/user/login");
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      );
    }

    if (refunds.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-xl mb-4 dark:text-white">
            No refund requests found.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {refunds.map((refund) => (
          <div
            key={refund.refundId}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <img
                  src={refund.course.thumbnail || "/placeholder.svg"}
                  alt={refund.course.title}
                  className="w-24 h-24 object-cover rounded mr-4"
                />
                <div>
                  <h3 className="text-lg font-semibold dark:text-white">
                    {refund.course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Amount: ₹{refund.amount}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Requested on: {formatDate(refund.requestDate)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    refund.status
                  )}`}
                >
                  {refund.status}
                </span>
                <button
                  onClick={() => fetchRefundDetails(refund.refundId)}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <Header
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        handleLogoutClick={() => setShowLogoutModal(true)}
      />
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        handleLogout={() => setShowLogoutModal(true)}
        menuItems={menuItems}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Refund History</h1>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {renderContent()}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer />

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />

      <Transition appear show={showDetailsModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowDetailsModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  {selectedRefund && (
                    <>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                      >
                        Refund Request Details
                      </Dialog.Title>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium dark:text-white">
                            Course
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {selectedRefund.course.title}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium dark:text-white">
                            Amount
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            ₹{selectedRefund.refund.amount}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium dark:text-white">
                            Reason
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {selectedRefund.refund.reason}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium dark:text-white">
                            Status
                          </h4>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(
                              selectedRefund.refund.status
                            )}`}
                          >
                            {selectedRefund.refund.status}
                          </span>
                        </div>
                        {selectedRefund.refund.adminNote && (
                          <div>
                            <h4 className="font-medium dark:text-white">
                              Admin Note
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300">
                              {selectedRefund.refund.adminNote}
                            </p>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium dark:text-white">
                            Course Progress
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {Math.round(selectedRefund.metrics.progress)}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                          onClick={() => setShowDetailsModal(false)}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default RefundHistory;
