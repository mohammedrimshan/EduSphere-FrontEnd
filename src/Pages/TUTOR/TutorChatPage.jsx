import React, { useState } from 'react';
import TutorChatComponent from '@/Pages/TUTOR/Common/TutorChatComponent';
import EnrolledStudentsSidebar from '@/Pages/TUTOR/Common/EnrolledStudents';
import { useTutorAuth } from '@/Context/TutorAuthContext';
import { useLocation, Navigate } from 'react-router-dom';

function TutorChatPage() {
  const { tutor } = useTutorAuth();
  const location = useLocation();
  const [selectedStudentId, setSelectedStudentId] = useState(location.state?.userId || null);

  console.log('TutorChatPage - Tutor:', tutor);
  console.log('TutorChatPage - Navigation State:', {
    locationState: location.state,
    selectedStudentId
  });

  if (!tutor) {
    return <Navigate to="/tutor/login" replace />;
  }

  const handleStudentSelect = (studentId) => {
    setSelectedStudentId(studentId);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <EnrolledStudentsSidebar onStudentSelect={handleStudentSelect} />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          {selectedStudentId ? (
            <TutorChatComponent studentId={selectedStudentId} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select a student to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TutorChatPage;

