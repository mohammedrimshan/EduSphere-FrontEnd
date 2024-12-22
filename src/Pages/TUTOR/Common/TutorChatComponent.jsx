import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "@/lib/socketConfig";
import { useTutorAuth } from "@/Context/TutorAuthContext";
import axiosInterceptor from "@/axiosInstance";
import { Send, Loader, Smile } from "lucide-react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadMenu } from "@/ui/uploadMenu";
import EmojiPicker from "emoji-picker-react";

const TutorChatComponent = ({ studentId, chatId }) => {
  const [chat, setChat] = useState(null);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    isOnline: false,
    avatar: "",
  });
  const theme = useSelector((state) => state.theme.theme);
  const [isStudentTyping, setIsStudentTyping] = useState(false);
  const {
    socket,
    isConnected,
    emitUserOnline,
    joinChatRoom,
    requestUserStatus,
  } = useSocket();
  const { tutor, setTutor } = useTutorAuth();
  const messagesEndRef = useRef(null);
  const lastSentMessageRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (tutor && studentId) {
      console.log("TutorChatComponent: Initializing with tutor and studentId", {
        tutorId: tutor.id,
        studentId,
      });
      fetchOrCreateChat();
      fetchStudentInfo();
    }
  }, [tutor, studentId]);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (socket && chat) {
      console.log("TutorChatComponent: Setting up socket listeners", {
        chatId: chat._id,
      });
      socket.on("receive-message", handleNewMessage);
      socket.on("student-typing", handleStudentTyping);
      socket.on("student-stop-typing", () => setIsStudentTyping(false));
      socket.on("user-status-change", handleUserStatusChange);
      socket.on("self-status-change", handleSelfStatusChange);

      joinChatRoom(chat._id);
      requestUserStatus(studentId);
      emitUserOnline(tutor.id, "tutor");

      return () => {
        console.log("TutorChatComponent: Cleaning up socket listeners");
        socket.off("receive-message", handleNewMessage);
        socket.off("student-typing", handleStudentTyping);
        socket.off("student-stop-typing");
        socket.off("user-status-change", handleUserStatusChange);
        socket.off("self-status-change", handleSelfStatusChange);
      };
    }
  }, [socket, chat, studentId, tutor.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchOrCreateChat = async () => {
    try {
      setLoading(true);
      const url = `/tutor/tutor/chats/${tutor.id}?role=tutor&studentId=${studentId}`;
      console.log("TutorChatComponent: Fetching or creating chat", { url });
      const response = await axiosInterceptor.get(url);
      if (response.data && response.data.length > 0) {
        console.log("TutorChatComponent: Existing chat found", {
          chatId: response.data[0]._id,
        });
        setChat(response.data[0]);
        fetchMessages(response.data[0]._id);
      } else {
        console.log("TutorChatComponent: Creating new chat");
        const newChatResponse = await axiosInterceptor.post(
          "/tutor/tutor/chat/create",
          {
            newChatDetails: {
              user_id: studentId,
              tutor_id: tutor.id,
            },
            role: "tutor",
          }
        );
        console.log("TutorChatComponent: New chat created", {
          chatId: newChatResponse.data._id,
        });
        setChat(newChatResponse.data);
        fetchMessages(newChatResponse.data._id);
      }
    } catch (error) {
      console.error(
        "TutorChatComponent: Error fetching or creating chat:",
        error
      );
      toast.error("Failed to load chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentInfo = async () => {
    try {
      console.log("TutorChatComponent: Fetching student info", { studentId });
      const response = await axiosInterceptor.get(
        `/tutor/user-info/${studentId}`
      );
      console.log("TutorChatComponent: Student info fetched", response.data);
      setStudentInfo({
        name: response.data.full_name,
        isOnline: response.data.is_online,
        avatar: response.data.user_image,
      });
    } catch (error) {
      console.error("TutorChatComponent: Error fetching student info:", error);
      setStudentInfo({ name: "Unknown Student", isOnline: false, avatar: "" });
      toast.error("Failed to load student information.");
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      console.log("TutorChatComponent: Fetching messages", { chatId });
      const response = await axiosInterceptor.get(
        `/tutor/tutor/messages/${chatId}`
      );
      const uniqueMessages = response.data.filter(
        (msg, index, self) => index === self.findIndex((m) => m._id === msg._id)
      );
      console.log("TutorChatComponent: Messages fetched", {
        messageCount: uniqueMessages.length,
      });
      setMessages(uniqueMessages);
    } catch (error) {
      console.error("TutorChatComponent: Error fetching messages:", error);
      toast.error("Failed to load messages. Please try again.");
    }
  };

  const handleNewMessage = useCallback(
    (data) => {
      console.log("TutorChatComponent: New message received", data);
      if (data.chat && data.chat._id === chat?._id) {
        if (
          lastSentMessageRef.current &&
          lastSentMessageRef.current._id === data.message._id
        ) {
          console.log("TutorChatComponent: Duplicate message, ignoring");
          return;
        }

        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some(
            (msg) => msg._id === data.message._id
          );
          return isDuplicate ? prevMessages : [...prevMessages, data.message];
        });
      }
    },
    [chat]
  );

  const handleStudentTyping = useCallback(() => {
    console.log("TutorChatComponent: Student is typing");
    setIsStudentTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log("TutorChatComponent: Student stopped typing");
      setIsStudentTyping(false);
    }, 2000);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chat || !newMessage.trim()) return;

    try {
      console.log("TutorChatComponent: Sending message", { chatId: chat._id });
      const messageData = {
        chat_id: chat._id,
        sender_id: tutor.id,
        receiver_id: studentId,
        message: newMessage.trim(),
      };

      const response = await axiosInterceptor.post(
        "/tutor/tutor/message",
        messageData
      );

      console.log(
        "TutorChatComponent: Message sent successfully",
        response.data
      );
      lastSentMessageRef.current = response.data;

      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some(
          (msg) => msg._id === response.data._id
        );
        return isDuplicate ? prevMessages : [...prevMessages, response.data];
      });

      setNewMessage("");

      if (socket && isConnected) {
        console.log("TutorChatComponent: Emitting send-message event", {
          chatId: chat._id,
        });
        socket.emit("send-message", {
          chat: { _id: chat._id },
          message: response.data,
        });
      }
    } catch (error) {
      console.error("TutorChatComponent: Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };
  const handleUpload = async (file) => {
    try {
      // Validate file
      if (!file) {
        throw new Error("No file selected");
      }

      // Log file details for debugging
      console.log("Upload file details:", {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // Determine upload URL based on file type
      const uploadType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : "raw";

      const uploadUrl = `https://api.cloudinary.com/v1_1/edusphere/${uploadType}/upload`;

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "edusphere");
      formData.append("cloud_name", "edusphere");

      // Perform upload
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      // Check response status
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Cloudinary upload error:", {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorData,
        });
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      // Parse response
      const data = await response.json();

      // Validate upload result
      if (!data.secure_url) {
        throw new Error("No secure URL returned from Cloudinary");
      }

      // Log successful upload
      console.log("File uploaded successfully", {
        fileUrl: data.secure_url,
        publicId: data.public_id,
      });

      // Prepare and send message
      const messageFormData = new FormData();
      messageFormData.append("chat_id", chat._id);
      messageFormData.append("sender_id", tutor.id);
      messageFormData.append("receiver_id", studentId);
      messageFormData.append("file_url", data.secure_url);

      const messageResponse = await axiosInterceptor.post(
        "/tutor/tutor/message",
        messageFormData
      );

      // Update messages state
      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some(
          (msg) => msg._id === messageResponse.data._id
        );
        return isDuplicate
          ? prevMessages
          : [...prevMessages, messageResponse.data];
      });

      // Emit socket event if connected
      if (socket && isConnected) {
        socket.emit("send-message", {
          chat: { _id: chat._id },
          message: messageResponse.data,
        });
      }

      return data.secure_url;
    } catch (error) {
      console.error("Detailed upload error:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });

      // User-friendly error toast
      toast.error(error.message || "Failed to upload file. Please try again.");

      throw error;
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUserStatusChange = useCallback(
    (data) => {
      console.log("TutorChatComponent: Status change received:", data);
      if (data.userId === studentId) {
        setStudentInfo((prev) => ({
          ...prev,
          isOnline: data.isOnline,
        }));
      }
      if (data.userId === tutor.id) {
        setTutor((prevTutor) => ({ ...prevTutor, isOnline: data.isOnline }));
      }
    },
    [studentId, tutor.id, setTutor]
  );

  const handleSelfStatusChange = useCallback(
    (data) => {
      console.log("TutorChatComponent: Self status change:", data);
      if (data.userId === tutor.id) {
        setTutor((prevTutor) => ({ ...prevTutor, isOnline: data.isOnline }));
      }
    },
    [tutor.id, setTutor]
  );

  const handleTyping = () => {
    if (socket && isConnected) {
      console.log("TutorChatComponent: Emitting tutor-typing event", {
        chatId: chat._id,
      });
      socket.emit("tutor-typing", { chat_id: chat._id });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-green-700 to-green-400 p-4 flex items-center">
        <div className="w-12 h-12 rounded-full bg-white p-1 mr-3 overflow-hidden">
          <img
            src={studentInfo.avatar || "/default-user.png"}
            alt="Student"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div>
          <h2 className="font-bold text-white text-lg">{studentInfo.name}</h2>
          <span
            className={`text-sm ${
              studentInfo.isOnline ? "text-green-200" : "text-gray-300"
            }`}
          >
            {studentInfo.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          ::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-xl font-semibold">No messages yet</p>
            <p className="text-sm">Start the conversation with your student!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isTutor = message.sender_id === tutor.id;
            return (
              <div
                key={message._id || index}
                className={`flex ${isTutor ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-end ${
                    isTutor ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <img
                    src={
                      isTutor
                        ? tutor.profile_image || "/default-tutor.png"
                        : studentInfo.avatar || "/default-user.png"
                    }
                    alt={isTutor ? "Tutor" : "Student"}
                    className="w-8 h-8 rounded-full mx-2 object-cover"
                  />
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isTutor
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="break-words">{message.message_text}</p>
                    {message.file_url && (
                      <div className="mt-2">
                        {message.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img
                            src={message.file_url}
                            alt="Shared image"
                            className="rounded-lg object-cover max-w-full h-auto"
                          />
                        ) : message.file_url.match(/\.(mp4|webm)$/i) ? (
                          <video
                            controls
                            className="rounded-lg max-w-full h-auto"
                            src={message.file_url}
                          />
                        ) : (
                          <a
                            href={message.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline"
                          >
                            Attached File
                          </a>
                        )}
                      </div>
                    )}
                    <div className="text-[11px] mt-1 text-black-300">
                      {moment(message.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isStudentTyping && (
          <div className="flex items-start space-x-2">
            <img
              src={studentInfo.avatar || "/default-user.png"}
              alt="Student"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-gray-200 rounded-lg px-4 py-2 flex items-center">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-typing-pulse"></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-typing-pulse"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-typing-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`border-t p-4 rounded-b-lg ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}>
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-6 w-6 text-gray-500" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-10">
                <div className="shadow-lg rounded-lg">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={theme === "dark" ? "dark" : "light"}
                  />
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            className={`flex-1 p-2 border rounded-full focus:outline-none focus:ring-2
              ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-200 border-gray-700 focus:ring-green-700"
                  : "bg-white text-gray-900 border-gray-300 focus:ring-green-500"
              }
            `}
          />
          <UploadMenu onUpload={handleUpload} />
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-5 w-5" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TutorChatComponent;