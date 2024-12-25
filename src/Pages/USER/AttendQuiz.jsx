import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaCheck, FaTimes, FaSpinner, FaCertificate } from "react-icons/fa";
import { useSelector } from "react-redux";
import axiosInterceptor from "@/axiosInstance";
import { toast } from "sonner";
import Certificate from "./Common/Certificate";
import {
  MdOutlineHome,
  MdOutlinePerson,
  MdLibraryBooks,
  MdOutlineShoppingCart,
  MdOutlineFavoriteBorder,
  MdOutlineReceiptLong,
  MdAccountBalanceWallet,
} from "react-icons/md";
import { BsPeopleFill, BsFillAwardFill } from "react-icons/bs";

export default function AttendQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.userDatas);
  const [quiz, setQuiz] = useState(null);
  const [tutorId, setTutorId] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await axiosInterceptor.get(
        `/user/courses/${courseId}/quiz`
      );
      if (response.data.success) {
        setQuiz(response.data.data);
        setTutorId(response.data.data.tutorId);
        setSelectedAnswers(
          response.data.data.questions.reduce(
            (acc, q) => ({ ...acc, [q._id]: "" }),
            {}
          )
        );
      } else {
        setError("No quiz found for this course.");
      }
    } catch (error) {
      setError("Failed to fetch quiz. Please try again later.");
      toast.error("Failed to fetch quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const issueCertificate = async (scorePercentage) => {
    try {
      console.log("Certificate Issuance Data:", {
        userData: userData,
        tutorId: tutorId,
        courseId: courseId,
        scorePercentage: scorePercentage,
      });

      if (!userData) {
        toast.error("User information not found");
        return false;
      }

      const userId = userData._id || userData.id;
      if (!userId) {
        toast.error("User ID not found");
        return false;
      }

      if (!tutorId) {
        toast.error("Tutor information not found. Please contact support.");
        return false;
      }

      const certificateData = {
        userId: userId,
        tutorId: tutorId,
        courseId: courseId,
        quizScorePercentage: scorePercentage,
      };

      const response = await axiosInterceptor.post(
        "/user/certificate",
        certificateData
      );

      if (response.data.certificate) {
        setCertificateData(response.data.certificate);
        toast.success("Certificate issued successfully!");
        return true;
      }
    } catch (error) {
      console.error("Certificate Issuance Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to issue certificate"
      );
      return false;
    }
  };

  const handleSubmit = async () => {
    if (Object.values(selectedAnswers).some((answer) => answer === "")) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    let correctAnswers = 0;
    quiz.questions.forEach((question) => {
      if (selectedAnswers[question._id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const calculatedScore = (correctAnswers / quiz.questions.length) * 100;
    setScore(calculatedScore);
    setShowResults(true);

    if (calculatedScore > 80) {
      const certificateIssued = await issueCertificate(calculatedScore);
      if (certificateIssued) {
        setShowCertificate(true);
      }
    }
  };

  const handleTryAgain = () => {
    setSelectedAnswers(
      quiz.questions.reduce((acc, q) => ({ ...acc, [q._id]: "" }), {})
    );
    setShowResults(false);
    setScore(0);
    setShowCertificate(false);
    setCertificateData(null);
  };

  const handleViewCertificate = () => {
    setShowCertificate(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-500">{error}</h1>
        <Link
          to={`/user/course/${courseId}/lessons`}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Return to Course
        </Link>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">No Quiz Available</h1>
        <p className="mb-4">
          There is no quiz available for this course at the moment.
        </p>
        <Link
          to={`/user/course/${courseId}/lessons`}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Return to Course
        </Link>
      </div>
    );
  }

  if (showCertificate && certificateData) {
    return (
      <Certificate
        userName={certificateData.userName}
        courseName={certificateData.courseName}
        score={certificateData.quizScorePercentage.toFixed(2)}
        tutorName={certificateData.tutorName}
        date={new Date(certificateData.issuedDate).toLocaleDateString()}
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">
        Course Quiz
      </h1>

      {quiz.questions.map((question, qIndex) => (
        <div
          key={question._id}
          className="mb-8 bg-white shadow-lg rounded-lg p-6 transition duration-300 hover:shadow-xl"
        >
          <h2 className="text-xl font-semibold mb-4 text-blue-700">
            Question {qIndex + 1}
          </h2>
          <p className="mb-4 text-gray-700">{question.questionText}</p>

          {question.options.map((option, oIndex) => (
            <div key={oIndex} className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id={`q${qIndex}-o${oIndex}`}
                name={`question-${qIndex}`}
                value={option}
                checked={selectedAnswers[question._id] === option}
                onChange={() => handleAnswerSelect(question._id, option)}
                disabled={showResults}
                className="form-radio h-4 w-4 text-blue-600 transition duration-300 ease-in-out"
              />
              <label
                htmlFor={`q${qIndex}-o${oIndex}`}
                className="ml-2 text-gray-700 hover:text-blue-600 cursor-pointer transition duration-300"
              >
                {option}
              </label>
              {showResults && (
                <span className="ml-2">
                  {option === question.correctAnswer ? (
                    <FaCheck className="text-green-500" />
                  ) : selectedAnswers[question._id] === option ? (
                    <FaTimes className="text-red-500" />
                  ) : null}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      {!showResults ? (
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-blue-800">
            Your Score: {score.toFixed(2)}%
          </h2>
          <div className="space-y-4">
            {score > 80 && (
              <div className="mb-4">
                <p className="text-green-600 font-semibold mb-2">
                  Congratulations! You've earned a certificate.
                </p>
                <button
                  onClick={handleViewCertificate}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center mx-auto"
                >
                  <FaCertificate className="mr-2" />
                  View Certificate
                </button>
              </div>
            )}
            <div className="space-x-4">
              <button
                onClick={handleTryAgain}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Try Again
              </button>
              <Link
                to={`/user/course/${courseId}/lessons`}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 inline-block"
              >
                Return to Course
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
