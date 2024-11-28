'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingPage() {
  const name = 'EduSphere';

  const [isDay, setIsDay] = useState(true);

  // Determine the theme based on the current time
  useEffect(() => {
    const hour = new Date().getHours();
    setIsDay(hour >= 6 && hour < 18); // Day theme between 6 AM and 6 PM

    // Temporarily add the theme class to the document
    document.documentElement.classList.add(isDay ? 'light' : 'dark');

    return () => {
      document.documentElement.classList.remove('light', 'dark');
    };
  }, [isDay]);

  // Animation variants for the text and dots
  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const dotVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen ${
        isDay
          ? 'bg-gradient-to-br from-white-100 to-white-300'
          : 'bg-gradient-to-br from-gray-900 to-gray-800'
      }`}
    >
      {/* Animated Heading */}
      <div className="text-center mb-8">
        <h1
          className={`text-5xl font-extrabold mb-6 overflow-hidden drop-shadow-lg ${
            isDay ? 'text-green-700' : 'text-green-400'
          }`}
        >
          {name.split('').map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </h1>
        <p
          className={`${
            isDay ? 'text-gray-700' : 'text-gray-300'
          } text-lg mb-4`}
        >
          Preparing your learning journey...
        </p>
      </div>

      {/* Loading Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className={`w-16 h-16 border-4 ${
          isDay
            ? 'border-green-500 border-t-transparent'
            : 'border-green-400 border-t-transparent'
        } rounded-full mb-6`}
      />

      {/* Loading Dots Animation */}
      <div className="flex gap-2 mt-4">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            variants={dotVariants}
            initial="hidden"
            animate="visible"
            transition={{
              delay: index * 0.3,
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'mirror',
            }}
            className={`w-3 h-3 rounded-full ${
              isDay ? 'bg-green-700' : 'bg-green-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
