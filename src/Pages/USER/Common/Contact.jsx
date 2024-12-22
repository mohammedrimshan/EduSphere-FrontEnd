import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle
} from "lucide-react";
import {
  MdOutlinePerson,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdOutlineFavoriteBorder,
  MdOutlineReceiptLong,
  MdOutlineHome,
  MdAccountBalanceWallet
} from "react-icons/md";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";
import Sidebar from "@/ui/sideBar";
import Header from "@/Pages/USER/Common/Header";
import Footer from "./Footer";

const ContactPage = () => {
  const theme = useSelector((state) => state.theme.theme);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const videos = [
    "https://res.cloudinary.com/dbair2ulh/video/upload/v1734721777/jlwgjdr3l7vyv8rm8d2h.mp4",
    "https://res.cloudinary.com/dbair2ulh/video/upload/v1734721749/c0dt575vfziizc4x3j13.mp4",
    "https://res.cloudinary.com/dbair2ulh/video/upload/v1734719719/uqdqd6vaxhyoheicncv4.mp4",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
    // Reset form
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const menuItems = [
    { icon: MdOutlineHome, label: "Home", path: "/user/home" },
    { icon: MdOutlinePerson, label: "Profile", path: "/user/profile" },
    { icon: MdLibraryBooks, label: "My Courses", path: "/user/my-courses" },
    { icon: BsPeopleFill, label: "Teachers", path: "/user/mytutors" },
    { icon: MdOutlineShoppingCart, label: "My Orders", path: "/user/payments/status" },
    { icon: MdOutlineFavoriteBorder, label: "Wishlist", path: "/user/wishlist" },
    { icon: BsFillAwardFill, label: "Certificates", path: "/user/certificates" },
    { icon: MdOutlineReceiptLong, label: "Refund History", path: "/user/refund-history" },
    { icon: MdAccountBalanceWallet , label: "Wallet", path: "/user/wallet" }
  ];

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["123 Learning Street", "Education City, ST 12345", "United States"]
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+1 (555) 123-4567", "+1 (555) 987-6543"]
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["support@learningplatform.com", "info@learningplatform.com"]
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Monday - Friday: 9AM - 6PM", "Saturday: 10AM - 4PM"]
    }
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        theme={theme}
        handleLogout={handleLogoutClick}
        menuItems={menuItems}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogoutClick={handleLogoutClick}
        />

        <div className="flex-1 overflow-auto scrollbar-hide">
          {/* Video Header Section */}
          <section className="relative h-[400px] overflow-hidden">
            <video
              key={videos[currentVideoIndex]}
              autoPlay
              muted
              className="absolute w-full h-full object-cover"
            >
              <source src={videos[currentVideoIndex]} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black bg-opacity-60">
              <div className="container mx-auto px-4 h-full flex items-center">
                <div className="max-w-2xl text-white">
                  <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
                  <p className="text-xl">We're here to help you on your learning journey</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information Cards */}
          <section className="py-16 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                    <info.icon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-4 dark:text-white">{info.title}</h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 dark:text-gray-300 mb-2">
                        {detail}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Form Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto bg-white dark:bg-gray-700 rounded-lg shadow-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-green-500 text-white p-8 md:w-1/3">
                    <h3 className="text-2xl font-bold mb-4">Let's Connect</h3>
                    <p className="mb-6">Fill out the form and our team will get back to you within 24 hours</p>
                    <div className="flex items-center mb-4">
                      <MessageCircle className="w-6 h-6 mr-2" />
                      <span>24/7 Live Chat Support</span>
                    </div>
                  </div>
                  <div className="p-8 md:w-2/3">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Your Email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Your Message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          rows="4"
                          required
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Map Section */}
          <section className="py-16 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg">
                  <iframe
                    title="Location Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e28c1191%3A0x49f75d3281df052a!2s150%20Park%20Row%2C%20New%20York%2C%20NY%2010007%2C%20USA!5e0!3m2!1sen!2s!4v1644262070010!5m2!1sen!2s"
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    className="rounded-lg"
                  ></iframe>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;