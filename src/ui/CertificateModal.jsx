import React, { useRef,useState  } from "react";
import { jsPDF } from "jspdf";
import { Card } from "@/components/ui/card";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import Signature from "@/assets/Signature.png";
import seal from "@/assets/seal.png";
import Confetti from 'react-dom-confetti';

// Confetti Configuration
const config = {
  angle: 90,
  spread: 360,
  startVelocity: 50,
  elementCount: 150,
  dragFriction: 0.08,
  duration: 4000,
  stagger: 2,
  width: "12px",
  height: "12px",
  perspective: "800px",
  colors: [
    "#00FFD1",  // Vibrant Turquoise
    "#FF6B6B",  // Soft Red
    "#4ECDC4",  // Teal
    "#FFD93D",  // Bright Yellow
    "#6A5ACD",  // Slate Blue
    "#1de5e2",  // Bright Cyan
    "#ff4757",  // Pastel Red
    "#ffa200"   // Warm Orange
  ],
  // Add more randomness and dynamic movement
  scalar: 1.2,
  zIndex: 9999,
  // Radial gradient for softer, more organic look
  shapes: ["circle", "square"],
};


const CertificateModal = ({
  onClose,
  certificate,
  theme,
  userName,
  courseName,
  score,
  tutorName,
  date,
}) => {
  const certificateRef = useRef(null);
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${certificate.courseId?.coursetitle || "certificate"}.pdf`);
      setIsConfettiActive(true);
      setTimeout(() => {
        setIsConfettiActive(false);
      }, 3000);

      toast.success("Certificate downloaded successfully");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to download certificate");
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-5xl mx-auto">
            <div ref={certificateRef} className="transform-gpu">
              <Card className="relative w-full aspect-[1.5/1] bg-white shadow-2xl overflow-hidden">
                {/* Main Border Frame - Responsive padding */}
                <div className="absolute inset-4 sm:inset-6 md:inset-8 border-2 border-emerald-500/30">
                  {/* Corner Decorations - Hidden on smallest screens */}
                  <div className="hidden sm:block absolute -top-1 -left-1 w-6 md:w-8 h-6 md:h-8 border-t-2 border-l-2 border-emerald-600"></div>
                  <div className="hidden sm:block absolute -top-1 -right-1 w-6 md:w-8 h-6 md:h-8 border-t-2 border-r-2 border-emerald-600"></div>
                  <div className="hidden sm:block absolute -bottom-1 -left-1 w-6 md:w-8 h-6 md:h-8 border-b-2 border-l-2 border-emerald-600"></div>
                  <div className="hidden sm:block absolute -bottom-1 -right-1 w-6 md:w-8 h-6 md:h-8 border-b-2 border-r-2 border-emerald-600"></div>
                </div>

                {/* Geometric Accents - Adjusted for small screens */}
                <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-emerald-500/10 transform rotate-45 translate-x-16 sm:translate-x-24 md:translate-x-32 -translate-y-16 sm:-translate-y-24 md:-translate-y-32"></div>
                <div className="absolute bottom-0 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-emerald-500/10 transform rotate-45 -translate-x-16 sm:-translate-x-24 md:-translate-x-32 translate-y-16 sm:translate-y-24 md:translate-y-32"></div>

                {/* Logo - Responsive sizing */}
                <div className="absolute top-6 sm:top-8 md:top-12 left-6 sm:left-8 md:left-12 flex items-center gap-2">
                  <div className="w-12 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16">
                    <img
                      src="/EduSphere.png"
                      alt="EduSphere Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Main Content - Responsive spacing and font sizes */}
                <div className="relative h-full flex flex-col items-center justify-between p-6 sm:p-10 md:p-16">
                  <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-emerald-600 mb-1 sm:mb-2">
                      CERTIFICATE
                    </h1>
                    <p className="text-sm sm:text-base md:text-xl text-emerald-500/80 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                      OF COMPLETION
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center flex-grow text-center max-w-3xl my-4 sm:my-6">
                    <p className="text-sm sm:text-base md:text-xl text-gray-600 mb-2 sm:mb-4">
                      THIS CERTIFICATE IS PROUDLY PRESENTED TO
                    </p>
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-script text-emerald-600 mb-4 sm:mb-6 md:mb-8">
                      {userName}
                      <span className="block w-32 sm:w-40 md:w-48 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mt-1 sm:mt-2"></span>
                    </h2>

                    <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-2 sm:mb-4">
                      for successfully completing the course
                    </p>
                    <h3 className="text-xl sm:text-3xl md:text-4xl font-semibold text-emerald-600 mb-4 sm:mb-6 md:mb-8">
                      {courseName}
                    </h3>

                    <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 md:mb-12">
                      <p className="text-sm sm:text-base md:text-xl text-gray-600">with a score of</p>
                      <p className="text-xl sm:text-3xl md:text-4xl font-bold text-emerald-600">
                        {score}%
                      </p>
                    </div>
                  </div>

                  {/* Footer - Responsive layout */}
                  <div className="flex justify-between items-end w-full px-4 sm:px-6 md:px-8">
                    <div className="text-center">
                      <p className="text-base sm:text-xl md:text-2xl font-script text-emerald-600 mb-0.5 sm:mb-1">
                        {tutorName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">Course Instructor</p>
                    </div>

                    <div className="text-center">
                      <div className="mb-0.5">
                        <img
                          src={Signature}
                          alt="Signature"
                          className="inline-block w-20 sm:w-24 md:w-32 h-auto"
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">CEO, EduSphere</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 border-2 sm:border-4 border-emerald-600 rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src={seal}
                          alt="Seal"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">{date}</p>
                    </div>
                  </div>
                </div>

                {/* Outer Frame Lines */}
                <div className="absolute inset-3 sm:inset-4 md:inset-6 border border-emerald-500/20"></div>
                <div className="absolute inset-4 sm:inset-5 md:inset-7 border border-emerald-500/20"></div>
              </Card>
            </div>

            <div className="flex justify-end gap-2 sm:gap-4 p-4 border-t border-gray-200">
              <Button
                onClick={onClose}
                variant="secondary"
                className={`${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Close
              </Button>
              <Button
                onClick={handleDownload}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Confetti active={isConfettiActive} config={config} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;