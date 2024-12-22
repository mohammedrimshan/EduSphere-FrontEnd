import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronDown, FaPlus, FaTrash, FaEdit, FaBook, FaQuestionCircle } from 'react-icons/fa';
import { addQuiz, updateQuiz, selectQuizzes } from '@/Redux/Slices/quizSlice';
import axiosInterceptor from '@/axiosInstance';
import { toast } from 'sonner';

const QuizManagement = () => {
  const dispatch = useDispatch();
  const { courseId } = useParams();
  const quizzes = useSelector(selectQuizzes);
  const [sortBy, setSortBy] = useState("relevance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    correctOptionIndex: null
  });

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    if (!courseId) {
      setError('Invalid course ID');
      toast.error('Invalid course ID');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axiosInterceptor.get(`/tutor/courses/${courseId}/quiz`);
      dispatch(addQuiz(response.data.data));
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Quiz not found');
        toast.error('Quiz not found for this course');
      } else {
        setError('Failed to fetch quizzes');
        toast.error('Failed to fetch quizzes');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (question) => {
    setSelectedQuestion(question);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuestion || !courseId) return;

    setLoading(true);
    setError(null);
    
    try {
      await axiosInterceptor.delete(`/tutor/courses/${courseId}/quiz/${selectedQuestion._id}`);
      const quiz = quizzes.find(q => q.courseId === courseId);
      if (quiz) {
        const updatedQuestions = quiz.questions.filter(q => q._id !== selectedQuestion._id);
        dispatch(updateQuiz({ 
          courseId,
          questions: updatedQuestions,
          _id: quiz._id
        }));
      }
      setDeleteModalOpen(false);
      toast.success('Question deleted successfully');
    } catch (err) {
      setError('Failed to delete quiz question');
      toast.error('Failed to delete quiz question');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setEditedQuestion({
      ...question,
      correctOptionIndex: question.options.findIndex(option => option === question.correctAnswer)
    });
    setEditModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedQuestion(null);
    setEditedQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      correctOptionIndex: null
    });
    setAddModalOpen(true);
  };

  const handleInputChange = (e, field, index) => {
    if (field === 'options' && typeof index === 'number') {
      const newOptions = [...editedQuestion.options];
      newOptions[index] = e.target.value;
      setEditedQuestion({ 
        ...editedQuestion, 
        options: newOptions,
        correctAnswer: editedQuestion.correctOptionIndex === index ? e.target.value : editedQuestion.correctAnswer
      });
    } else {
      setEditedQuestion({ ...editedQuestion, [field]: e.target.value });
    }
  };

  const handleCorrectAnswerChange = (index) => {
    setEditedQuestion(prev => ({
      ...prev,
      correctOptionIndex: index,
      correctAnswer: prev.options[index]
    }));
  };

  const handleUpdateQuiz = async () => {
    if (!courseId) {
      setError('Invalid course ID');
      toast.error('Invalid course ID');
      return;
    }
  
    setLoading(true);
    setError(null);
    try {
      const quiz = quizzes.find(q => q.courseId === courseId);
      if (!quiz) throw new Error('Quiz not found');

      let updatedQuestions;
      if (selectedQuestion) {
        // Editing existing question
        updatedQuestions = quiz.questions.map(q => 
          q._id === selectedQuestion._id ? editedQuestion : q
        );
      } else {
        // Adding new question
        updatedQuestions = [...quiz.questions, editedQuestion];
      }

      const response = await axiosInterceptor.put(`/tutor/courses/${courseId}/quiz`, { 
        questions: updatedQuestions 
      });
      dispatch(updateQuiz({ courseId, ...response.data.data }));
      setEditModalOpen(false);
      setAddModalOpen(false);
      toast.success(selectedQuestion ? 'Question updated successfully' : 'New question added successfully');
    } catch (err) {
      setError('Failed to update quiz');
      toast.error('Failed to update quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const quiz = quizzes.find(q => q.courseId === courseId);
  const questions = quiz ? quiz.questions : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg mb-6 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <FaBook className="h-6 w-6 text-red-500" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Quiz Management</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  aria-label="Sort questions"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="newest">Sort by Newest</option>
                  <option value="oldest">Sort by Oldest</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FaChevronDown className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <button
                onClick={handleAdd}
                className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                <FaPlus className="mr-2" aria-hidden="true" /> Add Question
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Content */}
        {(questions.length === 0 || error === 'Quiz not found') ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-center justify-center h-64">
              <FaQuestionCircle className="text-6xl text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                {error === 'Quiz not found' ? 'Quiz Not Found' : 'No Quizzes Available'}
              </h2>
              <p className="text-gray-500 text-center max-w-md">
                {error === 'Quiz not found'
                  ? 'The quiz for this course could not be found. You can create a new quiz by adding questions.'
                  : 'There are currently no quizzes available for this course. Click the "Add Question" button to get started with creating your quiz.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SI NO</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {questions.map((question, index) => (
                    <tr key={question._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium line-clamp-2">{question.questionText}</div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {question.options.map((option, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {option}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {question.correctAnswer}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(question)}
                            className="text-green-600 hover:text-green-900 transition-colors duration-200"
                            aria-label={`Edit question ${index + 1}`}
                          >
                            <FaEdit className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDelete(question)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            aria-label={`Delete question ${index + 1}`}
                          >
                            <FaTrash className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
              <h2 id="modal-headline" className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this question? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Add Modal */}
        {(editModalOpen || addModalOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 transform transition-all" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
              <h2 id="modal-headline" className="text-xl font-bold text-gray-900 mb-6">
                {editModalOpen ? 'Edit Question' : 'Add New Question'}
              </h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text
                  </label>
                  <input
                    type="text"
                    id="questionText"
                    value={editedQuestion.questionText}
                    onChange={(e) => handleInputChange(e, 'questionText')}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your question"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Options</label>
                  {editedQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={`option${index}`}
                        name="correctAnswer"
                        checked={editedQuestion.correctOptionIndex === index}
                        onChange={() => handleCorrectAnswerChange(index)}
                        className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleInputChange(e, 'options', index)}
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setAddModalOpen(false);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateQuiz}
                  className="px-4 py-2 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-colors duration-200"
                >
                  {editModalOpen ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManagement;

