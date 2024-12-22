import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Signature from "@/assets/Signature.png";
import seal from "@/assets/seal.png";
import downloadSound from '@/assets/downloadSound.mp3';
import useSound from 'use-sound';
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
// Certificate Component
const Certificate = ({ userName, courseName, score, tutorName, date }) => {
  // Download sound hook
  const [playDownloadSound] = useSound(downloadSound);
  
  // Reference to the certificate content
  const certificateRef = useRef(null);
  
  // State to control confetti animation
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  // Download handler
  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      // Generate canvas from certificate content
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Convert canvas to image data
      const imgData = canvas.toDataURL("image/png");
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      
      // Save PDF with user-specific filename
      pdf.save(`${userName}-Certificate.pdf`);
      
      // Play download sound
      playDownloadSound();
      
      // Trigger confetti
      setIsConfettiActive(true);
      
      // Stop confetti after 3 seconds
      setTimeout(() => {
        setIsConfettiActive(false);
      }, 3000);

    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 relative">
      {/* Certificate Content */}
      <div ref={certificateRef}>
        <Card className="relative w-full aspect-[1.5/1] bg-white shadow-2xl overflow-hidden">
          {/* Main Border Frame */}
          <div className="absolute inset-8 border-2 border-emerald-500/30">
            {/* Corner Decorations */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-emerald-600"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-emerald-600"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-emerald-600"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-emerald-600"></div>
          </div>

          {/* Geometric Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 transform rotate-45 translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 transform rotate-45 -translate-x-32 translate-y-32"></div>

          {/* Logo */}
          <div className="absolute top-12 left-12 flex items-center gap-2">
            <div className="w-20 h-16">
              <img
                src="/EduSphere.png"
                alt="EduSphere Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="relative h-full flex flex-col items-center justify-between p-16">
            <div className="text-center">
              <h1 className="text-6xl font-serif text-emerald-600 mb-2">
                CERTIFICATE
              </h1>
              <p className="text-xl text-emerald-500/80 uppercase tracking-[0.3em]">
                OF COMPLETION
              </p>
            </div>

            <div className="flex flex-col items-center justify-center flex-grow text-center max-w-3xl">
              <p className="text-xl text-gray-600 mb-4">
                THIS CERTIFICATE IS PROUDLY PRESENTED TO
              </p>
              <h2 className="text-5xl font-script text-emerald-600 mb-8">
                {userName}
                <span className="block w-48 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mt-2"></span>
              </h2>

              <p className="text-lg text-gray-600 mb-4">
                for successfully completing the course
              </p>
              <h3 className="text-4xl font-semibold text-emerald-600 mb-8">
                {courseName}
              </h3>

              <div className="flex items-center gap-4 mb-12">
                <p className="text-xl text-gray-600">with a score of</p>
                <p className="text-4xl font-bold text-emerald-600">{score}%</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end w-full px-8">
              <div className="text-center">
                <p className="font-script text-2xl text-emerald-600 mb-1">
                  {tutorName}
                </p>
                <p className="text-sm text-gray-600">Course Instructor</p>
              </div>

              <div className="text-center">
                <div className="mb-1/2">
                  <img
                    src={Signature}
                    alt="Signature"
                    className="inline-block w-32 h-auto"
                  />
                </div>
                <p className="text-sm text-gray-600">CEO, EduSphere</p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 border-4 border-emerald-600 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={seal}
                    alt="Seal"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">{date}</p>
              </div>
            </div>
          </div>

          {/* Outer Frame Lines */}
          <div className="absolute inset-6 border border-emerald-500/20"></div>
          <div className="absolute inset-7 border border-emerald-500/20"></div>
        </Card>
      </div>

      {/* Download Button with Confetti */}
      <div className="mt-8 flex justify-center items-center relative">
        <Button
          onClick={handleDownload}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </Button>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
          <Confetti active={isConfettiActive} config={config} />
        </div>
      </div>
    </div>
  );
};

export default Certificate;