import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';
import { toast } from 'sonner';
import axiosInterceptor from '@/axiosInstance';

const QuizCreator = () => {
  const [questions, setQuestions] = useState([]);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const questionCount = questions.length;

  useEffect(() => {
    // Load questions from localStorage when component mounts
    const savedQuestions = localStorage.getItem(`quiz_${courseId}`);
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }
  }, [courseId]);

  const saveQuestionsToLocalStorage = (updatedQuestions) => {
    localStorage.setItem(`quiz_${courseId}`, JSON.stringify(updatedQuestions));
  };

  const addQuestion = () => {
    const updatedQuestions = [...questions, { 
      questionText: '', 
      options: ['', '', '', ''], 
      correctAnswer: null,
      correctOptionIndex: null
    }];
    setQuestions(updatedQuestions);
    saveQuestionsToLocalStorage(updatedQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
    saveQuestionsToLocalStorage(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
    saveQuestionsToLocalStorage(updatedQuestions);
  };

  const setCorrectAnswer = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    question.correctOptionIndex = optionIndex;
    question.correctAnswer = question.options[optionIndex];
    setQuestions(updatedQuestions);
    saveQuestionsToLocalStorage(updatedQuestions);
  };

  const validateQuestions = () => {
    for (const question of questions) {
      if (!question.questionText.trim()) {
        toast.error('All questions must have text');
        return false;
      }
      
      if (question.options.some(option => !option.trim())) {
        toast.error('All options must be filled out');
        return false;
      }
      
      if (question.correctOptionIndex === null) {
        toast.error('Each question must have a correct answer selected');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!questions.length) {
        toast.error('Please add at least one question');
        return;
      }

      if (!validateQuestions()) {
        return;
      }

      saveQuestionsToLocalStorage(questions);
      toast.success('Quiz saved locally');
    } catch (error) {
      toast.error('Failed to save quiz');
      console.error(error);
    }
  };

  const handleTotalSubmit = async () => {
    try {
      const response = await axiosInterceptor.post(`/tutor/courses/${courseId}/quiz`, { questions });
      
      if (response.data.success) {
        toast.success(response.data.message);
        // Clear local storage after successful submission
        localStorage.removeItem(`quiz_${courseId}`);
        navigate('/tutor/quizzes');
      } else {
        toast.error(response.data.message || 'Failed to create quiz');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
      console.error(error);
    }
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    saveQuestionsToLocalStorage(updatedQuestions);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Quiz</h1>
      <div className="text-xl font-semibold mb-4 text-center text-gray-600">
        Total Questions: {questionCount}
      </div>
      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Question {questionIndex + 1}</h2>
            <button
              onClick={() => removeQuestion(questionIndex)}
              className="text-red-500 hover:text-red-700 transition-colors"
              aria-label={`Remove question ${questionIndex + 1}`}
            >
              <FaTimes />
            </button>
          </div>
          <input
            type="text"
            placeholder="Enter your question here"
            value={question.questionText}
            onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
            className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="space-y-4">
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <div className="flex-grow flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
                  <input
                    type="radio"
                    name={`correct-${questionIndex}`}
                    checked={question.correctOptionIndex === optionIndex}
                    onChange={() => setCorrectAnswer(questionIndex, optionIndex)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <input
                    type="text"
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                    className="flex-grow bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
          {question.correctOptionIndex !== null && (
            <div className="mt-4 text-sm text-green-600">
              Correct Answer: Option {question.correctOptionIndex + 1}
            </div>
          )}
        </div>
      ))}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={addQuestion}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <FaPlus className="mr-2" /> Add Question
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          <FaCheck className="mr-2" /> Save Quiz
        </button>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleTotalSubmit}
          className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-lg"
        >
          <FaCheck className="mr-2" /> Submit All Quizzes
        </button>
      </div>
    </div>
  );
};

export default QuizCreator;

