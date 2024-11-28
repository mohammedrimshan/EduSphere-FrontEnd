import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { toast, Toaster } from "sonner";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/user";

const OtpModal = ({ isOpen, onClose, onVerify, email }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      // Check for stored expiry time when modal opens
      const storedExpiryTime = localStorage.getItem("otpExpiryTime");

      if (storedExpiryTime) {
        const expiryTime = parseInt(storedExpiryTime);
        const currentTime = new Date().getTime();
        const remainingTime = Math.max(
          0,
          Math.floor((expiryTime - currentTime) / 1000)
        );

        if (remainingTime > 0) {
          setTimer(remainingTime);
        } else {
          // If timer has expired, set new expiry time
          const newExpiryTime = new Date().getTime() + 60000;
          localStorage.setItem("otpExpiryTime", newExpiryTime.toString());
          setTimer(60);
        }
      } else {
        // If no stored expiry time, set new one
        const expiryTime = new Date().getTime() + 60000;
        localStorage.setItem("otpExpiryTime", expiryTime.toString());
        setTimer(60);
      }

      // Reset OTP fields
      setOtp(["", "", "", "", "", ""]);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const newValue = prev - 1;
          if (newValue === 0) {
            localStorage.removeItem("otpExpiryTime");
          }
          return newValue;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      const response = await axios.post(`${API_BASE_URL}/resend-otp`, {
        email,
      });
      if (response.data.message === "OTP resent successfully") {
        // Set new expiry time when OTP is resent
        const expiryTime = new Date().getTime() + 60000;
        localStorage.setItem("otpExpiryTime", expiryTime.toString());
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        toast.success("New OTP sent successfully");
      } else {
        toast.error("Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = () => {
    const otpString = otp.join("");
    if (otpString === "") {
      toast.error("Please enter a valid OTP");
    } else if (otpString.length !== 6) {
      toast.error("OTP must be 6 digits");
    } else {
      onVerify(otpString);
    }
  };

  const handleModalClose = () => {
    // Clean up localStorage when modal is closed
    localStorage.removeItem("otpExpiryTime");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Toaster position="top-left" richColors />
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">Verify OTP</h3>
          <button onClick={handleModalClose}>
            <X size={20} />
          </button>
        </div>

        <p className="mt-4 text-gray-600">
          Please enter the OTP sent to your email address: {email}
        </p>

        <div className="mt-6 flex justify-between">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100 text-gray-800"
              ref={(el) => (inputRefs.current[index] = el)}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-between items-center">
          {timer > 0 ? (
            <p className="text-sm text-gray-500">Resend OTP in {timer}s</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm text-green-500 hover:underline disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          )}

          <button
            onClick={handleVerify}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
          >
            Verify OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
