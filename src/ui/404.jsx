import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const emojis = ['📚', '🎓', '✏️', '🖥️', '🧠']

export default function NotFoundPage() {
  const [isDay, setIsDay] = useState(true)

  useEffect(() => {
    const hour = new Date().getHours()
    setIsDay(hour >= 6 && hour < 18)

    document.documentElement.classList.add(isDay ? 'light' : 'dark')

    return () => {
      document.documentElement.classList.remove('light', 'dark')
    }
  }, [isDay])

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  }

  const iconVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, rotate: 360 },
  }

  const logoVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  }

  const waveVariants = {
    animate: (i) => ({
      y: [0, -20, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'loop',
        delay: i * 0.2,
      },
    }),
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen relative ${
        isDay
          ? 'bg-gradient-to-br from-white-100 to-white-300'
          : 'bg-gradient-to-br from-gray-900 to-gray-800'
      }`}
    >
      {/* EduSphere Logo as Text */}
      <motion.div
        className="absolute left-8 top-8 text-3xl font-bold"
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className={isDay ? 'text-green-700' : 'text-green-400'}>Edu</span>
        <span className={isDay ? 'text-gray-800' : 'text-gray-200'}>Sphere</span>
      </motion.div>

      {/* 404 Icon */}
      <motion.div
        variants={iconVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`text-8xl font-bold mb-8 ${
          isDay ? 'text-green-700' : 'text-green-400'
        }`}
      >
        404
      </motion.div>

      {/* Animated Heading */}
      <motion.h1
        variants={textVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`text-4xl font-extrabold mb-4 text-center ${
          isDay ? 'text-gray-800' : 'text-gray-100'
        }`}
      >
        Oops! Page Not Found
      </motion.h1>

      {/* Subheading */}
      <motion.p
        variants={textVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 0.4 }}
        className={`text-xl mb-8 text-center ${
          isDay ? 'text-gray-600' : 'text-gray-300'
        }`}
      >
        It seems you've wandered off the learning path.
      </motion.p>

      {/* Back to Home Button */}
      <motion.div
        variants={textVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <a
          href="/"
          className={`px-6 py-3 rounded-full text-white font-semibold transition-colors ${
            isDay
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          Back to Home
        </a>
      </motion.div>

      {/* Emoji Wave Animation */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-4">
        {emojis.map((emoji, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={waveVariants}
            animate="animate"
            className="text-4xl"
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </div>
  )
}