import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Award, Search } from "lucide-react";
import { toast } from "sonner";
import Header from "./Common/Header";
import Footer from "./Common/Footer";
import Sidebar from "../../ui/sideBar";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInterceptor from "@/axiosInstance";
import {
  MdOutlineHome,
  MdOutlinePerson,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdOutlineFavoriteBorder,
  MdOutlineReceiptLong,
  MdAccountBalanceWallet
} from "react-icons/md";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";
import CertificateModal from "@/ui/CertificateModal";

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
  { icon: MdOutlineFavoriteBorder, label: "Wishlist", path: "/user/wishlist" },
  { icon: BsFillAwardFill, label: "Certificates", path: "/user/certificates" },
  { icon: MdOutlineReceiptLong, label: "Refund History", path: "/user/refund-history" },
  { icon: MdAccountBalanceWallet , label: "Wallet", path: "/user/wallet" }
];

const CertificateCollection = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.user.userDatas);
  const userId = user?.id;

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!userId) {
        setError("User ID not found. Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axiosInterceptor.get(
          `/user/certificate/${userId}`
        );
        const certificatesData = response.data.certificates;
        setCertificates(certificatesData);
        setFilteredCertificates(certificatesData);
      } catch (error) {
        console.error("Error fetching certificates:", error);
        setError("Failed to fetch certificates. Please try again later.");
        toast.error("Failed to fetch certificates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, [userId]);

  useEffect(() => {
    const results = certificates.filter(
      (cert) =>
        cert.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.tutorName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCertificates(results);
  }, [searchTerm, certificates]);

  const handleThemeToggle = () => dispatch(toggleTheme());

  const handleCertificatePreview = (certificate) => {
    setSelectedCertificate(certificate);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCertificate(null);
  };

  if (error) {
    return (
      <div
        className={`flex h-screen ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex-1 flex items-center justify-center">
          <Card
            className={`p-6 text-center ${
              theme === "dark"
                ? "bg-gray-800 text-gray-200"
                : "bg-white text-gray-800"
            }`}
          >
            <p className="text-xl mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const renderCertificateCard = (cert) => (
    <Card
      key={cert._id}
      className={`overflow-hidden ${
        theme === "dark" ? "bg-gray-700" : "bg-white"
      } transition-all duration-300 transform hover:scale-105`}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Award
            className={`h-8 w-8 ${
              theme === "dark" ? "text-green-400" : "text-green-600"
            } mr-3`}
          />
          <h3
            className={`text-xl font-semibold ${
              theme === "dark" ? "text-green-300" : "text-green-700"
            }`}
          >
            {cert?.courseName || "Untitled Course"}
          </h3>
        </div>
        <p
          className={`mb-4 ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Issued by: {cert?.tutorName || "Unknown Tutor"}
        </p>
        <p
          className={`mb-4 ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Date: {new Date(cert.issuedDate).toLocaleDateString()}
        </p>
        <Button
          onClick={() => handleCertificatePreview(cert)}
          className={`w-full ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white transition-colors duration-300`}
        >
          View Certificate
        </Button>
      </div>
    </Card>
  );

  return (
    <div
      className={`flex h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        menuItems={menuItems}
      />

      <div className="flex-1 overflow-auto">
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleThemeToggle={handleThemeToggle}
          theme={theme}
        />

        <main
          className={`${
            theme === "dark"
              ? "bg-gray-800"
              : "bg-gradient-to-br from-green-50 to-green-100"
          } min-h-screen`}
        >
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            <h1
              className={`text-3xl md:text-4xl font-bold mb-8 ${
                theme === "dark" ? "text-green-400" : "text-green-800"
              }`}
            >
              Your Certificates
            </h1>

            <div className="mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${
                    theme === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900"
                  }`}
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div
                  className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${
                    theme === "dark" ? "border-green-400" : "border-green-600"
                  }`}
                />
              </div>
            ) : filteredCertificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map(renderCertificateCard)}
              </div>
            ) : (
              <Card
                className={`p-6 text-center ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-white text-gray-600"
                }`}
              >
                <p className="text-xl">No certificates found.</p>
                <p className="mt-2">Complete courses to earn certificates!</p>
              </Card>
            )}
          </div>
        </main>

        <Footer theme={theme} />
      </div>

      {showModal && selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={handleCloseModal}
          theme={theme}
          userName={selectedCertificate.userName}
          courseName={selectedCertificate.courseName}
          score={selectedCertificate.quizScorePercentage?.toFixed(2)}
          tutorName={selectedCertificate.tutorName}
          date={new Date(selectedCertificate.issuedDate).toLocaleDateString()}
        />
      )}
    </div>
  );
};

export default CertificateCollection;
