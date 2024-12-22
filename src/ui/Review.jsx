import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaStar, FaEllipsisV } from 'react-icons/fa';
import { toast } from 'sonner';
import axiosInterceptor from '@/axiosInstance';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

const CourseReviews = ({ courseId }) => {
    const user = useSelector((state) => state.user.userDatas);
    const theme = useSelector((state) => state.theme.theme);
    const [reviews, setReviews] = useState([]);
    const [courseStats, setCourseStats] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [deleteReviewId, setDeleteReviewId] = useState(null);
    const [newReview, setNewReview] = useState({
      rating: 5,
      review: ''
    });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await axiosInterceptor.get(
        `/user/courses/${courseId}/reviews?page=${page}&limit=5`
      );
      if (page === 1) {
        setReviews(response.data.reviews);
        setCourseStats(response.data.course_stats);
      } else {
        setReviews(prev => [...prev, ...response.data.reviews]);
      }
      setHasMore(response.data.reviews.length === 5);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    if (!user?.id) return;
    try {
      const response = await axiosInterceptor.get('/user/reviews');
      const userReviewForCourse = response.data.reviews.find(
        review => review.course._id === courseId
      );
      setUserReview(userReviewForCourse);
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchUserReview();
  }, [courseId, page, user?.id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('Please log in to submit a review');
      return;
    }

    try {
      await axiosInterceptor.post(`/user/courses/${courseId}/review`, newReview);
      toast.success('Review submitted successfully');
      setShowReviewForm(false);
      setNewReview({ rating: 5, review: '' });
      fetchReviews();
      fetchUserReview();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    if (!user?.id) {
      toast.error('Please log in to mark reviews as helpful');
      return;
    }

    try {
      await axiosInterceptor.post(`/user/reviews/${reviewId}/helpful`);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to mark review as helpful');
    }
  };

  const handleEditReview = async (e) => {
    e.preventDefault();
    try {
      await axiosInterceptor.put(`/user/reviews/${editingReview._id}`, {
        rating: editingReview.rating,
        review: editingReview.review
      });
      toast.success('Review updated successfully');
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const handleDeleteReview = async () => {
    try {
      await axiosInterceptor.delete(`/user/reviews/${deleteReviewId}`);
      toast.success('Review deleted successfully');
      setDeleteReviewId(null);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const renderReviewActions = (review) => {
    const isOwner = user?.id === review.user._id;
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <FaEllipsisV />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {isOwner && (
            <>
              <DropdownMenuItem onClick={() => setEditingReview(review)}>
                Edit Review
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setDeleteReviewId(review._id)}
              >
                Delete Review
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderStars = (rating, setRating = null) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating && setRating(star)}
            className={setRating ? 'cursor-pointer' : undefined}
          >
            <FaStar
              className={star <= rating ? 'text-yellow-400' : `${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}
              size={24}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Course Reviews</h2>
      
      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Course Stats */}
      {courseStats && (
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-green-600">
              {courseStats.average_rating.toFixed(1)}
            </div>
            <div>
              {renderStars(Math.round(courseStats.average_rating))}
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Based on {courseStats.total_reviews} reviews
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {!userReview && (
        <div className="mb-6">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Write a Review
            </button>
          ) : (
            <form onSubmit={handleSubmitReview} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
              <div className="mb-4">
                <label className="block mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                    >
                      <FaStar
                        className={star <= newReview.rating ? 'text-yellow-400' : `${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}
                        size={24}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Review</label>
                <textarea
                  value={newReview.review}
                  onChange={(e) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                  className={`w-full p-2 border rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                  rows="4"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={review.user.profileImage || "/placeholder.svg?height=40&width=40"}
                  alt={review.user.full_name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{review.user.full_name}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {renderStars(review.rating)}
                {renderReviewActions(review)}
              </div>
            </div>

            {editingReview?._id === review._id ? (
              <form onSubmit={handleEditReview} className="mt-4">
                <div className="mb-4">
                  <label className="block mb-2">Rating</label>
                  {renderStars(editingReview.rating, (rating) => 
                    setEditingReview(prev => ({ ...prev, rating }))
                  )}
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Review</label>
                  <textarea
                    value={editingReview.review}
                    onChange={(e) => setEditingReview(prev => ({ ...prev, review: e.target.value }))}
                    className={`w-full p-2 border rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                    rows="4"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Changes</Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setEditingReview(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {review.review}
              </p>
            )}
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={() => handleHelpfulVote(review._id)}
                className={`text-sm ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-green-500' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Helpful ({review.helpful_votes?.length || 0})
              </button>
            </div>
            {review.tutorResponse && (
              <div className={`mt-4 pl-4 border-l-2 border-green-500 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="font-semibold">Tutor Response:</p>
                <p>{review.tutorResponse.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={() => setPage(prev => prev + 1)}
          className={`mt-4 w-full py-2 text-center ${
            theme === 'dark' 
              ? 'text-green-500 hover:text-green-400' 
              : 'text-green-600 hover:text-green-700'
          }`}
        >
          Load More Reviews
        </button>
      )}
    </div>
  );
};

export default CourseReviews;

