"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import MessageInput from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { useSocket } from "@/lib/socketConfig";
import { useSelector, useDispatch } from "react-redux";
import axiosInterceptor from "@/axiosInstance";
import { setLoading, setCourses, setError } from "@/Redux/Slices/courseSlice";

export default function Chat() {
  const { courseId } = useParams();
  const [messages, setMessages] = useState([]);
  const [currentCourseData, setCurrentCourseData] = useState(null);
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);
  const userData = useSelector((state) => state.user.userDatas);
  const chatboxRef = useRef(null);

  // Fetch course data
  const fetchCourseById = useCallback(async () => {
    if (!courseId) {
      console.error("No courseId or invalid user");
      return;
    }

    try {
      dispatch(setLoading(true));
      const response = await axiosInterceptor.get(`/user/courses/${courseId}`);
      if (response.data.success) {
        dispatch(setCourses([response.data.course]));
        setCurrentCourseData(response.data.course);
      } else {
        dispatch(setCourses([]));
      }
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Failed to fetch course")
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [courseId, dispatch]);

  // Fetch course data when course ID changes
  useEffect(() => {
    if (courseId) {
      fetchCourseById();
    }
  }, [courseId, fetchCourseById]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Socket connection for receiving AI responses
  useEffect(() => {
    if (!socket) return;

    const handleResponse = (response) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          doubt: response,
          type: "ai",
        },
      ]);
    };

    socket.on("response", handleResponse);

    return () => {
      socket.off("response", handleResponse);
    };
  }, [socket]);

  // Send message handler
  const handleSendMessage = (content) => {
    if (!socket) return;

    const message = {
      id: userData._id, // Assuming _id exists in user data
      doubt: content,
      course_content: currentCourseData?.title || "",
      type: "user",
    };

    setMessages((prev) => [...prev, message]);
    socket.emit("message", message);
  };

  // Render only for valid users
  if (!courseId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">You do not have permission to access this chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 scrollbar-hide dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Ask your Doubt with AI</h2>

        <div className="space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              content={message.doubt}
              type={message.type}
            />
          ))}
          <div ref={chatboxRef} />
        </div>
      </div>

      <div className="p-4 border-t dark:border-gray-700 dark:bg-gray-800">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}