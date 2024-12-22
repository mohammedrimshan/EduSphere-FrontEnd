import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';
import axiosInterceptor from '@/axiosInstance';
import { toast } from 'sonner';

export default function PreviewQuiz() {
  const { courseId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [courseId]);

  const fetchQuiz = async () => {
    try {
      const response = await axiosInterceptor.get(`/tutor/courses/${courseId}/quiz`);
      if (response.data.success) {
        setQuiz(response.data.data);
        setSelectedAnswers(new Array(response.data.data.questions.length).fill(''));
      }
    } catch (error) {
      toast.error('Failed to fetch quiz');
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  if (!quiz) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Preview Quiz</h1>

      {quiz.questions.map((question, qIndex) => (
        <div key={qIndex} className="mb-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Question {qIndex + 1}</h2>
          <p className="mb-4">{question.questionText}</p>

          {question.options.map((option, oIndex) => (
            <div key={oIndex} className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id={`q${qIndex}-o${oIndex}`}
                name={`question-${qIndex}`}
                value={option}
                checked={selectedAnswers[qIndex] === option}
                onChange={() => handleAnswerSelect(qIndex, option)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <label htmlFor={`q${qIndex}-o${oIndex}`} className="ml-2">
                {option}
              </label>
              {showResults && (
                <span className="ml-2">
                  {option === question.correctAnswer ? (
                    <FaCheck className="text-green-500" />
                  ) : selectedAnswers[qIndex] === option ? (
                    <FaTimes className="text-red-500" />
                  ) : null}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={showResults}
        className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ${
          showResults ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {showResults ? 'Quiz Completed' : 'Submit Quiz'}
      </button>
    </div>
  );
}

