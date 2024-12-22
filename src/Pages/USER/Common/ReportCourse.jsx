import React, { useState, useEffect } from 'react';
import axiosInterceptor from "@/axiosInstance";
import { toast } from 'sonner';

const ReportCourseDialog = ({ isOpen, onClose, courseId, isOwned }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  useEffect(() => {
    const checkPreviousReport = async () => {
      try {
        const response = await axiosInterceptor.get(`/user/courses/${courseId}/report-status`);
        setHasReported(response.data.hasReported);
      } catch (error) {
        console.error('Error checking report status:', error);
      }
    };

    if (isOpen && isOwned) {
      checkPreviousReport();
    }
  }, [isOpen, courseId, isOwned]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInterceptor.post(`/user/courses/${courseId}/report`, { reason, description });
      if (response.data.success) {
        toast.success('Report submitted successfully');
        setHasReported(true);
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !isOwned) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Report Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block mb-1">Reason</label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={hasReported}
            >
              <option value="">Select a reason</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="spam">Spam</option>
              <option value="misleading">Misleading</option>
              <option value="offensive">Offensive</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide more details about your report"
              rows={4}
              className="w-full p-2 border rounded"
              disabled={hasReported}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || hasReported}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : hasReported ? 'Already Reported' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportCourseDialog;
