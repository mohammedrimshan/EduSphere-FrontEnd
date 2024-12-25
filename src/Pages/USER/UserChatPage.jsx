import React from "react";
import { useAuth } from "@/Context/AuthContext";
import UserChatComponent from "@/Pages/USER/Common/UserChatComponent";
import { useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function UserChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const tutorId = location.state?.tutorId;
  const theme = useSelector((state) => state.theme.theme);

  console.log("UserChatPage - Navigation State:", {
    locationState: location.state,
    tutorId,
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-100 to-green-400 dark:from-green-900 dark:to-green-700">
      <h1 className="text-3xl font-bold p-4 text-green-600 dark:text-green-300 text-center shadow-md"></h1>
      <div className="flex-1 overflow-hidden p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl h-full overflow-hidden">
          {tutorId ? (
            <UserChatComponent tutorId={tutorId} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p className="text-xl font-semibold">
                Please select a tutor to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserChatPage;
